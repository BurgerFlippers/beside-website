# MindMaintainer website

The local project website for MindMaintainer, the Burger Flippers Junction 2026 iOS prototype, originally named Beside.

## Run locally

Python 3 is the only requirement:

```sh
python3 dev.py
```

Open **http://localhost:3000**. To use another port: `python3 dev.py --port 3001`.

This is a buildless site: edit `index.html`, `styles.css` or `app.js`, then refresh. The local server disables caching. There are no package dependencies, accounts, analytics or third-party fonts. Deployment has not been configured.

## Current version

- Dark background and lavender accents follow the current iOS interface.
- The actual One thing screenshot from the MindMaintainer app, shown as a fixed hero preview.
- **Try the app:** three interactive iPhone 18 Pro sized (402 × 874 pt) phones, rebuilt from the app's `docs/demo-page-handoff.md`:
  - **One thing:** three tasks, choose, Mark as done, praise and extras, Revert (back to no choice, in the chosen and done states), and the "Show more tasks (demo)" score panel with the six-category rule.
  - **Trends:** a "Change demo scenario" picker (Steady about 89, A few harder days about 66, A harder stretch about 44 with "A contact person would be notified"), daily balance, the 4-week chart, eight signal rows and day browsing. The web page only shows demo data, so the app's "Show my data" toggle and the Send SMS demo are left out.
  - **For you:** Reach out (people, draft, copy to clipboard) and Get support (demo people, emergency numbers as plain text).
- Explanation of Apple Health context and preparing trusted people in advance.
- Original research cover teaser and unchanged PDF download, credited to Aapo Visapää, Esa Iivonen, Konsta Raitanen and Veeti Pellinen. The review was prepared for Beside and is not peer reviewed.

The example does not connect to HealthKit, assess the visitor's health or persist personal data. Nothing calls or messages anyone: every action that would leave the page shows a demo note, and message drafts are only copied to the clipboard. Health-source compatibility depends on the source's exports and the user's permissions. The automatic support-message service remains a prototype concept.

## App demo components

`assets/demo/mind-phones.js` defines three standalone custom elements. Each one works on its own, on any page, with a single script tag:

```html
<script src="assets/demo/mind-phones.js" defer></script>
<mind-one-thing></mind-one-thing>
<mind-trends></mind-trends>
<mind-for-you></mind-for-you>
```

The phones scale down to fit their container. The phone size is set by `PHONE` at the top of the script. State lives in memory and resets on reload.

On the page the three phones always sit side by side. When the window is too narrow for all three, the row scrolls sideways: use the arrow buttons under the phones, the left and right arrow keys, or a swipe (`app.js`).

Trends data is in `assets/demo/trends-fixtures.js` (one fixture per scenario), loaded automatically by the script. It is exported from the app's own Swift engine, so the website never re-implements scoring. To regenerate it (needs Xcode's Swift and the `aaltodepression` repo next to this one):

```sh
tools/fixture-export/export.sh ../aaltodepression
```

## Design references

References found and reviewed through Mobbin; the product visuals come from our own app:

- [Headspace introduction](https://mobbin.com/sites/sections/5b44d3ff-891d-4add-9f5f-53b903bb1800): a clear introduction beside visible app screens.
- [Superpower introduction](https://mobbin.com/sites/sections/a66c7229-39c5-4f24-b34c-c09db551575d): one focused phone preview with a selector.
- [Headspace feature section](https://mobbin.com/sites/sections/fbd8cb07-6e54-49a9-bb85-a53bfb132cfd): explain the product using its actual interface.

## Validation

Checked in the in-app browser at 320, 375, 820 and 1280 px widths, with no horizontal overflow. Verified the One thing states (choose, Mark as done, extras, the score demo panel), the Trends scenario picker, day browsing and signal rows, Reach out and Get support, and the invitation dialog. Browser warning/error logs were empty. The research PDF matches the supplied original.

Page copy was checked against the MindMaintainer Junction 2026 pitch deck.
