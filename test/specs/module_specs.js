describe("module", function() {
  
  it("should be defined", function () {
    expect(module).to_not(be_undefined);
  });

  it("should create named modules/namespaces", function () {
    module('Test1', function(){});

    expect(Test1).to_not(be_undefined);
    expect(Test1).to(be_an_object);
    
    delete Test1;
  });
  
  it("should create publicly accessible methods", function(){
    module('Test2', function(){
      method('helper', function(){
        return true;
      })
    });
    
    expect(Test2.helper()).to(equal, true);

    delete Test2;
  });

  it("should create publicly accessible getter/setters", function(){
    module('Test3', function(){
      var count = 0;
      
      property('count', {
        get: function() {
          return count;
        },
        set: function(val) {
          count = val;
        }
      });
      
      
      method('getCount', function(){ return count; });
    });
    
    expect(Test3.count).to(equal, 0);

    Test3.count = 10;

    expect(Test3.count).to(equal, 10);
    expect(Test3.getCount()).to(equal, 10);

    delete Test3;
  });

  it('should support events', function(){
    module('DB', function(){
      method('connect', function(){
        this.fire('connect', {sender:this});
      });
    });
    var count = 0;
    DB.on('connect', function(){
      count += 1;
    });
    DB.connect();
    expect(count).to(equal, 1);
  });
});
