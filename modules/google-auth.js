import { newDomain } from "./fetchingDomain";
import { getUrlParameter, getTestUserParams } from "./params";
import { goToRegister, addRegTestAction } from "./regTest";

// One-tap google auth
let currencyStoredData = localStorage.getItem("currencyData");
let currencyData = JSON.parse(currencyStoredData);
let currency = currencyData.abbr;
const promocode = getUrlParameter("promocode");
const lang = localStorage.getItem("preferredLanguage");
const cid = getUrlParameter("cid");
const partner = getUrlParameter("partner");
const offer = getUrlParameter("offer");

// Скрипт Google (~100 КБ) грузим после load страницы, чтобы он не конкурировал
// с первым экраном за сеть
const GSI_SRC = "https://accounts.google.com/gsi/client";
const GSI_DELAY_MS = 1500;

function initOneTap() {
  google.accounts.id.initialize({
    client_id:
      "757023558262-l0ffftmca719f5a4ksq4r5l2rugankkn.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  google.accounts.id.prompt();
}

function loadGsi() {
  const script = document.createElement("script");
  script.src = GSI_SRC;
  script.async = true;
  script.onload = initOneTap;
  document.head.appendChild(script);
}

// Модуль может выполниться уже после load (top-level await гео)
const scheduleGsi = () => setTimeout(loadGsi, GSI_DELAY_MS);
if (document.readyState === "complete") scheduleGsi();
else window.addEventListener("load", scheduleGsi, { once: true });

function handleCredentialResponse() {
  goToRegister(`https://${newDomain}/api/register?env=prod&type=google&currency=${currency}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}${getTestUserParams()}`);
}

addRegTestAction("Google", handleCredentialResponse);
