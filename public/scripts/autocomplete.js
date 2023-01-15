const tagsInput = document.querySelector('.tags-input');
const tagsAutocomplete = document.querySelector('.tags-autocomplete');

if (location.search !== '') {
  const params = location.search
    .replace('?', '')
    .split('&')
    .reduce((prev, property) => {
      const [key, value] = property.split('=');
      prev[key] = value;
      return prev;
    }, {});
  const tags =
    params.query[params.query.length - 1] === '+'
      ? params.query.slice(0, params.query.length - 1).split('+')
      : [params.query];
  tagsInput.value = tags.join(' ') + ' ';
}

function debounce(cb, timeout) {
  let timerId;
  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      cb(...args);
    }, timeout);
  };
}

tagsInput.oninput = debounce((e) => {
  const inputValue = e.target.value.trim().toLowerCase();
  if (inputValue === '') {
    tagsAutocomplete.hidden = true;
    return;
  }

  const tags = inputValue.split(' ');
  const query = tags[tags.length - 1];
  fetch(`/tags/autocomplete?query=${query}`)
    .then((res) => res.json())
    .then((tags) => renderTags(query, tags));
}, 250);

tagsInput.onblur = debounce(() => {
  tagsAutocomplete.hidden = true;
}, 100);

tagsAutocomplete.onclick = (e) => {
  const tagElem = e.target.closest('li');
  if (!tagElem) {
    return;
  }

  const tag = tagElem.dataset.tag;
  const tags = tagsInput.value.split(' ');
  tags[tags.length - 1] = tag;
  tagsInput.value = tags.join(' ') + ' ';

  tagsAutocomplete.hidden = true;
};

function createTag(query, tag) {
  return `<li data-tag="${tag.name}">
    ${tag.name.replace(query, `<mark>${query}</mark>`)}
  </li>`;
}

function renderTags(query, tags) {
  tagsAutocomplete.hidden = false;
  let html = '';
  for (const tag of tags) {
    html += createTag(query, tag);
  }

  tagsAutocomplete.innerHTML = html;
}
