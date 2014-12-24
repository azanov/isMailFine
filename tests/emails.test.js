var isValidEmail = require('../emailValidator');
var assert = require('assert');

var validAddresses = [
	"\"Abc\\@def\"@example.com",
	"\"Fred Bloggs\"@example.com",
	"\"Joe\\\\Blow\"@example.com",
	"\"Abc@def\"@example.com",
	"customer/department=shipping@example.com",
	"$A12345@example.com",
	"!def!xyz%abc@example.com",
	"_somename@example.com",
	"valid.ipv4.addr@[123.1.72.10]",
	"valid.ipv6.addr@[IPv6:0::1]",
	"valid.ipv6.addr@[IPv6:2607:f0d0:1002:51::4]",
	"valid.ipv6.addr@[IPv6:fe80::230:48ff:fe33:bc33]",
	"valid.ipv6v4.addr@[IPv6:aaaa:aaaa:aaaa:aaaa:aaaa:aaaa:127.0.0.1]",

	// examples from wikipedia
	"niceandsimple@example.com",
	"very.common@example.com",
	"a.little.lengthy.but.fine@dept.example.com",
	"disposable.style.email.with+symbol@example.com",
	"user@[IPv6:2001:db8:1ff::a0b:dbd0]",
	"\"much.more unusual\"@example.com",
	"\"very.unusual.@.unusual.com\"@example.com",
	"\"very.(),:;<>[]\\\".VERY.\\\"very@\\\\ \\\"very\\\".unusual\"@strange.example.com",
	"postbox@com",
	"admin@mailserver1",
	"!#$%&'*+-/=?^_`{}|~@example.org",
	"\"()<>[]:,;@\\\\\\\"!#$%&'*+-/=?^_`{}| ~.a\"@example.org",
	"\" \"@example.org",
];

var invalidAddresses = [
	"",
	"invalid",
	"invalid@",
	"invalid @",
	"invalid@[555.666.777.888]",
	"invalid@[IPv6:123456]",
	"invalid@[127.0.0.1.]",
	"invalid@[127.0.0.1].",
	"invalid@[127.0.0.1]x",

	// examples from wikipedia
	"Abc.example.com",
	"A@b@c@example.com",
	"a\"b(c)d,e:f;g<h>i[j\\k]l@example.com",
	"just\"not\"right@example.com",
	"this is\"not\\allowed@example.com",
	"this\\ still\\\"not\\\\allowed@example.com"
];

var validInternationalAddresses = [
	"伊昭傑@郵件.商務",	// Chinese
	"राम@मोहन.ईन्फो",	// Hindi
	"юзер@екзампл.ком", // Ukranian
	"θσερ@εχαμπλε.ψομ", // Greek,
	"дядя_вася@деревня.рф" // Russian
];

describe('Testing emailValidator...', function () {

	it(
		'should successfully recognize valid emails',
		function () {
			for (var i = 0; i < validAddresses.length; i++) {
				assert(isValidEmail(validAddresses[i]), '"' + validAddresses[i] + '" ' + 'not recognized as a valid email');
			}
		}
	);

	it(
		'should successfully recognize invalid emails',
		function () {
			for (var i = 0; i < invalidAddresses.length; i++) {
				assert(!isValidEmail(invalidAddresses[i]), '"' + invalidAddresses[i] + '" ' + 'not recognized as an invalid email');
			}
		}
	);

	// It should, but doesn't yet, unicode trouble hm
	//
	// it(
	// 	'should successfully recognize valid international emails',
	// 	function () {
	// 		for (var i = 0; i < validInternationalAddresses.length; i++) {
	// 			assert(!isValidEmail(validInternationalAddresses[i], true), '"' + validInternationalAddresses[i] + '" ' + 'not recognized as a valid email');
	// 		}
	// 	}
	// );

});
