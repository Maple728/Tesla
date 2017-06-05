angular.module('teslaInfo',[])
.directive('teslaInfo', function(){
	return {
		restrict : 'E',
		templateUrl : 'tesla-info/tesla-info.html',
		scope : {
			charger : '='
		},
		controller : function($scope){
			$scope.superChargerType = "超级充电桩";
			$scope.normalChargerType = "目的充电桩";
		}
		
	};
})