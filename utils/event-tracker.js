const eventListenersMap = new WeakMap();

function addTrackedEventListener(node, event, listener, options) {
  if (!eventListenersMap.has(node)) {
    eventListenersMap.set(node, []);
  }
  eventListenersMap.get(node).push({ event, listener, options });
  node.addEventListener(event, listener, options);
}

function getEventListeners(node) {
  return eventListenersMap.get(node) || [];
}

function removeTrackedEventListeners(node) {
  const listeners = getEventListeners(node);
  listeners.forEach(({ event, listener, options }) => {
    node.removeEventListener(event, listener, options);
  });
}

export { addTrackedEventListener, getEventListeners, removeTrackedEventListeners };
