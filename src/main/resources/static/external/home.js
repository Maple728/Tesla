// Customized block
var homeApp = angular.module('homeApp', []);
homeApp.controller('homeCtrl', function($scope, remoteService, $q){
	$scope.maxRange = 1000;
	$scope.battry = 70;
	$scope.range = 400;
	$scope.origin = {};
	$scope.dest = {};
	
	// --------------- Block for events --------------------
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
				console.log(origin.longitude);
				console.log(dest.longitude);
			});
		});
		
		return ;
		remoteService.getNavigationResult(origin, dest, range * battery / 100, range).success(function(response){
			console.log(response);
		});
	}
	
	var map = new BMap.Map("allmap");
	
	// TODO locate
	map.centerAndZoom("北京",12);


	// -------------- Block about Baidu auto complete hint -------------------------
	var acOrigin = new BMap.Autocomplete(    //建立一个自动完成的对象
		{"input" : "originPoint"
		,"location" : map
	});
	
	acOrigin.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
		acHighlight(e);
	});
	
	acOrigin.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
		acConfirmEvent(e);
	});
	
	var acDest = new BMap.Autocomplete(    //建立一个自动完成的对象
			{"input" : "destPoint"
			,"location" : map
		});

	acDest.addEventListener("onhighlight", function(e) {  //鼠标放在下拉列表上的事件
		acHighlight(e);
	});
	
	acDest.addEventListener("onconfirm", function(e) {    //鼠标点击下拉列表后的事件
		acConfirmEvent(e);
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
	}

	function setPlace(myValue){
		map.clearOverlays();    //清除地图上所有覆盖物
		localSearchByKey(myValue, true);
	}
	
	/**
	 * Search key position and set the coord into point
	 * 
	 * @param key
	 * @param point
	 * @returns
	 */
	function localSearchByKey(key, autoViewport){
		var defered = $q.defer();
		function myFun(){
			var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
			console.log(pp);
			
			var point = {};
			point.longitude = pp.lng;
			point.latitude = pp.lat;
			defered.resolve(point);
			
			map.centerAndZoom(pp, 18);
			map.addOverlay(new BMap.Marker(pp));    //添加标注
		}
		var local = new BMap.LocalSearch(map, { //智能搜索
		  onSearchComplete: myFun,
		  autoViewport : autoViewport
		});
		local.search(key);
		return defered.promise;
	}
	
	
	// 
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