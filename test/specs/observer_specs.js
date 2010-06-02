describe("class events", function() {
  
  before(function(){
    module('MyNS', function(){
      
      klass('Car', function(){
        
        ctor(function(){
          this.running = false;
        })
        
        method('start', function(){
          this.running = true;
          this.fire('start', {sender:this});
        });

        method('stop', function(){
          this.running = false;
          this.fire('stop', {sender:this});
        });
        
      });
      
    });
  });
  
  after(function(){
    delete MyNS;
  })
  
  it('should allow firing abritrary events', function(){
    
    var c = new MyNS.Car(), eventCount = 0;
    c.on('start', function(event){
      expect(event.sender.running).to(equal, true);
      eventCount += 1;
    });
    c.on('stop', function(event){
      expect(event.sender.running).to(equal, false);
      eventCount += 1;
    });
    c.start();
    expect(eventCount).to(equal, 1);
    c.stop();
    expect(eventCount).to(equal, 2);
    c.fire('crap');
    expect(eventCount).to(equal, 2);
  })

});
