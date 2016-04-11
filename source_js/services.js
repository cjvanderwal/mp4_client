var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('Users', function($http, $window) {
  return {
    getAll : function() {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/users');
    },
    getById : function(id) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/users/'+id);
    },
    remove : function(id) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.delete(baseUrl+'/api/users/'+id);
    },
    add : function(obj) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.post(baseUrl+'/api/users/', obj);
    },
    put : function(obj) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.put(baseUrl+'/api/users/'+obj._id, obj);
    }
  }
});

mp4Services.factory('Tasks', function($http, $window) {
  return {
    getAll : function() {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/tasks/');
    },
    getById : function(id) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/tasks/'+id);
    },
    getByQuery : function(obj) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/tasks?where='+JSON.stringify(obj));
    },
    getByNum : function(skip, limit) {
      var baseUrl = $window.sessionStorage.baseurl;
      return $http.get(baseUrl+'/api/tasks?&skip='+skip+'&limit='+limit);
    },
    getByPagination : function(skip, sort, query, order) {
      var baseUrl = $window.sessionStorage.baseurl;
      queryString = baseUrl + '/api/tasks?skip='+skip;
      queryString += '&sort={'+JSON.stringify(sort)+': '+order+'}';
      for (var key in query) {
        queryString += "&" + key + "=" + JSON.stringify(query[key]);
      }
      return $http.get(queryString);
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
