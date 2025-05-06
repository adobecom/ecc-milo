/* eslint-disable no-unused-vars */
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute } from '../../scripts/data-utils.js';

export function onSubmit(component, props) {
  const videoField = component.querySelector('div.video-content > sp-textfield');
  const video = { url: videoField.value };
  if (videoField.value) {
    setPropsPayload(props, { video }); // To be updated.
  }
}

function setVideoUrl(props, component) {
  const eventData = props.payload;
  const video = getAttribute(eventData, 'video', props.locale);

  const videoField = component.querySelector('div.video-content > sp-textfield');
  if (!videoField || !videoField.url) return;
  videoField.setAttribute('value', video?.url);
}

export async function onPayloadUpdate(component, props) {
  setVideoUrl(props, component);
}

export async function onRespUpdate(component, props) {
  setVideoUrl(props, component);
}

export default function init(component, props) {
  setVideoUrl(props, component);
}

export function onTargetUpdate(_component, _props) {
  // Do nothing
}
