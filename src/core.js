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


function module(name, definition) {
  var current_constructor, global = this;

  if (!global[name]) {
    global[name] = {};
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
  
  function synthesizeProp(name, klass, defaultValue) {
    var intern = '__'+ name;
    if(!(intern in klass)) klass.define(intern, defaultValue);
    klass.property(name,
      function get(){
        return this[intern];
      },
      function set(value){
        if(value != this[intern]) {
          var oldValue = this[intern];
          this[intern] = value;
          this.fire(':property:change', { sender:this, property:name, value:value, previous:oldValue });
        }
      }
    );
  };
  
  var keywords = {
    module: function(name, definition) {
      var module = push_module(name);
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
      current_constructor.prototype.__defineGetter__('klass', function(){ return curr_ctor; });
      definition.call(current_constructor);
      this.include(module.coreMethods);
      current_module()[name] = current_constructor;
      current_constructor = undefined;
    },

    include: function(mixin) {
      for (var slot_name in mixin) {
        current_constructor.prototype[slot_name] = mixin[slot_name];
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

    alias: function(oldName, newName) {
      var fn = (current_constructor) ? current_constructor.prototype[oldName] : current_module()[oldName];
      this.define(newName, fn);
    },
    
    staticMethod: function(name, fn) {
      current_constructor[name] = fn;
    },

    synthesize: function() {
      var props = Array.prototype.slice.call(arguments), self = this;
      if(props.length == 1 && typeOf(props[0]) == 'object') {
        for(var name in props[0]) {
          synthesizeProp(name, self, props[0][name]);
        }
      } else {
        props.forEach(function(name, i){
          synthesizeProp(name, self);
        });
      };
    },

    property: function(name, fnGet, fnSet) {
      if(!fnGet && !fnSet) {
        synthesizeProp(name, this);
      } else {
        this.get(name, fnGet);
        if(fnSet) this.set(name, fnSet);
      }
    },
    
    get: function(name, fn) {
      if(current_constructor) {
        current_constructor.prototype.__defineGetter__(name, fn);
      } else {
        current_module().__defineGetter__(name, fn);
      };
    },
    
    set: function(name, fn) {
      if(current_constructor) {
        current_constructor.prototype.__defineSetter__(name, fn);
      } else {
        current_module().__defineSetter__(name, fn);
      };
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
// TODO: add Observer stuff...
  fire: function(event, data) { // NOOP for now
  },
  on: function(event, handler) { // NOOP for now
  },
  stopOn: function(event, handler) { // NOOP for now
  }
};