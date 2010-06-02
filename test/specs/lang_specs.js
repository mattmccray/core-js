describe('lang additions', function(){
  
  describe('Function', function(){
    
    it('should allow binding to other scopes and curry initial args', function(){
      
      expect(Function.prototype.bind).to_not(be_undefined);
      
      var o = {
        name: 'matt'
      }
      
      function test(prefix) {
        prefix = prefix || 'hello ';
        return prefix + this.name;
      }
      expect( test.bind(o)() ).to(equal, "hello matt");
      expect( test.bind(o)('sure ') ).to(equal, "sure matt");
      expect( test.bind(o, 'goodbye ')() ).to(equal, "goodbye matt");
      
    });
    
  });
  
});