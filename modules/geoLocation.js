import { SupportedLanguages, countryLanguagesMap } from "../public/data";

export async function getLocation() {
  const fallback = { countryCode: "PL", currency: { code: "PLN" } };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

  try {
    const url = `https://${window.location.host}/geo-api/api/check?accessKey=0439ba6e-6092-46c2-9aeb-8662065bc43c`;
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) throw new Error("Bad API response");

    const data = await response.json();
    return data;
  } catch (err) {
    console.log("API failed, applying fallback GEO");
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export let geoData = await getLocation();

// Checking language
// Returns matched language or null if country/language not in our list
export const getSupportedLanguage = (countryCode) => {
  if (countryCode in countryLanguagesMap) {
    const languages = countryLanguagesMap[countryCode];

    if (languages.length > 1) {
      const browserLang = (navigator.language || "").split("-")[0].toLowerCase();
      if (browserLang && languages.includes(browserLang) && SupportedLanguages.includes(browserLang)) {
        return browserLang;
      }
    }

    for (let language of languages) {
      if (SupportedLanguages.includes(language)) {
        return language;
      }
    }
  }
  return null;
};
