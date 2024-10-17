import { getLocation } from "./geoLocation";
import { countryCurrencyData } from "../public/data";

export function getCountryCurrencyABBR(inputCountry) {
  for (const data of countryCurrencyData) {
    if (data.countries.includes(inputCountry)) {
      return data.countryCurrency;
    }
  }
  return "USD"; // or some default value if country is not found
}

function getCountryCurrencyFullName(inputCountry) {
  for (const data of countryCurrencyData) {
    if (data.countries.includes(inputCountry)) {
      return data.countryCurrencyFullName;
    }
  }
  return "US Dollar"; // or some default value if country is not found
}

function getCountryCurrencyIcon(inputCountry) {
  for (const data of countryCurrencyData) {
    if (data.countries.includes(inputCountry)) {
      return data.countryCurrencyIcon;
    }
  }
  return "./img/currencies/usd.svg"; // or some default value if country is not found
}

function setCurrency(abbr, name, icon) {
  const formCurrency = document.querySelectorAll(".form-currency");
  formCurrency.forEach((cur) => {
    let input = cur.querySelector("input");
    let currencyName = cur.querySelector(".main-currency-name");
    let currencyIcon = cur.querySelector(".main-currency-icon");
    input.value = abbr;
    currencyName.textContent = name;
    currencyIcon.src = icon;
  });
}

async function settingModalCurrency() {
  try {
    let locationData = await getLocation();
    const countryInput = locationData.countryCode;
    console.log(countryInput);

    const currencyAbbr = getCountryCurrencyABBR(countryInput);
    const currencyFullName = getCountryCurrencyFullName(countryInput);
    const currencyIcon = getCountryCurrencyIcon(countryInput);

    const currencyData = {
      abbr: currencyAbbr,
      name: currencyFullName,
      icon: currencyIcon,
    };

    // Save to local storage
    localStorage.setItem("currencyData", JSON.stringify(currencyData));

    setCurrency(currencyAbbr, currencyFullName, currencyIcon);
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
}

function loadCurrencyFromLocalStorage() {
  const currencyData = JSON.parse(localStorage.getItem("currencyData"));
  if (currencyData) {
    setCurrency(currencyData.abbr, currencyData.name, currencyData.icon);
  } else {
    settingModalCurrency();
  }
}

// Call this function when the page loads
document.addEventListener("DOMContentLoaded", loadCurrencyFromLocalStorage);

/**
 *  Currency dropdown
 */

const formCurrency = document.querySelectorAll(".form-currency");

formCurrency.forEach((cur) => {
  if (cur) {
    const currencyDropdownBtn = cur.querySelector(".form-currency-btn");
    const currencyDropdownList = cur.querySelector(".form-currency-dropdown");

    function hideDropdown() {
      currencyDropdownBtn.classList.remove("active");
      currencyDropdownList.classList.remove("active");
    }

    currencyDropdownBtn.addEventListener("click", () => {
      currencyDropdownBtn.classList.toggle("active");
      currencyDropdownList.classList.toggle("active");
    });

    const currencyListItems = currencyDropdownList.querySelectorAll("li");

    currencyListItems.forEach((item) => {
      item.addEventListener("click", () => {
        currencyListItems.forEach((el) => {
          el.classList.remove("active");
        });
        item.classList.add("active");
        hideDropdown();

        // Taking currency value from item
        let curIcon = item.querySelector(".currency-item-icon").src;
        let curName = item.querySelector(".currency-item-name").textContent;
        let curAbbr = item.querySelector(".currency-item-abbr").textContent;

        // Update all currency inputs on the page
        setCurrency(curAbbr, curName, curIcon);

        // Update local storage
        const currencyData = {
          abbr: curAbbr,
          name: curName,
          icon: curIcon,
        };
        localStorage.setItem("currencyData", JSON.stringify(currencyData));
      });
    });

    document.addEventListener("click", (event) => {
      if (!cur.contains(event.target)) {
        hideDropdown();
      }
    });
  }
});
