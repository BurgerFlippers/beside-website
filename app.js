'use strict';

// The interactive app demo lives in assets/demo/mind-phones.js. This file only runs the invitation dialog.
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
