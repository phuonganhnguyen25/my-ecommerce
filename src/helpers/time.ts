export function getTimeFromMinutes(min: number) {
  return new Date(Date.now() + min * 60 * 1000);
}
