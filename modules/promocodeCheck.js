// Проверка промокода через API основного домена.
// Эндпоинт: GET https://{newDomain}/api/v2/promocode/check-available?code=XXX
//   → { available: true|false } (тот же, что на two_step_form / Chicken_Road).
//
// Принцип fail-open: блокируем промокод ТОЛЬКО при однозначном available:false.
// Любая ошибка (сеть, CORS, таймаут, кривое тело) → «не знаем», код уходит как есть.

import { newDomain } from "./fetchingDomain";

const TIMEOUT_MS = 2500;

// CODE(uppercased) -> { pending, errored, available, promise? }
const cache = new Map();

export const normalizePromocode = (code) => (code || "").trim().toUpperCase();

export function getPromocodeStatus(code) {
  return cache.get(normalizePromocode(code)) || null;
}

export function checkPromocode(code) {
  const key = normalizePromocode(code);
  if (!key) return Promise.resolve(null);

  const cached = cache.get(key);
  if (cached && (cached.pending || !cached.errored)) {
    return cached.promise || Promise.resolve(cached);
  }

  const entry = { pending: true, errored: false, available: null };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  entry.promise = fetch(
    `https://${newDomain}/api/v2/promocode/check-available?code=${encodeURIComponent(key)}`,
    { signal: controller.signal },
  )
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((data) => {
      entry.available =
        data && typeof data.available === "boolean" ? data.available : null;
      if (entry.available === null) entry.errored = true;
    })
    .catch(() => {
      entry.errored = true;
      entry.available = null;
    })
    .finally(() => {
      clearTimeout(timer);
      entry.pending = false;
      delete entry.promise;
    })
    .then(() => entry);

  cache.set(key, entry);
  return entry.promise;
}

// NB: переводы am/ha/yo/ig/tw/rw/sw/mt/ga/lb/lm — best-effort, нужна вычитка носителями.
const INVALID_MESSAGES = {
  en: "Invalid promo code",
  ru: "Неверный промокод",
  uk: "Невірний промокод",
  es: "Código promocional no válido",
  pt: "Código promocional inválido",
  fr: "Code promo invalide",
  de: "Ungültiger Promo-Code",
  it: "Codice promozionale non valido",
  nl: "Ongeldige promotiecode",
  pl: "Nieprawidłowy kod promocyjny",
  cs: "Neplatný promo kód",
  sk: "Neplatný promo kód",
  sl: "Neveljavna promocijska koda",
  hr: "Nevažeći promotivni kod",
  hu: "Érvénytelen promóciós kód",
  ro: "Cod promoțional invalid",
  bg: "Невалиден промо код",
  el: "Μη έγκυρος κωδικός προσφοράς",
  sv: "Ogiltig kampanjkod",
  da: "Ugyldig kampagnekode",
  fi: "Virheellinen tarjouskoodi",
  et: "Vigane sooduskood",
  lv: "Nederīgs promo kods",
  lt: "Neteisingas akcijos kodas",
  ga: "Cód promóisin neamhbhailí",
  mt: "Kodiċi promozzjonali mhux validu",
  lb: "Ongëltege Promo-Code",
  ar: "رمز ترويجي غير صالح",
  zh: "优惠码无效",
  sw: "Msimbo wa ofa si sahihi",
  rw: "Kode ya poromosiyo ntiyemewe",
  am: "ልክ ያልሆነ የማስተዋወቂያ ኮድ",
  lm: "Promo-code si ntuufu",
  ha: "Lambar talla ba daidai ba ce",
  yo: "Kóòdù ìpolówó kò tọ́",
  ig: "Koodu nkwalite ezighi ezi",
  tw: "Promo koodu no nni mu",
};

export function promocodeInvalidMessage(lang) {
  return INVALID_MESSAGES[lang] || INVALID_MESSAGES.en;
}
