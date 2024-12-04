export function setPaymentMethods(countries, location) {
  // Find the country by name, or default to 'all'
  let country = countries.find((country) => country.name === location);

  // If the country isn't found, default to 'all'
  if (!country) {
    country = countries.find((country) => country.name === "all");
  }

  const modalPaymentsList = document.querySelectorAll(".payments-list-modal");
  modalPaymentsList.forEach((list) => {
    list.innerHTML = ""; // Clears the container before adding new payment methods
    country.payments.slice(0, 4).forEach((paymentName) => {
      // Create a new list item and icon for each element
      let item = document.createElement("li");
      // item.classList.add("main-footer-payments-item");
      let itemIcon = document.createElement("img");
      item.appendChild(itemIcon);

      // Set the src and alt attributes of the icon
      itemIcon.setAttribute("src", paymentName);
      itemIcon.setAttribute("alt", "Payment icon");

      // Append the item to the container
      list.appendChild(item);
    });
  });
}
