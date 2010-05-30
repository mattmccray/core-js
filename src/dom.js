//! output: ../dist/dom.src.js
//! yuic_to: ../dist/dom.min.js 
//! lib_path: ../lib
/*
Dom.js (v<%= VERSION %>) EXPERIMENTAL!
  <%= AUTHOR %>
  <%= URL %>

Tested and works in WebKit (Safari 4 & Chrome 4) & FireFox 3.6.

Require Core.js
*/

module('dom', function(){
  
  method('get', function(id) {
    return document.getElementById(id);
  });
  
  method('select', function(selector, root) {
    root = root || document;
    return root.querySelector(selector);
  });
  
  module('elements', function(){
    var element_methods = [];
    
    method('add', function(name, fn){
      element_methods[name] = fn;
    });
    
    add('update', function(content){
      this.innerHTML = content;
    });
    
  });
  
});
