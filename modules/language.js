import { geoData } from "./geoLocation";
import { translations } from "/public/translations";
import gsap from "gsap";

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
  "ua",
  "ru",
  "bd",
  "tr",
  "id",
  "pt",
  "de",
  "kz",
  "kg",
  "ee",
  "lv",
  "lt",
  "hr",
];

async function determineLanguage() {
  const location = geoData;

  const countryLangMap = {
    EN: "en",
    ES: "es",
    FR: "fr",
    AZ: "az",
    UZ: "uz",
    UA: "ua",
    RU: "ru",
    BD: "bd",
    TR: "tr",
    ID: "id",
    PT: "pt",
    DE: "de",
    KZ: "kz",
    KG: "kg",
    ee: "ee",
    lv: "lv",
    lt: "lt",
    hr: "hr",
  };
  lang = countryLangMap[location.countryCode] || "en";

  return lang;
}

async function mainFunction() {
  try {
    lang = await determineLanguage();

    changeLanguage(lang);
    document.querySelector(".wrapper").classList.remove("hidden");
  } catch (error) {
    console.error("Error determining language:", error);
  }
}
mainFunction();
gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
