let sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
let sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
let sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
let sQuotedPair = '\\x5c[\\x00-\\x7f]';
let sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
let sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
let sDomain_ref = sAtom;
let sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
let sWord = '(' + sAtom + '|' + sQuotedString + ')';
let sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
let sLocalPart = sWord + '(\\x2e' + sWord + ')*';
let sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
let sValidEmail = '^' + sAddrSpec + '$'; // as whole string
let reValidEmail = new RegExp(sValidEmail);

export function isRfc822Compliant(email: string ): boolean {
    return reValidEmail.test(email);
}