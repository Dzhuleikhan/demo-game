import { translations } from "/public/translations";

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.textContent = translations[lang][key];
  });
}

function changeLanguage(lang) {
  updateContent(lang);
  setLanguageUrl(lang);
  saveUserLanguage(lang);
  updateButtonText(lang);
}

function getLanguageFromPath() {
  const pathSegments = window.location.pathname.split("/");
  const lang = pathSegments[1];
  // Assuming the language code is the first segment in the path
  return translations[lang] ? lang : null;
}

function setLanguageUrl(lang) {
  const newPath = `/${lang}${window.location.pathname.substring(3)}`;
  window.history.replaceState({}, "", newPath);
}

function getUserLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  const supportedLangs = ["en", "es", "fr", "ru"];
  const langPrefix = userLang.split("-")[0]; // Get the language code without region
  return supportedLangs.includes(langPrefix) ? langPrefix : "en"; // Default to 'en' if the language is not supported
}

function saveUserLanguage(lang) {
  localStorage.setItem("preferredLanguage", lang);
}

function loadUserLanguage() {
  return localStorage.getItem("preferredLanguage");
}

function updateButtonText(lang) {
  const headerLangBtn = document.querySelector(".header-lang-btn img");
  const sideLangBtnFlag = document.querySelector(".sidelang-btn img");
  const sideLangBtnText = document.querySelector(".sidelang-btn span");
  const languageNames = {
    en: "English",
    es: "Español",
    fr: "Français",
    ru: "Русский",
  };
  headerLangBtn.setAttribute(
    "src",
    `./img/flags/${lang}.svg` || `./img/flags/en.svg`,
  );
  sideLangBtnFlag.setAttribute(
    "src",
    `./img/flags/${lang}.svg` || `./img/flags/en.svg`,
  );
  sideLangBtnText.textContent = languageNames[lang] || "English";
}

window.onload = () => {
  let lang = getLanguageFromPath();
  if (!lang) {
    lang = loadUserLanguage() || getUserLanguage();
    setLanguageUrl(lang);
  }
  changeLanguage(lang);
};

document.querySelectorAll(".language-link").forEach((langBtn) => {
  langBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const targetLang = e.target.getAttribute("data-lang");
    changeLanguage(targetLang);
  });
});
