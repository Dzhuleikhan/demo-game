import { pageTranslations } from "/public/translations"; // Import translation data from a local file

// Function to get the user's location data from the ipinfo.io service
async function getLocation() {
  let url = "https://ipinfo.io/json?token=fcd65e5fcfdda1"; // URL to fetch location data
  let response = await fetch(url); // Send request to ipinfo.io
  let data = await response.json(); // Parse the response as JSON
  return data; // Return the location data
}

// Function to update the content of the page based on the selected language
function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]"); // Select all elements with data-translate attribute
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate"); // Get the translation key from the element's attribute
    element.textContent = pageTranslations[lang][key]; // Update the element's content with the corresponding translation
  });
}

// Function to handle language changes
function changeLanguage(lang) {
  updateContent(lang); // Update the page content with the selected language
  saveUserLanguage(lang); // Save the user's preferred language in localStorage
  updateButtonText(lang); // Update the language button's text and flag
  setActiveLanguageBtn(lang); // Highlight the active language button
}

// Function to extract the language from the URL path
function getLanguageFromPath() {
  const pathSegments = window.location.pathname.split("/"); // Split the URL path into segments
  const lang = pathSegments[1]; // Assume the language code is the first segment
  return pageTranslations[lang] ? lang : null; // Return the language if supported, otherwise return null
}

// Function to get the browser's default language
function getUserLanguage() {
  const userLang = navigator.language || navigator.userLanguage; // Get the browser language
  const supportedLangs = ["en", "es", "fr", "ru"]; // List of supported languages
  const langPrefix = userLang.split("-")[0]; // Extract language code without region (e.g., "en" from "en-US")
  return supportedLangs.includes(langPrefix) ? langPrefix : "en"; // Return the supported language or default to English
}

// Function to save the user's preferred language to localStorage
function saveUserLanguage(lang) {
  localStorage.setItem("preferredLanguage", lang); // Store the language code in localStorage
}

// Function to load the user's preferred language from localStorage
function loadUserLanguage() {
  return localStorage.getItem("preferredLanguage"); // Retrieve the language code from localStorage
}

// Function to highlight the active language button on the page
function setActiveLanguageBtn(currentLang) {
  document.querySelectorAll(".language-link").forEach((el) => {
    if (el.getAttribute("data-lang") === currentLang) {
      el.classList.add("active"); // Add "active" class to the current language button
    } else {
      el.classList.remove("active"); // Remove "active" class from other buttons
    }
  });
}

// Function to update the language button's text and flag based on the selected language
function updateButtonText(lang) {
  const headerLangBtn = document.querySelector(".header-lang-btn img"); // Select the language button in the header
  const sideLangBtnFlag = document.querySelector(".sidelang-btn img"); // Select the language button flag in the sidebar
  const sideLangBtnText = document.querySelector(".sidelang-btn span"); // Select the language button text in the sidebar
  const languageNames = {
    en: "English",
    es: "Español",
    fr: "Français",
    ru: "Русский",
  }; // Map of language codes to their names
  headerLangBtn.setAttribute(
    "src",
    `./img/flags/${lang}.svg` || `./img/flags/en.svg`, // Set the flag image in the header based on the language code
  );
  sideLangBtnFlag.setAttribute(
    "src",
    `./img/flags/${lang}.svg` || `./img/flags/en.svg`, // Set the flag image in the sidebar based on the language code
  );
  sideLangBtnText.textContent = languageNames[lang] || "English"; // Set the text in the sidebar based on the language code
}

// Function to determine the language to be used based on URL, user preferences, or location
async function determineLanguage() {
  let lang = getLanguageFromPath(); // Try to get the language from the URL path
  if (!lang) {
    lang = loadUserLanguage(); // Try to load the saved language from localStorage
  }
  if (!lang) {
    try {
      const locationData = await getLocation(); // Fetch the user's location
      const countryLangMap = {
        US: "en",
        ES: "es",
        FR: "fr",
        RU: "ru",
        // Add more country codes and their corresponding languages as needed
      };
      lang = countryLangMap[locationData.country] || getUserLanguage(); // Determine the language based on the country or default browser language
    } catch (error) {
      console.error("Failed to fetch location data:", error); // Log an error if the location fetch fails
      lang = getUserLanguage(); // Default to the browser's language if location fails
    }
  }
  return lang; // Return the determined language
}

// Event listener that runs when the page is loaded
window.onload = async () => {
  const lang = await determineLanguage(); // Determine the language to be used
  changeLanguage(lang); // Apply the language to the page
};

// Event listeners for language change buttons
document.querySelectorAll(".language-link").forEach((langBtn) => {
  langBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent the default button action (e.g., page reload)
    const targetLang = e.target.getAttribute("data-lang"); // Get the target language from the button
    changeLanguage(targetLang); // Change the page language to the selected one
  });
});
