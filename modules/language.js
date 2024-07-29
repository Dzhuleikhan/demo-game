import { translations } from "/public/translations";

async function getLocation() {
  let url = "https://ipinfo.io/json?token=fcd65e5fcfdda1";
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.textContent = translations[lang][key];
  });
}

function changeLanguage(lang) {
  updateContent(lang);
  saveUserLanguage(lang);
  updateButtonText(lang);
  setActiveLanguageBtn(lang);
}

function getLanguageFromPath() {
  const pathSegments = window.location.pathname.split("/");
  const lang = pathSegments[1];
  // Assuming the language code is the first segment in the path
  return translations[lang] ? lang : null;
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

function setActiveLanguageBtn(currentLang) {
  document.querySelectorAll(".language-link").forEach((el) => {
    if (el.getAttribute("data-lang") === currentLang) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
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

async function determineLanguage() {
  let lang = getLanguageFromPath();
  if (!lang) {
    lang = loadUserLanguage();
  }
  if (!lang) {
    try {
      const locationData = await getLocation();
      const countryLangMap = {
        US: "en",
        ES: "es",
        FR: "fr",
        RU: "ru",
        // Add more country codes and their corresponding languages as needed
      };
      lang = countryLangMap[locationData.country] || getUserLanguage();
    } catch (error) {
      console.error("Failed to fetch location data:", error);
      lang = getUserLanguage();
    }
  }
  return lang;
}

window.onload = async () => {
  const lang = await determineLanguage();
  changeLanguage(lang);
};

document.querySelectorAll(".language-link").forEach((langBtn) => {
  langBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const targetLang = e.target.getAttribute("data-lang");
    changeLanguage(targetLang);
  });
});
