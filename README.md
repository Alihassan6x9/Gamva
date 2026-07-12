# GAMVA

Party games hub — no sign-in, just a name and age. Create a room, share the
4-character code, everyone plays on their own phone.

This first milestone covers **room creation, joining by code, and a live
lobby with a synced player list.** Game logic (Truth or Dare, etc.) comes
next.

## Stack

- **Next.js** (App Router) — hosted free on Vercel
- **Firebase Realtime Database** — free tier, powers the live player list
- **Firebase Anonymous Auth** — runs invisibly, no login screen, just lets
  the database's security rules require "signed in" without any account UI

## 1. Create a Firebase project (free)

1. Go to https://console.firebase.google.com → **Add project** → name it
   (e.g. "gamva") → you can skip Google Analytics.
2. In the left sidebar: **Build → Realtime Database → Create Database**.
   Start in **locked mode** (we'll add rules below). Pick a region close to
   your players.
3. In the left sidebar: **Build → Authentication → Get started**. Under
   **Sign-in method**, enable **Anonymous**.
4. Go to **Project settings** (gear icon) → scroll to **Your apps** →
   click the **</> Web** icon → register the app (any nickname). Firebase
   will show you a config object — you'll need those values next.

## 2. Set your environment variables

Copy `.env.local.example` to `.env.local` and fill in the values from the
Firebase config you just saw.

`NEXT_PUBLIC_FIREBASE_DATABASE_URL` looks like
`https://<project-id>-default-rtdb.<region>.firebasedatabase.app`.

## 3. Set Realtime Database security rules

In Firebase console → Realtime Database → **Rules**, paste:

```json
{
  "rules": {
    "rooms": {
      "$code": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}

