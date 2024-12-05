let container;
let image;
let zoomInBtn;
let zoomOutBtn;

let scale = 1; // Initial scale
let posX = 0; // Initial horizontal offset
let posY = 0; // Initial vertical offset

// Dragging state
let isDragging = false;
let startX;
let startY;

// Handle zooming
function zoom(scaleFactor) {
  if (scale + scaleFactor < 0.5) return;

  scale += scaleFactor;
  image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;

  zoomOutBtn.disabled = scale <= 0.5;
}

// Handle dragging start
function onDragStart(event) {
  image.classList.add('grabbing');
  event.preventDefault();
  isDragging = true;
  startX = event.clientX || event.touches?.[0].clientX;
  startY = event.clientY || event.touches?.[0].clientY;

  container.style.cursor = 'grabbing';
}

// Handle dragging move
function onDragMove(event) {
  if (!isDragging) return;

  event.preventDefault();

  const currentX = event.clientX || event.touches?.[0].clientX;
  const currentY = event.clientY || event.touches?.[0].clientY;

  const deltaX = currentX - startX;
  const deltaY = currentY - startY;

  posX += deltaX;
  posY += deltaY;

  // Apply transformations
  image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;

  // Update start positions for next move
  startX = currentX;
  startY = currentY;
}

// Handle dragging end
function onDragEnd() {
  isDragging = false;
  image.classList.remove('grabbing');
  container.style.cursor = 'grab';
}

export default function initPreviewFrame(component) {
  container = component.querySelector('.picker-preview-image-holder');
  image = component.querySelector('.picker-preview-image');
  zoomInBtn = component.querySelector('.picker-zoom-in-btn');
  zoomOutBtn = component.querySelector('.picker-zoom-out-btn');

  zoomInBtn?.addEventListener('click', () => zoom(0.25));
  zoomOutBtn?.addEventListener('click', () => zoom(-0.25));
  container.addEventListener('mousedown', onDragStart);
  container.addEventListener('mousemove', onDragMove);
  container.addEventListener('mouseup', onDragEnd);
  container.addEventListener('mouseleave', onDragEnd);
  container.addEventListener('touchstart', onDragStart);
  container.addEventListener('touchmove', onDragMove);
  container.addEventListener('touchend', onDragEnd);
}

export function resetPreviewFrame() {
  scale = 1;
  posX = 0;
  posY = 0;
  image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}
