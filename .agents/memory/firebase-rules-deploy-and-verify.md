---
name: Firebase security rules — deploy and verify without CLI credentials
description: How to get Firestore/RTDB security rules live and prove they work when there's no Firebase CLI login or service account available.
---

There is no way to deploy Firestore/Realtime Database security rules programmatically in this environment — `firebase deploy --only firestore:rules` needs either an interactive browser OAuth login or a service-account JSON key, neither of which is available or worth requesting from the user for a one-time rules paste.

**How to apply:** Give the user the exact rules text and the console path (Firebase console → project → Build → Firestore Database/Realtime Database → Rules tab → paste → Publish), then ask them to confirm once published.

**How to verify the rules actually work**, without any admin/CLI access: use the public web `apiKey` to sign in anonymously via the Identity Toolkit REST API (`POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=<apiKey>` with `{returnSecureToken: true}`), then use the returned `idToken` as a Bearer token against the Firestore REST API (`https://firestore.googleapis.com/v1/projects/<projectId>/databases/(default)/documents/<path>`) or RTDB REST API (`<databaseURL>/<path>.json?auth=<idToken>`). Confirm authenticated requests succeed and requests with no token are denied (403/401). This exactly matches what the client SDK does, so it's a reliable end-to-end proof that rules are live and correctly scoped — no headless browser needed.
