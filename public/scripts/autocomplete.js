export class TagsAutocomplete {
  constructor(rootSelector) {
    this.root = document.querySelector(rootSelector);
    this.input = this.root.querySelector('.form-control');
    this.list = this.root.querySelector('.list-group');

    if (location.search !== '') {
      this.initInputValue(location.search);
    }

    this.input.addEventListener(
      'input',
      this.debounce(this.handleInput.bind(this), 250)
    );

    this.input.addEventListener(
      'blur',
      this.debounce(this.handleInputBlur.bind(this), 1000)
    );

    this.list.addEventListener('click', this.handleListClick.bind(this));
  }

  handleInputBlur() {
    this.list.hidden = true;
  }

  handleListClick(e) {
    const tagElem = e.target.closest('.list-group-item');
    if (!tagElem) {
      return;
    }

    const tag = tagElem.dataset.tag;
    const tags = this.input.value.split(' ');
    tags[tags.length - 1] = tag;
    this.input.value = tags.join(' ') + ' ';

    this.list.hidden = true;
  }

  handleInput(e) {
    const inputValue = e.target.value.trim().toLowerCase();
    if (inputValue === '') {
      this.list.hidden = true;
      return;
    }

    const tags = inputValue.split(' ');
    const query = tags[tags.length - 1];
    fetch(`/tags/autocomplete?query=${query}`)
      .then((res) => res.json())
      .then((tags) => this.renderTags(query, tags.slice(0, 10)));
  }

  renderTags(query, tags) {
    this.list.hidden = false;
    let html = '';
    for (const tag of tags) {
      html += this.createTag(query, tag);
    }

    this.list.innerHTML = html;
  }

  createTag(query, tag) {
    return `<button type="button" data-tag="${
      tag.name
    }" class="list-group-item list-group-item-action">
        ${tag.name.replace(query, `<mark>${query}</mark>`)}
      </button>`;
  }

  initInputValue(searchString) {
    const searchParams = new URLSearchParams(searchString);
    const query = searchParams.get('query');
    const tags =
      query[query.length - 1] === '+'
        ? query.slice(0, query.length - 1).split('+')
        : [query];
    this.input.value = tags.join(' ') + ' ';
  }

  debounce(cb, timeout) {
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
}
