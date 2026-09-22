const MAX_EDGE = 1920;
const OUTPUT_QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Unable to read ${file.name}. Try a JPG or PNG photo.`)); };
        image.src = url;
    });
}

function encode(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to prepare this photo.")), mimeType, OUTPUT_QUALITY);
    });
}

export async function preparePropertyImage(file: File): Promise<File> {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser cannot prepare photos. Try another browser.");

    context.drawImage(image, 0, 0, width, height);
    const fontSize = Math.max(16, Math.min(42, Math.round(width * 0.035)));
    context.font = `800 ${fontSize}px Arial, Helvetica, sans-serif`;
    const label = "PROPYOURS";
    const paddingX = Math.round(fontSize * 0.65);
    const paddingY = Math.round(fontSize * 0.42);
    const boxWidth = Math.ceil(context.measureText(label).width + paddingX * 2);
    const boxHeight = Math.ceil(fontSize + paddingY * 2);
    const x = Math.max(0, width - boxWidth - Math.round(fontSize * 0.5));
    const y = Math.max(0, height - boxHeight - Math.round(fontSize * 0.5));
    context.fillStyle = "rgba(0, 0, 0, 0.38)";
    context.fillRect(x, y, boxWidth, boxHeight);
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.textBaseline = "middle";
    context.fillText(label, x + paddingX, y + boxHeight / 2);

    let blob = await encode(canvas, "image/webp");
    const isWebp = blob.type === "image/webp";
    if (!isWebp) blob = await encode(canvas, "image/jpeg");
    if (blob.size > 8 * 1024 * 1024) throw new Error(`${file.name} is still larger than 8 MB after preparation.`);
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-") || "property-photo";
    return new File([blob], `${baseName}-propyours.${isWebp ? "webp" : "jpg"}`, { type: blob.type, lastModified: file.lastModified });
}

export async function preparePropertyImages(files: File[]): Promise<File[]> {
    const prepared = new Array<File>(files.length);
    let next = 0;
    async function worker() {
        while (next < files.length) {
            const index = next++;
            prepared[index] = await preparePropertyImage(files[index]);
        }
    }
    await Promise.all(Array.from({ length: Math.min(2, files.length) }, () => worker()));
    return prepared;
}
