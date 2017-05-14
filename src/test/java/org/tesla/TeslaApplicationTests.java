package org.tesla;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.tesla.controllers.TeslaController;
import org.tesla.models.TeslaCharger;
import org.tesla.models.TeslaNavigation;

@RunWith(SpringRunner.class)
@SpringBootTest
public class TeslaApplicationTests {

	@Autowired
	TeslaController ctrl;
	
	@Test
	public void contextLoads() {
		TeslaNavigation nav = new TeslaNavigation();
		TeslaCharger ch = new TeslaCharger();
		ch.setLatitude(116.473008);
		ch.setLongitude(39.916605);
		nav.setOrigin(ch);
		nav.setDest(ch);
		ctrl.navigate(nav);
	}

}
