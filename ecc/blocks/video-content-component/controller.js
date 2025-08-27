/* eslint-disable no-unused-vars */
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute } from '../../scripts/data-utils.js';

export function onSubmit(component, props) {
  const videoField = component.querySelector('div.video-content > sp-textfield');
  const video = { url: videoField.value };
  const removeData = [];

  if (!videoField.value) {
    removeData.push({
      key: 'video',
      path: '',
    });
  }

  setPropsPayload(props, { video }, removeData);
}

function setVideoUrl(data, component, props) {
  if (props.eventDataResp.externalEventId?.startsWith('mcz-')) {
    component.classList.add('hidden');
    return;
  }

  const video = getAttribute(data, 'video', props.locale);

  if (!video) return;

  const videoField = component.querySelector('div.video-content > sp-textfield');

  if (!videoField || !video.url) return;

  videoField.setAttribute('value', video?.url);
}

export async function onPayloadUpdate(component, props) {
  setVideoUrl(props.payload, component, props);
}

export async function onRespUpdate(component, props) {
  setVideoUrl(props.eventDataResp, component, props);
}

export default function init(component, props) {
  setVideoUrl(props.eventDataResp, component, props);
}

export function onTargetUpdate(_component, _props) {
  // Do nothing
}
