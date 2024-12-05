export const fetchDomain = async () => {
  const res = await fetch("https://cdndigitaloceanspaces.cloud");
  const data = await res.json();
  return data.domain || "goldbet9.com";
};

export const newDomain = await fetchDomain();
console.log(newDomain);

function updatingBonusValueNumbers() {
  const dropd = document.querySelectorAll(".form-bonus-dropdown");
  dropd.forEach((drop) => {
    if (drop) {
      const links = drop.querySelectorAll("li");
      links[0].setAttribute("data-bonus-id", "120");
      links[1].setAttribute("data-bonus-id", "122");
      links[2].setAttribute("data-bonus-id", "121");
    }
  });
  const initialBonusValueInput = document.querySelectorAll(
    ".auth-form-bonus input",
  );
  initialBonusValueInput.forEach((input) => {
    input.value = 120;
  });

  const formSocials = document.querySelectorAll(".form-modal-socials");
  formSocials.forEach((form) => {
    let input = form.querySelector(".bonus-input");
    input.setAttribute("data-bonus", 120);
  });
}
updatingBonusValueNumbers();
