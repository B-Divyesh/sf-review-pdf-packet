(() => {
  const focusRoute = () => {
    if (document.body.dataset.routePending === 'true') return;
    const heading = document.querySelector('h1');
    const announcer = document.querySelector('#route-announcer');
    const message = document.body.dataset.routeAnnouncement;
    if (!(heading instanceof HTMLElement) || !(announcer instanceof HTMLElement) || !message) return;
    heading.focus({ preventScroll: true });
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = message; });
  };

  const scheduleFocus = () => requestAnimationFrame(focusRoute);
  if (document.readyState === 'complete') {
    scheduleFocus();
  } else {
    window.addEventListener('load', scheduleFocus, { once: true });
  }
  window.addEventListener('pageshow', scheduleFocus);
  document.addEventListener('review-packet:route-ready', scheduleFocus);
})();
