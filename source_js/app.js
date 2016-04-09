var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services' ,'720kb.datepicker']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UsersController'
  }).
  when('/adduser', {
    templateUrl: 'partials/adduser.html',
    controller: 'AddUserController'
  }).
  when('/users/:userID', {
    templateUrl: 'partials/profile.html',
    controller: 'ProfileController'
  }).
  when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TasksController'
  }).
  when('/addtask', {
    templateUrl: 'partials/addtask.html',
    controller: 'AddTaskController'
  }).
  when('/tasks/:taskID', {
    templateUrl: 'partials/task.html',
    controller: 'TaskController'
  }).
  when('/tasks/:taskID/edit', {
    templateUrl: 'partials/edittask.html',
    controller: 'EditTaskController'
  }).
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
