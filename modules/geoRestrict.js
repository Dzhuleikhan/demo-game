import { geoData } from "./geoLocation";
import { countryFlags } from "../public/data";

const restrictedCountries = ["US"];

// Названия, которые в заголовке читаются лучше, чем значение из countryFlags
const countryNameOverrides = { US: "the United States" };

const geoRestrictModal = document.querySelector(".geo-restrict-modal");

export const isGeoRestricted = restrictedCountries.includes(
  geoData.countryCode,
);

function getCountryName(countryCode) {
  if (countryNameOverrides[countryCode])
    return countryNameOverrides[countryCode];

  const country = countryFlags.find(
    (item) => item.slug === countryCode.toLowerCase(),
  );
  return country?.name || "your country";
}

if (geoRestrictModal && isGeoRestricted) {
  const hostEl = geoRestrictModal.querySelector(".geo-restrict-host");
  const countryEl = geoRestrictModal.querySelector(".geo-restrict-country");
  const flagEl = geoRestrictModal.querySelector(".geo-restrict-flag");
  const countryName = getCountryName(geoData.countryCode);

  if (hostEl) hostEl.textContent = window.location.hostname;
  if (countryEl) countryEl.textContent = countryName;
  if (flagEl) {
    flagEl.src = `./img/flags/${geoData.countryCode.toLowerCase()}.svg`;
    flagEl.alt = countryName;
  }

  geoRestrictModal.classList.add("is-open");
  document.body.classList.add("scroll-lock");
}
