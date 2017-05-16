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
homeApp.controller('homeCtrl', function($scope, remoteService, $q, $timeout){
	$scope.maxRange = 1000;		// kilometers
	$scope.battery = 70;	// percentage
	$scope.range = 400;		// kilometers
	
	$scope.originKey;
	$scope.destKey;
	$scope.aroundKey;
	
	$scope.superChargerMarkerList = [];
	$scope.otherChargerMarkerList = [];
	
	$scope.superChargerCircleList = [];
	$scope.otherChargerCircleList = [];
	
	$scope.isShowSuper = true;
	$scope.isShowOther = false;
	
	// --------------- Block for button events --------------------
	$scope.navSuper = function(){
		$scope.isShowSuper = !$scope.isShowSuper;
		if($scope.isShowSuper){
			showSuperChargers();
			if($scope.isShowCircle){
				showSuperCircle();
			}
		}
		else {
			hideSuperChargers();
			if($scope.isShowCircle)
				hideSuperCircle();
		}
	}
	
	$scope.navOther = function(){
		$scope.isShowOther = !$scope.isShowOther;
		if($scope.isShowOther){
			showOtherChargers();
			if($scope.isShowCircle){
				showOtherCircle();
			}
		}
		else {
			hideOtherChargers();
			if($scope.isShowCircle){
				hideOtherCircle();
			}
		}
	}
	
	//$scope.showSuperChargers();
	
	$scope.isShowCircle = false;
	$scope.addCircles = function(){
		$scope.isShowCircle = !$scope.isShowCircle;
		if($scope.isShowCircle){
			if($scope.isShowSuper){
				showSuperCircle();
			}
			if($scope.isShowOther){
				showOtherCircle();
			}
		}
		else {
			if($scope.isShowSuper){
				hideSuperCircle();
			}
			if($scope.isShowOther){
				hideOtherCircle();
			}			
		}
	}
	
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
				remoteService.getNavigationResult(origin, dest, $scope.range * $scope.battery * 10, $scope.range * 1000).success(function(response){
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
	
	$scope.clearAll = function(){
		map.clearOverlays();
		$timeout(function(){
			$scope.isShowSuper = false;
			$scope.isShowOther = false;
			$scope.isShowCircle = false;
		}, 500);
	}
	
	$scope.searchAround = function(key){
		var aroundRadius = 10000;
		$scope.clearAll();
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
					$timeout(function(){
						$scope.aroundKey += rs.surroundingPois[0].title;
					}, 500);
				}
			});
		});
	}
	// ------------ Block about circle display -------------------------
	
	function showSuperCircle(){
		if($scope.superChargerCircleList.length == 0){
			angular.forEach($scope.superChargerMarkerList, function(marker){
				var yellow = new BMap.Circle(marker.getPosition(),400000,{fillColor:"yellow", strokeWeight: 1 ,fillOpacity: 0.1, strokeOpacity: 0.2});
				var green = new BMap.Circle(marker.getPosition(),200000,{fillColor:"green", strokeWeight: 1 ,fillOpacity: 0.5, strokeOpacity: 0.5});
				$scope.superChargerCircleList.push(yellow);
				$scope.superChargerCircleList.push(green);
			});
		}
		angular.forEach($scope.superChargerCircleList, function(circle){
			map.addOverlay(circle);
		});
	}
	
	function hideSuperCircle(){
		if($scope.superChargerCircleList.length == 0)
			return ;
		angular.forEach($scope.superChargerCircleList, function(circle){
			map.removeOverlay(circle);
		});
	}
	
	function showOtherCircle(){
		if($scope.otherChargerCircleList.length == 0){
			angular.forEach($scope.otherChargerMarkerList, function(marker){
				var yellow = new BMap.Circle(marker.getPosition(),400000,{fillColor:"yellow", strokeWeight: 1 ,fillOpacity: 0.1, strokeOpacity: 0.2});
				var green = new BMap.Circle(marker.getPosition(),200000,{fillColor:"green", strokeWeight: 1 ,fillOpacity: 0.2, strokeOpacity: 0.3});
				$scope.otherChargerCircleList.push(yellow);
				$scope.otherChargerCircleList.push(green);
			});
		}
		angular.forEach($scope.otherChargerCircleList, function(circle){
			map.addOverlay(circle);
		});
	}
	
	function hideOtherCircle(){
		if($scope.otherChargerCircleList.length == 0)
			return ;
		angular.forEach($scope.otherChargerCircleList, function(circle){
			map.removeOverlay(circle);
		});
	}
	
	// -------------- Block about marker display ----------------------------
	function showMarkers(markerList){
		angular.forEach(markerList, function(marker){
			map.addOverlay(marker);
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
		$scope.clearAll();
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
				$scope.clearAll();
				
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