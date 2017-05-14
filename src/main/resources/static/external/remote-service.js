angular.module('homeApp')
.service('remoteService', function($http){
	var result = {
		getAllChargers :　getAllChargers,
		getNavigationResult : getNavigationResult
	};
	return result;
	
	function getAllChargers() {
		return $http.get('/tesla/getAllChargers');
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