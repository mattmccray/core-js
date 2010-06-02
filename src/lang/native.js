//! main: ../lang.js

var Native = {
  extend: function(klass, name, fn, force) {
    if(typeof klass[name] == 'undefined' || force) {
      klass[name] = fn;
    };
  },
  extendAll: function(klass, defs, force) {
    for(var key in defs) {
      if(defs.hasOwnProperty(key)) {
        Native.extend(klass, key, defs[key], force);
      };
    };
  },
  implement: function(klass, name, fn, force) {
    if(typeof klass.prototype[name] == 'undefined' || force) {
      klass.prototype[name] = fn;
    };
  },
  implementAll: function(klass, defs, force) {
    for(var key in defs) {
      if(defs.hasOwnProperty(key)) {
        Native.implement(klass, key, defs[key], force);
      };
    };
  }
};
