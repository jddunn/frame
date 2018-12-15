export default function getTmestamp(date, locale) {
  const event = (date===undefined) ? new Date() : new Date(date);
  return `${event.toLocaleDateString(locale)} ${event.toLocaleTimeString(locale)}`
};