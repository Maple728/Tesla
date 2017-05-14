package org.tesla.models;

import java.util.List;

import org.springframework.stereotype.Repository;

@Repository
public class ChargerRepository {

	private List<TeslaCharger> chargerList;
	
	private double[][] distanceMap;

	public List<TeslaCharger> getChargerList() {
		return chargerList;
	}

	public void setChargerList(List<TeslaCharger> chargerList) {
		this.chargerList = chargerList;
	}

	public double[][] getDistanceMap() {
		return distanceMap;
	}

	public void setDistanceMap(double[][] distanceMap) {
		this.distanceMap = distanceMap;
	}
	
	public int getChargerIndex(TeslaCharger charger){
		return chargerList.indexOf(charger);
	}
}
