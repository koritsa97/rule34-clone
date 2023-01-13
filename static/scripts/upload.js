const fileInput = document.querySelector('input[type="file"]');

let imgElem = null;

fileInput.oninput = (e) => {
  if (!imgElem) {
    imgElem = document.createElement('img');
    imgElem.style.display = 'block';
    imgElem.style.maxWidth = '100%';
    fileInput.insertAdjacentElement('afterend', imgElem);
  }

  imgElem.src = URL.createObjectURL(e.target.files[0]);
};
