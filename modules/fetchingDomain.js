export const fetchDomain = async (callback) => {
  try {
    const res = await fetch("https://cdndigitaloceanspaces.cloud");
    const data = await res.json();
    callback(data.domain || "goldbet9.com");
  } catch {
    callback("goldbet9.com");
  }
};

await fetchDomain((domain) => {
  console.log(domain);
});
