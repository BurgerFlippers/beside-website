'use strict';

// The interactive app demo lives in assets/demo/mind-phones.js. This file runs the invitation dialog
// and the sideways scrolling of the demo phone row.
const dialog = document.querySelector('#invite-dialog');
const inviteText = document.querySelector('#invite-text');
const copyStatus = document.querySelector('#copy-status');

function openInvite(key = 'social') {
  const drafts = {
    move: 'Fancy a short walk or a catch-up together? We can keep it easy.',
    eat: 'Would you like to share something easy to eat? A ready meal is fine.',
    medicine: 'Could you keep me company on a pharmacy visit when I need it?',
    social: 'Fancy a short visit or a cup of tea together? No big plans needed.'
  };
  inviteText.value = drafts[key] || drafts.social;
  copyStatus.textContent = 'Share it in your usual messaging app. Nothing is sent from this website.';
  dialog.showModal();
}
document.querySelector('#people-invite').addEventListener('click', () => openInvite());
document.querySelector('#copy-invite').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(inviteText.value);
    copyStatus.textContent = 'Copied. Paste it in your usual messaging app when you’re ready.';
  } catch {
    inviteText.focus();
    inviteText.select();
    copyStatus.textContent = 'Select and copy the message, then share it in your usual messaging app.';
  }
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});

// Demo phones: always side by side. When they don't all fit, the row scrolls sideways with the
// arrow buttons, the left/right arrow keys or a swipe.
const phoneRow = document.querySelector('#phone-row');
const phoneNav = document.querySelector('#phone-nav');
if (phoneRow && phoneNav) {
  const [prevButton, nextButton] = phoneNav.querySelectorAll('button');
  const overflowing = () => phoneRow.scrollWidth > phoneRow.clientWidth + 1;
  const step = () => {
    const item = phoneRow.querySelector('.phone-item');
    const gap = parseFloat(getComputedStyle(phoneRow).columnGap) || 0;
    return item ? item.getBoundingClientRect().width + gap : phoneRow.clientWidth;
  };
  const maxScroll = () => phoneRow.scrollWidth - phoneRow.clientWidth;
  // Buttons follow the position the row is heading to, so they are right even mid-animation.
  const setButtons = left => {
    prevButton.disabled = left <= 1;
    nextButton.disabled = left >= maxScroll() - 1;
  };
  let heading = null, settle;
  const move = dir => {
    const from = heading === null ? phoneRow.scrollLeft : heading;
    heading = Math.max(0, Math.min(maxScroll(), from + dir * step()));
    phoneRow.scrollTo({ left: heading });
    setButtons(heading);
    clearTimeout(settle);
    settle = setTimeout(() => { heading = null; update(); }, 700);  // fallback where scrollend is missing
  };
  const update = () => {
    const scrollable = overflowing();
    phoneNav.hidden = !scrollable;
    phoneRow.tabIndex = scrollable ? 0 : -1;
    if (heading === null) setButtons(phoneRow.scrollLeft);
  };
  phoneNav.addEventListener('click', event => {
    const button = event.target.closest('button[data-dir]');
    if (button) move(Number(button.dataset.dir));
  });
  // Arrow keys work while the row or its buttons have focus, or when nothing in particular has focus
  // and the phones are on screen. Keys inside a phone (e.g. its scenario picker) stay with the phone.
  document.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!overflowing() || (dialog && dialog.open)) return;
    const active = document.activeElement;
    const free = !active || active === document.body || active === phoneRow || phoneNav.contains(active);
    if (!free) return;
    const box = phoneRow.getBoundingClientRect();
    const visible = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
    if (active !== phoneRow && !phoneNav.contains(active) && visible < Math.min(box.height, innerHeight) * 0.4) return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  phoneRow.addEventListener('scroll', update, { passive: true });
  phoneRow.addEventListener('scrollend', () => { heading = null; update(); });
  new ResizeObserver(update).observe(phoneRow);
  update();
}
