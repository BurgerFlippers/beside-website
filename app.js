'use strict';

// Illustrative choices follow the wording and tap-to-select flow of the current iOS UI.
const categories = {
  move: { title: 'Move', tasks: [
    { icon: 'move', title: 'Find three colours on a short walk.', invite: true },
    { icon: 'music', title: 'Move gently to a favourite song.' },
    { icon: 'move', title: 'Walk or roll a familiar route.', invite: true }
  ]},
  eat: { title: 'Eat', tasks: [
    { icon: 'eat', title: 'Have two easy foods you enjoy together.' },
    { icon: 'eat', title: 'Make an easy meal, like soup and bread.' },
    { icon: 'social', title: 'Invite a friend to share a simple meal.', invite: true }
  ]},
  sleep: { title: 'Sleep', tasks: [
    { icon: 'sun', title: 'Put one thing ready for tomorrow morning.' },
    { icon: 'sleep', title: 'Dim the lights and unwind before bed.' },
    { icon: 'sun', title: 'Take a little daylight break outside.' }
  ]},
  social: { title: 'Social', tasks: [
    { icon: 'cup', title: 'Invite a friend over for a cup of tea.', invite: true },
    { icon: 'music', title: 'Send a friend a song that made you think of them.', invite: true },
    { icon: 'social', title: 'Ask a friend to join you for a short walk.', invite: true }
  ]},
  medicine: { title: 'Medicine', tasks: [
    { icon: 'medicine', title: 'Check whether your medication needs a refill.' },
    { icon: 'medicine', title: 'Check your existing medication reminder.' },
    { icon: 'social', title: 'Ask someone to join a needed pharmacy visit.', invite: true }
  ]}
};

const list = document.querySelector('#challenge-list');
const prompt = document.querySelector('#app-prompt');
const announcer = document.querySelector('#demo-status');
const tabs = [...document.querySelectorAll('[data-category]')];
const dialog = document.querySelector('#invite-dialog');
const inviteText = document.querySelector('#invite-text');
const copyStatus = document.querySelector('#copy-status');
const controls = document.querySelector('#demo-controls');
const choiceNote = document.querySelector('#choice-note');
let category = 'move';
let selected = null;

function icon(name) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('class', 'icon');
  el.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${name}`);
  el.append(use);
  return el;
}
function announce(message) { announcer.textContent = message; }
function render() {
  const group = categories[category];
  list.replaceChildren();
  list.setAttribute('role', 'tabpanel');
  list.setAttribute('aria-labelledby', `tab-${category}`);
  prompt.textContent = selected === null ? 'Choose one for today' : 'Your choice for today';
  controls.hidden = selected === null;
  choiceNote.hidden = selected === null;
  document.querySelector('#invite-choice').hidden = selected === null || !group.tasks[selected]?.invite;
  group.tasks.forEach((task, index) => {
    if (selected !== null && selected !== index) return;
    const card = document.createElement(selected === null ? 'button' : 'div');
    card.className = `challenge-card tone-${index}`;
    const title = document.createElement('span');
    title.className = 'challenge-title';
    title.textContent = task.title;
    card.append(icon(task.icon), title);
    if (selected === null) {
      card.type = 'button';
      card.setAttribute('aria-label', `Choose: ${task.title}`);
      card.addEventListener('click', () => {
        selected = index;
        render();
        announce(`Chosen: ${task.title} A good choice. One small step is enough.`);
        document.querySelector('#change-choice').focus({ preventScroll: true });
      });
    }
    list.append(card);
  });
}
function selectCategory(key, focus = false) {
  if (!categories[key]) return;
  category = key;
  selected = null;
  tabs.forEach(tab => {
    const active = tab.dataset.category === key;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus({ preventScroll: true });
  });
  render();
  announce(`${categories[key].title}: three example challenges.`);
}
function bindArrowNavigation(items, activate) {
  items.forEach((item, index) => item.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next !== undefined) { event.preventDefault(); activate(items[next], true); }
  }));
}
tabs.forEach(tab => tab.addEventListener('click', () => selectCategory(tab.dataset.category)));
bindArrowNavigation(tabs, tab => selectCategory(tab.dataset.category, true));
document.querySelector('#change-choice').addEventListener('click', () => { selected = null; render(); announce('Choose another challenge.'); });
document.querySelector('#invite-choice').addEventListener('click', () => openInvite(category));

const screenTabs = [...document.querySelectorAll('[data-screen]')];
const screenImage = document.querySelector('#product-screen');
const screenDescriptions = {
  routine: 'Mind’s current iOS Routine screen: three purple challenge cards on a black background.',
  trends: 'Mind’s current iOS Trends screen: date selection, daily balance and recorded challenge. No readings are shared for this example day.'
};
function selectScreen(tab, focus = false) {
  const key = tab.dataset.screen;
  screenImage.src = `assets/mind-${key}.png`;
  screenImage.alt = screenDescriptions[key];
  screenTabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#product-screen-panel').setAttribute('aria-labelledby', tab.id);
  if (focus) tab.focus({ preventScroll: true });
}
screenTabs.forEach(tab => tab.addEventListener('click', () => selectScreen(tab)));
bindArrowNavigation(screenTabs, selectScreen);

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
render();
