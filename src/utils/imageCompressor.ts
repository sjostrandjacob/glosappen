/**
 * Image compressor utility for camera/file uploads using HTML5 Canvas.
 * Ensures fast upload on mobile connections (max width/height 1200px, JPEG 0.8).
 */
export async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Kunde inte skapa canvas-kontext för bildkomprimering.'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          base64: compressedDataUrl,
          mimeType: 'image/jpeg',
        });
      };

      img.onerror = () => {
        reject(new Error('Kunde inte läsa in bilden för komprimering.'));
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('Kunde inte läsa bildfilen.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Fel vid läsning av bildfil.'));
    };

    reader.readAsDataURL(file);
  });
}
