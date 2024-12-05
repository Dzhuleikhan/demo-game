import { countryCurrencyData } from "../public/data";
import { geoData, getLocation } from "./geoLocation";
import { translations } from "/public/translations";
import gsap from "gsap";

const bonusBoxes = document.querySelectorAll(".form-bonus");

let lang;

function updateContent(lang) {
  const elements = document.querySelectorAll("[data-translate]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.innerHTML = translations[lang][key];
  });
}

function changeLanguage(lang) {
  settingBonusValueAndAmount(geoData.countryCode);
  updateContent(lang);
}

bonusBoxes.forEach((bonusBox) => {
  bonusBox.classList.add("hidden");
});

function settingBonusValueAndAmount(countryCode) {
  const detectedCountry = countryCode.toUpperCase();
  // Find the matching entry in countryCurrencyData
  const matchingCurrencyData = countryCurrencyData.find((currency) =>
    currency.countries.includes(detectedCountry),
  );

  if (matchingCurrencyData) {
    const bonusCurrency = document.querySelectorAll(".bonus-currency");
    const bonusValue = document.querySelectorAll(".bonus-value");

    // Update the bonus amount and currency on the page
    bonusValue.forEach((amount) => {
      amount.innerHTML = matchingCurrencyData.amount;
    });
    bonusCurrency.forEach((cur) => {
      cur.innerHTML = matchingCurrencyData.countryCurrencySymbol;
    });
    bonusBoxes.forEach((bonusBox) => {
      bonusBox.classList.remove("hidden");
    });
  } else {
    console.log("No matching country found in the data.");
  }
}

async function determineLanguage() {
  const location = await getLocation();

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
    // Add more country codes and their corresponding languages as needed
  };

  lang = countryLangMap[location.countryCode] || "en";

  return lang;
}

async function mainFunction() {
  try {
    lang = await determineLanguage();
    localStorage.setItem("preferredLanguage", lang);
    console.log(lang);

    changeLanguage(lang);
    gsap.to(".preloader", { opacity: 0, duration: 0.5 });
    document.querySelector(".wrapper").classList.remove("hidden");
  } catch (error) {
    console.error("Error determining language:", error);
  }
}
mainFunction();
