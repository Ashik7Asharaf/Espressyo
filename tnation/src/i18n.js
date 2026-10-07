'use strict';
// Main-navigation labels in English, Malayalam and Kannada.
// Have a native speaker review the Malayalam and Kannada labels before launch.
const NAV = [
  { href: '/', key: 'home', en: 'Home', ml: 'ഹോം', kn: 'ಮುಖಪುಟ' },
  { href: '/roster', key: 'roster', en: 'Roster', ml: 'പ്രതിഭകൾ', kn: 'ಪ್ರತಿಭೆಗಳು' },
  { href: '/live', key: 'live', en: 'Live & Shows', ml: 'ലൈവ് ഷോകൾ', kn: 'ಲೈವ್ ಶೋಗಳು' },
  { href: '/overseas', key: 'overseas', en: 'Overseas Desk', ml: 'വിദേശ ഡെസ്ക്', kn: 'ವಿದೇಶ ಡೆಸ್ಕ್' },
  { href: '/brands', key: 'brands', en: 'Brands', ml: 'ബ്രാൻഡുകൾ', kn: 'ಬ್ರ್ಯಾಂಡ್‌ಗಳು' },
  { href: '/rights', key: 'rights', en: 'Rights & Royalties', ml: 'അവകാശങ്ങളും റോയൽറ്റിയും', kn: 'ಹಕ್ಕುಗಳು ಮತ್ತು ರಾಯಧನ' },
  { href: '/about', key: 'about', en: 'About', ml: 'ഞങ്ങളെക്കുറിച്ച്', kn: 'ನಮ್ಮ ಬಗ್ಗೆ' },
  { href: '/contact', key: 'contact', en: 'Contact', ml: 'ബന്ധപ്പെടുക', kn: 'ಸಂಪರ್ಕಿಸಿ' },
];
const JOIN = { href: '/join', key: 'join', en: 'Join T Nation', ml: 'ടി നേഷനിൽ ചേരൂ', kn: 'ಟಿ ನೇಷನ್ ಸೇರಿ' };
const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ml', label: 'മല', name: 'മലയാളം' },
  { code: 'kn', label: 'ಕನ್ನ', name: 'ಕನ್ನಡ' },
];
module.exports = { NAV, JOIN, LANGS };
