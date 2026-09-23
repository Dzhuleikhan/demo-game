const termsModal = document.querySelector(".terms-modal");
const termsOpenBtn = document.querySelectorAll(".terms-modal-btn");
const termsCloseBtn = document.querySelector(".terms-close-btn");

// .terms-modal-btn — это <label> чекбокса согласия, внутри которого лежат И сам
// чекбокс, И ссылка «Terms and Conditions». Модалку открываем ТОЛЬКО по клику по
// ссылке: preventDefault на <label> отменяет штатное переключение чекбокса,
// поэтому раньше клик по квадратику раскрывал термсы, а галочка не ставилась
// (и change на .checkbox-input, который разблокирует кнопку сабмита, не наступал).
// Ссылку ищем делегированно, через closest от e.target, а не слушателем на самом
// <a>: перевод ключа terms кладётся в innerHTML, так что ссылка пересоздаётся
// при каждой смене языка и прямой слушатель на ней терялся бы.
termsOpenBtn.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link || !btn.contains(link)) return; // клик мимо ссылки — не мешаем чекбоксу
      e.preventDefault();
      termsModal.classList.add("is-open");
      document.body.classList.add("scroll-lock");
    });
  }
});

if (termsModal) {
  termsModal.addEventListener("click", (e) => {
    if (e.target === termsModal) {
      termsModal.classList.remove("is-open");
      document.body.classList.remove("scroll-lock");
    }
  });
}

if (termsCloseBtn) {
  termsCloseBtn.addEventListener("click", () => {
    termsModal.classList.remove("is-open");
    document.body.classList.remove("scroll-lock");
  });
}
