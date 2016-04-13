var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', '$http', 'Users', 'Tasks', function($scope, $http, Users, Tasks) {

  // get the list of users from the backend for listing them
  Users.getAll().success(function(response) {
    $scope.userList = response.data;
  });

  // remove a specified user from the backend
  $scope.removeUser = function(id) {

    // get the user by their id, and set their assigned tasks to unassigned
    Tasks.getByQuery({"assignedUser": id}).success(function(tasks_obj) {
      for (var i = 0; i < tasks_obj.data.length; i++) {
        tasks_obj.data[i].assignedUser = '';
        tasks_obj.data[i].assignedUserName = 'unassigned';
        Tasks.edit(tasks_obj.data[i]).success(function(add_response) {});
      }

      // actually remove the user
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

  // get the list of INCOMPLETE tasks from the backend that are assigned to this user
  Tasks.getByQuery({"assignedUser": $routeParams.userID, "completed": false}).success(function(response) {
    $scope.incompleteTaskList = response.data;
  });

  // get the list of COMPLETE tasks from the backend that are assigned to this user
  $scope.showCompleted = function() {
    Tasks.getByQuery({assignedUser: $routeParams.userID, completed: true}).success(function(response) {
      $scope.completeTaskList = response.data;
    });
  };

  // mark a task as completed
  $scope.completeTask = function(id) {

    // get the task by it's id and modify it's 'completed' attribute to true
    Tasks.getById(id).success(function(obj) {
      obj.data.completed = true;
      Tasks.edit(obj.data).success(function(edit_response) {
        Tasks.getByQuery({"assignedUser": $routeParams.userID, "completed": false}).success(function(getall_response) {
          $scope.incompleteTaskList = getall_response.data;
        });
      });

      // remove the task from the users pending list
      var index = $scope.user.pendingTasks.indexOf(id);
      if (index > -1)
        $scope.user.pendingTasks.splice(index, 1);
      Users.put($scope.user).success(function(response) {});
    });
  };

}]);

mp4Controllers.controller('TasksController', ['$scope', '$window', 'Tasks', 'Users' , function($scope, $window, Tasks, Users) {
  $scope.currSkip = 0;
  $scope.taskType = "false";
  $scope.sortBy = "dateCreated";
  $scope.direction = "1";

  // get the list of tasks from the backend for displaying
  Tasks.getByNum($scope.currSkip, 10).success(function(response) {
    $scope.taskList = response.data;
  });

  // remove a specified task from the backend
  $scope.removeTask = function(id) {
    Tasks.getById(id).success(function(get_task_response) {
      $scope.ownerID = get_task_response.data.assignedUser;

      // if the task is assigned to someone, get their user ID and remove the task from their pending list
      if ($scope.ownerID != "") {
        Users.getById($scope.ownerID).success(function(get_user_response) {
          $scope.owner = get_user_response.data;
          var index = $scope.owner.pendingTasks.indexOf(id);
          if (index > -1)
            $scope.owner.pendingTasks.splice(index, 1);

          Users.put($scope.owner).success(function(put_response) {});
        });
      }
    });

    // remove the task itself
    Tasks.remove(id).success(function(delete_response) {
      Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(get_response) {
        $scope.taskList = get_response.data;
      });
    });
  };

  // watch the taskType variable to change the [pending, completed, all] sort option
  $scope.$watch('taskType', function() {
    $scope.currSkip = 0;

    // if the task type is undefined (user selected 'all'), display both true and false tasks
    if ($scope.taskType != undefined) {
      $scope.currQuery = {"where": {"completed": $scope.taskType}};
    }
    else {
      $scope.currQuery = {"where": {"completed": {"$in": [true, false]} }};
    }

    // get 10 new tasks and reset the task skip whenever the sort option is changed
    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.numTasks = response.data.length;
      Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response2) {
        $scope.taskList = response2.data;
        document.getElementById('prev-task-button').className = "disabled button";
        document.getElementById('next-task-button').className = "secondary button";
      });
    });
  });

  // watch the sortBy variable to change the [dateCreated, deadline, name, assignedUserName] sort option
  $scope.$watch('sortBy', function() {
    $scope.currQuery = {"where": {"completed": $scope.taskType}, "limit": 10};

    // get 10 new tasks but dont reset the task skip whenever the sort option is changed
    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.taskList = response.data;
    });
  });

  // watch the direction variable to change the radio value
  $scope.$watch('direction', function() {

    // get 10 new tasks but dont reset the task skip whenever the sort option is changed
    Tasks.getByPagination($scope.currSkip, $scope.sortBy, $scope.currQuery, $scope.direction).success(function(response) {
      $scope.taskList = response.data;
    });
  });

  // when 'next' is pressed, get the next 10 tasks (if they are available), also modify the buttons pressabilities if necessary
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

  // when 'previous' is pressed, get the next 10 tasks (if they are available), also modify the buttons pressabilities if necessary
  $scope.prevPage = function() {
    if ($scope.currSkip <= 0) {
      document.getElementById('prev-task-button').className = "disabled button";
      return;
    }
    else if ($scope.currSkip <= 10) {
      document.getElementById('prev-task-button').className = "disabled button";
    }

    document.getElementById('next-task-button').className = "secondary button";
    $scope.currSkip -= 10;
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

  // get the list of users from the backend for picking who to assign the task to
  Users.getAll().success(function(response) {
    $scope.userList = response.data;
  });

  // add a new task to the backend
  $scope.addTask = function() {

    //find the user the task selected
    Users.getById($scope.userID).success(function(response) {
      $scope.user = response.data;
      $scope.userName = response.data.name;

      // actually add the task
      Tasks.add({name: $scope.name,
                description: $scope.desc,
                deadline: $scope.deadline,
                assignedUser: $scope.userID,
                assignedUserName: $scope.userName}).then(
        function(response) {
          $scope.status = response.data.message;
          $scope.taskID = response.data.data._id;

          if ($scope.user != undefined) {
            $scope.user.pendingTasks.push($scope.taskID);
            Users.put($scope.user).success(function(response) {});
          }
        },
        function(error) {
          $scope.status = error.data.message;
        }
      );
    });
  };

}]);

