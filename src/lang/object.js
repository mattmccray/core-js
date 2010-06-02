//! main: ../lang.js

Native.extendAll(Object, {

  extend: function(tgt, src, dontOverwrite) {
    for(var prop in src) {
      if(src.hasOwnProperty(prop)) {
        if(prop in tgt) {
          if(!dontOverwrite) { 
            tgt[prop] = src[prop]; 
          };
        } else {
          tgt[prop] = src[prop];
        };
      };
    };
    return tgt;
  },
  
  keys: function(obj) {
    var array = new Array();
    for ( var prop in obj ) {
      if ( obj.hasOwnProperty( prop ) ) {
        array.push( prop );
      };
    };
    return array;
  },
  
  values: function(object) {
    var values = [], key;
    for (var key in object)
      values.push(object[key]);
    return values;
  },


  isEmpty: function(object) {
    for (var key in object) break;
    return !key;
  },

  without: function() {
    var filter = Array.from(arguments).flatten(), object = filter.shift(), copy = {}, key;

    for (key in object)
      if (!filter.includes(key) && object.hasOwnProperty(key))
        copy[key] = object[key];

    return copy;
  },

  only: function() {
    var filter = Array.from(arguments).flatten(), object = filter.shift(), copy = {},
        i=0, length = filter.length;

    for (; i < length; i++) {
      if (filter[i] in object)
        copy[filter[i]] = object[filter[i]];
    }

    return copy;
  },

  // NOTE this method _DO_NOT_ change the objects, it creates a new object which conatins all the given ones. 
  merge: function() {
    var object = {}, i=0, length = arguments.length;
    for (; i < length; i++) {
      if (Var.isHash(arguments[i])) {
        Object.extend(object, arguments[i]);
      }
    }
    return object;
  },

  toQueryString: function(object) {
    var tokens = [], key;
    for (var key in object) {
      tokens.push(key+'='+encodeURIComponent(object[key]))
    }
    return tokens.join('&');
  },
  
  fromQueryString: function(qs) {
    if(qs.startsWith('?')) qs = qs.substring(1);
    var object = {};
    qs.split('&').each(function(group) {
      var parts = group.split('=');
          key = unescape(parts.shift()),
          value = unescape(parts.join('='));
      object[key] = value;
    });
    return object;
  },

  // Only REALLY works on WebKit/Mozilla (So firefox, chrome, safari)
  getPrototypeOf: (function(rawProto){ // Memoized
    if ( rawProto ) {
      return function getPrototypeOf(object){
        return object.__proto__;
      };
    } else {
      return function getPrototypeOf(object){
        // May break if the constructor has been tampered with
        return object.constructor.prototype;
      };
    };
  })({}.__proto__),
  
  setPrototypeOf: (function(rawProto){ // Memoized
    if( rawProto ) {
      return function setPrototypeOf(o, proto){
        o.__proto__ = proto;
        return o;
      }
    } 
    else {
      return function setPrototypeOf(o, proto){ 
        for(var field in proto) { // Munge it for IE??
          o.constructor.prototype[field] = proto[field];
        }
        return o;
      }
    }
  })({}.__proto__)
  
});

if(!('defineProperty' in Object) && '__defineGetter__' in Object.prototype) {
  Object.extend('defineProperty', function(object, name, defs) {
    if('get' in defs) object.__defineGetter__(name, defs.get);
    if('set' in defs) object.__defineSetter__(name, defs.set);
    if('value' in defs) { // How to handle defs.value?
      if('set' in defs) defs.call(object, defs.value); // ????
      else object[name] = defs.value;
    };
  });
}

