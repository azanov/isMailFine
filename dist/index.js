'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

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
// by Nikolai Orekhov <nick.orekhov@gmail.com>
//
var None = 0;
var Alphabetic = 1;
var Numeric = 2;

var EmailValidator = /*#__PURE__*/function () {
  function EmailValidator() {
    _classCallCheck(this, EmailValidator);

    this.atomCharacters = '!#$%&\'*+-/=?^_`{|}~';
    this.index = 0;
    this.type = 0;
  }

  _createClass(EmailValidator, [{
    key: "isControl",
    value: function isControl(c) {
      return c.charCodeAt(0) <= 31 || c.charCodeAt(0) === 127;
    }
  }, {
    key: "isDigit",
    value: function isDigit(c) {
      return c >= '0' && c <= '9';
    }
  }, {
    key: "isLetter",
    value: function isLetter(c) {
      return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z';
    }
  }, {
    key: "isLetterOrDigit",
    value: function isLetterOrDigit(c) {
      return this.isLetter(c) || this.isDigit(c);
    }
  }, {
    key: "isAtom",
    value: function isAtom(c, allowInternational) {
      // check for control characters
      if (this.isControl(c)) return false;
      return c.charCodeAt(0) < 128 ? this.isLetterOrDigit(c) || this.atomCharacters.indexOf(c) !== -1 : allowInternational;
    }
  }, {
    key: "isDomain",
    value: function isDomain(c, allowInternational) {
      if (c.charCodeAt(0) < 128) {
        if (this.isLetter(c) || c === '-') {
          this.type |= Alphabetic;
          return true;
        }

        if (this.isDigit(c)) {
          this.type |= Numeric;
          return true;
        }

        return false;
      }

      if (allowInternational) {
        this.type |= Alphabetic;
        return true;
      }

      return false;
    }
  }, {
    key: "isDomainStart",
    value: function isDomainStart(c, allowInternational) {
      if (c.charCodeAt(0) < 128) {
        if (this.isLetter(c)) {
          this.type = Alphabetic;
          return true;
        }

        if (this.isDigit(c)) {
          this.type = Numeric;
          return true;
        }

        this.type = None;
        return false;
      }

      if (allowInternational) {
        this.type = Alphabetic;
        return true;
      }

      this.type = None;
      return false;
    }
  }, {
    key: "skipAtom",
    value: function skipAtom(text, allowInternational) {
      var self = this;
      var startIndex = self.index;

      while (self.index < text.length && self.isAtom(text[self.index], allowInternational)) {
        self.index++;
      }

      return self.index > startIndex;
    }
  }, {
    key: "skipSubDomain",
    value: function skipSubDomain(text, allowInternational) {
      var self = this;
      var startIndex = self.index;

      if (!this.isDomainStart(text[self.index], allowInternational)) {
        return false;
      }

      self.index++;

      while (self.index < text.length && self.isDomain(text[self.index], allowInternational)) {
        self.index++;
      } // Don't allow single-character top-level domains.


      if (self.index === text.length && self.index - startIndex === 1) return false; // https://datatracker.ietf.org/doc/html/rfc2181#section-11
      // The length of any one label is limited to between 1 and 63 octets. A full domain
      // name is limited to 255 octets (including the separators).

      return self.index - startIndex < 64 && text[self.index - 1] !== '-';
    }
  }, {
    key: "skipDomain",
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
      } // Note: by allowing AlphaNumeric, we get away with not having to support punycode.


      if (self.type === Numeric) return false;
      return true;
    }
  }, {
    key: "skipQuoted",
    value: function skipQuoted(text, allowInternational) {
      var self = this;
      var escaped = false; // skip over leading '"'

      self.index++;

      while (self.index < text.length) {
        if (this.isControl(text[self.index]) || text.charCodeAt(this.index) >= 128 && !allowInternational) {
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
    key: "skipIPv4Literal",
    value: function skipIPv4Literal(text) {
      var self = this;
      var groups = 0;

      while (self.index < text.length && groups < 4) {
        var startIndex = self.index;
        var value = 0;

        while (self.index < text.length && this.isDigit(text[self.index])) {
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
    key: "isHexDigit",
    value: function isHexDigit(c) {
      return c >= 'A' && c <= 'F' || c >= 'a' && c <= 'f' || c >= '0' && c <= '9';
    } // This needs to handle the following forms:
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
    key: "skipIPv6Literal",
    value: function skipIPv6Literal(text) {
      var self = this;
      var needGroup = false;
      var compact = false;
      var groups = 0;

      while (self.index < text.length) {
        var startIndex = self.index;

        while (self.index < text.length && self.isHexDigit(text[self.index])) {
          self.index++;
        }

        if (self.index >= text.length) {
          break;
        }

        if (self.index > startIndex && text[self.index] === '.' && (compact || groups === 6)) {
          // IPv6v4
          self.index = startIndex;

          if (!self.skipIPv4Literal(text)) {
            return false;
          }

          return compact ? groups <= 4 : groups === 6;
        }

        var count = self.index - startIndex;

        if (count > 4) {
          return false;
        }

        if (count > 0) {
          needGroup = false;
          groups++;
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
        } else {
          needGroup = true;
        }
      }

      return !needGroup && (compact ? groups <= 6 : groups === 8);
    }
  }, {
    key: "validate",
    value: function validate(email) {
      var allowTopLevelDomains = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var allowInternational = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var self = this;

      if (!email) {
        return false;
      }

      if (!email.length || email.length > 254) {
        return false;
      } // Local-part = Dot-string / Quoted-string
      //       ; MAY be case-sensitive
      //
      // Dot-string = Atom *("." Atom)
      //
      // Quoted-string = DQUOTE *qcontent DQUOTE


      if (email[self.index] === '"') {
        if (!this.skipQuoted(email, allowInternational) || self.index >= email.length) return false;
      } else {
        if (!this.skipAtom(email, allowInternational) || self.index >= email.length) return false;

        while (email[self.index] === '.') {
          self.index++;

          if (self.index >= email.length) {
            return false;
          }

          if (!self.skipAtom(email, allowInternational)) {
            return false;
          }

          if (self.index >= email.length) {
            return false;
          }
        }
      } // https://datatracker.ietf.org/doc/html/rfc5321#section-4.5.3.1.1
      // The maximum total length of a user name or other local-part is 64 octets.


      if (self.index + 1 >= email.length || self.index > 64 || email[self.index++] !== '@') {
        return false;
      }

      if (email[self.index] !== '[') {
        // domain
        if (!self.skipDomain(email, allowTopLevelDomains, allowInternational)) {
          return false;
        }

        return self.index === email.length;
      } // address literal


      self.index++; // We need at least 7 more characters. "1.1.1.1" and "IPv6:::" are the shortest literals we can have.

      if (self.index + 7 >= email.length) {
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
}(); // order of paramaters changed for compatibility


function isMailFine(email) {
  var allowInternational = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var allowTopLevelDomains = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var vld = new EmailValidator();
  return vld.validate(email, allowTopLevelDomains, allowInternational);
}

exports.isMailFine = isMailFine;
