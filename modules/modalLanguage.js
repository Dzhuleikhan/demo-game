import { modalTranslations } from "../public/modalTranslations";

async function getLocation() {
  let url = "https://ipinfo.io/json?token=fcd65e5fcfdda1";
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-modal-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-modal-translate");
    element.innerHTML =
      modalTranslations[lang][key] || modalTranslations["en"][key];
  });
}

function changeLanguage(lang) {
  if (modalTranslations[lang]) {
    updateContent(lang);
  } else {
    updateContent("en");
  }
}

async function setModalLanguage() {
  try {
    const location = await getLocation();
    const locationCode = location.country.toLowerCase();
    changeLanguage(locationCode);
  } catch (error) {
    console.log(error);
    changeLanguage("en");
  }
}

setModalLanguage();
