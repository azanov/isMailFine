(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.isMailFine = factory());
}(this, function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  //
  // EmailValidator.cs
  //
  // Author: Jeffrey Stedfast <jeff@xamarin.com>
  //
  // Copyright (c) 2013 Xamarin Inc.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  //
  // The above copyright notice and this permission notice shall be included in
  // all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  // THE SOFTWARE.

  // Translated to JS for CSSSR (http://csssr.ru)
  // by Pavel Azanov <pavel@azanov.de>
  //

  var EmailValidator = function () {
  	function EmailValidator() {
  		classCallCheck(this, EmailValidator);

  		this.atomCharacters = '!#$%&\'*+-/=?^_`{|}~';
  		this.index = 0;
  	}

  	createClass(EmailValidator, [{
  		key: 'isLetterOrDigit',
  		value: function isLetterOrDigit(c) {
  			return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z' || c >= '0' && c <= '9';
  		}
  	}, {
  		key: 'isAtom',
  		value: function isAtom(c, allowInternational) {
  			return c.charCodeAt(0) < 128 ? this.isLetterOrDigit(c) || this.atomCharacters.indexOf(c) !== -1 : allowInternational;
  		}
  	}, {
  		key: 'isDomain',
  		value: function isDomain(c, allowInternational) {
  			return c.charCodeAt(0) < 128 ? this.isLetterOrDigit(c) || c === '-' : allowInternational;
  		}
  	}, {
  		key: 'skipAtom',
  		value: function skipAtom(text, allowInternational) {
  			var self = this;
  			var startIndex = self.index;

  			while (self.index < text.length && self.isAtom(text[self.index], allowInternational)) {
  				self.index++;
  			}

  			return self.index > startIndex;
  		}
  	}, {
  		key: 'skipSubDomain',
  		value: function skipSubDomain(text, allowInternational) {
  			var self = this;
  			var startIndex = self.index;

  			if (!self.isDomain(text[self.index], allowInternational) || text[self.index] === '-') {
  				return false;
  			}

  			self.index++;

  			while (self.index < text.length && self.isDomain(text[self.index], allowInternational)) {
  				self.index++;
  			}

  			return self.index - startIndex < 64 && text[self.index - 1] !== '-';
  		}
  	}, {
  		key: 'skipDomain',
  		value: function skipDomain(text, allowTopLevelDomains, allowInternational) {
  			var self = this;

  			if (!self.skipSubDomain(text, allowInternational)) {
  				return false;
  			}

  			if (self.index < text.length && text[self.index] === '.') {
  				do {
  					self.index++;

  					if (self.index === text.length) {
  						return false;
  					}

  					if (!self.skipSubDomain(text, allowInternational)) {
  						return false;
  					}
  				} while (self.index < text.length && text[self.index] === '.');
  			} else if (!allowTopLevelDomains) {
  				return false;
  			}

  			return true;
  		}
  	}, {
  		key: 'skipQuoted',
  		value: function skipQuoted(text, allowInternational) {
  			var self = this;
  			var escaped = false;

  			// skip over leading '"'
  			self.index++;

  			while (self.index < text.length) {
  				if (text.charCodeAt(this.index) >= 128 && !allowInternational) {
  					return false;
  				}

  				if (text[self.index] === '\\') {
  					escaped = !escaped;
  				} else if (!escaped) {
  					if (text[self.index] === '"') {
  						break;
  					}
  				} else {
  					escaped = false;
  				}

  				self.index++;
  			}

  			if (self.index >= text.length || text[self.index] !== '"') {
  				return false;
  			}

  			self.index++;

  			return true;
  		}
  	}, {
  		key: 'skipWord',
  		value: function skipWord(text, allowInternational) {
  			var self = this;

  			if (text[self.index] === '"') {
  				return self.skipQuoted(text, allowInternational);
  			}

  			return self.skipAtom(text, allowInternational);
  		}
  	}, {
  		key: 'skipIPv4Literal',
  		value: function skipIPv4Literal(text) {
  			var self = this;
  			var groups = 0;

  			while (self.index < text.length && groups < 4) {
  				var startIndex = self.index;
  				var value = 0;

  				while (self.index < text.length && text[self.index] >= '0' && text[self.index] <= '9') {
  					value = value * 10 + (text[self.index] - '0');
  					self.index++;
  				}

  				if (self.index === startIndex || self.index - startIndex > 3 || value > 255) {
  					return false;
  				}

  				groups++;

  				if (groups < 4 && self.index < text.length && text[self.index] === '.') {
  					self.index++;
  				}
  			}

  			return groups === 4;
  		}
  	}, {
  		key: 'isHexDigit',
  		value: function isHexDigit(c) {
  			return c >= 'A' && c <= 'F' || c >= 'a' && c <= 'f' || c >= '0' && c <= '9';
  		}

  		// This needs to handle the following forms:
  		//
  		// IPv6-addr = IPv6-full / IPv6-comp / IPv6v4-full / IPv6v4-comp
  		// IPv6-hex  = 1*4HEXDIG
  		// IPv6-full = IPv6-hex 7(":" IPv6-hex)
  		// IPv6-comp = [IPv6-hex *5(":" IPv6-hex)] "::" [IPv6-hex *5(":" IPv6-hex)]
  		//             ; The "::" represents at least 2 16-bit groups of zeros
  		//             ; No more than 6 groups in addition to the "::" may be
  		//             ; present
  		// IPv6v4-full = IPv6-hex 5(":" IPv6-hex) ":" IPv4-address-literal
  		// IPv6v4-comp = [IPv6-hex *3(":" IPv6-hex)] "::"
  		//               [IPv6-hex *3(":" IPv6-hex) ":"] IPv4-address-literal
  		//             ; The "::" represents at least 2 16-bit groups of zeros
  		//             ; No more than 4 groups in addition to the "::" and
  		//             ; IPv4-address-literal may be present

  	}, {
  		key: 'skipIPv6Literal',
  		value: function skipIPv6Literal(text) {
  			var self = this;
  			var compact = false;
  			var colons = 0;

  			while (self.index < text.length) {
  				var startIndex = self.index;

  				while (self.index < text.length && self.isHexDigit(text[self.index])) {
  					self.index++;
  				}

  				if (self.index >= text.length) {
  					break;
  				}

  				if (self.index > startIndex && colons > 2 && text[self.index] === '.') {
  					// IPv6v4
  					self.index = startIndex;

  					if (!self.skipIPv4Literal(text)) {
  						return false;
  					}

  					return compact ? colons < 6 : colons === 6;
  				}

  				var count = self.index - startIndex;
  				if (count > 4) {
  					return false;
  				}

  				if (text[self.index] !== ':') {
  					break;
  				}

  				startIndex = self.index;
  				while (self.index < text.length && text[self.index] === ':') {
  					self.index++;
  				}

  				count = self.index - startIndex;
  				if (count > 2) {
  					return false;
  				}

  				if (count === 2) {
  					if (compact) {
  						return false;
  					}

  					compact = true;
  					colons += 2;
  				} else {
  					colons++;
  				}
  			}

  			if (colons < 2) {
  				return false;
  			}

  			return compact ? colons < 7 : colons === 7;
  		}
  	}, {
  		key: 'validate',
  		value: function validate(email) {
  			var allowTopLevelDomains = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
  			var allowInternational = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  			var self = this;

  			if (!email) {
  				return false;
  			}

  			if (!email.length || email.length >= 255) {
  				return false;
  			}

  			if (!self.skipWord(email, allowInternational) || self.index >= email.length) {
  				return false;
  			}

  			while (email[self.index] === '.') {
  				self.index++;

  				if (self.index >= email.length) {
  					return false;
  				}

  				if (!self.skipWord(email, allowInternational)) {
  					return false;
  				}

  				if (self.index >= email.length) {
  					return false;
  				}
  			}

  			if (self.index + 1 >= email.length || self.index > 64 || email[self.index++] !== '@') {
  				return false;
  			}

  			if (email[self.index] !== '[') {
  				// domain
  				if (!self.skipDomain(email, allowTopLevelDomains, allowInternational)) {
  					return false;
  				}

  				return self.index === email.length;
  			}

  			// address literal
  			self.index++;

  			// we need at least 8 more characters
  			if (self.index + 8 >= email.length) {
  				return false;
  			}

  			var ipv6 = email.substr(self.index, 5);
  			if (ipv6.toLowerCase() === 'ipv6:') {
  				self.index += 'IPv6:'.length;
  				if (!self.skipIPv6Literal(email)) {
  					return false;
  				}
  			} else if (!self.skipIPv4Literal(email, this.index)) {
  				return false;
  			}

  			if (self.index >= email.length || email[self.index++] !== ']') {
  				return false;
  			}

  			return self.index === email.length;
  		}
  	}]);
  	return EmailValidator;
  }();

  // order of paramaters changed for compatibility


  function isMailFine (email) {
  	var allowInternational = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
  	var allowTopLevelDomains = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  	var vld = new EmailValidator();
  	return vld.validate(email, allowTopLevelDomains, allowInternational);
  }

  return isMailFine;

}));