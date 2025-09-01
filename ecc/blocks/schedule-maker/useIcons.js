import { LIBS } from '../../scripts/scripts.js';
import { useEffect } from '../../scripts/libs/preact-hook.js';

/**
 * useIcons is a hook that loads the icons from the icons.js file
 * and makes them available to the components
 */
export default function useIcons() {
  useEffect(() => {
    const fetchIcons = async () => {
      const { default: loadIcons } = await import(`${LIBS}/features/icons/icons.js`);
      const icons = document.querySelectorAll('span.icon');
      if (!icons) return;
      loadIcons(icons);
    };
    fetchIcons();
  });

  return null;
}
