import { getLocation } from "./geoLocation";
import { paymentCountries } from "../public/data";

function setPaymentMethods(countries, location) {
  countries.forEach((country) => {
    if (country.name === location) {
      // Loop through the payment methods and limit to a maximum of 4
      for (let i = 0; i < country.payments.length && i < 4; i++) {
        const paymentName = country.payments[i];

        document.querySelectorAll(".payments-list-modal").forEach((el) => {
          // Create a new list item and icon for each element
          let item = document.createElement("li");
          let itemIcon = document.createElement("img");
          item.appendChild(itemIcon);

          // Set the src and alt attributes of the icon
          itemIcon.setAttribute("src", paymentName);
          itemIcon.setAttribute("alt", "Payment icon");

          el.appendChild(item);
        });
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