mp4Controllers.controller('TaskController', ['$scope', '$window', '$routeParams', 'Tasks', function($scope, $window, $routeParams, Tasks) {

  // get the specific task details from the backend
  Tasks.getById($routeParams.taskID).success(function(response) {
    $scope.task = response.data;
  });

}]);

mp4Controllers.controller('EditTaskController', ['$scope', '$window', '$routeParams', 'Tasks', 'Users'  , function($scope, $window, $routeParams, Tasks, Users) {

  // get the list of users from the backend for picking who to assign the task to
  Users.getAll().success(function(response) {
    $scope.userList = response.data;

    // get the specific task from the backend for modifying
    Tasks.getById($routeParams.taskID).success(function(response) {
      $scope.task = response.data;

      // if the task is assigned a user, get their object for later
      if ($scope.task.assignedUser != '') {
        Users.getById($scope.task.assignedUser).success(function(response) {
          $scope.orig_owner = response.data;
        });
      }
    });
  });

  // clicking 'edit' to put the new task
  $scope.editTask = function() {

    // get the new user the task is assigned to (may be same as old)
    Users.getById($scope.task.assignedUser).success(function(response) {
      $scope.owner = response.data;
      $scope.task.assignedUserName = $scope.owner.name

      // if the old owner existed, compare the new and old owner and modify the pending tasks if necessary
      if ($scope.orig_owner != undefined) {

        // new owner != old owner
        if ($scope.orig_owner._id != $scope.owner._id) {
          var index = $scope.orig_owner.pendingTasks.indexOf($scope.task._id);
          if (index > -1)
            $scope.orig_owner.pendingTasks.splice(index, 1);
          $scope.owner.pendingTasks.push($scope.task._id);

          Users.put($scope.orig_owner).success(function(put_reponse) {});

          if ($scope.task.completed === false)
            Users.put($scope.owner).success(function(put_response) {});
        }

        // new owner == old owner and task is changing to NOT COMPLETE
        else if ($scope.task.completed === false && $scope.owner.pendingTasks.indexOf($scope.task._id) === -1) {
          $scope.owner.pendingTasks.push($scope.task._id);
          Users.put($scope.owner).success(function(put_response) {});
        }

        // new owner == old owner and task is changing to COMPLETE
        else if ($scope.task.completed === true && $scope.owner.pendingTasks.indexOf($scope.task._id) > -1) {
          $scope.owner.pendingTasks.splice(index, 1);
          Users.put($scope.owner).success(function(put_response) {});
        }
      }
      else if ($scope.owner != undefined && $scope.task.completed === false) {
        $scope.owner.pendingTasks.push($scope.task._id);
        Users.put($scope.owner).success(function(put_response) {});
      }

      // put the task to the backend
      Tasks.edit($scope.task).then(
        function(response) {
          $scope.status = response.data.message;
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
