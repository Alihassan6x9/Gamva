export const THIS_OR_THAT_PROMPTS = [
  { a: "Pizza", b: "Burgers" },
  { a: "Beach vacation", b: "Mountain vacation" },
  { a: "Texting", b: "Calling" },
  { a: "Coffee", b: "Tea" },
  { a: "Cats", b: "Dogs" },
  { a: "Netflix", b: "YouTube" },
  { a: "Early bird", b: "Night owl" },
  { a: "Sweet snacks", b: "Salty snacks" },
  { a: "Summer", b: "Winter" },
  { a: "Books", b: "Movies" },
  { a: "City life", b: "Countryside" },
  { a: "Save the money", b: "Spend the money" },
  { a: "Power to fly", b: "Power to turn invisible" },
  { a: "Window seat", b: "Aisle seat" },
  { a: "Group chats", b: "One-on-one texts" },
  { a: "Camping", b: "Hotel stay" },
  { a: "Karaoke", b: "Dancing" },
  { a: "Instagram", b: "TikTok" },
  { a: "Big group of friends", b: "A few close friends" },
  { a: "Plans every weekend", b: "No plans at all" },
];

// Fisher-Yates shuffle, then take the first `count`.
export function pickPrompts(count = 8) {
  const pool = [...THIS_OR_THAT_PROMPTS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}
