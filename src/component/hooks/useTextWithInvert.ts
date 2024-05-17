import { usePreferences } from '../context/PreferencesContext';

export function useTextWithInvert() {
  const {
    current: {
      general: { invert },
    },
  } = usePreferences();

  function getTextWithInvert(
    text: string,
    invertText?: string,
    options: { shift?: boolean; prefix?: string; suffix?: string } = {},
  ) {
    const { shift = true, prefix = '', suffix = '' } = options;
    const dynamicText = shift && invert ? invertText : text;
    return `${prefix} ${dynamicText} ${suffix}`.trim();
  }

  return { getTextWithInvert };
}
