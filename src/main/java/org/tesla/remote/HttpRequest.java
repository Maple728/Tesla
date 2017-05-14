/**
 * 
 */
/**
 * @author 24483
 *
 */
package org.tesla.remote;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

public class HttpRequest {

	public static String sendGet(String url){
		String result = "";
        BufferedReader in = null;
		try {
			URL realUrl = new URL(url);
			URLConnection conn = realUrl.openConnection();
			
			conn.setRequestProperty("accept", "*/*");
			
			conn.connect();
			
            // ���� BufferedReader����������ȡURL����Ӧ
            in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
			
		} catch (IOException e) {
			e.printStackTrace();
		}
        finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
        return result;		
	}
	
}