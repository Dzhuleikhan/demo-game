import { getLocation } from "./geoLocation";
import { paymentCountries } from "../public/data";

function setPaymentMethods(countries, location) {
  countries.forEach((country) => {
    if (country.name === location) {
      for (let i = 0; i < country.payments.length && i < 4; i++) {
        const paymentName = country.payments[i];
        let item = document.createElement("li");
        let itemIcon = document.createElement("img");
        item.appendChild(itemIcon);
        itemIcon.setAttribute("src", paymentName);
        itemIcon.setAttribute("alt", "Payment icon");
        document.querySelector(".payments-list-modal").appendChild(item);
      }
    }
  });
}

async function setPayments() {
  try {
    let locationData = await getLocation();
    setPaymentMethods(paymentCountries, locationData.country);
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
}

document.addEventListener("DOMContentLoaded", setPayments);
