//! main: ../lang.js

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