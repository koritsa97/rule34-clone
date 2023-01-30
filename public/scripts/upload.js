const fileInput = document.querySelector('input[type="file"]');
const previewImgElem = document.querySelector('#imagePreview');

fileInput.addEventListener('input', (e) => {
  previewImgElem.src = URL.createObjectURL(e.target.files[0]);
  previewImgElem.classList.remove('d-none');
  previewImgElem.classList.add('d-block');
});
