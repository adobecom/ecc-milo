/* eslint-disable no-unused-vars */
import { getAttribute } from '../../scripts/data-utils.js';
import { getEventPageHost, handlize } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { LOCALES } from '../../scripts/scripts.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const promotionGroup = component.querySelector('promotion-selector-group');

  const selectedPromotions = promotionGroup?.getSelectedPromotions();

  if (selectedPromotions && selectedPromotions.length > 0) {
    const selectedPromotionsPayload = selectedPromotions.map((p) => p.name);
    setPropsPayload(props, { promotionalItems: selectedPromotionsPayload });
  } else {
    setPropsPayload(props, {}, [{ key: 'promotionalItems', path: '' }]);
  }
}

async function getPromotionalContentSheet(props) {
  const { locale } = props;

  if (!locale) return [];

  const sheetLocation = 'events/default/promotional-content.json';

  const targetLocaleObject = Object.entries(LOCALES).find(([, v]) => v.ietf === locale) || {};
  const localePrefix = targetLocaleObject[0];
  const sheetResp = await fetch(`${getEventPageHost()}${localePrefix ? `/${localePrefix}` : ''}/${sheetLocation}`);

  if (!sheetResp.ok) return [];

  const { data } = await sheetResp.json();

  return data || [];
}

async function updatePromotionSelector(component, props) {
  const promotionalContent = await getPromotionalContentSheet(props);
  if (!promotionalContent) return;

  const promotionGroups = component.querySelectorAll('promotion-selector-group');

  promotionGroups.forEach((pg) => {
    pg.promotions = promotionalContent;
    pg.requestUpdate();

    const selectedPromotions = pg.getSelectedPromotions();

    selectedPromotions.forEach((sp, i) => {
      const isPromotionAvailable = promotionalContent.find((p) => p.name === sp.name);

      if (!isPromotionAvailable) {
        pg.deletePromotion(i);
      }
    });

    pg.shadowRoot.querySelectorAll('promotion-selector').forEach((ps) => {
      ps.dispatchEvent(new CustomEvent('update-promotion', {
        detail: { promotion: ps.selectedPromotion },
        bubbles: true,
        composed: true,
      }));
    });
  });
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
  }

  await updatePromotionSelector(component, props);
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  await updatePromotionSelector(component, props);
  const eventData = props.eventDataResp;

  const [
    cloudType,
    promotionalItems,
  ] = [
    getAttribute(eventData, 'cloudType', props.locale),
    getAttribute(eventData, 'promotionalItems', props.locale),
  ];

  if (cloudType) component.dataset.cloudType = cloudType;
  const promotionGroup = component.querySelector('promotion-selector-group');

  if (promotionalItems?.length) {
    const selectedPromotions = promotionalItems.map((p) => p.name);

    promotionGroup.selectedPromotions = selectedPromotions;
    promotionGroup.requestUpdate();
    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
