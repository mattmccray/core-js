//! main: ../lang.js

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
