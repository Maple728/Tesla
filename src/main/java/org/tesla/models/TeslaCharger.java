/**
 * 
 */
/**
 * @author 24483
 *
 */
package org.tesla.models;

import java.util.List;

public class TeslaCharger {
	
	private int nid;
	private String title;
	private List<String> locationType;
	private String address;
	private String city;
	private String provinceState;
	private String country;
	private double latitude;
	private double longitude;
	
	
	public int getNid() {
		return nid;
	}
	public void setNid(int nid) {
		this.nid = nid;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public List<String> getLocationType() {
		return locationType;
	}
	public void setLocationType(List<String> locationType) {
		this.locationType = locationType;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getProvinceState() {
		return provinceState;
	}
	public void setProvinceState(String provinceState) {
		this.provinceState = provinceState;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public double getLatitude() {
		return latitude;
	}
	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}
	public double getLongitude() {
		return longitude;
	}
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}
	
	public boolean equals(Object obj){
		if(obj instanceof TeslaCharger)
		{
			TeslaCharger charger = (TeslaCharger)obj;
			return (this.getNid() == charger.getNid());
		}
		return super.equals(obj);
	}
	
	public int hashCode(){
		return this.getNid();
	}
}