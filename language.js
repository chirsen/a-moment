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
  });
})();
