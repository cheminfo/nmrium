function getCssTextFromStyleSheet(
  styleSheet: Pick<CSSStyleSheet, 'cssRules'>,
): string | undefined {
  try {
    if (!styleSheet.cssRules) return undefined;
    return Array.from(styleSheet.cssRules)
      .map((rule) => rule.cssText)
      .join('\n');
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'SecurityError' || error.name === 'NotAllowedError')
    ) {
      return undefined;
    }
    throw error;
  }
}

export function transferStylesToDocument(targetDocument: Document) {
  const styleSheets = Array.from(document.styleSheets);
  const targetHead = targetDocument.head;

  for (const styleSheet of styleSheets) {
    const cssText = getCssTextFromStyleSheet(styleSheet);
    if (!cssText) continue;

    const newStyleEl = document.createElement('style');
    newStyleEl.append(document.createTextNode(cssText));
    targetHead.append(newStyleEl);
  }
}
