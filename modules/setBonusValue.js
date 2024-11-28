import { getLocation } from "./geoLocation";
import { getCountryCurrencyABBR } from "./modalCurrency";
import { welcomeBonusData } from "../public/welcomeBonusAmount";

export async function gettingBonusCurrency() {
  try {
    let locationData = await getLocation();
    const countryInput = locationData.countryCode;

    const bonusCurrency = document.querySelectorAll(".bonus-currency");
    const bonusValue = document.querySelectorAll(".bonus-value");

    const currencyAbbr = getCountryCurrencyABBR(countryInput);

    bonusCurrency.forEach((cur) => {
      cur.innerHTML = currencyAbbr;
    });
    if (Object.keys(welcomeBonusData).includes(currencyAbbr)) {
      bonusCurrency.innerHTML = currencyAbbr;
      bonusValue.forEach((val) => {
        val.innerHTML = welcomeBonusData[currencyAbbr].amount;
      });
    } else {
      // Fallback to USD if currencyAbbr is not found
      bonusCurrency.innerHTML = "USD";
      bonusValue.forEach((val) => {
        val.innerHTML = welcomeBonusData["USD"].amount;
      });
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
}
