//@ts-nocheck
Tiff.initialize({ TOTAL_MEMORY: 19777216 * 10 });

export const fileToCanvas = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const tiff = new Tiff({ buffer: reader.result });
            const canvas = tiff.toCanvas();
            resolve(canvas);
        }
        reader.readAsArrayBuffer(file);
    })
}