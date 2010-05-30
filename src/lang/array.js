//! main: ../lang.js

Array.from = function(item) {
  if (item == null) return [];
  if(typeOf(item) == 'string') return ;
  return (Var.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : Array.prototype.slice.call(item) : (typeOf(item) == 'string') ? item.split(' ') :  [item];
};


if(!Array.prototype.forEach) {
  // Implement forEach
  Array.prototype.forEach = function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		};
	};  
};
