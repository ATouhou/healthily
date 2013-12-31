app.controller('notificationsController', function($scope){
	$scope.notifications = [
		{
			text: 'www',
			updated: new Date(),
			created: new Date(),
			people: {},
			activity: {
				type: ''
			},
		}
	]
});