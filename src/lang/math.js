//! main: ../lang.js

// Math.random()
(function(old_random) {
  Math.old_random = old_random;
  Math.random = function(min, max) {
    if(arguments.length == 2) return Math.floor(old_random() * (max - min + 1) + min);
    else return old_random();
  };
})(Math.random);
