var userCan = require("../controllers/auth").canMiddleware;

module.exports = function(app, users) {

  // is this a new que instance (with zero users?)
  app.get("/users/any", function(req, res) {
    users.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({newInstance: !data.length}));
    });
  });

  // get all users
  app.get("/users/all", userCan("user.view.all"), function(req, res, next) {
    users.get(null, function(data) {
      res.status(200);
      res.end(JSON.stringify({data: data}));
    });
  });

  // add a user
  app.post("/users/add", userCan("user.create"), function(req, res, next) {
    users.add(req.body, function(err, d) {
      err &&
        res.send( users.createResponsePacket({error: err}) ) ||
        res.send( users.createResponsePacket() );
    });
  });

  // delete a user
  app.delete("/users/:id", userCan("user.delete.#id"), function(req, res, next) {
    users.delete(req.param("id"), function(err) {
      res.send( users.createResponsePacket() );
    });
  });

  // modify / change user's code
  app.put("/users/:id", userCan("user.edit.#id"), function(req, res, next) {
    users.update(req.param("id"), req.body, function() {
      res.send( users.createResponsePacket() );
    });
  });

}
