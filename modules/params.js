import { getLocation } from "./geoLocation";

const allModals = document.querySelectorAll(".modal-content");
const methodTabs = document.querySelectorAll(".modal-tabs button");
const methodFormContents = document.querySelectorAll(".form-content");

function showCurrentModal(modalName, bannerName) {
  allModals.forEach((modal) => {
    modal.classList.remove("active");
  });
  document.querySelector(`.modal-content-${modalName}`).classList.add("active");
}

function showMethod(method) {
  methodTabs.forEach((tab) => {
    tab.classList.remove("active");
  });
  methodFormContents.forEach((content) => {
    content.classList.remove("active");
  });
  document
    .querySelector(`.modal-tabs button[data-tab='${method}']`)
    .classList.add("active");
  document.querySelector(`.form-content-${method}`).classList.add("active");
}

// Function to get a URL parameter by name
export function getUrlParameter(name) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(window.location.href);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Check if 'modal' parameter is present; if not, set it to 'normal'
const modal = getUrlParameter("modal");

if (!modal) {
  addUrlParameter("modal", "auth");
}

if (modal === "auth") {
  showCurrentModal("main");

  // adding method
  if (!getUrlParameter("method")) {
    addUrlParameter("method", "email");
  }

  const method = getUrlParameter("method");

  if (method === "email") {
    showMethod("email");
  } else if (method === "phone") {
    showMethod("phone");
  } else if (method === "social") {
    showMethod("social");
  } else if (method === "oneclick") {
    showMethod("oneclick");
    document.querySelector("button[data-tab='social']").classList.add("hidden");
    document
      .querySelector("button[data-tab='oneclick']")
      .classList.remove("hidden");
  }
} else if (modal === "auth-social") {
  showCurrentModal("authSocial");
} else if (modal === "socials") {
  showCurrentModal("socials");
} else {
  showCurrentModal("main");
}

// Bonus
let bonus = getUrlParameter("bonus");
let bonusType = getUrlParameter("bonus-type");

const bonusWrapper = document.querySelectorAll(".form-bonus");
const bonusInput = document.querySelectorAll(".bonus-input");
const formBonusBtn = document.querySelectorAll(".form-bonus-btn");

if (bonus) {
  bonusWrapper.forEach((b) => {
    b.classList.remove("hidden");
  });
  if (bonusType === "fixed") {
    bonusWrapper.forEach((b) => {
      b.style.pointerEvents = "none";
    });
    formBonusBtn.forEach((btn) => {
      if (btn) {
        btn.classList.add("bonus-applied");
      }
    });
  }
} else {
  bonusWrapper.forEach((b) => {
    b.classList.add("hidden");
  });
  bonusInput.forEach((input) => {
    input.value = 0;
  });
}

// Function to add a parameter to the URL
function addUrlParameter(key, value) {
  var url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({ path: url.href }, "", url.href);
}

export function updateUrl(key, value) {
  // Create a URL object based on the current window location
  const url = new URL(window.location);

  // Update or add the specified key-value pair
  url.searchParams.set(key, value);

  // Update the browser URL without reloading the page
  if (history.pushState) {
    window.history.pushState({ path: url.href }, "", url.href);
  }
}

async function saveUserLanguage() {
  const location = await getLocation();
  const lang = location.countryCode;
  localStorage.setItem("preferredLanguage", lang.toLowerCase());
}
saveUserLanguage();

const regWithEmailBtn = document.querySelector(".reg-with-email-btn");

if (regWithEmailBtn) {
  regWithEmailBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showCurrentModal("main");
  });
}
