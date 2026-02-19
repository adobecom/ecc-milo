/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { getEventLibsHost } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { LOCALES } from '../../scripts/scripts.js';
import { getLocales } from '../../scripts/esp-controller.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const promotionGroup = component.querySelector('promotion-selector-group');

  const selectedPromotions = promotionGroup?.selectedPromotions;

  if (selectedPromotions && selectedPromotions.length > 0) {
    const selectedPromotionsPayload = selectedPromotions.map((p) => p.name);
    setPropsPayload(props, { promotionalItems: selectedPromotionsPayload });
  } else {
    setPropsPayload(props, {}, [{ key: 'promotionalItems', path: '' }]);
  }
}

/**
 * Fetches promotional content from external JSON sheet
 * @param {Object} props - Component props containing locale information
 * @returns {Promise<Array>} Array of promotional content items
 */
async function getPromotionalContentSheet(props) {
  try {
    const { locale } = props;

    if (!locale) {
      console.warn('No locale provided for promotional content');
      return [];
    }

    // No longer pointing at Events Milo for promotional content.
    const sheetLocation = 'event-libs/assets/configs/promotional-content.json';
    const locales = await getLocales().then((resp) => resp.localeNames) || {};
    const lName = locales[locale];

    const targetLocaleObject = Object.entries(LOCALES)
      .find(([, v]) => v.longName.toLowerCase() === lName?.toLowerCase()) || {};
    const localePrefix = targetLocaleObject[0];

    const sheetResp = await fetch(`${getEventLibsHost()}${localePrefix ? `/${localePrefix}` : ''}/${sheetLocation}`);

    if (!sheetResp.ok) {
      console.warn(`Failed to fetch promotional content: ${sheetResp.status} ${sheetResp.statusText}`);
      return [];
    }

    const response = await sheetResp.json();
    const { data } = response;

    if (!Array.isArray(data)) {
      console.warn('Promotional content data is not an array');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching promotional content:', error);
    return [];
  }
}

/**
 * Updates promotion selector components with new promotional content
 * @param {HTMLElement} component - The component element
 * @param {Array} promotionalContent - Array of promotional content items
 */
function updatePromotionSelector(component, promotionalContent) {
  if (!Array.isArray(promotionalContent) || promotionalContent.length === 0) {
    console.warn('No promotional content available');
    return;
  }

  const promotionGroups = component.querySelectorAll('promotion-selector-group');

  if (promotionGroups.length === 0) {
    console.warn('No promotion-selector-group found in component');
    return;
  }

  promotionGroups.forEach((pg) => {
    if (!pg || typeof pg.requestUpdate !== 'function') {
      console.warn('Invalid promotion-selector-group element');
      return;
    }

    pg.promotions = promotionalContent;
    pg.requestUpdate();

    const { selectedPromotions } = pg;

    if (Array.isArray(selectedPromotions)) {
      selectedPromotions.forEach((sp, i) => {
        if (sp && sp.name) {
          const isPromotionAvailable = promotionalContent.find((p) => p.name === sp.name);

          if (!isPromotionAvailable) {
            pg.deletePromotion(i);
          }
        }
      });
    }

    // Update child promotion selectors
    if (pg.shadowRoot) {
      pg.shadowRoot.querySelectorAll('promotion-selector').forEach((ps) => {
        if (ps && ps.selectedPromotion) {
          ps.dispatchEvent(new CustomEvent('update-promotion', {
            detail: { promotion: ps.selectedPromotion },
            bubbles: true,
            composed: true,
          }));
        }
      });
    }
  });
}

export async function onPayloadUpdate(component, props) {
  if (!component || !props) {
    console.warn('Invalid component or props provided to onPayloadUpdate');
    return;
  }

  const { cloudType } = props.payload || {};

  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
  }

  const promotionalContent = await getPromotionalContentSheet(props);
  updatePromotionSelector(component, promotionalContent);
}

export async function onRespUpdate() {
  // Do nothing - placeholder for future implementation
}

export default async function init(component, props) {
  if (!component || !props) {
    console.error('Invalid component or props provided to init');
    return;
  }

  try {
    const promotionalContent = await getPromotionalContentSheet(props);
    updatePromotionSelector(component, promotionalContent);

    const eventData = props.eventDataResp;

    if (!eventData) {
      console.warn('No event data response available');
      return;
    }

    const [
      cloudType,
      promotionalItems,
    ] = [
      getAttribute(eventData, 'cloudType', props.locale),
      getAttribute(eventData, 'promotionalItems', props.locale),
    ];

    if (cloudType) {
      component.dataset.cloudType = cloudType;
    }

    const promotionGroup = component.querySelector('promotion-selector-group');

    if (!promotionGroup) {
      console.warn('No promotion-selector-group found in component');
      return;
    }

    if (Array.isArray(promotionalItems) && promotionalItems.length > 0) {
      const selectedPromotions = promotionalItems
        .map((p) => promotionalContent.find((pc) => pc.name === p))
        .filter(Boolean); // Remove undefined items

      if (selectedPromotions.length > 0) {
        promotionGroup.selectedPromotions = selectedPromotions;
        promotionGroup.requestUpdate();
        component.classList.add('prefilled');
      }
    }
  } catch (error) {
    console.error('Error initializing content promotion component:', error);
  }
}

export function onTargetUpdate() {
  // Do nothing - placeholder for future implementation
}
