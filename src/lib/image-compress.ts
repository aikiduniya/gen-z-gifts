import imageCompression, { type Options } from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options: Options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.85,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    
    // browser-image-compression returns a Blob, not a File
    // Convert it back to a File with proper name and MIME type
    // IMPORTANT: Use the compressedBlob's actual type, not the original file type
    // The library may convert between formats (e.g., PNG to JPEG) for better compression
    const actualMimeType = compressedBlob.type || file.type;
    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.' + (actualMimeType.split('/')[1] || 'jpg');
    
    const compressedFile = new File(
      [compressedBlob],
      fileName,
      {
        type: actualMimeType,
        lastModified: Date.now()
      }
    );
    
    console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB (type: ${actualMimeType})`);
    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
