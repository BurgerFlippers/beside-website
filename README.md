# Beside website

The local project website for Beside, the BurgerFlippers Junction 2026 iOS prototype.

## Run locally

Python 3 is the only requirement:

```sh
python3 dev.py
```

Open **http://localhost:3000**. To use another port: `python3 dev.py --port 3001`.

This is a buildless site: edit `index.html`, `styles.css` or `app.js`, then refresh. The local server disables caching. There are no package dependencies, accounts, analytics or third-party fonts.

## First version

- Responsive introduction to Beside and its five daily-life categories.
- Interactive example: choose a category, start a challenge, make it smaller and record a small win.
- Example friend invitation with editable text and a copy action. No messages are sent.
- Explanation of Apple Health context and preparing trusted people in advance.
- Original Beside logo reused from the iOS project's assets.

The interactive example does not connect to HealthKit, assess the visitor's health or persist personal data. Health-source compatibility depends on the source's exports and the user's permissions. The automatic support-message service remains a prototype concept.

This first version is local-only. Deployment has not been configured.

## Validation

The first version was checked in the in-app browser at desktop size and a 390 px mobile viewport. Verified all five categories (three choices each), direct start, smaller version, completion, keyboard category navigation, invitation editing/copy-paste and dialog dismissal. The mobile page had no horizontal overflow and the browser reported no warning/error logs. Local asset paths, in-page anchors and Python syntax were also checked.
