app.controller("LoginController", function($scope, $http, loginService) {

  var root = this;

  this.username = "superadmin";
  this.password = "root";

  this.login = function() {
    loginService.login(root.username, root.password);
  }
});

app.factory("loginService", function($http, $location) {
  return {
    auth: {username: null},

    login: function(user, pass) {
      var root = this;
      $http({
        method: "POST",
        url: host+"/auth",
        data: {name: user, pass: pass}
      }).success(function(data) {
        // save it all into the auth area
        root.auth = data;

        // go to the dash
        $location.url("/dash");
      });
    },

    logout: function() {
      var root = this;
      $http({
        method: "DELETE",
        url: host+"/auth",
        headers: {Authentication: this.auth.key || ""}
      }).success(function(data) {
        // logout
        root.auth = {username: null};
      });
    },

    // if user has permission to do something
    // if permission is thing.edit: thing.edit, thing.*, * all work
    can: function(permission) {
      if (typeof this.auth.permissions === "object") {
        resp = [];
        _.each(this.auth.permissions, function(p) {
          resp.push( matchWildcard(p, permission).length );
        });
        console.log(permission, resp);
        return _.filter(resp, function(x) { return x !== undefined; }).length;
      } else {
        return false;
      }
    }

  }
});
