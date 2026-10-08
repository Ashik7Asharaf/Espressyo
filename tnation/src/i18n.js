'use strict';
// Main-navigation labels in English and the four big South Indian languages.
// Have native speakers review the non-English labels before launch.
const NAV = [
  { href: '/', key: 'home', en: 'Home', ml: 'ഹോം', kn: 'ಮುಖಪುಟ', ta: 'முகப்பு', te: 'హోమ్' },
  { href: '/roster', key: 'roster', en: 'Roster', ml: 'പ്രതിഭകൾ', kn: 'ಪ್ರತಿಭೆಗಳು', ta: 'திறமையாளர்கள்', te: 'ప్రతిభావంతులు' },
  { href: '/live', key: 'live', en: 'Live & Shows', ml: 'ലൈവ് ഷോകൾ', kn: 'ಲೈವ್ ಶೋಗಳು', ta: 'நேரலை நிகழ்ச்சிகள்', te: 'లైవ్ షోలు' },
  { href: '/overseas', key: 'overseas', en: 'Overseas Desk', ml: 'വിദേശ ഡെസ്ക്', kn: 'ವಿದೇಶ ಡೆಸ್ಕ್', ta: 'வெளிநாட்டுப் பிரிவு', te: 'విదేశీ విభాగం' },
  { href: '/brands', key: 'brands', en: 'Brands', ml: 'ബ്രാൻഡുകൾ', kn: 'ಬ್ರ್ಯಾಂಡ್‌ಗಳು', ta: 'பிராண்டுகள்', te: 'బ్రాండ్‌లు' },
  { href: '/rights', key: 'rights', en: 'Rights & Royalties', ml: 'അവകാശങ്ങളും റോയൽറ്റിയും', kn: 'ಹಕ್ಕುಗಳು ಮತ್ತು ರಾಯಧನ', ta: 'உரிமைகளும் ராயல்டியும்', te: 'హక్కులు & రాయల్టీలు' },
  { href: '/about', key: 'about', en: 'About', ml: 'ഞങ്ങളെക്കുറിച്ച്', kn: 'ನಮ್ಮ ಬಗ್ಗೆ', ta: 'எங்களைப் பற்றி', te: 'మా గురించి' },
  { href: '/contact', key: 'contact', en: 'Contact', ml: 'ബന്ധപ്പെടുക', kn: 'ಸಂಪರ್ಕಿಸಿ', ta: 'தொடர்புக்கு', te: 'సంప్రదించండి' },
];
const JOIN = { href: '/join', key: 'join', en: 'Join T Nation', ml: 'ടി നേഷനിൽ ചേരൂ', kn: 'ಟಿ ನೇಷನ್ ಸೇರಿ', ta: 'டி நேஷனில் சேருங்கள்', te: 'టి నేషన్‌లో చేరండి' };
const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'ml', label: 'മലയാളം', name: 'Malayalam' },
];

// Where T Nation works: Bengaluru HQ plus the other three big South Indian markets.
const CITIES = [
  { city: 'Bengaluru', role: 'Headquarters', region: 'Karnataka', language: 'Kannada' },
  { city: 'Chennai', role: 'Market', region: 'Tamil Nadu', language: 'Tamil' },
  { city: 'Hyderabad', role: 'Market', region: 'Telangana & Andhra Pradesh', language: 'Telugu' },
  { city: 'Kochi', role: 'Market', region: 'Kerala', language: 'Malayalam' },
];
module.exports = { NAV, JOIN, LANGS, CITIES };
