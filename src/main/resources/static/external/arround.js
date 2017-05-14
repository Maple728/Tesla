
	// �ٶȵ�ͼAPI����
	var map = new BMap.Map("allmap");            // ����Mapʵ��
	var mPoint = new BMap.Point(116.404, 39.915);  
	map.enableScrollWheelZoom();
	map.centerAndZoom(mPoint,15);

	var circle = new BMap.Circle(mPoint,5000,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.1, strokeOpacity: 0.1});
    map.addOverlay(circle);
    var local =  new BMap.LocalSearch(map, {renderOptions: {map: map, autoViewport: false}});  
    local.searchNearby('��˹��',mPoint,5000);

	var json_data = [[latitude,longitude],[116.383752,39.91334],[116.384502,39.932241]];
	var pointArray = new Array();
	for(var i=0;i<json_data.length;i++){
		var marker = new BMap.Marker(new BMap.Point(json_data[i][0], json_data[i][1])); // ������
		map.addOverlay(marker);    //���ӵ�
		pointArray[i] = new BMap.Point(json_data[i][0], json_data[i][1]);
		marker.addEventListener("click",attribute);
	}
	//�����е�����Ұ��Χ��
	map.setViewport(pointArray);
	//��ȡ������λ��
	function attribute(e){
		var p = e.target;
		alert("marker��λ����" + p.getPosition().lng + "," + p.getPosition().lat);    
	}	
	
	
		var suggestIdAC = new BMap.Autocomplete(    //����һ���Զ���ɵĶ���
		{"input" : "suggestId"
		,"location" : map
	});
	suggestIdAC.addEventListener("onhighlight", function(e){
		autoCompleteHighlight(e);
	});
	suggestIdAC.addEventListener("onconfirm", function(e){
		autoCompleteConfirm(e,true);
	});
		function autoCompleteConfirm(e, isSetPlace){
		var _value = e.item.value;
		myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
		
		// check if the function need to auto set place
		if(isSetPlace)
			setPlace();

