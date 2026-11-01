const form = document.querySelector('#beulex-form');
const dateInput = document.querySelector('#date');
const fileInput = document.querySelector('#image');
const uploadZone = document.querySelector('#upload-zone');
const preview = document.querySelector('#preview');
const previewImage = document.querySelector('#preview-image');
const fileName = document.querySelector('#file-name');
const fileSize = document.querySelector('#file-size');
const removeButton = document.querySelector('#remove-image');
const status = document.querySelector('#status');

const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
dateInput.min = today.toISOString().split('T')[0];

function clearFile() {
  if (previewImage.src.startsWith('blob:')) URL.revokeObjectURL(previewImage.src);
  fileInput.value = '';
  previewImage.removeAttribute('src');
  preview.hidden = true;
  uploadZone.hidden = false;
}

function showFile(file) {
  status.textContent = '';
  if (!file) return;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    clearFile();
    status.textContent = 'Bitte wähle ein JPG-, PNG- oder WEBP-Bild.';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    clearFile();
    status.textContent = 'Das Bild darf maximal 10 MB groß sein.';
    return;
  }
  previewImage.src = URL.createObjectURL(file);
  fileName.textContent = file.name;
  fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  preview.hidden = false;
  uploadZone.hidden = true;
}

fileInput.addEventListener('change', () => showFile(fileInput.files[0]));
removeButton.addEventListener('click', clearFile);

['dragenter', 'dragover'].forEach(eventName => {
  uploadZone.addEventListener(eventName, event => {
    event.preventDefault();
    uploadZone.classList.add('is-dragging');
  });
});
['dragleave', 'drop'].forEach(eventName => {
  uploadZone.addEventListener(eventName, event => {
    event.preventDefault();
    uploadZone.classList.remove('is-dragging');
  });
});
uploadZone.addEventListener('drop', event => {
  const file = event.dataTransfer.files[0];
  if (!file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
  showFile(file);
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const chosenDate = new Date(`${dateInput.value}T12:00:00`).toLocaleDateString('de-DE');
  status.textContent = `Auswahl für den ${chosenDate} ist bereit.`;
});
