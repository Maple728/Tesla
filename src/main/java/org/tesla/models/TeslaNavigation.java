package org.tesla.models;

/**
 * 
 * 
 * @author 24483
 *
 */
public class TeslaNavigation {

	private TeslaCharger origin;
	
	private TeslaCharger dest;
	
	private int originDistance;
	
	private double maxDistance;

	public TeslaCharger getOrigin() {
		return origin;
	}

	public void setOrigin(TeslaCharger origin) {
		this.origin = origin;
	}

	public TeslaCharger getDest() {
		return dest;
	}

	public void setDest(TeslaCharger dest) {
		this.dest = dest;
	}

	public int getOriginDistance() {
		return originDistance;
	}

	public void setOriginDistance(int originDistance) {
		this.originDistance = originDistance;
	}

	public double getMaxDistance() {
		return maxDistance;
	}

	public void setMaxDistance(double maxDistance) {
		this.maxDistance = maxDistance;
	}
}
