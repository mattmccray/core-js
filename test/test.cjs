// Just an idea... Translate 'cjs' into core.js compliant javascript?

module App {
  
  method init(containerId) {
    this.viewer = new Viewer(containerId);
  }
  
  class Viewer {
    
    ctor(containerId) {
      this.container = dom.get(containerId);
    }
    
    method doSomething(param) {
      alert('bang!');
    }
    
  }
  
}

// Compiles to:
module('App', function(){
  
  method('init', function(containerId) {
    this.viewer = new Viewer(containerId);
  });
  
  klass('Viewer', function(){
    
    ctor(function(containerId) {
      this.container = dom.get(containerId);
    });
    
    method('doSomething', function(param) {
      alert('bang!');
    });
    
  });
  
});


// ====================================

module dom {
  
  method get(id) {
    return document.getElementById(id);
  }
  
  method select(selector, root=document) {
    return root.querySelector(selector);
  }
  
}

// Compiles to:
module('dom', function(){
  
  method('get', function(id) {
    return document.getElementById(id);
  });
  
  method('select', function(selector, root) {
    root = root || document;
    return root.querySelector(selector);
  });
  
});
