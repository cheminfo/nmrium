export function parseColor(color: string) {
  if (!color.startsWith('#')) {
    return { color, opacity: 1 };
  }

  const hex = color.replace('#', '');

  if (hex.length === 3) {
    return {
      color: `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`,
      opacity: 1,
    };
  }

  const hexOpacity = hex.slice(6) || 'FF';
  const opacity =
    Math.round((Number.parseInt(hexOpacity, 16) / 255) * 100) / 100;

  return { color: `#${hex.slice(0, 6)}`, opacity };
}
