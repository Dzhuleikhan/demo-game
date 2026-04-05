import { translations } from "/public/translations";
import gsap from "gsap";
import { setNewBonusBasedOnParams } from "./formSocials";

function applyDirection(lang) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", dir);
}

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.innerHTML = (translations[lang] || translations["en"])[key];
  });
}

function changeLanguage(lang) {
  applyDirection(lang);
  updateContent(lang);
}

export const availableLang = [
  "en",
  "es",
  "fr",
  "uk",
  "ru",
  "pt",
  "de",
  "it",
  "hu",
  "ro",
  "pl",
  "cs",
  "et",
  "lv",
  "lt",
  "hr",
  "da",
  "fi",
  "bg",
  "el",
  "ga",
  "lb",
  "mt",
  "nl",
  "sk",
  "sl",
  "sv",
  "ar",
  "zh",
  "sw",
  "rw",
];

export const countryLangMap = {
  GB: "en",
  US: "en",
  AU: "en",
  NZ: "en",
  ZA: "en",
  IN: "en",
  UA: "uk",
  RU: "ru",
  BY: "ru",
  FR: "fr",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  PE: "es",
  VE: "es",
  CL: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  DO: "es",
  HN: "es",
  PY: "es",
  NI: "es",
  SV: "es",
  CR: "es",
  PA: "es",
  UY: "es",
  PT: "pt",
  BR: "pt",
  AO: "pt",
  MZ: "pt",
  GW: "pt",
  TL: "pt",
  MO: "pt",
  DE: "de",
  AT: "de",
  LI: "de",
  IT: "it",
  HU: "hu",
  RO: "ro",
  MD: "ro",
  PL: "pl",
  CZ: "cs",
  EE: "et",
  LV: "lv",
  LT: "lt",
  HR: "hr",
  FI: "fi",
  DK: "da",
  BG: "bg",
  GR: "el",
  CY: "el",
  IE: "ga",
  LU: "lb",
  MT: "mt",
  NL: "nl",
  BE: "nl",
  SK: "sk",
  SI: "sl",
  SE: "sv",
  SA: "ar",
  AE: "ar",
  EG: "ar",
  MA: "ar",
  IQ: "ar",
  JO: "ar",
  KW: "ar",
  OM: "ar",
  QA: "ar",
  SY: "ar",
  TN: "ar",
  YE: "ar",
  DZ: "ar",
  BH: "ar",
  LY: "ar",
  SD: "ar",
  LB: "ar",
  CN: "zh",
  HK: "zh",
  TW: "zh",
  TZ: "sw",
  KE: "sw",
  UG: "sw",
  RW: "rw",
};

function determineLanguage() {
  const browserLang = (navigator.language || "en").split("-")[0].toLowerCase();
  return availableLang.includes(browserLang) ? browserLang : "en";
}

function mainFunction() {
  try {
    const lang = determineLanguage();
    localStorage.setItem("preferredLanguage", lang);
    changeLanguage(lang);
    document.querySelector(".wrapper").classList.remove("hidden");

    let currencyStoredData = localStorage.getItem("currencyData");
    let currencyData = JSON.parse(currencyStoredData);
    let currency = currencyData?.abbr;

    setTimeout(() => {
      setNewBonusBasedOnParams(currency);
    }, 500);
  } catch (error) {
    console.error("Error determining language:", error);
  }
}
mainFunction();
gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
