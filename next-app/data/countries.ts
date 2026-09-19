export interface CountryMeta {
  code: string; // ISO-3166 alpha-2
  name: string;
  nationality: string;
  dialCode: string;
  flag: string;
}

// Curated dataset — extend freely; components never hard-code countries.
// Source: ISO-3166 + ITU dial codes.
export const COUNTRIES: CountryMeta[] = [
  { code: "IN", name: "India", nationality: "Indian", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", nationality: "American", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", nationality: "Canadian", dialCode: "+1", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", nationality: "British", dialCode: "+44", flag: "🇬🇧" },
  { code: "AU", name: "Australia", nationality: "Australian", dialCode: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", nationality: "New Zealander", dialCode: "+64", flag: "🇳🇿" },
  { code: "AE", name: "United Arab Emirates", nationality: "Emirati", dialCode: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", nationality: "Saudi", dialCode: "+966", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", nationality: "Qatari", dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", nationality: "Kuwaiti", dialCode: "+965", flag: "🇰🇼" },
  { code: "OM", name: "Oman", nationality: "Omani", dialCode: "+968", flag: "🇴🇲" },
  { code: "BH", name: "Bahrain", nationality: "Bahraini", dialCode: "+973", flag: "🇧🇭" },
  { code: "SG", name: "Singapore", nationality: "Singaporean", dialCode: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", nationality: "Malaysian", dialCode: "+60", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", nationality: "Indonesian", dialCode: "+62", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", nationality: "Filipino", dialCode: "+63", flag: "🇵🇭" },
  { code: "TH", name: "Thailand", nationality: "Thai", dialCode: "+66", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", nationality: "Vietnamese", dialCode: "+84", flag: "🇻🇳" },
  { code: "JP", name: "Japan", nationality: "Japanese", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", nationality: "South Korean", dialCode: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", nationality: "Chinese", dialCode: "+86", flag: "🇨🇳" },
  { code: "HK", name: "Hong Kong", nationality: "Hong Konger", dialCode: "+852", flag: "🇭🇰" },
  { code: "LK", name: "Sri Lanka", nationality: "Sri Lankan", dialCode: "+94", flag: "🇱🇰" },
  { code: "BD", name: "Bangladesh", nationality: "Bangladeshi", dialCode: "+880", flag: "🇧🇩" },
  { code: "NP", name: "Nepal", nationality: "Nepali", dialCode: "+977", flag: "🇳🇵" },
  { code: "PK", name: "Pakistan", nationality: "Pakistani", dialCode: "+92", flag: "🇵🇰" },
  { code: "AF", name: "Afghanistan", nationality: "Afghan", dialCode: "+93", flag: "🇦🇫" },
  { code: "MM", name: "Myanmar", nationality: "Myanmar", dialCode: "+95", flag: "🇲🇲" },
  { code: "DE", name: "Germany", nationality: "German", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", nationality: "French", dialCode: "+33", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", nationality: "Dutch", dialCode: "+31", flag: "🇳🇱" },
  { code: "IE", name: "Ireland", nationality: "Irish", dialCode: "+353", flag: "🇮🇪" },
  { code: "ES", name: "Spain", nationality: "Spanish", dialCode: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italy", nationality: "Italian", dialCode: "+39", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", nationality: "Portuguese", dialCode: "+351", flag: "🇵🇹" },
  { code: "SE", name: "Sweden", nationality: "Swedish", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", nationality: "Norwegian", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", nationality: "Danish", dialCode: "+45", flag: "🇩🇰" },
  { code: "FI", name: "Finland", nationality: "Finnish", dialCode: "+358", flag: "🇫🇮" },
  { code: "CH", name: "Switzerland", nationality: "Swiss", dialCode: "+41", flag: "🇨🇭" },
  { code: "AT", name: "Austria", nationality: "Austrian", dialCode: "+43", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", nationality: "Belgian", dialCode: "+32", flag: "🇧🇪" },
  { code: "PL", name: "Poland", nationality: "Polish", dialCode: "+48", flag: "🇵🇱" },
  { code: "RU", name: "Russia", nationality: "Russian", dialCode: "+7", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", nationality: "Ukrainian", dialCode: "+380", flag: "🇺🇦" },
  { code: "TR", name: "Turkey", nationality: "Turkish", dialCode: "+90", flag: "🇹🇷" },
  { code: "ZA", name: "South Africa", nationality: "South African", dialCode: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", nationality: "Nigerian", dialCode: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", nationality: "Kenyan", dialCode: "+254", flag: "🇰🇪" },
  { code: "EG", name: "Egypt", nationality: "Egyptian", dialCode: "+20", flag: "🇪🇬" },
  { code: "BR", name: "Brazil", nationality: "Brazilian", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", nationality: "Mexican", dialCode: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", nationality: "Argentine", dialCode: "+54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", nationality: "Chilean", dialCode: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", nationality: "Colombian", dialCode: "+57", flag: "🇨🇴" },
  { code: "FJ", name: "Fiji", nationality: "Fijian", dialCode: "+679", flag: "🇫🇯" },
  { code: "MU", name: "Mauritius", nationality: "Mauritian", dialCode: "+230", flag: "🇲🇺" },
];

export const countryByCode = (code: string): CountryMeta | undefined =>
  COUNTRIES.find((c) => c.code === code.toUpperCase());

/** Match a typed query against country name, nationality, code, or dial code. */
export function searchCountries(query: string): CountryMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES;
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nationality.toLowerCase().includes(q) ||
      c.code.toLowerCase() === q ||
      c.dialCode.replace("+", "").startsWith(q.replace("+", ""))
  );
}

/** Basic per-country digit-length guidance (min, max) for validation hints. */
export const PHONE_LENGTHS: Record<string, [number, number]> = {
  IN: [10, 10],
  US: [10, 10],
  CA: [10, 10],
  GB: [10, 11],
  AU: [9, 10],
  AE: [9, 9],
};
export const DEFAULT_PHONE_LENGTH: [number, number] = [7, 15];
