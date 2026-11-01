const form = document.querySelector('#beulex-form');
const fileInput = document.querySelector('#image');
const uploadZone = document.querySelector('#upload-zone');
const preview = document.querySelector('#preview');
const previewImage = document.querySelector('#preview-image');
const fileName = document.querySelector('#file-name');
const fileSize = document.querySelector('#file-size');
const removeButton = document.querySelector('#remove-image');
const imageError = document.querySelector('#image-error');
const slotStep = document.querySelector('#slot-step');
const slotPanel = document.querySelector('#slot-panel');
const slotPlaceholder = document.querySelector('#slot-placeholder');
const dateTabs = document.querySelector('#date-tabs');
const datesPrev = document.querySelector('#dates-prev');
const datesNext = document.querySelector('#dates-next');
const timeSlots = document.querySelector('#time-slots');
const selectedSlot = document.querySelector('#selected-slot');
const slotError = document.querySelector('#slot-error');
const contactStep = document.querySelector('#contact-step');
const contactPanel = document.querySelector('#contact-panel');
const contactPlaceholder = document.querySelector('#contact-placeholder');
const contactInput = document.querySelector('#contact-value');
const contactLabel = document.querySelector('#contact-label');
const contactError = document.querySelector('#contact-error');
const consent = document.querySelector('#consent');
const thankYou = document.querySelector('#thank-you');
const backHome = document.querySelector('#back-home');

let currentContactType = 'email';
let availableDays = [];

function formatDay(date) {
  return {
    weekday: new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(date).replace('.', ''),
    date: new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(date),
    full: new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  };
}

function buildAvailableDays() {
  const days = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  while (days.length < 10) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function timesForDay(date) {
  const friday = date.getDay() === 5;
  const endMinutes = friday ? 14 * 60 + 30 : 16 * 60 + 30;
  const times = [];
  for (let minutes = 8 * 60 + 30; minutes <= endMinutes; minutes += 30) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    times.push(`${hours}:${mins}`);
  }
  return times;
}

function renderTimes(date, activeTab) {
  document.querySelectorAll('.date-tab').forEach(tab => tab.classList.toggle('active', tab === activeTab));
  timeSlots.replaceChildren();
  selectedSlot.value = '';
  lockContact();
  timesForDay(date).forEach(time => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-slot';
    button.textContent = time;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
        slot.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      selectedSlot.value = `${date.toISOString().split('T')[0]}T${time}`;
      slotError.textContent = '';
      unlockContact();
    });
    timeSlots.append(button);
  });
}

function unlockSlots() {
  availableDays = buildAvailableDays();
  dateTabs.replaceChildren();
  availableDays.forEach((date, index) => {
    const day = formatDay(date);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-tab';
    button.setAttribute('role', 'tab');
    button.innerHTML = `<span>${day.weekday}</span><strong>${day.date}</strong>`;
    button.addEventListener('click', () => renderTimes(date, button));
    dateTabs.append(button);
    if (index === 0) renderTimes(date, button);
  });
  slotStep.hidden = false;
  slotPanel.hidden = false;
  slotPlaceholder.hidden = true;
}

function lockContact() {
  contactStep.hidden = true;
  contactPanel.hidden = true;
  contactPlaceholder.hidden = false;
}

function unlockContact() {
  contactStep.hidden = false;
  contactPanel.hidden = false;
  contactPlaceholder.hidden = true;
}

function clearFile() {
  if (previewImage.src.startsWith('blob:')) URL.revokeObjectURL(previewImage.src);
  fileInput.value = '';
  previewImage.removeAttribute('src');
  preview.hidden = true;
  uploadZone.hidden = false;
  slotStep.hidden = true;
  slotPanel.hidden = true;
  slotPlaceholder.hidden = false;
  selectedSlot.value = '';
  lockContact();
}

function showFile(file) {
  imageError.textContent = '';
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    clearFile();
    imageError.textContent = 'Bitte wähle ein JPG-, PNG- oder WEBP-Bild.';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    clearFile();
    imageError.textContent = 'Das Bild darf maximal 10 MB groß sein.';
    return;
  }
  previewImage.src = URL.createObjectURL(file);
  fileName.textContent = file.name;
  fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  preview.hidden = false;
  uploadZone.hidden = true;
  unlockSlots();
}

fileInput.addEventListener('change', () => showFile(fileInput.files[0]));
removeButton.addEventListener('click', clearFile);
['dragenter', 'dragover'].forEach(name => uploadZone.addEventListener(name, event => {
  event.preventDefault();
  uploadZone.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach(name => uploadZone.addEventListener(name, event => {
  event.preventDefault();
  uploadZone.classList.remove('is-dragging');
}));
uploadZone.addEventListener('drop', event => {
  const file = event.dataTransfer.files[0];
  if (!file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
  showFile(file);
});

datesPrev.addEventListener('click', () => dateTabs.scrollBy({ left: -320, behavior: 'smooth' }));
datesNext.addEventListener('click', () => dateTabs.scrollBy({ left: 320, behavior: 'smooth' }));

document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => {
  currentContactType = button.dataset.contact;
  document.querySelectorAll('[data-contact]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  const isEmail = currentContactType === 'email';
  contactInput.type = isEmail ? 'email' : 'tel';
  contactInput.autocomplete = isEmail ? 'email' : 'tel';
  contactInput.placeholder = isEmail ? 'name@beispiel.de' : '+49 170 1234567';
  contactInput.value = '';
  contactLabel.textContent = isEmail ? 'E-Mail-Adresse' : 'Telefonnummer';
  contactError.textContent = '';
}));

form.addEventListener('submit', event => {
  event.preventDefault();
  imageError.textContent = '';
  slotError.textContent = '';
  contactError.textContent = '';
  if (!fileInput.files[0]) {
    imageError.textContent = 'Bitte lade zuerst ein Bild hoch.';
    return;
  }
  if (!selectedSlot.value) {
    slotError.textContent = 'Bitte wähle einen Termin.';
    return;
  }
  if (!contactInput.checkValidity()) {
    contactError.textContent = currentContactType === 'email' ? 'Bitte gib eine gültige E-Mail-Adresse ein.' : 'Bitte gib eine Telefonnummer ein.';
    contactInput.focus();
    return;
  }
  if (!consent.checked) {
    contactError.textContent = 'Bitte bestätige, dass wir dich kontaktieren dürfen.';
    return;
  }
  thankYou.hidden = false;
  document.body.style.overflow = 'hidden';
});

backHome.addEventListener('click', () => {
  thankYou.hidden = true;
  document.body.style.overflow = '';
  form.reset();
  clearFile();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
