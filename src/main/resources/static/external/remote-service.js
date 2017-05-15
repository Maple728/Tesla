angular.module('homeApp')
.service('remoteService', function($http){
	var result = {
		getAllChargers :　getAllChargers,
		getAllSuperChargers : getAllSuperChargers,
		getAllOtherChargers : getAllOtherChargers,
		getNavigationResult : getNavigationResult
	};
	return result;
	
	function getAllChargers() {
		return $http.get('/tesla/getAllChargers');
	}
	
	function getAllSuperChargers(){
		return $http.get('/tesla/getAllSuperChargers');
	}
	
	function getAllOtherChargers(){
		return $http.get('/tesla/getAllOtherChargers');
	}
	
	function getNavigationResult(origin, dest, originDistance, maxDistance){
		var data = {
			origin : origin,
			dest : dest,
			originDistance : originDistance,
			maxDistance : maxDistance
		};
		return $http.post('/tesla/navigate', data);
	}
});