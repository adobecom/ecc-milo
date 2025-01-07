import { LIBS } from '../../scripts/scripts.js';
import { getCaasTags } from '../../scripts/esp-controller.js';
import { generateToolTip } from '../../scripts/utils.js';
import TagManager from '../../components/tag-manager/tag-manager.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

// function buildLevel(caasTags, parent, currentLevel = 0) {
//   const tagsArray = Object.entries(caasTags);

//   if (!tagsArray.length) return;

//   const menuWrapper = createTag('div', { class: 'menu-wrapper' });
//   const menu = createTag('sp-menu');

//   menuWrapper.append(menu);
//   parent.append(menuWrapper);

//   tagsArray.forEach(([key, value]) => {
//     const { title, tags } = value;
//     const menuItem = createTag('sp-menu-item', { value: key }, title);

//     menu.append(menuItem);

//     if (tags && Object.keys(tags).length) {
//       menuItem.append(getIcon('chev-right'));
//       menuItem.addEventListener('click', () => {
//         const lastMenuWrapper = parent.querySelectorAll('.menu-wrapper');

//         lastMenuWrapper.forEach((wrapper, i) => {
//           if (i > currentLevel) wrapper.remove();
//         });

//         buildLevel(tags, parent, currentLevel + 1);
//       });
//     }
//   });

//   parent.append(menuWrapper);
// }

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el);

  await Promise.all([
    import(`${LIBS}/deps/lit-all.min.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/theme.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/checkbox.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/menu.js`),
    import(`${LIBS}/features/spectrum-web-components/dist/picker.js`),
  ]);

  const spTheme = createTag('sp-theme', { color: 'light', scale: 'medium' });
  el.parentElement.replaceChild(spTheme, el);

  spTheme.appendChild(el);

  const caasTags = await getCaasTags();

  if (!caasTags) return;

  customElements.define('tag-manager', TagManager);

  const tagManager = createTag('tag-manager', { class: 'tag-manager' }, '', { parent: el });
  tagManager.tags = caasTags.namespaces.caas;
}
