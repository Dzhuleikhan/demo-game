const sideGameAcc = document.querySelectorAll(".sidegame-acc");

sideGameAcc.forEach((acc) => {
  if (acc) {
    const accBtn = acc.querySelector(".sidegame-btn");
    const accList = acc.querySelector(".sidegame-list");

    accBtn.addEventListener("click", () => {
      accBtn.classList.toggle("is-open");

      if (accBtn.classList.contains("is-open")) {
        accList.classList.add("is-active");
        accList.style.maxHeight = accList.scrollHeight + "px";
      } else {
        accList.classList.remove("is-active");
        accList.style.maxHeight = null;
      }
    });
  }
});
