emailValidator
==================

A simple (but correct) library for validating email addresses. Supports mail addresses as defined in rfc5322 as well as the new Internationalized Mail Address standards (rfc653x). Based on https://github.com/jstedfast/EmailValidation

Usage
-----

### API

```javascript

import isValidEmail from 'emailValidator';

// global
isValidEmail(
	email, // the email address to check
	allowInternational // true/false, will allow international addresses (e.g cyrillic or chinese),
	allowTopLevelDomains // true/false, will allow top level domains
);

### Tests

A few tests can be found here: http://jsfiddle.net/coder13/arL3hq26/
