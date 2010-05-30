/*
Core.js (v0.6)
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
