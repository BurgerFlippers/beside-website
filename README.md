# Mind website

The local project website for Mind, the BurgerFlippers Junction 2026 iOS prototype, originally named Beside.

## Run locally

Python 3 is the only requirement:

```sh
python3 dev.py
```

Open **http://localhost:3000**. To use another port: `python3 dev.py --port 3001`.

This is a buildless site: edit `index.html`, `styles.css` or `app.js`, then refresh. The local server disables caching. There are no package dependencies, accounts, analytics or third-party fonts. Deployment has not been configured.

## Current version

- Dark background and lavender accents follow the current iOS interface.
- Actual Routine and Trends screenshots from the app, with a keyboard-accessible preview selector.
- Interactive example with five categories and three whole-card challenge choices per category. Selecting one shows gentle encouragement and an optional invitation.
- Editable invitation with a copy action. No messages are sent.
- Explanation of Apple Health context and preparing trusted people in advance.
- Original research cover teaser and unchanged PDF download, credited to Aapo Visapää. The review was prepared for Beside and is not peer reviewed.

The example does not connect to HealthKit, assess the visitor's health or persist personal data. Health-source compatibility depends on the source's exports and the user's permissions. The automatic support-message service remains a prototype concept.

## Design references

References found and reviewed through Mobbin; the product visuals come from our own app:

- [Headspace introduction](https://mobbin.com/sites/sections/5b44d3ff-891d-4add-9f5f-53b903bb1800): a clear introduction beside visible app screens.
- [Superpower introduction](https://mobbin.com/sites/sections/a66c7229-39c5-4f24-b34c-c09db551575d): one focused phone preview with a selector.
- [Headspace feature section](https://mobbin.com/sites/sections/fbd8cb07-6e54-49a9-bb85-a53bfb132cfd): explain the product using its actual interface.

## Validation

Checked in the in-app browser at desktop size and 320, 390 and 768 px widths, with no horizontal overflow. Verified all five categories (three choices each), whole-card selection, encouragement, choosing another, keyboard tab navigation, Routine/Trends switching, editable invitation copy/paste and dialog dismissal. Browser warning/error logs were empty. Local assets, internal anchors and the PDF checksum were checked; the research PDF matches the supplied original.
