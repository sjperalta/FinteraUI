export const formatLargeNumber = (num, locale = 'es-HN') => {
  const value = Number(num || 0);
  if (Number.isNaN(value)) return '0';
  if (value >= 1000000000) {
    const formatted = (value / 1000000000).toFixed(1);
    return formatted.replace('.0', '') + 'B';
  } else if (value >= 1000000) {
    const formatted = (value / 1000000).toFixed(1);
    return formatted.replace('.0', '') + 'M';
  } else if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1);
    return formatted.replace('.0', '') + 'K';
  }
  return value.toLocaleString(locale);
};