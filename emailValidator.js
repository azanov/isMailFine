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
(function (root, factory) {
	var host = root.jQuery || root;

	if (typeof define === 'function' && define.amd) {
		define([], function() {
			host.isValidEmail = factory(host);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(host);
	} else {
		host.isValidEmail = factory(host);
	}
}(this, function (host) {
	'use strict';

	// Based on https://github.com/jstedfast/EmailValidation

	var atomCharacters = "!#$%&'*+-/=?^_`{|}~";

	var EmailValidator = function() {
		this.index = 0;
	};

	EmailValidator.prototype.isLetterOrDigit = function(c) {
		return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');
	};

	EmailValidator.prototype.isAtom = function(c, allowInternational) {
		return c.charCodeAt(0) < 128 ? this.isLetterOrDigit (c) || atomCharacters.indexOf (c) !== -1 : allowInternational;
	};

	EmailValidator.prototype.isDomain = function(c, allowInternational) {
		return c.charCodeAt(0) < 128 ? this.isLetterOrDigit (c) || c === '-' : allowInternational;
	};

	EmailValidator.prototype.skipAtom = function(text, allowInternational) {
		var startIndex = this.index;

		while (this.index < text.length && this.isAtom(text[this.index], allowInternational)) {
			this.index++;
		}

		return this.index > startIndex;
	};

	EmailValidator.prototype.skipSubDomain = function(text, allowInternational) {
		if (!this.isDomain(text[this.index], allowInternational) || text[this.index] === '-') {
			return false;
		}

		this.index++;

		while (this.index < text.length && this.isDomain(text[this.index], allowInternational)) {
			this.index++;
		}

		return true;
	};

	EmailValidator.prototype.skipDomain = function(text, allowInternational) {
		if (!this.skipSubDomain(text, allowInternational)) {
			return false;
		}

		while (this.index < text.length && text[this.index] === '.') {
			this.index++;

			if (this.index === text.length) {
				return false;
			}

			if (!this.skipSubDomain(text, allowInternational)) {
				return false;
			}
		}

		return true;
	};

	EmailValidator.prototype.skipQuoted = function(text, allowInternational) {
		var escaped = false;

		// skip over leading '"'
		this.index++;

		while (this.index < text.length) {
			if (text.charCodeAt(this.index) >= 128 && !allowInternational) {
				return false;
			}

			if (text[this.index] === '\\') {
				escaped = !escaped;
			} else if (!escaped) {
				if (text[this.index] === '"') {
					break;
				}
			} else {
				escaped = false;
			}

			this.index++;
		}

		if (this.index >= text.length || text[this.index] !== '"') {
			return false;
		}

		this.index++;

		return true;
	};

	EmailValidator.prototype.skipWord = function(text, allowInternational) {
		if (text[this.index] === '"') {
			return this.skipQuoted(text, allowInternational);
		}

		return this.skipAtom(text, allowInternational);
	};

	EmailValidator.prototype.skipIPv4Literal = function(text) {
		var groups = 0;

		while (this.index < text.length && groups < 4) {
			var startIndex = this.index;
			var value = 0;

			while (this.index < text.length && text[this.index] >= '0' && text[this.index] <= '9') {
				value = (value * 10) + (text[this.index] - '0');
				this.index++;
			}

			if (this.index === startIndex || this.index - startIndex > 3 || value > 255) {
				return false;
			}

			groups++;

			if (groups < 4 && this.index < text.length && text[this.index] === '.') {
				this.index++;
			}
		}

		return groups === 4;
	};

	EmailValidator.prototype.isHexDigit = function(c) {
		return (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f') || (c >= '0' && c <= '9');
	};

	EmailValidator.prototype.skipIPv6Literal =  function(text) {
		var compact = false;
		var colons = 0;

		while (this.index < text.length) {
			var startIndex = this.index;

			while (this.index < text.length && this.isHexDigit(text[this.index])) {
				this.index++;
			}

			if (this.index >= text.length) {
				break;
			}

			if (this.index > startIndex && colons > 2 && text[this.index] === '.') {
				// IPv6v4
				this.index = startIndex;

				if (!this.skipIPv4Literal(text)) {
					return false;
				}

				break;
			}

			var count = this.index - startIndex;
			if (count > 4) {
				return false;
			}

			if (text[this.index] !== ':') {
				break;
			}

			startIndex = this.index;
			while (this.index < text.length && text[this.index] === ':') {
				this.index++;
			}

			count = this.index - startIndex;
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

		if (compact) {
			return colons < 6;
		}

		return colons < 7;
	};

	EmailValidator.prototype.validate = function(email, allowInternational) {

		this.index = 0;

		if (!email) {
			return false;
		}

		if (email.length === 0) {
			return false;
		}

		if(host.emailValidator) {
			if(host.emailValidator.allowedCharactersPattern && !email.match(host.emailValidator.allowedCharactersPattern)) {
				return false;
			}
			if(host.emailValidator.filterPattern && !email.match(host.emailValidator.filterPattern)) {
				return false;
			}
		}

		if (!this.skipWord(email, allowInternational) || this.index >= email.length) {
			return false;
		}

		while (this.index < email.length && email[this.index] === '.') {
			this.index++;

			if (!this.skipWord(email, allowInternational) || this.index >= email.length) {
				return false;
			}
		}

		if (this.index + 1 >= email.length || email[this.index++] !== '@') {
			return false;
		}

		if (email[this.index] !== '[') {
			// domain
			if (!this.skipDomain(email, allowInternational)) {
				return false;
			}

			return this.index === email.length;
		}

		// address literal
		this.index++;

		// we need at least 8 more characters
		if (this.index + 8 >= email.length) {
			return false;
		}

		var ipv6 = email.substr(this.index, 5);
		if (ipv6.toLowerCase () === "ipv6:") {
			this.index += "IPv6:".length;
			if (!this.skipIPv6Literal(email)) {
				return false;
			}
		} else {
			if (!this.skipIPv4Literal(email)) {
				return false;
			}
		}

		if (this.index >= email.length || email[this.index++] !== ']') {
			return false;
		}

		return this.index === email.length;

	};

	return function(email, allowInternational) {
		return (new EmailValidator()).validate(email, allowInternational);
	};

}));
