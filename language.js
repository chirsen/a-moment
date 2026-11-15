(() => {
  const pageURL = new URL(window.location.href);
  const requestedLanguage = pageURL.searchParams.get('lang');
  const documentLanguage = pageURL.hash.slice(1);
  const browserLanguage = navigator.languages?.[0] || navigator.language || 'en';
  const supportsRequest = ['zh', 'en'].includes(requestedLanguage);
  const supportsAnchor = ['zh', 'en'].includes(documentLanguage);
  const preferredLanguage = supportsRequest ? requestedLanguage : browserLanguage;
  let language = preferredLanguage.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  if (supportsAnchor) language = documentLanguage;

  document.documentElement.dataset.language = language;
  document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
  document.title = document.querySelector(`meta[name="title-${language}"]`).content;

  document.addEventListener('DOMContentLoaded', () => {
    const storePicker = document.querySelector('#store-region');
    const supportedRegions = [...storePicker.options].map(option => option.value);
    const requestedRegion = pageURL.searchParams.get('store');
    let browserRegion = 'us';
    try {
      // This suggests a storefront; visitors can choose their account's region.
      browserRegion = new Intl.Locale(browserLanguage).maximize().region.toLowerCase();
    } catch {
      // Keep the US storefront when the browser supplies an invalid locale.
    }
    const defaultRegion = supportedRegions.includes(browserRegion) ? browserRegion : 'us';
    let storeRegion = supportedRegions.includes(requestedRegion) ? requestedRegion : defaultRegion;
    storePicker.value = storeRegion;

    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.href);
      const isWebsiteLink = url.origin === pageURL.origin && url.pathname.startsWith(new URL('.', pageURL).pathname);
      if (!isWebsiteLink) continue;

      const selectedLanguage = link.dataset.language;
      const anchorLanguage = url.hash.slice(1);
      const hasLanguageAnchor = ['zh', 'en'].includes(anchorLanguage);
      const isLocalAnchor = link.getAttribute('href').startsWith('#') && !hasLanguageAnchor;
      if (isLocalAnchor) continue;
      let linkLanguage = language;
      if (hasLanguageAnchor) linkLanguage = anchorLanguage;
      if (selectedLanguage) {
        linkLanguage = selectedLanguage;
        if (supportsAnchor) url.hash = selectedLanguage;
        if (selectedLanguage === language) link.setAttribute('aria-current', 'true');
      }
      url.searchParams.set('lang', linkLanguage);
      link.href = url.href;
    }

    function updateStoreLinks() {
      for (const link of document.querySelectorAll('a[href]')) {
        const url = new URL(link.href);
        if (link.hasAttribute('data-app-store')) {
          url.pathname = `/${storeRegion}/app/id6830665862`;
          url.searchParams.set('mt', '12');
          link.href = url.href;
          continue;
        }
        const isWebsiteLink = url.origin === pageURL.origin && url.pathname.startsWith(new URL('.', pageURL).pathname);
        if (isWebsiteLink && url.searchParams.has('lang')) {
          url.searchParams.set('store', storeRegion);
          link.href = url.href;
        }
      }
    }

    storePicker.addEventListener('change', () => {
      storeRegion = storePicker.value;
      pageURL.searchParams.set('store', storeRegion);
      window.history.replaceState(null, '', pageURL);
      updateStoreLinks();
    });
    updateStoreLinks();
  });
})();
