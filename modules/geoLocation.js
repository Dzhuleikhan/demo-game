import { SupportedLanguages, countryLanguagesMap } from "../public/data";

export async function getLocation() {
  const fallback = { countryCode: "PL", currency: { code: "PLN" } };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const url = `https://${window.location.host}/geo-api/api/check?accessKey=0439ba6e-6092-46c2-9aeb-8662065bc43c`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) throw new Error("Bad API response");

    const data = await response.json();
    return data;
  } catch (err) {
    console.log("API failed, applying fallback GEO");
    return fallback;
  }
}

export let geoData = await getLocation();

// Checking language
export const getSupportedLanguage = (countryCode) => {
  if (countryCode === "NG") {
    const nigeriaLangs = ["ha", "yo", "ig"];
    const browserLang = (navigator.language || "").split("-")[0].toLowerCase();
    return nigeriaLangs.includes(browserLang) ? browserLang : "ha";
  }
  if (countryCode in countryLanguagesMap) {
    const languages = countryLanguagesMap[countryCode];
    for (let language of languages) {
      if (SupportedLanguages.includes(language)) {
        return language;
      }
    }
  }
  return "en";
};

// Коды браузера, расходящиеся с кодами наших словарей.
// В эталоне (CASH_Joker) здесь ещё есть da → dk, нам он НЕ нужен: датский у нас
// лежит под кодом da, как его и шлёт браузер.
const BROWSER_LANG_ALIASES = {
  no: "nb", // норвежский: браузер шлёт макро-код
  nn: "nb", // нюнорск отдаём на букмоле
};

// Ленд открывается на языке браузера; не поддерживаем его — показываем en.
// Считаем здесь, а не в language.js: значение уходит в /api/register как lang,
// а формы читают localStorage раньше, чем language.js успевает отработать.
export const getInitialLanguage = () => {
  const browserLang = navigator.language.split("-")[0];
  const lang = BROWSER_LANG_ALIASES[browserLang] ?? browserLang;

  return SupportedLanguages.includes(lang) ? lang : "en";
};

localStorage.setItem("preferredLanguage", getInitialLanguage());
