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
  console.log(props);
}
