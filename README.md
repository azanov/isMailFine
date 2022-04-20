isMailFine
==================

A simple (but correct) library for validating email addresses. Supports mail addresses as defined in rfc5322 as well as the new Internationalized Mail Address standards (rfc653x). Based on https://github.com/jstedfast/EmailValidation

```
npm i @3cx/is-mail-fine
```

Usage
-----

### API

```javascript

import { isMailFine } from 'is-mail-fine';

// global
isMailFine(
	email, // the email address to check
	allowInternational // true/false, will allow international addresses (e.g cyrillic or chinese),
	allowTopLevelDomains // true/false, will allow top level domains
);

```
