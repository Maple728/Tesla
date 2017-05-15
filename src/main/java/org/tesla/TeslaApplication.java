package org.tesla;

import java.io.IOException;

import org.apache.log4j.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.tesla.models.ChargerRepository;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;

@SpringBootApplication
public class TeslaApplication {
	
	/**
	 * Logger
	 */
	static Logger logger = Logger.getLogger(TeslaApplication.class);
	
	public static ChargerRepository chargerRepostory = new ChargerRepository();
	
	public static int baiduAPICount = 0;
	
	public static void main(String[] args) throws JsonParseException, JsonMappingException, IOException {
		// boot whole spring container
		SpringApplication.run(TeslaApplication.class, args);
		
		// init all charger data
		logger.info("Loading charger repository data...");
		chargerRepostory.setChargerList(TeslaInit.getTeslaRepositoryRemote());
		logger.info("Loaded charger repository data successly!");
		
		// init matrix of distances
		logger.info("Loading charger respository route maps.....");
		chargerRepostory.setDistanceMap(TeslaInit.generateMapMultiple(chargerRepostory.getChargerList()));
		logger.info("Loaded charger respository route maps successly!");
	}

}