package org.tesla.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tesla.TeslaApplication;
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
		
		// clone original map
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
		//TODO 
		
		return null;
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
	
}