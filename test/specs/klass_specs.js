
describe('klass', function() {

  describe("constructor", function() {
    
    it("should be defined", function () {
      module('ClassTest1', function(){
        
        expect(klass).to_not(be_undefined);
        
      });
      
      delete ClassTest1;
    });

    it("should create named classes with associated metadata", function () {
      module('ClassTest2', function(){
        klass('User', function(){
          
        })
      });

      expect(ClassTest2.User).to_not(be_undefined);
      expect(ClassTest2.User.displayName).to(equal, "User");
      expect(ClassTest2.User.className).to(equal, "ClassTest2.User");
      
      var u = new ClassTest2.User();
      expect(u.klass).to(equal, ClassTest2.User);

      delete ClassTest2;
    });

  });

  describe("classes", function() {

    it("should define static methods and variables", function() {
      module('ClassTest3', function(){
        klass('Data', function(){
          
          staticMethod('find', function(){
            return 'found!';
          });
          
          this.registry = true;
          
        })
      });
      
      expect(ClassTest3.Data.find).to_not(be_undefined)
      expect(ClassTest3.Data.find()).to(equal, "found!")

      expect(ClassTest3.Data.registry).to_not(be_undefined)
      expect(ClassTest3.Data.registry).to(equal, true)

      delete ClassTest3;
    });

    it("should inherit static methods", function() {
      module('ClassTest10', function(){
        klass('Model', function(){
          staticMethod('find', function(){
            return 'find '+ this.displayName;
          })
        });
        subklass(Model, 'User', function(){
          
        });
      })
    
      expect(ClassTest10.Model.find()).to(equal, 'find Model');
      expect(ClassTest10.User.find()).to(equal, 'find User');
    
      delete ClassTest10;
    });
    
    it("should allow calls to superclass methods", function() {
      module('ClassTest11', function(){
        klass('Person', function(){
          staticMethod('title', function(){
            return 'Buffoon';
          });
        });
        
        subklass(Person, 'Sith', function(){
          staticMethod('title', function(){
            return 'Darth '+ this.callSuper('title');
          });
        });
      });
    
      expect(ClassTest11.Person.title()).to(equal, 'Buffoon');
      expect(ClassTest11.Sith.title()).to(equal, 'Darth Buffoon');

      delete ClassTest11;
    });
    

    it("should trigger 'didSubklass' static method when a subklass is defined", function() {
      
      
      module('ClassTest11', function(){
        this.subKlassCount = 0;
        
        klass('Person', function(){
          staticMethod('didSubklass', function(){
            subKlassCount += 1;
          })
        });
        
        subklass(Person, 'Sith', function(){
          method('title', function(){
            return 'Darth '+ this.callSuper('title');
          });
        });
      });

      expect(ClassTest11.subKlassCount).to(equal, 1);
      
      module('ClassTest12', function(){
        subklass(ClassTest11.Person, 'Jedi', function(){
          this.isJedi = true;
        })
      })
      
      expect(ClassTest11.subKlassCount).to(equal, 2);

      delete ClassTest11;
      delete ClassTest12;
    });


  });

  describe("instances", function() {

    it("should call initialize()", function(){
      module('ClassTest8', function(){
        this.count = 0;

        klass('Car', function(){
          
          method('initialize', function(){
            this.speed = 80;
            count += 1;
          });
          
        })
      });

      expect(ClassTest8.count).to(equal, 0);

      var c = new ClassTest8.Car()
      expect(typeof c.speed).to_not(be_undefined);
      expect(c.speed).to(equal, 80);
      expect(ClassTest8.count).to(equal, 1);

      delete ClassTest8
    });
    
    it("should contain methods", function() {
      module('ClassTest4', function(){
        klass('Car', function(){
          
          method('start', function(){
            return 'now running';
          });
          
        })
      });

      var c = new ClassTest4.Car()
      expect(typeof c.start).to(equal, 'function');
      expect(c.start()).to(equal, 'now running');

      delete ClassTest4
    });

    it("should contain properties", function() {
      module('ClassTest5', function(){
        klass('User', function(){
          
          this.username = undefined;

          // read-only
          property('planet', {
            get: function(){ return 'earth'; }
          });

          property('email', { value:'' });

          // multiple properties with default value &| private vars
          var privateAge = 10;
          properties({
            country: { value: 'USA' },
            age: {
              get: function(){ return privateAge; },
              set: function(val) { privateAge = val; }
            }
          });
          
        });
      });

      var u = new ClassTest5.User();
    // Existense
      expect(typeof u.username).to_not(be_undefined);
      expect(typeof u.planet).to_not(be_undefined);
      expect(typeof u.email).to_not(be_undefined);
      expect(typeof u.country).to_not(be_undefined);
      expect(typeof u.age).to_not(be_undefined);
      
    // Values
      expect(u.username).to(be_undefined);
      expect(u.planet).to(equal, 'earth');
      expect(u.email).to(equal, '');
      expect(u.country).to(equal, 'USA');
      expect(u.age).to(equal, 10);
      
    // Updated Values
      u.username = 'darthapo';
      var threwError = false;
      try {
        u.planet = 'mars'; // Should error!
      } catch(e) {
        threwError = true;
      }
      u.email = 'darthapo@gmail.com';
      u.country = 'UK';
      u.age = 30;

      expect(u.username).to(equal, 'darthapo');
      expect(threwError).to(equal, true);
      expect(u.planet).to(equal, 'earth');
      expect(u.email).to(equal, 'darthapo@gmail.com');
      expect(u.country).to(equal, 'UK');
      expect(u.age).to(equal, 30);
    
      delete ClassTest5;
    });

    it("should encapsulate method calls", function() {
      module('ClassTest6', function(){
        klass('Car', function(){
          
          var privateName = 'BOB';
          
          method('start', function(name){
            name = name || privateName;
            return name +' is now running';
          });
          
        });
      });
      
      var c = new ClassTest6.Car();
      var method = c.method('start');
      
      expect(method).to_not(be_undefined);
      expect(method()).to(equal, 'BOB is now running');
      expect(method('Matt')).to(equal, 'Matt is now running');
      
      delete ClassTest6;
    });
    
    it("should contain a reference to their constructing Klass", function() {
      module('ClassTest7', function(){
        klass('Car', function(){});
      });
      
      var c = new ClassTest7.Car();
      
      expect(c.klass).to_not(be_undefined);
      expect(c.klass).to(equal, ClassTest7.Car);
      expect(c.klass.displayName).to(equal, 'Car');
      expect(c.klass.className).to(equal, 'ClassTest7.Car');
      
      delete ClassTest7;
    });
    
    it("should inherit methods", function() {
      module('ClassTest9', function(){
        klass('Car', function(){
          method('start', function(){
            return this.klass.displayName +' is running';
          });
        });
        
        subklass(Car, 'Truck', function(){
          method('stop', function(){
            return 'stopped';
          });
        });
      });
      
      var c = new ClassTest9.Car(),
          t = new ClassTest9.Truck();
      
      expect(c.start()).to(equal, 'Car is running');
      expect(t.start()).to(equal, 'Truck is running');
      expect(t.stop()).to(equal, 'stopped');
      
      delete ClassTest9;
    });

    it("should allow calls to superclass methods", function() {
      module('ClassTest11', function(){
        klass('Person', function(){
          method('title', function(){
            return 'Buffoon';
          });
        });
        
        subklass(Person, 'Sith', function(){
          method('title', function(){
            return 'Darth '+ this.callSuper('title');
          });
        });
      });
    
      var u = new ClassTest11.Person();
      var s = new ClassTest11.Sith();
      
      expect(u.title()).to(equal, 'Buffoon');
      expect(s.title()).to(equal, 'Darth Buffoon');

      delete ClassTest11;
    });
    
  });

});
