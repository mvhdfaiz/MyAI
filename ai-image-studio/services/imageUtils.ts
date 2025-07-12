
export const imageUtils = {
  compressImage: (dataUrl: string, maxSizeInBytes = 950000): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context"));

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let quality = 0.9;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        while (compressedDataUrl.length > maxSizeInBytes && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        if (compressedDataUrl.length > maxSizeInBytes) {
          console.warn("Could not compress the image enough by quality reduction. Resizing...");
          const scaleRatio = Math.sqrt(maxSizeInBytes / compressedDataUrl.length) * 0.95;
          const newWidth = canvas.width * scaleRatio;
          const newHeight = canvas.height * scaleRatio;
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');

          if (!tempCtx) return reject(new Error("Could not get temporary canvas context"));
          tempCanvas.width = newWidth;
          tempCanvas.height = newHeight;
          tempCtx.drawImage(img, 0, 0, newWidth, newHeight);
          compressedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
        }

        if (compressedDataUrl.length > maxSizeInBytes) {
          console.error("Could not compress the image enough. Final size:", compressedDataUrl.length);
          return reject(new Error("Image too large to save, even after compression."));
        }
        
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error("Could not load image for saving."));
    });
  },

  fileToB64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  },

  dataUrlToB64: (dataUrl: string): string => {
    const parts = dataUrl.split(',');
    return parts.length > 1 ? parts[1] : dataUrl;
  },
};
