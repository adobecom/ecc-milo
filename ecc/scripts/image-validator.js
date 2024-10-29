export async function isImageTypeValid(file) {
  const validTypes = ['jpeg', 'jpg', 'png', 'svg'];
  let currentFileType = '';

  const blob = file.slice(0, 128);

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
  };

  if (signatures.jpeg.every((byte, i) => byte === bytes[i])) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'jpg' || extension === 'jpeg') {
      currentFileType = extension;
    }

    currentFileType = 'jpg';
  }

  if (signatures.png.every((byte, i) => byte === bytes[i])) {
    currentFileType = 'png';
  }

  const text = await blob.text();

  if (text.trim().startsWith('<svg')) {
    currentFileType = 'svg';
  }

  return validTypes.includes(currentFileType);
}

export function isImageSizeValid(file, maxSize) {
  return file.size <= maxSize;
}
