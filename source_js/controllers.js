var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', '$http', 'Users', 'Tasks', function($scope, $http, Users, Tasks) {

  // get the list of users from the backend
  Users.getAll().success(function(response) {
    $scope.userList = response.data;
  });

  // remove a specified user from the backend
  $scope.removeUser = function(id) {
    Tasks.getByQuery({"assignedUser": id}).success(function(tasks_obj) {
      for (var i = 0; i < tasks_obj.data.length; i++) {
        tasks_obj.data[i].assignedUser = '';
        tasks_obj.data[i].assignedUserName = 'unassigned';
        Tasks.edit(tasks_obj.data[i]).success(function(add_response) {});
      }
      Users.remove(id).success(function(delete_response) {
        Users.getAll().success(function(get_response) {
          $scope.userList = get_response.data;
        });
      });
    });
  };

}]);

mp4Controllers.controller('AddUserController', ['$scope', '$http', 'Users', function($scope, $http, Users) {
  $scope.name = "";
  $scope.email = "";

  // add a new user to the backend
  $scope.addUser = function() {
    Users.add({name: $scope.name, email: $scope.email}).then(
      function(response) {
        $scope.status = response.data.message;
      },
      function(error) {
        $scope.status = error.data.message;
      }
    );
  };
}]);

mp4Controllers.controller('ProfileController', ['$scope', '$http', '$routeParams', 'Users', 'Tasks', function($scope, $http, $routeParams, Users, Tasks) {

  // get the specific user from the backend
  Users.getById($routeParams.userID).success(function(response) {
    $scope.user = response.data;
  });

  // get the list of COMPLETED tasks from the backend that are assigned to this user
  Tasks.getByQuery({"assignedUser": $routeParams.userID, "completed": false}).success(function(response) {
    $scope.incompleteTaskList = response.data;
  });

  // get the list of INCOMPLETE tasks from the backend that are assigned to this user
  $scope.showCompleted = function() {
    Tasks.getByQuery({assignedUser: $routeParams.userID, completed: true}).success(function(response) {
      $scope.completeTaskList = response.data;
    });
  };

  // mark a task as completed
  $scope.completeTask = function(id) {
    Tasks.getById(id).success(function(obj) {
      obj.data.completed = true;
      Tasks.edit(obj.data).success(function(edit_response) {
        Tasks.getByQuery({"assignedUser": $routeParams.userID, "completed": false}).success(function(getall_response) {
          $scope.incompleteTaskList = getall_response.data;
        });
      });
    });
  };

}]);

mp4Controllers.controller('TasksController', ['$scope', '$window', 'Tasks' , function($scope, $window, Tasks) {
  $scope.currSkip = 0;
  $scope.taskType = "false";
  $scope.sortBy = "dateCreated";
  $scope.direction = "1";

  // get the list of tasks from the backend
  Tasks.getByNum($scope.currSkip, 10).success(function(response) {
    $scope.taskList = response.data;
  });

  // remove a specified task from the backend
  $scope.removeTask = function(id) {
    Tasks.remove(id).success(function(delete_response) {
      Tasks.getAll().success(function(get_response) {
        $scope.taskList = get_response.data;
      });
    });
  };

  // watch the taskType variable to change the radio value
  $scope.$watch('taskType', function() {
    $scope.currSkip = 0;
    $scope.currQuery = {"where": {"completed": $scope.taskType}};

    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.numTasks = response.data.length;
      Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response2) {
        $scope.taskList = response2.data;
        document.getElementById('prev-task-button').className = "disabled button";
        document.getElementById('next-task-button').className = "secondary button";
      });
    });
  });

  // watch the sortBy variable to change the select value
  $scope.$watch('sortBy', function() {
    $scope.currQuery = {"where": {"completed": $scope.taskType}, "limit": 10};

    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.taskList = response.data;
    });
  });

  // watch the direction variable to change the radio value
  $scope.$watch('direction', function() {
    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.taskList = response.data;
    });
  });

  // get the next 10 tasks
  $scope.nextPage = function() {
    if ($scope.currSkip + 10 >= $scope.numTasks) {
      document.getElementById('next-task-button').className = "disabled button";
      return;
    }
    else if ($scope.currSkip + 20 >= $scope.numTasks) {
      document.getElementById('next-task-button').className = "disabled button";
    }

    document.getElementById('prev-task-button').className = "secondary button";
    $scope.currSkip += 10;
    $scope.currQuery = {"where": {"completed": $scope.taskType}, "limit": 10};
    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.taskList = response.data;
    });
  };

  // get the previous 10 tasks
  $scope.prevPage = function() {
    if ($scope.currSkip <= 0) {
      document.getElementById('prev-task-button').className = "disabled button";
      return;
    }
    else if ($scope.currSkip <= 10) {
      document.getElementById('prev-task-button').className = "disabled button";
    }
    $scope.currSkip -= 10;
    document.getElementById('next-task-button').className = "secondary button";
    $scope.currQuery = {"where": {"completed": $scope.taskType}, "limit": 10};
    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.taskList = response.data;
    });
  };

}]);

mp4Controllers.controller('AddTaskController', ['$scope', '$window', 'Tasks', 'Users'  , function($scope, $window, Tasks, Users) {
  $scope.name = "";
  $scope.desc = "";
  $scope.deadline = "";
  $scope.userID = "";

  // get the list of users from the backend
  Users.getAll().success(function(response) {
    $scope.userList = response.data;
  });

  // add a new task to the backend, must get the user to be assigned to
  $scope.addTask = function() {
    Users.getById($scope.userID).success(function(response) {
      $scope.userName = response.data.name;

      Tasks.add({name: $scope.name,
                description: $scope.desc,
                deadline: $scope.deadline,
                assignedUser: $scope.userID,
                assignedUserName: $scope.userName}).then(
        function(response) {
          $scope.status = "Task '" + $scope.name + "' has been added!";
        },
        function(error) {
          $scope.status = error.data.message;
        }
      );
    });
  };

}]);

mp4Controllers.controller('TaskController', ['$scope', '$window', '$routeParams', 'Tasks', function($scope, $window, $routeParams, Tasks) {

  // get the specific task from the backend
  Tasks.getById($routeParams.taskID).success(function(response) {
    $scope.task = response.data;
  });

}]);

mp4Controllers.controller('EditTaskController', ['$scope', '$window', '$routeParams', 'Tasks', 'Users'  , function($scope, $window, $routeParams, Tasks, Users) {

  // get the list of users from the backend
  Users.getAll().success(function(response) {
    $scope.userList = response.data;

    // get the specific task from the backend
    Tasks.getById($routeParams.taskID).success(function(response) {
      $scope.task = response.data;
    });
  });

  $scope.editTask = function() {
    Users.getById($scope.task.assignedUser).success(function(response) {
      $scope.task.assignedUserName = response.data.name;

      // put the task back to the backend
      Tasks.edit($scope.task).then(
        function(response) {
          $scope.status = "Task '" + $scope.task.name + "' has been edited!";
        },
        function(error) {
          $scope.status = error.data.message;
        }
      );
    });
  };

}]);

mp4Controllers.controller('SettingsController', ['$scope' , '$window', function($scope, $window) {

  $scope.url = $window.sessionStorage.baseurl

  // change the baseUrl of the backend
  $scope.changeUrl = function() {
    $window.sessionStorage.baseurl = $scope.url;
    $scope.status = 'URL set';
  };

}]);
