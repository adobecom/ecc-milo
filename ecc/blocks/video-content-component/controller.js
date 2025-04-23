/* eslint-disable no-unused-vars */

export function onSubmit(_component, _props) {
  // Do nothing
}

export async function onPayloadUpdate(component, props) {
  const eventData = props.payload;
  // const video = getAttribute(eventData, 'video', props.locale);
  const video = { link: 'https://example.com/video.mp4', title: 'Adobe Dynamo DB' }; // Placeholder for video data

  const videoField = component.querySelector('div.video-content > sp-textfield');
  videoField.setAttribute('value', video.link);
}

export async function onRespUpdate(component, props) {
  const eventData = props.eventDataResp;
  // const video = getAttribute(eventData, 'video', props.locale);
  const video = { link: 'https://example.com/video.mp4', title: 'Adobe Dynamo DB' }; // Placeholder for video data

  const videoField = component.querySelector('div.video-content > sp-textfield');
  videoField.setAttribute('value', video.link);
}

export default function init(component, props) {
  const eventData = props.payload;
  // const video = getAttribute(eventData, 'video', props.locale);
  const video = { link: 'https://example.com/video.mp4', title: 'Adobe Dynamo DB' }; // Placeholder for video data

  const videoField = component.querySelector('div.video-content > sp-textfield');
  videoField.setAttribute('value', video.link);
}

export function onTargetUpdate(_component, _props) {
  // Do nothing
}
