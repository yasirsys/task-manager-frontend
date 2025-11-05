export const trimText = (text: string, maxLength = 30): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};
