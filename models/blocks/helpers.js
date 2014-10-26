// some small helper apis to make stuff easier
module.exports = function(socket, things, services, item) {

  return {

    // get a thing by its tag
    getThingByTag: function(tag, cb) {
      things.get(null, function(data) {

        // get matching things
        fltr = _.filter(data, function(item) {
          return _.contains(item.tags, tag);
        });

        // iterate over them
        _.each(fltr, function(f, ct) {
          cb(f, ct);
        });
      });
    },

    // set value for things
    setThingValue: function(id, key, value, callback) {
      // set up the object
      obj = {}
      obj[key] = {value: value};

      // update
      things.update(id, obj, function(data) {
        callback && (data && callback(true) || callback(null));
      });
    },




    // get and set persistant variables intividual to that block
    get: function(elem) {
      return item.data[elem];
    },

    set: function(elem, value) {
      if (!item.data) item.data = []
      item.data[elem] = value;
      return true;
    },




    // log to console underneath the block
    log: function(msg) {
      socket && socket.emit("block-log", {
        id: item.id,
        type: "info",
        msg: msg
      });
    }


  };
};