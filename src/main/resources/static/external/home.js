// Customized block

// init baidu map
var map = new BMap.Map("allmap");
initMap(map);

function initMap(map){
	map.enableScrollWheelZoom();
	map.enableAutoResize();
	map.centerAndZoom('北京', 12);
	
	var mapType1 = new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP,BMAP_HYBRID_MAP]});
	map.addControl(mapType1); 
	
	var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
	var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
	map.addControl(top_left_control);        
	map.addControl(top_left_navigation); 
}

var homeApp = angular.module('homeApp', []);
homeApp.controller('homeCtrl', function($scope, remoteService, $q){
	$scope.maxRange = 1000;
	$scope.battery = 70;
	$scope.range = 400;
	
	$scope.originKey;
	$scope.destKey;
	$scope.aroundKey;
	
	$scope.superChargerMarkerList = [];
	$scope.otherChargerMarkerList = [];
	
	$scope.isShowSuper = true;
	$scope.isShowOther = false;
	
	// --------------- Block for button events --------------------
	$scope.navSuper = function(){
		$scope.isShowSuper = !$scope.isShowSuper;
		if($scope.isShowSuper){
			showSuperChargers();
		}
		else {
			hideSuperChargers();
		}
	}
	
	$scope.navOther = function(){
		$scope.isShowOther = !$scope.isShowOther;
		if($scope.isShowOther){
			showOtherChargers();
		}
		else {
			hideOtherChargers();
		}
	}
	
	//$scope.showSuperChargers();
	
	$scope.calcPercentage = function(range, maxRange){
		return Math.round(range / maxRange * 100);
	}
	$scope.navigate = function(){
		var origin = {};
		var dest = {};
		localSearchByKey($scope.originKey, false).then(function(result){
			origin = result;
			localSearchByKey($scope.destKey, false).then(function(result){
				dest = result;
				
				console.log($scope.originKey);
				console.log(origin);
				console.log($scope.destKey + dest);
				console.log(dest);
				remoteService.getNavigationResult(origin, dest, $scope.range * $scope.battery / 100, $scope.range).success(function(response){
					console.log(response);
				});
			});
		});
		
		return ;

	}
	
	$scope.switchPoint = function(){
		var temp = $scope.destKey;
		$scope.destKey = $scope.originKey;
		$scope.originKey = temp;
	}
	
	$scope.searchAround = function(key){
		var aroundRadius = 10000;
		map.clearOverlays();
		localSearchByKey(key).then(function(point){
			var mPoint = new BMap.Point(point.longitude, point.latitude);
			var circle = new BMap.Circle(mPoint, aroundRadius,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.3, strokeOpacity: 0.3});
		    map.addOverlay(circle);
		})
	}
	
	$scope.locateCur = function(){
		setCurrentLoc().then(function(mPoint){
			var geoc = new BMap.Geocoder();
			geoc.getLocation(mPoint, function(rs){
				$scope.aroundKey = rs.address;
				if(rs.surroundingPois.length != 0){
					$scope.aroundKey += rs.surroundingPois[0].title;
				}
				$scope.$digest();
			});
		});
	}
	
	// -------------- Block about marker display ----------------------------
	function showMarkers(markerList){
		angular.forEach(markerList, function(marker){
			marker.show();
		});
	}
	
	function hideMarkers(markerList){
		angular.forEach(markerList, function(marker){
			marker.hide();
		});	
	}
	
	function createMarker(charger, icon){
		var mPoint = new BMap.Point(charger.longitude, charger.latitude);
		return new BMap.Marker(mPoint, {
				icon : icon
			}
		);
	}
	// Show all super chargers
	showSuperChargers();
	function showSuperChargers(){
		if($scope.superChargerMarkerList.length == 0){
			remoteService.getAllSuperChargers().success(function(response){
				var icon = new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
					    scale: 0.8,	//图标缩放大小
					    fillColor: "rgb(255,0,0)",	//填充颜色
					    fillOpacity: 0.8	//填充透明度
				});
				angular.forEach(response, function(item){
					var marker = createMarker(item, icon);
					$scope.superChargerMarkerList.push(marker);
					map.addOverlay(marker);
				});
				showMarkers($scope.superChargerMarkerList);
			});
		}
		else {
			showMarkers($scope.superChargerMarkerList);
		}
	};
	
	function hideSuperChargers(){
		if($scope.superChargerMarkerList.length == 0)
			return ;
		else {
			hideMarkers($scope.superChargerMarkerList);
		}
	}
	
	function showOtherChargers(){
		if($scope.otherChargerMarkerList.length == 0){
			remoteService.getAllOtherChargers().success(function(response){
				var icon = new BMap.Symbol(BMap_Symbol_SHAPE_POINT, {
					    scale: 0.6,	//图标缩放大小
					    fillColor: "rgb(139,139,122)",	//填充颜色
					    fillOpacity: 0.8	//填充透明度
				});
				angular.forEach(response, function(item){
					var marker = createMarker(item, icon);
					$scope.otherChargerMarkerList.push(marker);
					map.addOverlay(marker);
				});
				showMarkers($scope.otherChargerMarkerList);
			});
		}
		else {
			showMarkers($scope.otherChargerMarkerList);
		}
	};
	
	function hideOtherChargers() {
		if($scope.otherChargerMarkerList.length == 0)
			return ;
		else {
			hideMarkers($scope.otherChargerMarkerList);
		}		
	}
	
	// -------------- Block about Baidu auto complete hint -------------------------
	
	var acOrigin = new BMap.Autocomplete(    //建立一个自动完成的对象
			{"input" : 'originPoint'
			,"location" : map
		});
	acOrigin.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
		acHighlight(e);
	});
	
	acOrigin.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
		$scope.originKey = acConfirmEvent(e);
	});
	
	var acDest = new BMap.Autocomplete(    //建立一个自动完成的对象
			{"input" : 'destPoint'
			,"location" : map
		});
	acDest.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
		acHighlight(e);
	});
	
	acDest.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
		$scope.destKey = acConfirmEvent(e);
	});
	
	var acAround = new BMap.Autocomplete(    //建立一个自动完成的对象
			{"input" : 'aroundInput'
			,"location" : map
		});
	acAround.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
		acHighlight(e);
	});
	
	acAround.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
		$scope.aroundKey = acConfirmEvent(e);
	});
	
	function acHighlight(e){
		var str = "";
		var _value = e.fromitem.value;
		var value = "";
		if (e.fromitem.index > -1) {
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
		
		value = "";
		if (e.toitem.index > -1) {
			_value = e.toitem.value;
			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		}    
		str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
		G("searchResultPanel").innerHTML = str;		
	}
	
	function acConfirmEvent(e){
		var _value = e.item.value;
		var myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
		setPlace(myValue);
		return myValue;
	}

	function setPlace(myValue){
		map.clearOverlays();    //清除地图上所有覆盖物
		localSearchByKey(myValue, true);
	}
	
	// ---------------- Block about util -------------------------
	
	/**
	 * Search key position and set the coord into point
	 * 
	 * @param key
	 * @param point
	 * @returns
	 */
	function localSearchByKey(key, autoViewport = true){
		var defered = $q.defer();
		function myFun(){
			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
			
			var point = {};
			point.longitude = pp.lng;
			point.latitude = pp.lat;
			defered.resolve(point);
			
			map.centerAndZoom(pp, 18);
			map.addOverlay(new BMap.Marker(pp));    //添加标注
		}
		var local = new BMap.LocalSearch(map, { //智能搜索
			renderOptions : {
				autoViewport : autoViewport
			},
			onSearchComplete: myFun
		});
		local.search(key);
		return defered.promise;
	}
	
	/**
	 * Locate to the current position
	 * 
	 * @returns Promise that resolves MPoint
	 */
	function setCurrentLoc(){
		var defered = $q.defer();
		var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r){
			if(this.getStatus() === BMAP_STATUS_SUCCESS){
				map.clearOverlays();
				map.addOverlay(new BMap.Marker(r.point));
				map.centerAndZoom(r.point, 15);
				
				defered.resolve(r.point);
			}
			else {
				console.log(this.getStatus());
			}
		});
		return defered.promise;
	}
	
	function Point(longitude, latitude){
		return {
			longitude : longitude,
			latitude : latitude			
		};
	}
	
	function G(id) {
		return document.getElementById(id);
	}
});



