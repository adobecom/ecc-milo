/* eslint-disable no-unused-vars */
import { getCaasTags } from '../../scripts/caas.js';
import { getAttribute } from '../../scripts/data-utils.js';
import { getEventPageHost, handlize } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const promotionGroup = component.querySelector('promotion-selector-group');

  const selectedPromotions = promotionGroup?.getSelectedPromotions();

  if (selectedPromotions && selectedPromotions.length > 0) {
    const selectedPromotionsPayload = selectedPromotions.map((p) => p.name);
    setPropsPayload(props, { promotionItems: selectedPromotionsPayload });
  } else {
    setPropsPayload(props, {}, [{ key: 'promotionItems', path: '' }]);
  }
}

async function getPromotionalContentSheet() {
  const { data } = await fetch(`${getEventPageHost()}/events/default/promotional-content.json`).then((res) => res.json());

  return data;
}

async function updatePromotionSelector(component, props) {
  const promotionalContent = await getPromotionalContentSheet();
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
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  await updatePromotionSelector(component, props);
  const eventData = props.eventDataResp;

  const [
    cloudType,
    relatedPromotions,
  ] = [
    getAttribute(eventData, 'cloudType', props.locale),
    getAttribute(eventData, 'relatedPromotions', props.locale),
  ];

  if (cloudType) component.dataset.cloudType = cloudType;
  const promotionGroup = component.querySelector('promotion-selector-group');

  if (relatedPromotions?.length) {
    const selectedPromotions = relatedPromotions.map((p) => handlize(p.name));

    promotionGroup.selectedPromotions = selectedPromotions;
    promotionGroup.requestUpdate();
    component.classList.add('prefilled');
  }
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
