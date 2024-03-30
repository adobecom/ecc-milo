import { getLibs } from '../../scripts/utils.js';

const { html, render, useState } = await import(`${getLibs()}/deps/htm-preact.js`);

const CheckboxSection = (props) => {
  const [checked, setChecked] = useState(false);
  
  return html`
  <section>
    <h2>${props.heading}</h2>
    <div>tooltip placeholder</div>
    ${props.checkboxes.map((checkboxName) => html`
      <input type="checkbox" id="scales" name="scales" checked=${checked} />
      <label for="scales">${checkboxName}</label>
      `)}
  </section>
`;
};

export default function init(el) {
  const incasingFormHandler = el.closest('.form-handler');
  if (!incasingFormHandler) return;

  const heading = el.querySelector('h2')?.textContent.trim();
  const tooltip = el.querySelector('p > em')?.textContent.trim();
  const checkboxes = Array.from(el.querySelectorAll('ul > li'))?.map((li) => li.textContent.trim());
  const props = {
    heading,
    tooltip,
    checkboxes,
  };

  el.innerHTML = '';
  render(html`<${() => CheckboxSection(props)} />`, el);
}
