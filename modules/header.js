const headerLangBtn = document.querySelector(".header-lang-btn");
const headerLangList = document.querySelector(".header-lang-list");
const burgerBtn = document.querySelector(".burger");
const sideMenu = document.querySelector(".sidemenu");

if (sideMenu) {
  if (window.innerWidth >= 576) {
    sideMenu.classList.add("is-open");
  }
}

if (headerLangBtn) {
  headerLangBtn.addEventListener("click", () => {
    headerLangList.classList.toggle("is-open");
  });
}

if (headerLangList) {
  headerLangList.addEventListener("pointerleave", () => {
    headerLangList.classList.remove("is-open");
  });
}

if (burgerBtn) {
  burgerBtn.addEventListener("click", () => {
    sideMenu.classList.toggle("is-open");
    document.body.classList.toggle("scroll-lock");
  });
}
