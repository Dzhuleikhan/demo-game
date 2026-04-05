import { translations } from "/public/translations";
import gsap from "gsap";

let lang;

function applyDirection(lang) {
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lang);
}

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.innerHTML = translations[lang][key];
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
  "et",
  "lv",
  "lt",
  "hr",
  "da",
  "fi",
  "bg",
  "ro",
  "hu",
  "pl",
  "cs",
  "sl",
  "sv",
  "el",
  "ga",
  "it",
  "lb",
  "mt",
  "nl",
  "sk",
  "ar",
  "zh",
  "sw",
  "rw",
];

function determineLanguage() {
  const browserLang = (navigator.language || "en").split("-")[0].toLowerCase();
  return availableLang.includes(browserLang) ? browserLang : "en";
}

async function mainFunction() {
  try {
    lang = determineLanguage();

    changeLanguage(lang);
    document.querySelector(".wrapper").classList.remove("hidden");
  } catch (error) {
    console.error("Error determining language:", error);
  }
}
mainFunction();
gsap.to(".preloader", { opacity: 0, duration: 0.5, delay: 1.5 });
