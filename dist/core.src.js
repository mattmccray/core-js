/*
Core.js (v0.6.1)
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

Native.extendAll(Array, {

  from: function(item) {
    if (item == null) return [];
    return (Var.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : Array.prototype.slice.call(item) : (typeOf(item) == 'string') ? item.split(' ') :  [item];
  }

});

Native.implementAll(Array, {

  forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		};
	},

	each: function(fn, bind) {
	  return this.forEach(fn, bind);
	},

	includes: function() {
    for (var i=0, length = arguments.length; i < length; i++)
      if (this.indexOf(arguments[i]) == -1)
        return false;
    return true;
  },

  first: function() {
    if(arguments.length == 1 && Var.isFunction(arguments[0])) {
      var fn = arguments[0];
      for (var i=0; i < this.length; i++) {
        if(fn.call(this, this[i])) return this[i];
      };
      return false;
    } else {
      return this[0];
    }
  },

  last: function() {
    if(arguments.length == 1 && Var.isFunction(arguments[0])) {
      var fn = arguments[0];
      for (var i = this.length - 1; i >= 0; i--){
        if(fn.call(this, this[i])) return this[i];
      };
      return false;
    } else {
      return this[this.length-1];
    }
  },

  without: function() {
    var filter = Array.from(arguments);
    return this.filter(function(value) {
      return !filter.includes(value);
    });
  },

  min: function() {
    return Math.min.apply(Math, this);
  },

  max: function() {
    return Math.max.apply(Math, this);
  },

  uniq: function() {
    return [].merge(this);
  },

  compact: function() {
    return this.without(null, [][0]); // <- shorter undefined
  },

  merge: function() {
    for (var copy = this.clone(), arg, i=0, j, length = arguments.length; i < length; i++) {
      arg = arguments[i];
      arg = Var.isArray(arg) ? arg : [arg];

      for (j=0; j < arg.length; j++) {
        if (copy.indexOf(arg[j]) == -1)
          copy.push(arg[j]);
      }
    }
    return copy;
  },

  clone: function() {
    return this.slice(0);
  },

  isEmpty: function() {
    return !this.length;
  },

  flatten: function() {
    var copy = [];
    this.forEach(function(value) {
      if (Var.isArray(value)) {
        copy = copy.concat(value.flatten());
      } else {
        copy.push(value);
      }
    });
    return copy;
  },
})

Native.implementAll(Function, {

  bind: function() {
    var func = this, args = Array.from(arguments), context = args.shift();
    return function bound() {
      var localArgs = args.concat(Array.from(arguments));
      return func.apply(context, localArgs);
    };
  },

  delay: function() {
    var args = Array.from(arguments),
        timeout = args.shift(),
        timer = new Number(window.setTimeout(this.bind.apply(this, [this].concat(args)), timeout));
    timer.cancel = function(){ window.clearTimeout(this) };
    return timer;
  },

  periodical: function() {
    var args  = Array.from(arguments), timeout = args.shift(),
        timer = new Number(window.setInterval(this.bind.apply(this, [this].concat(args)), timeout));
    timer.stop = function() { window.clearInterval(this); };
    return timer;
  }

});



if(window.JSON) {
  Native.extend(JSON, 'translate', function translate(types) {
    return function translator(key, value) {
      if(key in types) {
        switch(types[key]) {
          case 'Date':
            return new Date(Date(value));
          case 'Time':
            return new Date(Date(value)).getTime();
          case 'int':
            return parseInt(value);
          case 'float':
            return parseFloat(value);
          case 'bool':
            return (value) ? true : false;
          case 'String':
            return (value) ? true : false;
          default:
            return value.toString();
        };
      } else {
        return value;
      };
    };
  });
};

Native.extendAll(Math, {

  randomBetween: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

});

Native.extendAll(Number, {

  random: function(min, max) {
    return Math.randomBetween(min, max);
  }

});

Native.implementAll(Number, {

  times: function(fn, bind) {
    for (var i = 0; i < this; i++) {
  	  fn.call(bind, i, this);
    };
  }

});

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

  getPrototypeOf: (function(rawProto){ // Memoized
    if ( rawProto ) {
      return function getPrototypeOf(object){
        return object.__proto__;
      };
    } else {
      return function getPrototypeOf(object){
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


Native.implementAll(String, {

  toSlug: function() {
    return this.trim().toLowerCase().replace(/[^-a-z0-9~\s\.:;+=_]/g, '').replace(/[\s\.:;=_+]+/g, '-').replace(/[\-]{2,}/g, '-');
  },

  merge: function(data) {
    data = Var.isHash(data) ? data : Array.from(arguments).flatten();
    return this.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split("."), value = data[keys.shift()];
        keys.each(function (key) { value = value[key]; });
        return (value === null || value === undefined) ? "" : value;
    });
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  trim: String.prototype.trim || function() {
    var str = this.replace(/^\s\s*/, ''), i = str.length;
    while (/\s/.test(str.charAt(--i)));
    return str.slice(0, i + 1);
  },

  stripTags: function() {
    return this.replace(/<\/?[^>]+>/ig, '');
  },

  camelize: function() {
    return this.replace(/(\-|_)+(.)?/g, function(match, dash, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  },

  underscored: function() {
    return this.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/\-/g, '_').toLowerCase();
  },

  capitalize: function() { // Kinda weak...
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  includes: function(string) {
    return this.indexOf(string) != -1;
  },

  startsWith: function(string, ignorecase) {
    var start_str = this.substr(0, string.length);
    return ignorecase ? start_str.toLowerCase() === string.toLowerCase() :
      start_str === string;
  },

  endsWith: function(string, ignorecase) {
    var end_str = this.substring(this.length - string.length);
    return ignorecase ? end_str.toLowerCase() === string.toLowerCase() :
      end_str === string;
  },

  toInt: function(base) {
    return parseInt(this, base || 10);
  },

  toFloat: function(strict) {
    return parseFloat(strict ? this : this.replace(',', '.').replace(/(\d)-(\d)/g, '$1.$2'));
  }

})

