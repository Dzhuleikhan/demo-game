export const fetchDomain = async (callback) => {
  const res = await fetch("https://cdndigitaloceanspaces.cloud");
  const data = await res.json();
  callback(data.domain);
};
