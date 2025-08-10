// Country and Timezone data for Settings dropdowns
// Minimal but useful list; can be extended easily.

export const COUNTRIES = [
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CZ', name: 'Czechia', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

export const TIMEZONES_BY_COUNTRY = {
  TR: ['Europe/Istanbul'],
  US: [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
  ],
  GB: ['Europe/London'],
  DE: ['Europe/Berlin'],
  FR: ['Europe/Paris'],
  ES: ['Europe/Madrid', 'Atlantic/Canary'],
  IT: ['Europe/Rome'],
  NL: ['Europe/Amsterdam'],
  SE: ['Europe/Stockholm'],
  NO: ['Europe/Oslo'],
  DK: ['Europe/Copenhagen'],
  FI: ['Europe/Helsinki'],
  RU: [
    'Europe/Moscow', 'Europe/Kaliningrad', 'Asia/Yekaterinburg', 'Asia/Novosibirsk',
    'Asia/Krasnoyarsk', 'Asia/Irkutsk', 'Asia/Yakutsk', 'Asia/Vladivostok', 'Asia/Magadan'
  ],
  UA: ['Europe/Kyiv'],
  PL: ['Europe/Warsaw'],
  RO: ['Europe/Bucharest'],
  GR: ['Europe/Athens'],
  PT: ['Europe/Lisbon', 'Atlantic/Azores', 'Atlantic/Madeira'],
  IE: ['Europe/Dublin'],
  CH: ['Europe/Zurich'],
  AT: ['Europe/Vienna'],
  CZ: ['Europe/Prague'],
  HU: ['Europe/Budapest'],
  BG: ['Europe/Sofia'],
  RS: ['Europe/Belgrade'],
  PS: ['Asia/Gaza', 'Asia/Hebron'],
  AE: ['Asia/Dubai'],
  SA: ['Asia/Riyadh'],
  IN: ['Asia/Kolkata'],
  CN: ['Asia/Shanghai'],
  JP: ['Asia/Tokyo'],
  KR: ['Asia/Seoul'],
  AU: ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide'],
  NZ: ['Pacific/Auckland']
};

// Provide a general list of common IANA timezones for fallback or full listing
export const ALL_TIMEZONES = [
  'UTC',
  // Europe
  'Europe/London','Europe/Amsterdam','Europe/Andorra','Europe/Athens','Europe/Belgrade','Europe/Berlin','Europe/Brussels','Europe/Bucharest','Europe/Budapest','Europe/Copenhagen','Europe/Dublin','Europe/Gibraltar','Europe/Helsinki','Europe/Istanbul','Europe/Kaliningrad','Europe/Kiev','Europe/Kyiv','Europe/Lisbon','Europe/Luxembourg','Europe/Madrid','Europe/Malta','Europe/Minsk','Europe/Monaco','Europe/Moscow','Europe/Oslo','Europe/Paris','Europe/Prague','Europe/Riga','Europe/Rome','Europe/Samara','Europe/Sarajevo','Europe/Skopje','Europe/Sofia','Europe/Stockholm','Europe/Tallinn','Europe/Tirane','Europe/Vienna','Europe/Vilnius','Europe/Warsaw','Europe/Zurich',
  // America
  'America/St_Johns','America/Halifax','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix','America/Anchorage','America/Adak','Pacific/Honolulu','America/Mexico_City','America/Bogota','America/Lima','America/Santiago','America/Montevideo','America/Sao_Paulo','America/Argentina/Buenos_Aires',
  // Africa
  'Africa/Cairo','Africa/Johannesburg','Africa/Nairobi','Africa/Casablanca',
  // Asia
  'Asia/Jerusalem','Asia/Dubai','Asia/Riyadh','Asia/Tehran','Asia/Karachi','Asia/Kolkata','Asia/Dhaka','Asia/Bangkok','Asia/Jakarta','Asia/Ho_Chi_Minh','Asia/Shanghai','Asia/Hong_Kong','Asia/Taipei','Asia/Tokyo','Asia/Seoul','Asia/Singapore','Asia/Kuala_Lumpur','Asia/Manila','Asia/Yangon','Asia/Novosibirsk','Asia/Yekaterinburg','Asia/Krasnoyarsk','Asia/Irkutsk','Asia/Yakutsk','Asia/Vladivostok','Asia/Magadan','Asia/Kamchatka',
  // Oceania
  'Australia/Perth','Australia/Adelaide','Australia/Brisbane','Australia/Melbourne','Australia/Sydney','Pacific/Auckland','Pacific/Fiji'
];

