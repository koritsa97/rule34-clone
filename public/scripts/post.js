const favoriteBtn = document.querySelector('#favoriteBtn');

favoriteBtn.onclick = (e) => {
  const postId = e.target.dataset.postid;

  favoriteBtn.disabled = true;
  fetch(`/posts/${postId}/favorite`, {
    method: 'PATCH',
  })
    .then((res) => res.text())
    .then((data) => {
      console.log(data);
      favoriteBtn.insertAdjacentHTML(
        'beforebegin',
        '<p>Added to favorites</p>'
      );
    })
    .finally(() => {
      favoriteBtn.disabled = false;
    });
};
