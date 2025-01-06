import { countryCurrencyData } from "../public/data";
import { geoData, getLocation } from "./geoLocation";

const bonusBoxes = document.querySelectorAll(".form-bonus");

bonusBoxes.forEach((bonusBox) => {
  bonusBox.classList.add("hidden");
});

function settingBonusValueAndAmount(countryCode) {
  let detectedCountry = countryCode.toUpperCase();

  if (detectedCountry === "RU") {
    detectedCountry = "US";
  }

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

export async function initBonusDisplay() {
  try {
    // Wait for geoData to be fetched
    const geoData = await getLocation();

    // Observe the DOM for dynamic content to be ready
    waitForDynamicContent(() => {
      // Call the function to set bonus value and amount
      settingBonusValueAndAmount(geoData.countryCode);
    });
  } catch (error) {
    console.error("Error fetching geo location data:", error);
  }
}

function waitForDynamicContent(callback) {
  const targetNode = document.body; // You can change this to a specific container if needed
  const observerConfig = {
    childList: true,
    subtree: true,
  };

  const observer = new MutationObserver((mutations, obs) => {
    // Check if the dynamic elements are present on the page
    const bonusCurrency = document.querySelectorAll(".bonus-currency");
    const bonusValue = document.querySelectorAll(".bonus-value");

    if (bonusCurrency.length > 0 && bonusValue.length > 0) {
      // Stop observing once the content is ready
      obs.disconnect();

      // Execute the callback function
      callback();
    }
  });

  // Start observing the target node for changes
  observer.observe(targetNode, observerConfig);
}

// Call the initBonusDisplay function to initiate the process
initBonusDisplay();
