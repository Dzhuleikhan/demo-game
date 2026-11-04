// Sources:
//   https://github.com/disposable/disposable-email-domains  (active, ~72k)
//   https://github.com/ivolo/disposable-email-domains       (large, ~121k)
const SOURCES = [
  {
    url: "https://cdn.jsdelivr.net/gh/disposable/disposable-email-domains@master/domains.txt",
    parse: (text) => text.split("\n"),
  },
  {
    url: "https://cdn.jsdelivr.net/gh/ivolo/disposable-email-domains@master/index.json",
    parse: (text) => JSON.parse(text),
  },
];

let disposableSet = null;

// Списки весят ~1,25 МБ — раньше качались сразу на загрузке и забивали канал
// первого экрана. Теперь: при первом вводе в поле email или через 4 с после load.
// Именно ввод, а не фокус: formSocials сам фокусирует email при открытии модалки.
let loadStarted = false;
const loadDisposableLists = () => {
  if (loadStarted) return;
  loadStarted = true;
  Promise.allSettled(
    SOURCES.map(({ url, parse }) =>
      fetch(url)
        .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
        .then(parse),
    ),
  ).then((results) => {
    const merged = new Set();
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        r.value.forEach((d) => {
          const v = String(d).trim().toLowerCase();
          if (v) merged.add(v);
        });
      } else {
        console.warn(`Disposable source ${SOURCES[i].url} failed:`, r.reason);
      }
    });
    disposableSet = merged;
  });
};

document.addEventListener(
  "input",
  (e) => {
    const el = e.target;
    if (el instanceof HTMLInputElement && (el.type === "email" || el.name === "email"))
      loadDisposableLists();
  },
  true,
);
const scheduleDisposable = () => setTimeout(loadDisposableLists, 4000);
if (document.readyState === "complete") scheduleDisposable();
else window.addEventListener("load", scheduleDisposable, { once: true });

export const isDisposableEmail = (email) => {
  if (!disposableSet) return false;
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  return disposableSet.has(email.slice(at + 1).toLowerCase());
};
