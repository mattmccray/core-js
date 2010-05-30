/*
Core.js & Language Extensions (v0.5.1)
  M@ McCray <matt@elucidata.net>
  http://github.com/darthapo/core-js

Tested and works in WebKit (Safari 4 & Chrome 4) & FireFox 3.6.
*/

/*
Core.js (v0.5.1)
  M@ McCray <matt@elucidata.net>
  http://github.com/darthapo/core-js

Tested and works in WebKit (Safari 4 & Chrome 4) & FireFox 3.6.
*/

var typeOf = (function(){
  var arrayCtor  = (new Array).constructor,
      dateCtor   = (new Date).constructor,
      regexpCtor = (new RegExp).constructor;
  return function typeOf(v) {
    var typeStr = typeof(v);
    if (typeStr == "object" || typeStr == 'function') {
      if (v === null) return "null";
      if (v.constructor == arrayCtor) return "array";
      if (v.constructor == dateCtor) return "date";
      if (v.constructor == regexpCtor) return "regexp";
    };
    return typeStr;
  };
})();


function module(name, definition) {
  var current_constructor, global = this, lastLogGroup = null;
  if (!global[name]) {
    global[name] = {};
    for(var prop in module.coreMethods) {
      global[name][prop] = module.coreMethods[prop];
    };
  };
  var module_stack = [global[name]],
      module_path = [name];

  function current_module() {
    return module_stack[module_stack.length -1];
  };

  function push_module(name) {
    if (!current_module()[name]) {
      current_module()[name] = {};
    };
    var module = current_module()[name];
    module_stack.push(module);
    module_path.push(name);
    return module;
  };

  function pop_module() {
    module_stack.pop();
    module_path.pop();
  };

  function fullpath(name) {
    return module_path.join(".") + "." + name;
  }

  function clone(object) {
    var cleaned = {};
    for(var name in object) {
      if(object.hasOwnProperty(name)) {
        cleaned[name] = object[name];
      };
    };
    return cleaned;
  }

  var keywords = {
    module: function(name, definition) {
      var module = push_module(name);
      this.include(module.coreMethods);
      definition.call(module);
      pop_module();
    },

    klass: function(name, definition) {
      current_constructor = function() {
        if (this.initialize) {
          this.initialize.apply(this, arguments);
        };
      };
      var curr_ctor = current_constructor;
      current_constructor.displayName = name;
      current_constructor.className = fullpath(name);
      Object.defineProperty(current_constructor.prototype, "klass", {
      	get : function () { return curr_ctor; },
      	configurable: false,
      	enumerable: true,
      });
      definition.call(current_constructor);
      this.include(module.coreMethods);
      current_module()[name] = current_constructor;
      current_constructor = undefined;
    },

    subklass: function(parent, name, definition) {
      current_constructor = function() {
        if (this.initialize) {
          this.initialize.apply(this, arguments);
        };
      };
      current_constructor.prototype = clone(parent.prototype);
      for(var prop in clone(parent)) { // Copy static methods...
        current_constructor[prop] = parent[prop];
      };
      for(var prop in module.coreMethods) {
        current_constructor[prop] = module.coreMethods[prop];
      };
      var curr_ctor = current_constructor;
      current_constructor.displayName = name;
      current_constructor.className = fullpath(name);
      Object.defineProperty(current_constructor.prototype, "klass", {
      	get : function () { return curr_ctor; },
      	configurable: false,
      	enumerable: true,
      });
      Object.defineProperty(current_constructor.prototype, "superKlass", {
      	get : function () { return parent; },
      	configurable: false,
      	enumerable: true,
      });
      definition.call(current_constructor);
      this.include(module.coreMethods);
      current_module()[name] = current_constructor;
      if('didSubklass' in parent) {
        parent.didSubklass(current_constructor);
      };
      current_constructor = undefined;
    },

    include: function(mixin) {
      for (var prop in mixin) {
        this.define(prop, mixin[prop]);
      };
    },

    define: function(name, item) {
      if(current_constructor) {
        current_constructor.prototype[name] = item;
      } else {
        current_module()[name] = item;
      };
    },

    method: function(name, fn) {
      this.define(name, fn)
    },

    ctor: function(fn) {
      this.method('initialize', fn);
    },

    alias: function(oldName, newName) {
      var fn = (current_constructor) ? current_constructor.prototype[oldName] : current_module()[oldName];
      this.define(newName, fn);
    },

    staticMethod: function(name, fn) {
      current_constructor[name] = fn;
    },

    property: function(name, definition) {
      if(current_constructor) {
        Object.defineProperty(current_constructor.prototype, name, definition);
      } else {
        Object.defineProperty(current_module(), name, definition);
      };
    },

    properties: function(props) {
      for(var name in props) {
        this.property(name, props[name]);
      }
    },

    log: function() {
      if(!module.debug) return;
      var caller_name = module_path.join('.');
      if(window.console && console.log) {
        if(caller_name && console.group && caller_name != lastLogGroup) {
          console.groupEnd()
          console.group(caller_name +" ("+ (new Date()).getTime() +")");
          lastLogGroup = caller_name;
        }
        var args = Array.prototype.slice.call(arguments);
        args.forEach(function(arg){
          console.log(arg);
        })
      }
    }
  };

  with(current_module()) { with(keywords) { // Not sure if this will stay around or not -- It's handy for now.
    eval("("+ definition +")").call(current_module(), keywords);
  }};
};

module.coreMethods = {

  method: function() {
    var self = this,
        args = Array.prototype.slice.call(arguments),
        meth = self[args.shift()];
    return function curriedMethod() {
      return meth.apply(self, args.concat(Array.prototype.slice.call(arguments)));
    };
  },

  callSuper: function() {
    if('superKlass' in this || 'superKlass' in this.prototype) {
      var parent = this.superKlass || this.prototype.superKlass,
          args = Array.prototype.slice.call(arguments),
          meth = args.shift();
      if(meth in parent.prototype) {
        return parent.prototype[meth].apply(this,args);
      } else if(meth in parent) { // Is this such a good idea?
        return parent[meth].apply(this,args);
      } else {
        throw "Method not found: "+ meth;
      };
    } else {
      throw "No super class found!";
    }
  },

  fire: function(eventName, data) { // NOOP for now
    if(!this.__listeners || !(eventName in this.__listeners)) return;
    this.__listeners[eventName].forEach(function(handler){ handler.call(this, data); });
    return this;
  },

  on: function(eventName, handler) { // NOOP for now
    if(!this.__listeners) this.__listeners = {};
    if(!(eventName in this.__listeners)) this.__listeners[eventName] = [];
    this.__listeners[eventName].push(handler);
    return this;
  },
  observe: function(eventName, handler) { return this.on(eventName, handler); },

  stopObserving: function(eventName, handler) { // NOOP for now
    if(!this.__listeners || !(eventName in this.__listeners)) return;
    if(handler)
      this.__listeners[eventName] = this.__listeners[eventName].filter(function(h){ return h !== handler; });
    else
      this.__listeners[eventName] = [];
    return this;
  }
};

module.debug = false;
/*
Core.js - Language Extensions (v0.5.1)
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
