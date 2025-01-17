import { countryCurrencyData } from "../public/data";

const bonusBoxes = document.querySelectorAll(".form-bonus");

bonusBoxes.forEach((bonusBox) => {
  bonusBox.classList.add("hidden");
});

export function settingBonusValueAndAmount(countryCode) {
  let detectedCountry = countryCode.toUpperCase();

  if (detectedCountry === "RU") {
    detectedCountry = "US";
  }

  // Find the matching entry in countryCurrencyData
  const matchingCurrencyData = countryCurrencyData.find((currency) =>
    currency.countries.includes(detectedCountry),
  );

  const bonusCurrency = document.querySelectorAll(".bonus-currency");
  const bonusValue = document.querySelectorAll(".bonus-value");
  const bonusSpins = document.querySelectorAll(".bonus-spins");

  function settingData(bonusAmount, symbol, spins) {
    bonusValue.forEach((amount) => {
      amount.innerHTML = bonusAmount;
    });
    bonusCurrency.forEach((cur) => {
      cur.innerHTML = symbol;
    });
    bonusSpins.forEach((cur) => {
      cur.innerHTML = spins;
    });
    bonusBoxes.forEach((bonusBox) => {
      bonusBox.classList.remove("hidden");
    });
  }

  if (matchingCurrencyData) {
    settingData(
      matchingCurrencyData.amount,
      matchingCurrencyData.countryCurrencySymbol,
      matchingCurrencyData.spins,
    );
  } else {
    console.log("No matching country found in the data.");
    settingData("5.000", "$", "200FS");
  }
}
