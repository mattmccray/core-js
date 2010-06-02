//! main: ../lang.js

Native.extendAll(Math, {
  
  randomBetween: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
});
