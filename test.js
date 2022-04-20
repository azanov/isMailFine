import { expect } from 'chai';
import { isMailFine } from "./src/isMailFine.js";

const ValidAddresses = [
    "\"Abc\\@def\"@example.com",
    "\"Fred Bloggs\"@example.com",
    "\"Joe\\\\Blow\"@example.com",
    "\"Abc@def\"@example.com",
    "customer/department=shipping@example.com",
    "$A12345@example.com",
    "!def!xyz%abc@example.com",
    "_somename@example.com",
    "valid@[1.1.1.1]",
    "valid.ipv4.addr@[123.1.72.10]",
    "valid.ipv4.addr@[255.255.255.255]",
    "valid.ipv6.addr@[IPv6:::]",
    "valid.ipv6.addr@[IPv6:0::1]",
    "valid.ipv6.addr@[IPv6:::12.34.56.78]",
    "valid.ipv6.addr@[IPv6:::3333:4444:5555:6666:7777:8888]",
    "valid.ipv6.addr@[IPv6:2607:f0d0:1002:51::4]",
    "valid.ipv6.addr@[IPv6:fe80::230:48ff:fe33:bc33]",
    "valid.ipv6.addr@[IPv6:fe80:0000:0000:0000:0202:b3ff:fe1e:8329]",
    "valid.ipv6v4.addr@[IPv6:::12.34.56.78]",
    "valid.ipv6v4.addr@[IPv6:aaaa:aaaa:aaaa:aaaa:aaaa:aaaa:127.0.0.1]",
    // new string ('a', 64) + "@example.com", // max local-part length (64 characters)
    // "valid@" + new string ('a', 63) + ".com", // max subdomain length (64 characters)
    // "valid@" + new string ('a', 60) + "." + new string ('b', 60) + "." + new string ('c', 60) + "." + new string ('d', 61) + ".com", // max length (254 characters)
    // new string ('a', 64) + "@" + new string ('a', 45) + "." + new string ('b', 46) + "." + new string ('c', 45) + "." + new string ('d', 46) + ".com", // max local-part length (64 characters)

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

    // examples from https://github.com/Sembiance/email-validator
    "\"\\e\\s\\c\\a\\p\\e\\d\"@sld.com",
    "\"back\\slash\"@sld.com",
    "\"escaped\\\"quote\"@sld.com",
    "\"quoted\"@sld.com",
    "\"quoted-at-sign@sld.org\"@sld.com",
    "&'*+-./=?^_{}~@other-valid-characters-in-local.net",
    "01234567890@numbers-in-local.net",
    "a@single-character-in-local.org",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@letters-in-local.org",
    "backticksarelegit@test.com",
    "bracketed-IP-instead-of-domain@[127.0.0.1]",
    "country-code-tld@sld.rw",
    "country-code-tld@sld.uk",
    "letters-in-sld@123.com",
    "local@dash-in-sld.com",
    "local@sld.newTLD",
    "local@sub.domains.com",
    "mixed-1234-in-{+^}-local@sld.net",
    "one-character-third-level@a.example.com",
    "one-letter-sld@x.org",
    "punycode-numbers-in-tld@sld.xn--3e0b707e",
    "single-character-in-sld@x.org",
    "the-character-limit@for-each-part.of-the-domain.is-sixty-three-characters.this-is-exactly-sixty-three-characters-so-it-is-valid-blah-blah.com",
    "the-total-length@of-an-entire-address.cannot-be-longer-than-two-hundred-and-fifty-six-characters.and-this-address-is-256-characters-exactly.so-it-should-be-valid.and-im-going-to-add-some-more-words-here.to-increase-the-length-blah-blah-blah-blah-blah.org",
    "uncommon-tld@sld.mobi",
    "uncommon-tld@sld.museum",
    "uncommon-tld@sld.travel",
];

