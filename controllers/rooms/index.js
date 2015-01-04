var fs = require("fs");
var _ = require("underscore");
var path = require("path");
var async = require("async");

var Room = require("../../models/rooms");

// a service container
module.exports = function(thedb) {
  var root = this;

  // currently active auth key
  this.currentAuthKey = null;

  // a default service; used in .add()
  this.defaultRoom = {
    "name": "Untitled Room",
    "desc": "Untitled Room Description",
    "id": null,
    "image": null,
    "tags": [],
    "things": []
  }

  // the websocket instance
  this.socket = null;

  /**
    Add a new thing to the list of things
  */
  this.add = function(data, done) {
    // update
    this.get(null, function(all) {

      // allocate id
      maxId = _.max(all, function(i) {
        return i.id;
      }).id || 0;

      // add new record
      item = _.extend(root.defaultRoom, data);
      item.id = ++maxId;

      item.type = "service";
      var thing = new Room(item);
      thing.save(function(err, d) {
        // tell the frontend it needs to pull in a new thing
        root.socket && root.socket.emit("backend-data-change", data);

        // callback
        done && done(item.id);
      });
    });
  }

  /**
    Delete a thing from the list of things
  */
  this.delete = function(id, done) {
    Room.remove({id: id}, function(err) {
      // tell the frontend it's time to update
      root.socket && root.socket.emit("backend-data-change", data);

      // callback
      done && done();
    });
  }

  /**
    Get a list of all things connected to the container
  */
  this.get = function(id, done) {

    // get from persistant data store
    Room.find(function(err, docs) {
      ret = [];
      _.each(docs, function(doc) {

        // convert to object from model
        ob = doc.toObject();
        delete ob._id;

        // add to array
        ret.push(ob);
      });

      // search for id
      if (id !== null) {
        ret = _.find(ret, function(i) {
          return i.id == id || undefined;
        });
      }

      done(ret);
    });
  };

  /**
    Replace modified records in one specific thing
  */
  this.update = function(id, changes, done) {

    // update
    this.get(null, function(data) {

      // get the modified record
      var listIndex = null;
      record = _.find(data, function(i, indx) {
        listIndex = indx;
        return i.id == id || undefined;
      });

      // update record's data
      if (record) {
        // add in the new attributes, and save
        record.data = Object.deepExtend(record.data, changes || {});

        Room.update({id: id}, record, {}, function(err) {
          // tell the frontend it's time to update
          root.socket && root.socket.emit("backend-data-change", data);

          // callback
          done && done();
        });

      }
    });
  }



  /**
    Create a response packet with the correct status and message
  */
  this.createResponsePacket = function(status, data) {
    return _.extend({"status": status || "OK", "msg": null}, data || {});
  }



}
