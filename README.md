emailValidator
==================

A simple (but correct) library for validating email addresses. Supports mail addresses as defined in rfc5322 as well as the new Internationalized Mail Address standards (rfc653x). Based on https://github.com/jstedfast/EmailValidation

Usage
-----

### API

```javascript
$.isValidEmail(
	email, // the email address to check
	allowInternational // true/false, will allow international addresses (e.g cyrillic or chinese)
);
```

### Quickstart:

```javascript
if($.isValidEmail('test@example.com')) {
	// Cool! I'm valid!
}

if($.isValidEmail('дядя_вася@деревня.рф', true)) {
	// Cool! I'm valid!
}
```

### Tests

A few tests can be found here: http://jsfiddle.net/eL2tq8oq/3/
