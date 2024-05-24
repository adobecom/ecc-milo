const eventListenersMap = new Map();

function trackEventListeners(node, event, listener, options) {
  if (!eventListenersMap.has(node)) {
    eventListenersMap.set(node, []);
  }
  eventListenersMap.get(node).push({ event, listener, options });
}

// Override the addEventListener method to store the listeners
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = (event, listener, options) => {
  // Ensure the node is a valid key for WeakMap
  if (listener.element) {
    trackEventListeners(listener.element, event, listener, options);
  }
  originalAddEventListener.call(this, event, listener, options);
};

export default eventListenersMap;
