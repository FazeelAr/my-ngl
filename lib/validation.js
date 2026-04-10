export function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hasLengthInRange(value, min, max) {
  const length = value.length;
  return length >= min && length <= max;
}
