import { html } from '../htm-wrapper.js';

function SearchInput({ placeholder = 'Search schedules', value = '', onInput, className = '' }) {
  const handleInput = (e) => {
    if (onInput) {
      onInput(e);
    }
  };

  return html`
    <div class="sm-search-input ${className}">
      <div class="sm-search-input__icon">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.3834 19.2168L14.7918 13.6252C15.8581 12.3037 16.5001 10.6261 16.5001 8.8001C16.5001 4.55478 13.0454 1.1001 8.8001 1.1001C4.55478 1.1001 1.1001 4.55477 1.1001 8.80009C1.1001 13.0454 4.55478 16.5001 8.8001 16.5001C10.6261 16.5001 12.3037 15.8581 13.6252 14.7918L19.2168 20.3834C19.3779 20.5445 19.5885 20.6251 19.8001 20.6251C20.0117 20.6251 20.2223 20.5445 20.3834 20.3834C20.7057 20.0611 20.7057 19.5391 20.3834 19.2168ZM8.8001 14.8501C5.46464 14.8501 2.7501 12.1355 2.7501 8.80009C2.7501 5.46463 5.46464 2.75009 8.8001 2.75009C12.1356 2.75009 14.8501 5.46463 14.8501 8.80009C14.8501 12.1355 12.1356 14.8501 8.8001 14.8501Z" fill="#292929"/>
        </svg>
      </div>
      <input \
        type="text" \
        class="sm-search-input__field" \
        placeholder="${placeholder}" \
        value="${value}" \
        oninput="${handleInput}" \
      />
    </div>
  `;
}

export default SearchInput;
