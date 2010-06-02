// translation utils

// JSON.translate({ time:'Date' })
// JSON.translate({ time:'Time' })

if(window.JSON) {
  Native.extend(JSON, 'translate', function translate(types) {
    return function translator(key, value) {
      if(key in types) {
        switch(types[key]) {
          case 'Date':
            return new Date(Date(value));
          case 'Time':
            return new Date(Date(value)).getTime();
          case 'int':
            return parseInt(value);
          case 'float':
            return parseFloat(value);
          case 'bool':
            return (value) ? true : false;
          case 'String':
            return (value) ? true : false;
          default:
            return value.toString();
        };
      } else {
        return value;
      };
    };
  });
};