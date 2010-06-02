//! main: ../lang.js

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

