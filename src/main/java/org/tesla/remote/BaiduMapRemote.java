package org.tesla.remote;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.log4j.Logger;
import org.tesla.TeslaConstants;
import org.tesla.models.TeslaCharger;

import com.fasterxml.jackson.databind.ObjectMapper;

public class BaiduMapRemote {
	private final static String baiduAK = "7OFG0fFwHTeGYdA4psdci0uDbGLV8bDI";
	
	private static boolean isLimit = false;
	
	static Logger logger = Logger.getLogger(BaiduMapRemote.class);
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static double[] getDistBetweenChargersByBaidu(TeslaCharger originCharger, List<TeslaCharger> destChargerlist){
		double[] result = new double[destChargerlist.size()];
		
		if(isLimit){
			for(int i = 0; i < result.length; i++){
				result[i] = getDistBetweenChargersByCoord(originCharger, destChargerlist.get(i));
			}
			return result;
		}
		
		String url = "http://api.map.baidu.com/routematrix/v2/driving?output=json&tactics=13&ak=" + baiduAK;
		String paramOrigins = "&origins=" + originCharger.getLatitude() + "," + originCharger.getLongitude();
		String paramDests = "&destinations=";
		String dest = "";
		for(TeslaCharger charger : destChargerlist){
			dest += charger.getLatitude() + "," + charger.getLongitude() + "|";
		}
		paramDests += dest.subSequence(0, dest.length() - 1);
		
		String fullUrl = url + paramOrigins + paramDests;
		String response = HttpRequest.sendGet(fullUrl);
		
		ObjectMapper mapper = new ObjectMapper();
		List<Map> results = null;
		Map map;
		try {
			map = (Map) mapper.readValue(response, TreeMap.class);
			results = (List<Map>)map.get("result");
		} catch (IOException e1) {
			e1.printStackTrace();
		}
		
		if(results == null){
			logger.error("The count of Baidu API invoking is upper limit! Now will use direct calc");
			isLimit = true;
			for(int i = 0; i < result.length; i++){
				result[i] = getDistBetweenChargersByCoord(originCharger, destChargerlist.get(i));
			}
		}
		else {
			for(int j = 0; j < results.size(); j++){
				result[j] = Double.valueOf(((Map)(results.get(j)).get("distance")).get("value").toString());
			}
		}
		return result;
	}
	
	public static double[] getDistsOneToMore(TeslaCharger originCharger, List<TeslaCharger> destChargerList){
		double[] result = new double[destChargerList.size()];
		
		List<TeslaCharger> perList = new ArrayList<>();
		
		for(int i = 0; i < destChargerList.size(); i++){
			double dist = BaiduMapRemote.getDistBetweenChargersByCoord(originCharger, destChargerList.get(i));
			if(dist > TeslaConstants.CAR_MAX_MILEAGE){
				result[i] = dist;
			}
			else {
				if(perList.size() < TeslaConstants.BAIDU_ROUTE_MAX_COUNT){
					perList.add(destChargerList.get(i));
				}
				else {
					double[] distances = BaiduMapRemote.getDistBetweenChargersByBaidu(originCharger, perList);
					for(int j = 0; j < distances.length; j++){
						result[destChargerList.indexOf(perList.get(j))] = distances[j];
					}
					perList.clear();
				}
			}
		}
		if(!perList.isEmpty()){
			double[] distances = BaiduMapRemote.getDistBetweenChargersByBaidu(originCharger, perList);
			for(int j = 0; j < distances.length; j++){
				result[destChargerList.indexOf(perList.get(j))] = distances[j];
			}			
		}
		return result;
	}
	
    /** 
     * 转化为弧度(rad) 
     * */  
    private static double rad(double d)  
    {  
       return d * Math.PI / 180.0;  
    }  
      
    /**
     * Get distances using longitude and latitude.
     * 
     * @param startCharger
     * @param endCharger
     * @return
     */
    public static double getDistBetweenChargersByCoord(TeslaCharger startCharger, TeslaCharger endCharger) {
    	
    	double EARTH_RADIUS = 6371393; // meters
    	
        double radLat1 = rad(startCharger.getLatitude());  
        double radLat2 = rad(endCharger.getLatitude());  
  
        double radLon1 = rad(startCharger.getLongitude());  
        double radLon2 = rad(endCharger.getLongitude());  
  
        if (radLat1 < 0)  
            radLat1 = Math.PI / 2 + Math.abs(radLat1);// south  
        if (radLat1 > 0)  
            radLat1 = Math.PI / 2 - Math.abs(radLat1);// north  
        if (radLon1 < 0)  
            radLon1 = Math.PI * 2 - Math.abs(radLon1);// west  
        if (radLat2 < 0)  
            radLat2 = Math.PI / 2 + Math.abs(radLat2);// south  
        if (radLat2 > 0)  
            radLat2 = Math.PI / 2 - Math.abs(radLat2);// north  
        if (radLon2 < 0)  
            radLon2 = Math.PI * 2 - Math.abs(radLon2);// west  
        double x1 = EARTH_RADIUS * Math.cos(radLon1) * Math.sin(radLat1);  
        double y1 = EARTH_RADIUS * Math.sin(radLon1) * Math.sin(radLat1);  
        double z1 = EARTH_RADIUS * Math.cos(radLat1);  
  
        double x2 = EARTH_RADIUS * Math.cos(radLon2) * Math.sin(radLat2);  
        double y2 = EARTH_RADIUS * Math.sin(radLon2) * Math.sin(radLat2);  
        double z2 = EARTH_RADIUS * Math.cos(radLat2);  
  
        double d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)+ (z1 - z2) * (z1 - z2));  
        //余弦定理求夹角  
        double theta = Math.acos((EARTH_RADIUS * EARTH_RADIUS + EARTH_RADIUS * EARTH_RADIUS - d * d) / (2 * EARTH_RADIUS * EARTH_RADIUS));  
        double dist = theta * EARTH_RADIUS;  
        return dist;  
    }
}
