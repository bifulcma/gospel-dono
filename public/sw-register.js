// Registra il service worker (solo su produzione o https locale).
// Errore silenzioso: se non parte, il sito continua a funzionare come prima.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}