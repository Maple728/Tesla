package org.tesla.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tesla.TeslaApplication;
import org.tesla.TeslaConstants;
import org.tesla.models.ChargerRepository;
import org.tesla.models.TeslaCharger;
import org.tesla.models.TeslaNavigation;
import org.tesla.remote.BaiduMapRemote;

@RestController
@RequestMapping("/tesla")
public class TeslaController {
	
	public ChargerRepository chargerRepostory = TeslaApplication.chargerRepostory;
	
	@PostMapping("/navigate")
	public List<TeslaCharger> navigate(@RequestBody TeslaNavigation nav){
		
		// Construct the new matrix with origin and dest point
		
		// append origin and dest into distances map
		int oldLength = chargerRepostory.getDistanceMap().length;
		int newLength = oldLength + 2;
		double[][] newMap = new double[newLength][newLength];
		
		// clone original map and initialize map
		for(int i = 0; i < oldLength; i++){
			for(int j = 0; j < oldLength; j++){
				newMap[i][j] = chargerRepostory.getDistanceMap()[i][j];
			}
		}
		
		int originIndex = oldLength;
		double[] originRoutes = BaiduMapRemote.getDistsOneToMore(nav.getOrigin(), chargerRepostory.getChargerList());
		for(int j = 0; j < oldLength; j++){
			newMap[originIndex][j] = originRoutes[j];
			newMap[j][originIndex] = originRoutes[j];
		}
		newMap[originIndex][originIndex] = 0;
		
		int destIndex = oldLength + 1;
		double[] destRoutes = BaiduMapRemote.getDistsOneToMore(nav.getDest(), chargerRepostory.getChargerList());
		for(int j = 0; j < oldLength; j++){
			newMap[destIndex][j] = destRoutes[j];
			newMap[j][destIndex] = destRoutes[j];
		}
		newMap[destIndex][destIndex] = 0;	

		List<TeslaCharger> destList = new ArrayList<>();
		destList.add(nav.getDest());
		double[] distance = BaiduMapRemote.getDistBetweenChargersByBaidu(nav.getOrigin(), destList);
		
		newMap[originIndex][destIndex] = distance[0];
		newMap[destIndex][originIndex] = distance[0];
		
		// Calculate the shortest path
		List<Integer> pathIndexList = getShorestPath(newMap, originIndex, destIndex, nav.getOriginDistance(), nav.getMaxDistance());
		
		List<TeslaCharger> result = new ArrayList<>();
		for(Integer nodeIndex : pathIndexList){
			if(nodeIndex == originIndex){
				result.add(nav.getOrigin());
			}
			else if(nodeIndex == destIndex){
				result.add(nav.getDest());
			}
			else{
				result.add(this.chargerRepostory.getChargerList().get(nodeIndex));
			}
		}
		return result;
	}
	
	@GetMapping("/getAllChargers")
	public List<TeslaCharger> getAllChargers(){
		return chargerRepostory.getChargerList();
	}
	
	@GetMapping("/getAllSuperChargers")
	public List<TeslaCharger> getAllSuperChargers(){
		List<TeslaCharger> result = new ArrayList<>();
		for(TeslaCharger charger : chargerRepostory.getChargerList()){
			if(charger.isSuperCharger()){
				result.add(charger);
			}
		}
		return result;
	}
	
	@GetMapping("/getAllOtherChargers")
	public List<TeslaCharger> getAllOtherChargers(){
		List<TeslaCharger> result = new ArrayList<>();
		for(TeslaCharger charger : chargerRepostory.getChargerList()){
			if(!charger.isSuperCharger()){
				result.add(charger);
			}
		}
		return result;
	}
	
	@RequestMapping("/runTeslaMatlab")
	public void runTeslaMatlab() throws IOException{
		Runtime.getRuntime().exec( "matlab -nodisplay -nojvm -nodesktop  -r run('D:\\Program\" \"Files\\MATLAB\\R2016a\\bin\\特斯拉\\interface')");	
	}
	
	
	public List<Integer> getShorestPath(double[][] map, int start, int end, double originDistance, double maxDistance){
		return dijkstra(map, start, end, originDistance, maxDistance);
	}
	
	public double[][] initDistanceMap(double[][] map, int start, double originDistance, double maxDistance){
		double[][] result = new double[map.length][map.length];
		
		double maxD = 0;
		for(int i = 0; i < map.length; i++){
			if(i == start)
				maxD = originDistance;
			else
				maxD = maxDistance;
			
			for(int j = 0; j < map.length; j++){
				
				if(map[i][j] > maxD){
					result[i][j] = -1;
				}
				else {
					result[i][j] = map[i][j];
				}
			}
		}
		return result;
	}
	
	/**
	 * 
	 * 
	 * @param map 不可达点的距离为-1。
	 * @param start
	 * @param end
	 * @return
	 */
	public List<Integer> dijkstra(double[][] originMap, int start, int end, double originDistance, double maxDistance){
		if(null == originMap || originMap.length <= start || originMap.length <= end || start < 0 || end < 0)
			return null;
		if(start == end){
			return Arrays.asList(start);
		}
		
		double[][] map = initDistanceMap(originMap, start, originDistance, maxDistance);
		double[] dist = Arrays.copyOf(map[start], map[start].length);
		List<Integer> s = new ArrayList<>();
		List<Integer> t = new ArrayList<>();
		int[] prev = new int[map.length];	// prev[i] : the i node's previous node index
		
		// initialize s, t and prev
		s.add(start);
		for(int i = 0; i < map.length; i++){
			if(i != start){
				t.add(i);
			}
			if(dist[i] != -1)
				prev[i] = start; 
			else
				prev[i] = -1;
		}
		
		
		// search shortest path
		while(prev[end] == -1){
			if(t.isEmpty())
				break;
			
			int minIndex = t.get(0);
			double minDist = dist[t.get(0)];
			for(int i : t){
				if(dist[i] == -1)
					continue;
				if((minDist == -1 && dist[i] != -1) || (minDist != -1 && dist[i] < minDist)){
					minDist = dist[i];
					minIndex = i;
				}
			}
			
			if(dist[minIndex] == -1 || minIndex == end)
				break;
			else{
				// update s and t matrix
				s.add(minIndex);
				t.remove((Object)minIndex);
				
				// update the distances between start and points of t through minIndex
				for(int i : t){
					if(map[minIndex][i] == -1)
						continue;
					else{
						if(dist[i] == -1 || dist[i] >=  dist[minIndex] + map[minIndex][i]){
							// update distance
							dist[i] = dist[minIndex] + map[minIndex][i];
							// update path
							prev[i] = minIndex;
						}
					}
				}
				
			}
			
		}
		List<Integer> result = new ArrayList<>();
		int cur;
		if(prev[end] == -1){
			// not found path, then search the shortest node from the end node that can reach
			int minEndIndex = -1;
			for(int i = 0; i < originMap.length; i++){
				if(prev[i] != -1){
					if(minEndIndex == -1){
						minEndIndex = i;
					}
					else {
						if(originMap[end][i] <= originMap[end][minEndIndex]){
							minEndIndex = i;
						}
					}
				}
			}
			cur = minEndIndex;
			
		}
		else {
			// found path
			cur = end;
		}
		while(cur != start){
			result.add(cur);
			cur = prev[cur];
		}
		result.add(start);
		Collections.reverse(result);
		return result;
	}
	
}