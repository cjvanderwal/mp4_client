var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('Users', function($http, $window) {
  return {
    getAll : function() {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/users');
    },
    remove : function(id) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.delete(baseUrl+'/api/users/'+id);
    },
    add : function(obj) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.post(baseUrl+'/api/users/', obj);
    },
    profile : function(id) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/users/'+id);
    }
  }
});

mp4Services.factory('Tasks', function($http, $window) {
  return {
    getAll : function() {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/tasks/');
    },
    getByQuery : function(obj) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/tasks?where='+JSON.stringify(obj));
    },
    getById : function(id) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/tasks/'+id);
    },
    remove : function(id) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.delete(baseUrl+'/api/tasks/'+id);
    },
    add : function(obj) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.post(baseUrl+'/api/tasks/', obj);
    },
    edit : function(obj) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.put(baseUrl+'/api/tasks/'+obj._id, obj)
    }

  }
});
