//! main: ../lang.js

Native.implementAll(String, {
  
  toSlug: function() {
    // M@: Modified from Radiant's version, removes multple --'s next to each other
    // This is the same RegExp as the one on the page model...
    return this.trim().toLowerCase().replace(/[^-a-z0-9~\s\.:;+=_]/g, '').replace(/[\s\.:;=_+]+/g, '-').replace(/[\-]{2,}/g, '-');
  },
  
  merge: function(data) {
    data = Var.isHash(data) ? data : Array.from(arguments).flatten();
    return this.replace(/\{([\w\.]*)\}/g, function (str, key) {
        var keys = key.split("."), value = data[keys.shift()];
        keys.each(function (key) { value = value[key]; });
        return (value === null || value === undefined) ? "" : value;
    });
  },
  
  blank: function() {
    return /^\s*$/.test(this);
  },
  
  trim: String.prototype.trim || function() {
    var str = this.replace(/^\s\s*/, ''), i = str.length;
    while (/\s/.test(str.charAt(--i)));
    return str.slice(0, i + 1);
  },
  
  stripTags: function() {
    return this.replace(/<\/?[^>]+>/ig, '');
  },
  
  camelize: function() {
    return this.replace(/(\-|_)+(.)?/g, function(match, dash, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  },

  underscored: function() {
    return this.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/\-/g, '_').toLowerCase();
  },

  capitalize: function() { // Kinda weak...
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },
  
  includes: function(string) {
    return this.indexOf(string) != -1;
  },
  
  startsWith: function(string, ignorecase) {
    var start_str = this.substr(0, string.length);
    return ignorecase ? start_str.toLowerCase() === string.toLowerCase() : 
      start_str === string;
  },
  
  endsWith: function(string, ignorecase) {
    var end_str = this.substring(this.length - string.length);
    return ignorecase ? end_str.toLowerCase() === string.toLowerCase() :
      end_str === string;
  },

  toInt: function(base) {
    return parseInt(this, base || 10);
  },
  
  toFloat: function(strict) {
    return parseFloat(strict ? this : this.replace(',', '.').replace(/(\d)-(\d)/g, '$1.$2'));
  }
  
})