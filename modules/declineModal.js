import gsap from "gsap";

const mainModalCloseBtns = document.querySelectorAll(".main-modal-close-btn");
const declineOverlay = document.querySelector(".decline-overlay");
const declineModal = document.querySelector(".decline-modal");
const declineCloseBtn = document.querySelectorAll(".decline-close-btn");
const declineRedBtn = document.querySelector(".decline-red-cancel");

function showDeclineModal() {
  declineOverlay.classList.add("active");
  gsap.fromTo(
    declineModal,
    {
      y: 300,
      opacity: 0,
    },
    { y: 0, opacity: 1, duration: 0.3, ease: "none" },
  );
}

function hideDeclineModal() {
  gsap.fromTo(
    declineModal,
    {
      y: 0,
      opacity: 1,
    },
    { y: 300, opacity: 0, duration: 0.3, ease: "none" },
  );
  setTimeout(() => {
    declineOverlay.classList.remove("active");
  }, 200);
}

mainModalCloseBtns.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      declineOverlay.classList.add("active");
      showDeclineModal();
    });
  }
});

declineCloseBtn.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", () => {
      hideDeclineModal();
    });
  }
});

declineRedBtn.addEventListener("click", () => {
  hideDeclineModal();
  document.querySelector(".main-overlay").classList.remove("is-open");
  localStorage.removeItem("mainModal");
});
