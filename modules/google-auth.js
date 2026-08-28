import { newDomain } from "./fetchingDomain";
import { getUrlParameter } from "./params";

// One-tap google auth.
// One Tap отрисовывается не здесь, а в iframe на постоянном домене promogb.com
// (Intermediate iframe API). Google проверяет origin именно этого iframe,
// поэтому ленд-домены не нужно добавлять в Authorized JavaScript origins.
const ONETAP_IFRAME_ORIGIN = "https://promogb.com";

const promocode = getUrlParameter("promocode");
const cid = getUrlParameter("cid");
const partner = getUrlParameter("partner");
const offer = getUrlParameter("offer");

function buildRegisterUrl() {
  const currencyData = JSON.parse(localStorage.getItem("currencyData"));
  const currency = currencyData?.abbr;
  const lang = localStorage.getItem("preferredLanguage");

  return `https://${newDomain}/api/register?env=prod&type=google&currency=${currency}${promocode ? "&promocode=" + promocode : ""}&lang=${lang}${cid ? "&cid=" + cid : ""}${partner ? "&partner=" + partner : ""}${offer ? "&offer=" + offer : ""}`;
}

window.addEventListener("message", (event) => {
  if (event.origin !== ONETAP_IFRAME_ORIGIN) return;
  if (event.data?.type !== "gb-onetap-success") return;

  window.location.href = buildRegisterUrl();
});
