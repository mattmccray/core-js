/*
Core.js - Language Extensions (v0.6)
  M@ McCray <matt@elucidata.net>
  http://github.com/darthapo/core-js

(Requires Core.js) Tested and works in WebKit (Safari 4 & Chrome 4) & FireFox 3.6.
*/


Array.from = function(item) {
  if (item == null) return [];
  if(typeOf(item) == 'string') return ;
  return (Var.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : Array.prototype.slice.call(item) : (typeOf(item) == 'string') ? item.split(' ') :  [item];
};


if(!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		};
	};
};

(function(old_random) {
  Math.old_random = old_random;
  Math.random = function(min, max) {
    if(arguments.length == 2) return Math.floor(old_random() * (max - min + 1) + min);
    else return old_random();
  };
})(Math.random);

Number.prototype.times = function(fn, bind){
	for (var i = 0; i < this; i++) {
	  fn.call(bind, i, this);
  };
}

Object.prototype.alias = function(oldName, newName) {
  this[newName] = this[oldName];
}


if(!'keys' in Object) {
  Object.keys = function( obj ) {
    var array = new Array();
    for ( var prop in obj ) {
      if ( obj.hasOwnProperty( prop ) ) {
        array.push( prop );
      }
    }
    return array;
  };
}


if ( typeof Object.getPrototypeOf !== "function" ) {
  if ( typeof "test".__proto__ === "object" ) {
    Object.getPrototypeOf = function getPrototypeOf(object){
      return object.__proto__;
    };
  } else {
    Object.getPrototypeOf = function getPrototypeOf(object){
      return object.constructor.prototype;
    };
  };
};

Object.setPrototypeOf = (function(){ // Memoized
  if( {}.__proto__ ) {
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
})();

var Var = {

  isEnumerable: function(item){
  	return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
  },

  isDefined: function(item) {
    return typeOf(item) != 'undefined';
  },

  isObject: function(item) {
    return typeOf(item) == 'object';
  },

  isArray: function(item) {
    return typeOf(item) == 'array';
  },

  isRegExp: function(item) {
    return typeOf(item) == 'regexp';
  },

  isDate: function(item) {
    return typeOf(item) == 'date';
  },

  isBoolean: function(item) {
    return typeOf(item) == 'boolean';
  },
  isBool: function(item) {
    return this.isBoolean(item)
  },

  isNumber: function(item) {
    return typeOf(item) == 'number';
  },

  isNull: function(item) {
    return typeOf(item) == 'null';
  },

  isNaN: function(item) {
    return typeOf(item).toLowerCase() == 'nan';
  },

  isElement: function(item) {
    return (item instanceof HTMLElement);
  }
};
