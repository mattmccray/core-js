//! main: ../lang.js

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