const InvalidAddresses = [
    "",
    "invalid",
    "invalid@",
    "invalid @",
    "invalid@[10]",
    "invalid@[10.1]",
    "invalid@[10.1.52]",
    "invalid@[256.256.256.256]",
    "invalid@[IPv6:123456]",
    "invalid@[127.0.0.1.]",
    "invalid@[127.0.0.1].",
    "invalid@[127.0.0.1]x",
    "invalid@domain1.com@domain2.com",
    "\"locál-part\"@example.com", // international local-part when allowInternational=false should fail
    // new string ('a', 65) + "@example.com", // local-part too long
    // "invalid@" + new string ('a', 64) + ".com", // subdomain too long
    // "invalid@" + new string ('a', 60) + "." + new string ('b', 60) + "." + new string ('c', 60) + "." + new string ('d', 60) + ".com", // too long (254 characters)
    "invalid@[]", // empty IP literal
    "invalid@[111.111.111.111", // unenclosed IPv4 literal
    "invalid@[IPv6:2607:f0d0:1002:51::4", // unenclosed IPv6 literal
    "invalid@[IPv6:1111::1111::1111]", // invalid IPv6-comp
    "invalid@[IPv6:1111:::1111::1111]", // more than 2 consecutive :'s in IPv6
    "invalid@[IPv6:aaaa:aaaa:aaaa:aaaa:aaaa:aaaa:555.666.777.888]", // invalid IPv4 address in IPv6v4
    "invalid@[IPv6:1111:1111]", // incomplete IPv6
    "invalid@[IPv6:1::2:]", // incomplete IPv6
    "\"invalid-qstring@example.com", // unterminated q-string in local-part of the addr-spec
    "\"control-\u007f-character\"@example.com",
    "\"control-\u001f-character\"@example.com",
    "\"control-\\\u007f-character\"@example.com",

    // examples from wikipedia
    "Abc.example.com",
    "A@b@c@example.com",
    "a\"b(c)d,e:f;g<h>i[j\\k]l@example.com",
    "just\"not\"right@example.com",
    "this is\"not\\allowed@example.com",
    "this\\ still\\\"not\\\\allowed@example.com",

    // examples from https://github.com/Sembiance/email-validator
    "! #$%`|@invalid-characters-in-local.org",
    "(),:;`|@more-invalid-characters-in-local.org",
    "* .local-starts-with-dot@sld.com",
    "<>@[]`|@even-more-invalid-characters-in-local.org",
    "@missing-local.org",
    "IP-and-port@127.0.0.1:25",
    "another-invalid-ip@127.0.0.256",
    "invalid",
    "invalid-characters-in-sld@! \"#$%(),/;<>_[]`|.org",
    "invalid-ip@127.0.0.1.26",
    "local-ends-with-dot.@sld.com",
    "missing-at-sign.net",
    "missing-sld@.com",
    "missing-tld@sld.",
    "sld-ends-with-dash@sld-.com",
    "sld-starts-with-dashsh@-sld.com",
    "the-character-limit@for-each-part.of-the-domain.is-sixty-four-characters.this-subdomain-is-exactly-sixty-five-characters-so-it-is-invalid1.com",
    "the-local-part-is-invalid-if-it-is-longer-than-sixty-four-characters@sld.net",
    "the-total-length@of-an-entire-address.cannot-be-longer-than-two-hundred-and-fifty-six-characters.and-this-address-is-257-characters-exactly.so-it-should-be-invalid.lets-add-some-extra-words-here.to-increase-the-length.beyond-the-256-character-limitation.org",
    "two..consecutive-dots@sld.com",
    "unbracketed-IP@127.0.0.1",
    "dot-first-in-domain@.test.de",
    "single-character-tld@ns.i",

    // examples of real (invalid) input from real users.
    "No longer available.",
    "Moved."
];

const ValidInternationalAddresses = [
    "伊昭傑@郵件.商務", // Chinese
    "राम@मोहन.ईन्फो", // Hindi
    "юзер@екзампл.ком", // Ukranian
    "θσερ@εχαμπλε.ψομ", // Greek
];

describe('Email validation unit tests', () => {
    ValidAddresses.forEach(addr => it(`${addr} should be valid`, () => {
        expect(isMailFine(addr, false, true)).true;
    }))

    InvalidAddresses.forEach(addr => it(`${addr} should be invalid`, () => {
        expect(isMailFine(addr, false, true)).false;
    }))

    ValidInternationalAddresses.forEach(addr => it(`${addr} should be valid`, () => {
        expect(isMailFine(addr, true, true)).true;
    }))

    it('Top level domain not allowed', () => {
        expect(isMailFine('invalid@tld', true, false)).false
    })
})
