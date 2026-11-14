'use strict';

const categories = {
  move: { title: 'Move', color: '#b9dfcd', tasks: [
    { kind: 'A little fresh air', title: 'Step outside for five minutes.', minutes: 5, detail: 'A familiar route, at a comfortable pace. Notice one thing you like along the way.', small: 'Spend a moment just outside your door.', smallDetail: 'A little fresh air is enough. There is no distance goal.' },
    { kind: 'Gentle movement', title: 'Move to one favourite song.', minutes: 3, detail: 'Sway, stretch or move however feels comfortable, seated or standing.', small: 'Try one comfortable movement to music.', smallDetail: 'Play a little of a song you enjoy. One gentle movement counts.' },
    { kind: 'Explore nearby', title: 'Find something colourful on a short walk.', minutes: 10, detail: 'Take a gentle walk or roll and find one colourful thing that catches your eye.', small: 'Find one colourful thing nearby.', smallDetail: 'Look around from a comfortable spot. No need to go outside.' }
  ]},
  eat: { title: 'Eat', color: '#ffdbc0', tasks: [
    { kind: 'Easy bite', title: 'Have two easy foods you enjoy together.', minutes: 3, detail: 'Try yoghurt and fruit or bread and a topping. Choose what suits your dietary needs.', small: 'Put an easy snack within reach.', smallDetail: 'A familiar, ready-to-eat food that suits you. No cooking needed.' },
    { kind: 'Meal prep', title: 'Find a simple meal you already have.', minutes: 5, detail: 'Look in one cupboard or the fridge for a familiar meal or leftovers.', small: 'Look in one cupboard for a snack.', smallDetail: 'Find one easy food. You do not need to organise the cupboard.' },
    { kind: 'Eat together', title: 'Ask someone to share an easy meal.', minutes: 2, detail: 'A shared ready meal is fine. You can figure out the details together.', small: 'Invite someone to share a snack.', smallDetail: 'Sending a short invitation is enough for this small step.', invite: true }
  ]},
  sleep: { title: 'Sleep', color: '#ffda70', tasks: [
    { kind: 'Morning prep', title: 'Put one thing ready for tomorrow morning.', minutes: 3, detail: 'Your mug, clothes or breakfast bowl. Pick one thing that makes your morning easier.', small: 'Put your morning mug within reach.', smallDetail: 'One useful thing, somewhere you will see it tomorrow.' },
    { kind: 'Wind-down', title: 'Dim a light and play one calm song tonight.', minutes: 4, detail: 'Before your usual bedtime, take a quiet moment with music you enjoy.', small: 'Dim one light before bed.', smallDetail: 'There is nothing else to prepare.' },
    { kind: 'Daylight', title: 'Take a short daylight break outside.', minutes: 5, detail: 'During daylight hours, notice the sky and the sounds around you.', small: 'Open the curtains and sit by a window.', smallDetail: 'A moment by the window is a smaller place to start.' }
  ]},
  social: { title: 'Social', color: '#d0c6ed', tasks: [
    { kind: 'Say hello', title: 'Send a friend a little hello.', minutes: 1, detail: 'A short message or an emoji. You do not need to explain everything.', small: 'Send someone one emoji.', smallDetail: 'Choose someone you enjoy hearing from.', invite: true },
    { kind: 'Time together', title: 'Invite a friend over for a cup of tea.', minutes: 3, detail: 'It can be short, and there is no tidying requirement.', small: 'Tell a friend you would like to see them.', smallDetail: 'You can choose the time together later.', invite: true },
    { kind: 'Share a song', title: 'Send someone a song that reminds you of them.', minutes: 2, detail: 'A quick “thought of you” is enough of a message.', small: 'Send a favourite song title.', smallDetail: 'Keep it as short as you like.', invite: true }
  ]},
  medicine: { title: 'Medicine', color: '#c1d8f8', tasks: [
    { kind: 'Your reminder', title: 'Check your existing medication reminder.', minutes: 2, detail: 'For people who use medication: keep following your own prescribed instructions.', small: 'Open your tracker and check the next reminder.', smallDetail: 'No dose or schedule changes.' },
    { kind: 'Supply check', title: 'Check your regular medication supply.', minutes: 3, detail: 'If you use regular medication, see whether you need to plan a refill.', small: 'Find your regular medication and check the supply.', smallDetail: 'You do not need to arrange everything now.' },
    { kind: 'Pharmacy help', title: 'Ask someone to join a needed pharmacy visit.', minutes: 2, detail: 'If a visit is due, a little company could make the practical part easier.', small: 'Ask someone about pharmacy help.', smallDetail: 'No medicine details needed in your invitation.', invite: true }
  ]}
};

const list = document.querySelector('#challenge-list');
const prompt = document.querySelector('#app-prompt');
const announcer = document.querySelector('#demo-status');
const tabs = [...document.querySelectorAll('[data-category]')];
const dialog = document.querySelector('#invite-dialog');
const inviteText = document.querySelector('#invite-text');
const copyStatus = document.querySelector('#copy-status');
let category = 'move';
let selected = null;
let smaller = new Set();
let completed = false;

