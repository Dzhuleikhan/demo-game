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
} else if (modal === "quick") {
  showCurrentModal("quick");
} else if (modal === "prize") {
  if (!getUrlParameter("mode")) {
    addUrlParameter("mode", "fixed");
  }
  const mode = getUrlParameter("mode");

  if (mode === "normal") {
    showCurrentModal("prize-normal");
  } else if (mode === "fixed") {
    showCurrentModal("prize-fixed");
  }
}

// Function to add a parameter to the URL
function addUrlParameter(key, value) {
  var url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.pushState({ path: url.href }, "", url.href);
}

// Function to update the URL with a new parameter and value
function updateUrl(key, value) {
  if (history.pushState) {
    var newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      key +
      "=" +
      value;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}

// Function to remove a parameter from the URL
function removeUrlParameter(parameter) {
  var url = window.location.href;
  var urlParts = url.split("?");

  if (urlParts.length >= 2) {
    var params = urlParts[1].split(/[&;]/g);

    // Filter out the parameter to be removed
    var newParams = params.filter(function (param) {
      return param.split("=")[0] !== parameter;
    });

    var newUrl =
      urlParts[0] + (newParams.length > 0 ? "?" + newParams.join("&") : "");
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}
