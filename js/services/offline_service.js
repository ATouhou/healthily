app.service('OfflineService', function($http){
	this.enable = function(config){

	}

	this.disable = function(){

	}

	this.config = {
		enabled: false,
		components: {
			nutridb: false,
			favorites: false,
			friends: false
		}
	}
});