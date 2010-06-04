//! output: ../dist/core.src.js
//! yuic_to: ../dist/core.min.js 
//! lib_path: ../lib
/*
Core.js (v<%= VERSION %>)
  <%= AUTHOR %>
  <%= URL %>

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

//= require "lang"

function module(name, definition) {
  var current_constructor, parent_klass, global = this, lastLogGroup = null, propertyCache = {};
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
  };
  
  function clone(object) {
    var cleaned = {};
    for(var name in object) {
      if(object.hasOwnProperty(name)) {
        cleaned[name] = object[name];
      };
    };
    return cleaned;
  };
  
  function cache_property(path, prop, def) {
    if(!propertyCache[path]) propertyCache[path] = {};
    propertyCache[path][prop] = def;
  };
  
  function property_in_cache(path, prop) {
    return ( path in propertyCache && prop in propertyCache[path] );
  };
  
  function has_super(name) {
    if(parent_klass) {
      var parent = parent_klass.prototype,
          inside = (name in parent),
          anctrs = (current_constructor) ? current_constructor.ancestors.first(function(proto) { return name in proto && Var.isFunction(proto[name]); }) : false;
      return inside || anctrs;
    }
    return false;
  };
  
  function get_super(name) {
//     var parent = parent_klass.prototype;
//     console.log('Returning {0}.{1}()'.merge(parent_klass.displayName, name))
// //    console.log(parent[name])
//     return parent[name]; // Hmmm...

  
//console.log("Getting super."+ name +"() "+ current_constructor.displayName +" > "+ current_constructor.ancestors.map(function(a){ return a.klass.displayName; }).join(" > "));
//console.log(current_constructor.ancestors.map(function(a){ return a.klass.displayName; }))
    
    var ancestor = current_constructor.ancestors.first(function(proto) { return proto.hasOwnProperty(name) && Var.isFunction(proto[name]); });

//    console.log(" super."+ name +" from: "+ ancestor.klass.displayName);
//    console.dir(ancestor[name])

    return ancestor[name];
  };
  
  var excludeFields = Array.from('klass superKlass didSubklass ancestors className displayName').concat(Object.keys(module.coreMethods)).flatten();
  
  function build_class(name, definition, parent) {
    parent_klass = parent;
    current_constructor = function() {
      if (this.initialize) {
        this.initialize.apply(this, arguments);
      };
    };

    current_constructor.ancestors = [];
    current_constructor.displayName = name;
    current_constructor.className = fullpath(name);
    current_constructor.prototype.klass = current_constructor;
    
    if(parent) {
//      console.log(name +" is subklassing: "+ parent.displayName);
      var grandparent = parent.prototype, 
          parentProps = (parent.className in propertyCache) ? Object.keys(propertyCache[parent.className]) : [],
          exclusions = excludeFields.clone().concat(parentProps).flatten();
      current_constructor.prototype = Object.without(parent.prototype, exclusions);
      current_constructor.prototype.klass = current_constructor;
      current_constructor.prototype.superKlass = parent;
      for(var prop in Object.without(parent, exclusions)) {// Copy static methods...
//        console.log(" + static method: "+ prop)
        current_constructor[prop] = parent[prop];
      };
//       for (var i=0; i < parentProps.length; i++) {
//         var prop = parentProps[i];
// //        console.log(" @ property: "+ prop)
//         this.property(prop, propertyCache[parent.className][prop]);
//       };
      while (grandparent) {
//        console.log(' > ancestor chain: '+ grandparent.klass.displayName);
        current_constructor.ancestors.push(grandparent);
        grandparent = ('superKlass' in grandparent) ? grandparent.superKlass.prototype : false;
      };
    };

    this.include(module.coreMethods);
    
    definition.call(current_constructor);
    
    if(parent) {
      for (var i=0; i < parentProps.length; i++) {
        var prop = parentProps[i];
        if(!property_in_cache(current_constructor.className, prop)) {
//        console.log(" @ property: "+ prop)
          this.property(prop, propertyCache[parent.className][prop]);
        };
      };
      if('didSubklass' in parent) {
        parent.didSubklass(current_constructor);
      };
    };

    current_module()[name] = current_constructor;

    // if(parent && 'didSubklass' in parent) {
    //   parent.didSubklass(current_constructor);
    // };
    
    current_constructor = undefined;
    parent_klass = undefined;
  };
  
  var keywords = {
    module: function(name, definition) {
      var module = push_module(name);
      this.include(module.coreMethods);
      definition.call(module);
      pop_module();
    },
    
    klass: function(name, definition) {
      build_class.call(this, name, definition, false);
    },
    
    subklass: function(parent, name, definition) {
      build_class.call(this, name, definition, parent);
    },
    
//     _super: function(name) {
// //      alert(has_super(name))
//     },

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
      if( has_super(name) ) {
        var superFn = get_super(name);
        this.define(name, function(){
          this._super = superFn;
          return fn.apply(this, arguments);
        })
      } else {
        this.define(name, fn)
      }
    },
    
    ctor: function(fn) {
      this.method('initialize', fn);
    },

    alias: function(oldName, newName) {
      var fn = (current_constructor) ? current_constructor.prototype[oldName] : current_module()[oldName];
      this.define(newName, fn);
    },
    
    staticMethod: function(name, fn) {
      // Check of parent...
      if(name in current_constructor) {
        var superFn = current_constructor[name];
        current_constructor[name] = function(){
          this._super = superFn;
          return fn.apply(this, arguments);
        };
      } else {
        current_constructor[name] = fn;
      };
    },

    property: function(name, definition) {
      // definition.configurable = true;
      // if(!'value' in definition) definition.writable = true;
      // definition.enumerable = true;
      if(current_constructor && !property_in_cache(current_constructor.className, name)) {
        cache_property(current_constructor.className, name, definition);
        Object.defineProperty(current_constructor.prototype, name, definition);
      } else if(!property_in_cache(module_path.join('.'), name)) {
        cache_property(module_path.join('.'), name, definition);
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