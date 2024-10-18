import { GEO_API_KEY } from "../public/geoApi";

const CACHE_KEY = "cachedLocation";
const EXPIRATION_KEY = "cacheExpirationTime";

export async function getLocation() {
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Retrieve cached data and expiration time from localStorage
  const cachedLocation = localStorage.getItem(CACHE_KEY);
  const cacheExpirationTime = localStorage.getItem(EXPIRATION_KEY);

  // Check if cached data exists and hasn't expired
  if (
    cachedLocation &&
    cacheExpirationTime &&
    Date.now() < cacheExpirationTime
  ) {
    return JSON.parse(cachedLocation);
  }

  try {
    // Fetch new data
    let url = "https://apiip.net/api/check?accessKey=" + GEO_API_KEY;
    let response = await fetch(url);
    let data = await response.json();

    // Cache the location data and expiration time in localStorage
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(EXPIRATION_KEY, Date.now() + CACHE_DURATION);

    return data;
  } catch (error) {
    console.error("Error fetching location:", error);
    throw error;
  }
}