function button(text, className, handler) {
  const el = document.createElement('button');
  el.type = 'button'; el.className = className; el.textContent = text;
  el.addEventListener('click', handler);
  return el;
}
function text(tag, content, className) {
  const el = document.createElement(tag); el.textContent = content;
  if (className) el.className = className;
  return el;
}
function currentTaskTitle(task, index) { return smaller.has(index) ? task.small : task.title; }
function announce(message) { announcer.textContent = message; }
function resetDemo() { selected = null; completed = false; smaller = new Set(); render(); }

function render() {
  const group = categories[category];
  list.replaceChildren();
  list.style.setProperty('--task-color', group.color);
  list.setAttribute('role', 'tabpanel');
  list.setAttribute('aria-labelledby', `tab-${category}`);
  prompt.textContent = completed ? 'One small win for today' : selected === null ? 'Choose one for today' : 'Your small step';
  if (completed) {
    const win = document.createElement('div'); win.className = 'win';
    const logo = document.createElement('img'); logo.src = 'assets/beside-mark.png'; logo.alt = ''; logo.width = 72; logo.height = 72;
    win.append(logo, text('h3', 'You showed up for yourself.'), text('p', currentTaskTitle(group.tasks[selected], selected)), button('Try another example', 'small-button', resetDemo));
    list.append(win);
    return;
  }
  if (selected !== null) {
    const task = group.tasks[selected];
    const card = document.createElement('div'); card.className = 'active-card';
    card.append(text('div', `${task.kind} · ${group.title}`, 'challenge-meta'), text('h3', currentTaskTitle(task, selected)), text('p', smaller.has(selected) ? task.smallDetail : task.detail, 'active-instruction'), text('span', 'In progress', 'in-progress'));
    const actions = document.createElement('div'); actions.className = 'active-controls';
    actions.append(button('I did it', 'start-button', () => { completed = true; render(); announce('Challenge complete. One small win for today.'); list.querySelector('button')?.focus({ preventScroll: true }); }));
    if (!smaller.has(selected)) actions.append(button('Make it smaller', 'small-button', () => { smaller.add(selected); render(); announce('Switched to the smaller version.'); }));
    if (task.invite || category === 'move') actions.append(button('Invite someone', 'small-button', () => openInvite(category)));
    card.append(actions, button('Choose a different step', 'change-choice', () => { selected = null; render(); }));
    list.append(card, text('p', 'This is an example. Do it at your own pace.', 'phone-feedback'));
    return;
  }
  group.tasks.forEach((task, index) => {
    const card = document.createElement('article'); card.className = 'challenge-card';
    const meta = document.createElement('div'); meta.className = 'challenge-meta';
    meta.append(text('span', `${task.kind} · ${group.title}`), text('span', `${smaller.has(index) ? 1 : task.minutes} min`));
    card.append(meta, text('h3', currentTaskTitle(task, index)));
    const actions = document.createElement('div'); actions.className = 'challenge-actions';
    const start = button('Start', 'start-button', () => { selected = index; render(); announce(`Started: ${currentTaskTitle(task, index)}`); list.querySelector('button')?.focus({ preventScroll: true }); });
    start.setAttribute('aria-label', `Start: ${currentTaskTitle(task, index)}`);
    actions.append(start);
    if (!smaller.has(index)) actions.append(button('Make smaller', 'small-button', () => { smaller.add(index); render(); announce(`Smaller version: ${task.small}`); }));
    else actions.append(text('span', 'Smaller version', 'challenge-meta'));
    card.append(actions); list.append(card);
  });
}
function selectCategory(key, focus = false) {
  if (!categories[key]) return;
  category = key; selected = null; completed = false; smaller = new Set();
  tabs.forEach(tab => {
    const active = tab.dataset.category === key;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus({ preventScroll: true });
  });
  render(); announce(`${categories[key].title}: three example challenges.`);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCategory(tab.dataset.category));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectCategory(tabs[next].dataset.category, true); }
  });
});
document.querySelectorAll('[data-explore]').forEach(link => link.addEventListener('click', () => selectCategory(link.dataset.explore)));
function openInvite(key = 'social') {
  const drafts = { move: 'Fancy a short walk or a catch-up together? We can keep it easy.', eat: 'Would you like to share something easy to eat? A ready meal is fine.', medicine: 'Could you keep me company on a pharmacy visit when I need it?', social: 'Fancy a short visit or a cup of tea together? No big plans needed.' };
  inviteText.value = drafts[key] || drafts.social;
  copyStatus.textContent = 'Share it in your usual messaging app. Nothing is sent from this website.';
  document.querySelector('#copy-invite').firstChild.textContent = 'Copy invitation ';
  dialog.showModal();
}
document.querySelector('#people-invite').addEventListener('click', () => openInvite());
document.querySelector('#copy-invite').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(inviteText.value);
    copyStatus.textContent = 'Copied. Paste it in your usual messaging app when you’re ready.';
  } catch {
    inviteText.focus(); inviteText.select();
    copyStatus.textContent = 'Select and copy the message, then share it in your usual messaging app.';
  }
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
render();
