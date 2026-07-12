// Letters chosen to skip visually-confusable characters (0/O, 1/I, etc).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 4) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function normalizeRoomCode(input) {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generatePlayerId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "p-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
