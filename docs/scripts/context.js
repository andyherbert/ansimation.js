export function createContext(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas.getContext("2d");
}
export function createContextWithRGB(width, height, rgb, startY = 0) {
    const ctx = createContext(width, height);
    const imageData = ctx.createImageData(width, height);
    let imageDataPos = startY * width * 4;
    while (imageDataPos < imageData.data.length) {
        imageData.data[imageDataPos++] = rgb.red;
        imageData.data[imageDataPos++] = rgb.green;
        imageData.data[imageDataPos++] = rgb.blue;
        imageData.data[imageDataPos++] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return ctx;
}
export function sourceInCopy(source, rgb) {
    source.fillStyle = `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
    const canvas = source.canvas;
    source.fillRect(0, 0, canvas.width, canvas.height);
    const ctx = createContext(canvas.width, canvas.height);
    ctx.drawImage(canvas, 0, 0);
    return ctx;
}
