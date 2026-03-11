import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file to under 1MB and converts it to WebP format.
 * @param file The original image file
 * @returns A Promise that resolves to the compressed WebP File
 */
export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 1,
        useWebWorker: true,
        fileType: "image/webp",
    };

    try {
        const compressedBlob = await imageCompression(file, options);
        // Convert Blob back to File with .webp extension
        const originalName = file.name;
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newFileName = `${baseName}.webp`;
        
        return new File([compressedBlob], newFileName, {
            type: "image/webp",
            lastModified: Date.now(),
        });
    } catch (error) {
        console.error("Error compressing image:", error);
        // If compression fails, return the original file to avoid breaking the upload pipeline
        return file;
    }
}
