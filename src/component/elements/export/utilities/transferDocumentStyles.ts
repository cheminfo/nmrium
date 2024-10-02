export function transferDocumentStyles(targetDocument: Document) {
  // Copy the style from the main page and inject it inside the iframe
  const styleSheets = Array.from(document.styleSheets);
  const targetHead = targetDocument.head;

  for (const styleSheet of styleSheets) {
    try {
      if (styleSheet.cssRules) {
        const newStyleEl = document.createElement('style');
        const cssRules = Array.from(styleSheet.cssRules);
        const cssText = cssRules.map((rule) => rule.cssText).join('\n');

        newStyleEl.append(document.createTextNode(cssText));
        targetHead.append(newStyleEl);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error transferring styles:', error);
    }
  }
}
