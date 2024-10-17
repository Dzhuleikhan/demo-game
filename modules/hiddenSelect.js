export const hiddenSelect = document.getElementById("hidden-select");

document.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    if (hiddenSelect.classList.contains("hidden")) {
      hiddenSelect.classList.remove("hidden");
      hiddenSelect.focus();
    } else {
      hiddenSelect.classList.add("hidden");
    }
  }
});

let pressTimer;

// Mobile touch support
document.addEventListener("touchstart", function () {
  pressTimer = setTimeout(function () {
    if (hiddenSelect.classList.contains("hidden")) {
      hiddenSelect.classList.remove("hidden");
      hiddenSelect.focus();
    } else {
      hiddenSelect.classList.add("hidden");
    }
  }, 1000);
});

document.addEventListener("touchend", function () {
  clearTimeout(pressTimer);
});
