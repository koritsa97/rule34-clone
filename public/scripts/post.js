const favoriteBtn = document.querySelector('#favoriteBtn');

favoriteBtn?.addEventListener('click', (e) => {
  const postId = e.target.dataset.postid;

  favoriteBtn.disabled = true;
  fetch(`/posts/${postId}/favorite`, {
    method: 'PATCH',
  })
    .then((res) => res.text())
    .then(() => {
      favoriteBtn.insertAdjacentHTML(
        'beforebegin',
        '<p>Added to favorites</p>'
      );
    })
    .finally(() => {
      favoriteBtn.remove();
    });
});
