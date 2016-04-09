var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('Users', function($http, $window) {
  var baseUrl = $window.sessionStorage.baseurl;
  return {
    getAll : function() {
      return $http.get(baseUrl+'/api/users');
    },
    remove : function(id) {
      return $http.delete(baseUrl+'/api/users/'+id);
    },
    add : function(obj) {
      return $http.post(baseUrl+'/api/users/', obj);
    },
    profile : function(id) {
      return $http.get(baseUrl+'/api/users/'+id);
    }
  }
});

mp4Services.factory('Tasks', function($http, $window) {
  var baseUrl = $window.sessionStorage.baseurl;
  return {
    getAll : function() {
      return $http.get(baseUrl+'/api/tasks/');
    },
    getByUser : function(id) {
      return $http.get(baseUrl+'/api/tasks?where={"assignedUser": '+'"'+id+'"'+'}');
    },
    getById : function(id) {
      return $http.get(baseUrl+'/api/tasks/'+id);
    },
    remove : function(id) {
      return $http.delete(baseUrl+'/api/tasks/'+id);
    },
    add : function(obj) {
      return $http.post(baseUrl+'/api/tasks/', obj);
    },
    edit : function(id, obj) {
      return $http.put(baseUrl+'/api/tasks/'+id, obj)
    }

  }
});
