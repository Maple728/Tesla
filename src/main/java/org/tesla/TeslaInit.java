package org.tesla;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;

import org.tesla.models.TeslaCharger;
import org.tesla.remote.BaiduMapRemote;
import org.tesla.remote.HttpRequest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.type.ArrayType;

public class TeslaInit {
	
	private static String mapFilePath;
	
	private static String chargerFilePath;
	
	static
	{
		// Initialize paths of the map file and the charger repository file 
		 try {
			 String root = URLDecoder.decode(TeslaInit.class.getResource("/").getPath(), "UTF-8");
			 mapFilePath = root + TeslaConstants.TESLA_MAP_FILE_NAME;
			 chargerFilePath = root + TeslaConstants.TESLA_CHARGER_REPOSITORY_FILE_NAME;
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Write a string into a file specified by filename.
	 * 
	 * @param filename
	 * @param content
	 */
	public static void writeStringToFile(String filename, String content){
		BufferedWriter bw = null; 
		try {
			File file = new File(filename);
			if(!file.isFile()){
				file.createNewFile();
			}
			FileWriter fw = new FileWriter(file);
			bw = new BufferedWriter(fw);
			bw.write(content);
			
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		finally{
			try {
				bw.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * Read the content of the file specified by filename.
	 * 
	 * @param filename
	 * @return the content of the file.
	 */
	public static String readStringFromFile(String filename){
		File file = new File(filename);
		if(!file.isFile()){
			return null;
		}
		FileReader fr = null;
		BufferedReader br = null;
		String result = "";
		try {
			fr = new FileReader(file);
			br = new BufferedReader(fr);
			String line;
			while((line = br.readLine()) != null){
				result += line + System.lineSeparator();
			}
			
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		finally{
			try {
				br.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return result;
	}
	
	@SuppressWarnings("unchecked")
	public static List<TeslaCharger> getTeslaRepositoryRemote(){
		List<TeslaCharger> result = null;
		
		String json = readStringFromFile(chargerFilePath);
		if(json == null){
			// Get all chargers info from Tesla Web Server
			
			String chargerType = "super_charger";
			double topRightLatitude =  54.575691;	
			double topRightLongitude = 144.488317;
			double BottomLeftLatitude = 17.737584;
			double BottomLeftLongitude = 68.17633;
			
			String teslaURL = "https://www.tesla.cn/all-locations?type="
				+ chargerType 
				+ "&bounds="
				+ topRightLatitude + ","
				+ topRightLongitude + ","
				+ BottomLeftLatitude + ","
				+ BottomLeftLongitude 
				+ "&map=baidu";
			
			json = HttpRequest.sendGet(teslaURL);
			if(json == null)
				return null;
			
			// Write all chargers info into disk
			writeStringToFile(chargerFilePath, json);
		}
		
		// Transfer the type of a string from Json to object.
		ObjectMapper objMapper = new ObjectMapper();
		objMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		objMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);	
		JavaType type = objMapper.getTypeFactory().constructParametricType(ArrayList.class, TeslaCharger.class);
		try {
			result = (List<TeslaCharger>) objMapper.readValue(json, type);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return result;
	}
	
	public static double[][] generateMapMultiple(List<TeslaCharger> list){
		double[][] result;
		
		result = getMapFromDisk();
		if(null != result){
			return result;
		}
		// get distance matrix from remote
		int length = list.size();
		result = new double[length][length];
		
		int maxOriginsPerThread = 1000;

		for(int startIndex = 0; startIndex < length; startIndex += maxOriginsPerThread){
			int count = list.size() - startIndex < maxOriginsPerThread ? list.size() - startIndex : maxOriginsPerThread;
			GenerateMapThread th = new GenerateMapThread(list, result, startIndex, count);
			th.run();
		}
		return result;
	}
	
	public static void storeMapToDisk(double[][] map){
		ObjectMapper objMapper = new ObjectMapper();
		try {
			String result = objMapper.writeValueAsString(map);
			writeStringToFile(mapFilePath, result);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}
	
	public static double[][] getMapFromDisk(){

		double[][] result = null;
		
		try {
			String json = readStringFromFile(mapFilePath);
			if(json == null){
				return null;
			}
			ObjectMapper objMapper = new ObjectMapper();
			ArrayType type = objMapper.getTypeFactory().constructArrayType(objMapper.getTypeFactory().constructArrayType(double.class));
			result = objMapper.readValue(json, type);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return result;
	}
}

//class GenerateMapThread implements Runnable{
class GenerateMapThread{
	
	private List<TeslaCharger> list;
	private double[][] map;
	private int originStartIndex;
	private int originCount;
	public GenerateMapThread(List<TeslaCharger> list, double[][] map, int originStartIndex, int originCount){
		this.list = list;
		this.map = map;
		this.originStartIndex = originStartIndex;
		this.originCount = originCount;
	}
	
	//@Override
	public void run() {
		int maxRouteCount = TeslaConstants.BAIDU_ROUTE_MAX_COUNT < list.size() ? TeslaConstants.BAIDU_ROUTE_MAX_COUNT : list.size();
		
		// storing the destination chargers for Baidu Web request once.
		List<TeslaCharger> perList = new ArrayList<>();
		
		for(int startIndex = originStartIndex; startIndex < originStartIndex + this.originCount; startIndex++){
			
			this.map[startIndex][startIndex] = 0;
			
			// Get the distances from charger whose index equal startIndex to the position other chargers whose index higher than that of startIndex in charger repository
			for(int endIndex = startIndex + 1; endIndex < list.size(); endIndex++){
				double dist = BaiduMapRemote.getDistBetweenChargersByCoord(list.get(startIndex), list.get(endIndex));
				if(dist > TeslaConstants.CAR_MAX_MILEAGE){
					map[startIndex][endIndex] = dist;
					map[endIndex][startIndex] = dist;
					continue;
				}
				else {
					perList.add(list.get(endIndex));
					if(perList.size() >= maxRouteCount){
						double[] distances = BaiduMapRemote.getDistBetweenChargersByBaidu(list.get(startIndex), perList);
						for(int j = 0; j < distances.length; j++){
							int destIndex = list.indexOf(perList.get(j));
							map[startIndex][destIndex] = distances[j];
							map[destIndex][startIndex] = distances[j];
						}
						perList.clear();
					}
				}
			}
			if(!perList.isEmpty()){
				double[] distances = BaiduMapRemote.getDistBetweenChargersByBaidu(list.get(startIndex), perList);
				for(int j = 0; j < distances.length; j++){
					int destIndex = list.indexOf(perList.get(j));
					map[startIndex][destIndex] = distances[j];
					map[destIndex][startIndex] = distances[j];
				}			
			}
			perList.clear();
			
		}
		// Store the map to disk
		TeslaInit.storeMapToDisk(map);
		System.out.println("Baidu invoke count: " + TeslaApplication.baiduAPICount);
	}
}