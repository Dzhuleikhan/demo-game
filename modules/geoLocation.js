export async function getLocation() {
  let url = "https://ipinfo.io/json?token=d5361631d79bbd";
  let response = await fetch(url);
  let data = await response.json();
  return data;
}