function mousedown(event){
	console.log(event);
}





// 百度地图API功能
//	function G(id) {
//		return document.getElementById(id);
//	}
//
//	var map = new BMap.Map("allmap");
//	map.centerAndZoom("北京",12);                   // 初始化地图,设置城市和地图级别。
//
//	var suggestIdAC = new BMap.Autocomplete(    //建立一个自动完成的对象
//		{"input" : "suggestId"
//		,"location" : map
//	});
//	suggestIdAC.addEventListener("onhighlight", function(e){
//		autoCompleteHighlight(e);
//	});
//	suggestIdAC.addEventListener("onconfirm", function(e){
//		autoCompleteConfirm(e,true);
//	});
//	
//	var startInputAC = new BMap.Autocomplete(    //建立一个自动完成的对象
//			{"input" : "startInput"
//			,"location" : map
//		});
//	startInputAC.addEventListener("onhighlight", function(e){ 
//		autoCompleteHighlight(e);
//	});
//	startInputAC.addEventListener("onconfirm", function(e){
//		autoCompleteConfirm(e,false);
//	});
//		
//	var endInputAC = new BMap.Autocomplete(    //建立一个自动完成的对象
//			{"input" : "endInput"
//			,"location" : map
//		});
//	endInputAC.addEventListener("onhighlight", function(e){ 
//		autoCompleteHighlight(e);
//	});
//	endInputAC.addEventListener("onconfirm", function(e){
//		autoCompleteConfirm(e,false);
//	});
//	
//	var myValue;
//	//鼠标放在下拉列表上的事件
//	function autoCompleteHighlight(e){
//		var str = "";
//		var _value = e.fromitem.value;
//		var value = "";
//		if (e.fromitem.index > -1) {
//			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
//		}    
//		str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
//		
//		value = "";
//		if (e.toitem.index > -1) {
//			_value = e.toitem.value;
//			value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
//		}    
//		str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
//		G("searchResultPanel").innerHTML = str;		
//	}
//	
//	function autoCompleteConfirm(e, isSetPlace){
//		var _value = e.item.value;
//		myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
//		G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
//		
//		// check if the function need to auto set place
//		if(isSetPlace)
//			setPlace();
//	}
//
//	function setPlace(){
//		map.clearOverlays();    //清除地图上所有覆盖物
//		function myFun(){
//			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
//			map.centerAndZoom(pp, 18);
//			map.addOverlay(new BMap.Marker(pp));    //添加标注
//		}
//		var local = new BMap.LocalSearch(map, { //智能搜索
//		  onSearchComplete: myFun
//		});
//		local.search(myValue);
//	}
//	
//	
//	//三种驾车策略：最少时间，最短距离，避开高速
//	var routePolicy = [BMAP_DRIVING_POLICY_LEAST_TIME,BMAP_DRIVING_POLICY_LEAST_DISTANCE,BMAP_DRIVING_POLICY_AVOID_HIGHWAYS];
//	$("#resultBtn").click(function(){
//		var start = $("#startInput").val();
//		var end = $("#endInput").val();
//		map.clearOverlays(); 
//		search(start,end,BMAP_DRIVING_POLICY_LEAST_DISTANCE); 
//		function search(start,end,route){ 
//			var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, autoViewport: true},policy: route});
//			driving.search(start,end);
//		}
//	});