export const dictionaries = {
  en: {
    heroTitle: "ClaimBridge",
    heroSubtitle: "Bridge the gap between your accident and your insurance.",
    uploadPhoto: "Upload Vehicle Photo",
    uploadPolicy: "Upload Insurance Policy",
    submit: "Analyze Claim",
    analyzing: "Analyzing...",
    result: "Claim Analysis Result",
    consumables: "Consumables Added",
    zeroDep: "Zero Depreciation",
    idv: "Insured Declared Value (IDV)"
  },
  hi: {
    heroTitle: "क्लेमब्रिज (ClaimBridge)",
    heroSubtitle: "आपकी दुर्घटना और बीमा के बीच की दूरी कम करें।",
    uploadPhoto: "वाहन की फोटो अपलोड करें",
    uploadPolicy: "बीमा पॉलिसी अपलोड करें",
    submit: "दावे का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    result: "दावा विश्लेषण परिणाम",
    consumables: "कंज्यूमेबल्स शामिल",
    zeroDep: "जीरो डेप्रिसिएशन (शून्य मूल्यह्रास)",
    idv: "बीमित घोषित मूल्य (IDV)"
  }
};

export type Language = keyof typeof dictionaries;

export function getDictionary(lang: Language) {
  return dictionaries[lang];
}
