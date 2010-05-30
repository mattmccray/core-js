//! main: ../lang.js

Number.prototype.times = function(fn, bind){
	for (var i = 0; i < this; i++) {
	  fn.call(bind, i, this);
  };
}