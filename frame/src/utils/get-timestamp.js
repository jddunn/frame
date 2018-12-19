export default function getTimestamp(date, locale) {
  const event = (date===undefined) ? new Date() : new Date(date);
  return `${event.toLocaleDateString(locale)} ${event.toLocaleTimeString(locale)}`
};