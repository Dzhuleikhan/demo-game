import { geoData } from "./geoLocation";
import { countryCurrencyData } from "../public/data";

const CDN = "https://3344112-img.b-cdn.net";

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
  return CDN + "/currency_icons/USD.svg"; // or some default value if country is not found
}

// Названия валют в данных и в разметке — английские («Icelandic krona»).
// Показываем их на языке модалки через Intl («Íslensk króna», «Złoty polski»);
// если браузер не знает такой язык или валюту — остаётся английское.
let currencyLang = "en";

// Chrome собран без данных Intl для части языков (исландский в их числе) и
// для них отдаёт английское название — такие языки держим своим словарём.
const CURRENCY_NAMES = {
  is: {
    ARS: "Argentínskur pesi",
    AUD: "Ástralskur dalur",
    AZN: "Aserskt manat",
    BDT: "Bangladessk taka",
    BRL: "Brasilískt ríal",
    CAD: "Kanadadalur",
    CHF: "Svissneskur franki",
    CLP: "Síleskur pesi",
    COP: "Kólumbískur pesi",
    CZK: "Tékknesk króna",
    DKK: "Dönsk króna",
    EUR: "Evra",
    GHS: "Ganverskur sedi",
    HUF: "Ungversk fórinta",
    IDR: "Indónesísk rúpía",
    INR: "Indversk rúpía",
    ISK: "Íslensk króna",
    KES: "Kenískur skildingur",
    KGS: "Kirgiskt som",
    KZT: "Kasakst tengi",
    MXN: "Mexíkóskur pesi",
    NGN: "Nígerísk næra",
    NOK: "Norsk króna",
    NZD: "Nýsjálenskur dalur",
    PLN: "Pólskt slot",
    RON: "Rúmenskt lei",
    RUB: "Rússnesk rúbla",
    SLL: "Síerraleónsk ljóna",
    THB: "Taílenskt bat",
    TRY: "Tyrknesk líra",
    TZS: "Tansanískur skildingur",
    UAH: "Úkraínsk hrinja",
    UGX: "Úgandskur skildingur",
    USD: "Bandaríkjadalur",
    UZS: "Úsbekskt súm",
    XAF: "Miðafrískur franki",
    XOF: "Vesturafrískur franki",
    ZAR: "Suðurafrískt rand",
    ZMW: "Sambísk kvaka",
  },
};

const localizeCurrencyName = (abbr, fallback) => {
  // Английские названия из данных оставляем как есть
  if (currencyLang === "en") return fallback;
  const own = CURRENCY_NAMES[currencyLang]?.[String(abbr).trim()];
  if (own) return own;
  try {
    const name = new Intl.DisplayNames([currencyLang], { type: "currency" }).of(
      String(abbr).trim(),
    );
    if (!name || name === String(abbr).trim()) return fallback;
    return name.charAt(0).toLocaleUpperCase(currencyLang) + name.slice(1);
  } catch {
    return fallback;
  }
};

// Вызывается из modalLanguage, когда выбран язык модалки
export function localizeCurrencyNames(lang) {
  currencyLang = lang || "en";

  document.querySelectorAll(".currency-item-name").forEach((nameEl) => {
    const abbr = nameEl
      .closest("li")
      ?.querySelector(".currency-item-abbr")
      ?.textContent.trim();
    if (!abbr) return;
    nameEl.dataset.enName ??= nameEl.textContent.trim();
    nameEl.textContent = localizeCurrencyName(abbr, nameEl.dataset.enName);
  });

  document.querySelectorAll(".form-currency").forEach((cur) => {
    const abbr = cur.querySelector("input")?.value;
    const nameEl = cur.querySelector(".main-currency-name");
    if (!abbr || !nameEl) return;
    nameEl.dataset.enName ??= nameEl.textContent.trim();
    nameEl.textContent = localizeCurrencyName(abbr, nameEl.dataset.enName);
  });
}

function setCurrency(abbr, name, icon) {
  const formCurrency = document.querySelectorAll(".form-currency");
  formCurrency.forEach((cur) => {
    let input = cur.querySelector("input");
    let currencyName = cur.querySelector(".main-currency-name");
    let currencyIcon = cur.querySelector(".main-currency-icon");
    input.value = abbr;
    currencyName.dataset.enName = name;
    currencyName.textContent = localizeCurrencyName(abbr, name);
    currencyIcon.src = icon;

    const currencyListItem = cur.querySelectorAll(
      ".form-currency-dropdown ul li",
    );

    // Выбранной должна быть ровно одна валюта во ВСЕХ списках (у каждой
    // вкладки свой dropdown). Раньше active только добавлялся — старый выбор
    // оставался подсвеченным, и при переключении вкладок в списке горело
    // несколько валют.
    currencyListItem.forEach((item) => {
      const itemAbbr = item
        .querySelector(".currency-item-abbr")
        .textContent.trim();
      item.classList.toggle("active", itemAbbr === String(abbr).trim());
    });
  });
}

async function settingModalCurrency() {
  try {
    let locationData = geoData;
    let countryInput = locationData.countryCode;

    const excludedCountries = ["RU", "MX", "CL", "CO", "TH", "ID"];

    if (excludedCountries.includes(countryInput)) {
      countryInput = "US";
    }

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

settingModalCurrency();

/**
 *  Currency dropdownxw
 */
export const settingBonusOnCurrencyChange = (
  currencyDataArray,
  targetCurrency,
) => {
  const matchedObject = currencyDataArray.find(
    (item) => item.countryCurrency === targetCurrency.abbr,
  );
  const amount = matchedObject ? matchedObject.amount : null;
  const symbol = matchedObject ? matchedObject.countryCurrencySymbol : null;
  const spins = matchedObject ? matchedObject.spins : null;

  document.querySelectorAll(".bonus-value").forEach((el) => {
    el.innerHTML = amount;
  });
  document.querySelectorAll(".bonus-currency").forEach((el) => {
    el.innerHTML = symbol;
  });
  document.querySelectorAll(".bonus-spins").forEach((el) => {
    el.innerHTML = spins;
  });
};

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
        // active во всех списках выставляет setCurrency ниже
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

        settingBonusOnCurrencyChange(countryCurrencyData, currencyData);
      });
    });

    document.addEventListener("click", (event) => {
      if (!cur.contains(event.target)) {
        hideDropdown();
      }
    });
  }
});

export const checkTir1CurrencyMatch = (currency, bonus) => {
  const exceptCurrencies = [
    "RON",
    "DKK",
    "HUF",
    "CZK",
    "CHF",
    "PLN",
    "CAD",
    "USD",
    "EUR",
  ];
  if (exceptCurrencies.includes(currency) && bonus === "welcome-bonus-1") {
    bonus = bonus + "-alt";
  } else {
    bonus = bonus;
  }
  return bonus;
};
