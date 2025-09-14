/**
 * Utility for resizing images before upload
 */

/**
 * Resizes an image file to fit within maxWidth and maxHeight while maintaining aspect ratio
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<File>} - A promise that resolves with the resized file
 */
export const resizeImage = async (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  // Check if file is an image
  if (!file || !file.type.match(/image.*/)) {
    console.log("Not an image file, skipping resize");
    return file;
  }
  
  // Skip small files
  if (file.size < 500 * 1024) { // 500KB
    console.log("File already small enough, skipping resize");
    return file;
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onload = () => {
        // Calculate dimensions to maintain aspect ratio
        let width = image.width;
        let height = image.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        
        // Get blob from canvas
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas to Blob conversion failed"));
            return;
          }
          
          // Create new file from blob
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          console.log(`Resized image from ${file.size} to ${resizedFile.size} bytes`);
          resolve(resizedFile);
        }, file.type, quality);
      };
      image.onerror = (error) => {
        console.error("Error loading image:", error);
        reject(error);
      };
      image.src = readerEvent.target.result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Ensures an image file is below a certain size by resizing if necessary
 * @param {File} file - The image file to check
 * @param {number} maxSizeInMB - Maximum size in MB
 * @returns {Promise<File>} - A promise that resolves with the file (resized if needed)
 */
export const ensureMaxFileSize = async (file, maxSizeInMB = 2) => {
  if (!file) return null;
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  // If file is already small enough, return it as is
  if (file.size <= maxSizeInBytes) {
    return file;
  }
  
  console.log(`File size ${file.size} exceeds ${maxSizeInBytes}. Resizing...`);
  
  // Start with a quality of 0.8 and gradually decrease if needed
  const qualities = [0.8, 0.6, 0.4, 0.2];
  
  for (const quality of qualities) {
    const resized = await resizeImage(file, 800, 800, quality);
    if (resized.size <= maxSizeInBytes) {
      return resized;
    }
  }
  
  // If we can't get it small enough with quality adjustments, reduce dimensions more
  return resizeImage(file, 400, 400, 0.6);
};