var Var = {

  isEnumerable: function(item){
  	return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
  },

  isDefined: function(item) {
    return typeOf(item) != 'undefined';
  },

  isFunction: function(item) {
    return typeOf(item) === 'function';
  },

  isObject: function(item) {
    return typeOf(item) == 'object';
  },

  isHash: function(item) {
    return item.toString() === '[object Object]';
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



    var ancestor = current_constructor.ancestors.first(function(proto) { return proto.hasOwnProperty(name) && Var.isFunction(proto[name]); });

    console.log(" super."+ name +" from: "+ ancestor.klass.displayName);
    console.dir(ancestor[name])

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
      console.log(name +" is subklassing: "+ parent.displayName);
      var grandparent = parent.prototype,
          parentProps = (parent.className in propertyCache) ? Object.keys(propertyCache[parent.className]) : [],
          exclusions = excludeFields.clone().concat(parentProps).flatten();
      current_constructor.prototype = Object.without(parent.prototype, exclusions);
      current_constructor.prototype.klass = current_constructor;
      current_constructor.prototype.superKlass = parent;
      for(var prop in Object.without(parent, exclusions)) {// Copy static methods...
        console.log(" + static method: "+ prop)
        current_constructor[prop] = parent[prop];
      };
      for (var i=0; i < parentProps.length; i++) {
        var prop = parentProps[i];
        console.log(" @ property: "+ prop)
        this.property(prop, propertyCache[parent.className][prop]);
      };

      while (grandparent) {
        console.log(' > ancestor chain: '+ grandparent.klass.displayName);
        current_constructor.ancestors.push(grandparent);
        grandparent = ('superKlass' in grandparent) ? grandparent.superKlass.prototype : false;
      };
    };

    this.include(module.coreMethods);

    definition.call(current_constructor);

    current_module()[name] = current_constructor;

    if(parent && 'didSubklass' in parent) {
      parent.didSubklass(current_constructor);
    };

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
      if(current_constructor) {
        cache_property(current_constructor.className, name, definition);
        Object.defineProperty(current_constructor.prototype, name, definition);
      } else {
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
