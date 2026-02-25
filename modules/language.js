import { geoData } from "./geoLocation";
import { translations } from "/public/translations";
import gsap from "gsap";
import { setNewBonusBasedOnParams } from "./formSocials";

let lang;

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.innerHTML = translations[lang][key];
  });
}

function changeLanguage(lang) {
  updateContent(lang);
}

export const availableLang = [
  "en",
  "es",
  "fr",
  "az",
  "uz",
  "uk",
  "ru",
  "bd",
  "tr",
  "id",
  "pt",
  "de",
  "kk",
  "kg",
  "it",
  "hu",
  "ro",
  "pl",
  "cs",
  "ee",
  "lv",
  "lt",
  "hr",
  "dk",
  "fi",
  "bg",
  "sk",
  "sl",
  "el",
  "nl",
];

export async function determineLanguage() {
  const location = geoData;

  const countryLangMap = {
    EN: "en",
    ES: "es",
    FR: "fr",
    AZ: "az",
    UZ: "uz",
    UA: "uk",
    RU: "ru",
    BD: "bd",
    TR: "tr",
    ID: "id",
    PT: "pt",
    DE: "de",
    KZ: "kk",
    KG: "kg",
    IT: "it",
    HU: "hu",
    RO: "ro",
    PL: "pl",
    CZ: "cs",
    EE: "ee",
    LV: "lv",
    LT: "lt",
    HR: "hr",
    FI: "fi",
    DK: "dk",
    BG: "bg",
    SK: "sk",
    SI: "sl",
    GR: "el",
    AT: "de",
    CH: "fr",
    BE: "fr",
  };
  lang = countryLangMap[location.countryCode] || "en";

  return lang;
}

async function mainFunction() {
  try {
    lang = await determineLanguage();

    changeLanguage(lang);
    document.querySelector(".wrapper").classList.remove("hidden");
    setTimeout(() => {
      setNewBonusBasedOnParams();
    }, 500);
  } catch (error) {
    console.error("Error determining language:", error);
  }
}
mainFunction();
gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
