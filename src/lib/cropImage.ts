/**
 * Canvas-based image cropper.
 * Takes an image source + the pixel-crop area from react-easy-crop
 * and returns a File ready for upload.
 */
export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.crossOrigin = "anonymous";
        image.src = url;
    });
}

export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    fileName = "cropped.webp"
): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise<File>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Canvas toBlob failed"));
                    return;
                }
                resolve(new File([blob], fileName, { type: "image/webp" }));
            },
            "image/webp",
            0.9
        );
    });
}
