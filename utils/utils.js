function createTag(tag, attributes, html, options = {}) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement
      || html instanceof SVGElement
      || html instanceof DocumentFragment) {
      el.append(html);
    } else if (Array.isArray(html)) {
      el.append(...html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  options.parent?.append(el);
  return el;
}

export function yieldToMain() {
  return new Promise((r) => {
    setTimeout(r, 0);
  });
}

export function handlize(str) {
  return str.toLowerCase().trim().replace(' ', '-');
}

export function standardizeFormComponentHeading(formComponent) {
  const h2 = formComponent.querySelector(':scope > div:first-of-type h2');

  if (h2) {
    const em = formComponent.querySelector('p > em');

    if (em) {
      const tooltipText = em.textContent.trim();
      const toolTipIcon = createTag('span', { class: 'event-heading-tooltip-icon' }, 'i');
      const toolTipBox = createTag('div', { class: 'event-heading-tooltip-box' }, tooltipText);
      const toolTipWrapper = createTag('div', { class: 'event-heading-tooltip-wrapper' });

      toolTipWrapper.append(toolTipIcon, toolTipBox);
      h2.append(toolTipWrapper);
      em.parentElement?.remove();
    }
  }
}

export function getIcon(tag) {
  const img = document.createElement('img');
  img.className = `icon icon-${tag}`;
  img.src = `/icons/${tag}.svg`;
  img.alt = tag;

  return img;
}
