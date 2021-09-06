import Rgb from "./rgb.js";

export const black: Rgb = new Rgb(0, 0, 0);
export const blue: Rgb = new Rgb(0, 0, 176);
export const green: Rgb = new Rgb(0, 176, 0);
export const cyan: Rgb = new Rgb(0, 176, 176);
export const red: Rgb = new Rgb(176, 0, 0);
export const magenta: Rgb = new Rgb(176, 0, 176);
export const yellow: Rgb = new Rgb(176, 88, 0);
export const white: Rgb = new Rgb(176, 176, 176);
export const brightBlack: Rgb = new Rgb(88, 88, 88);
export const brightBlue: Rgb = new Rgb(88, 88, 255);
export const brightGreen: Rgb = new Rgb(88, 255, 88);
export const brightCyan: Rgb = new Rgb(88, 255, 255);
export const brightRed: Rgb = new Rgb(255, 88, 88);
export const brightMagenta: Rgb = new Rgb(255, 88, 255);
export const brightYellow: Rgb = new Rgb(255, 255, 88);
export const brightWhite: Rgb = new Rgb(255, 255, 255);

export const ansiPalette: Rgb[] = [
    black,
    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    white,
    brightBlack,
    brightRed,
    brightGreen,
    brightYellow,
    brightBlue,
    brightMagenta,
    brightCyan,
    brightWhite,
];
