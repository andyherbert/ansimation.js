var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetchBytes from "./fetch_bytes.js";
import { createContext, createContextWithRGB, sourceInCopy } from "./context.js";
import { white, ansiPalette } from "./palette.js";
function getFileName(fontName) {
    switch (fontName) {
        case "IBM VGA":
            return "ibm/CP437.F16";
        case "IBM VGA50":
            return "ibm/CP437.F08";
        case "IBM VGA25G":
            return "ibm/CP437.F19";
        case "IBM EGA":
            return "ibm/CP437.F14";
        case "IBM EGA43":
            return "ibm/CP437.F08";
        case "IBM VGA 437":
            return "ibm/CP437.F16";
        case "IBM VGA50 437":
            return "ibm/CP437.F08";
        case "IBM VGA25G 437":
            return "ibm/CP437.F19";
        case "IBM EGA 437":
            return "ibm/CP437.F14";
        case "IBM EGA43 437":
            return "ibm/CP437.F08";
        case "IBM VGA 720":
            return "ibm/CP437.F16";
        case "IBM VGA50 720":
            return "ibm/CP437.F08";
        case "IBM VGA25G 720":
            return "ibm/CP437.F19";
        case "IBM EGA 720":
            return "ibm/CP437.F14";
        case "IBM EGA43 720":
            return "ibm/CP437.F08";
        case "IBM VGA 737":
            return "ibm/CP737.F16";
        case "IBM VGA50 737":
            return "ibm/CP737.F08";
        case "IBM VGA25G 737":
            return "ibm/CP437.F19";
        case "IBM EGA 737":
            return "ibm/CP737.F14";
        case "IBM EGA43 737":
            return "ibm/CP737.F08";
        case "IBM VGA 775":
            return "ibm/CP775.F16";
        case "IBM VGA50 775":
            return "ibm/CP775.F08";
        case "IBM VGA25G 775":
            return "ibm/CP437.F19";
        case "IBM EGA 775":
            return "ibm/CP775.F14";
        case "IBM EGA43 775":
            return "ibm/CP775.F08";
        case "IBM VGA 819":
            return "ibm/CP437.F16";
        case "IBM VGA50 819":
            return "ibm/CP437.F08";
        case "IBM VGA25G 819":
            return "ibm/CP437.F19";
        case "IBM EGA 819":
            return "ibm/CP437.F14";
        case "IBM EGA43 819":
            return "ibm/CP437.F08";
        case "IBM VGA 850":
            return "ibm/CP850.F16";
        case "IBM VGA50 850":
            return "ibm/CP850.F08";
        case "IBM VGA25G 850":
            return "ibm/CP850.F19";
        case "IBM EGA 850":
            return "ibm/CP850.F14";
        case "IBM EGA43 850":
            return "ibm/CP850.F08";
        case "IBM VGA 852":
            return "ibm/CP852.F16";
        case "IBM VGA50 852":
            return "ibm/CP852.F08";
        case "IBM VGA25G 852":
            return "ibm/CP852.F19";
        case "IBM EGA 852":
            return "ibm/CP852.F14";
        case "IBM EGA43 852":
            return "ibm/CP852.F08";
        case "IBM VGA 855":
            return "ibm/CP855.F16";
        case "IBM VGA50 855":
            return "ibm/CP855.F08";
        case "IBM VGA25G 855":
            return "ibm/CP437.F19";
        case "IBM EGA 855":
            return "ibm/CP855.F14";
        case "IBM EGA43 855":
            return "ibm/CP855.F08";
        case "IBM VGA 857":
            return "ibm/CP857.F16";
        case "IBM VGA50 857":
            return "ibm/CP857.F08";
        case "IBM VGA25G 857":
            return "ibm/CP437.F19";
        case "IBM EGA 857":
            return "ibm/CP857.F14";
        case "IBM EGA43 857":
            return "ibm/CP857.F08";
        case "IBM VGA 858":
            return "ibm/CP437.F16";
        case "IBM VGA50 858":
            return "ibm/CP437.F08";
        case "IBM VGA25G 858":
            return "ibm/CP437.F19";
        case "IBM EGA 858":
            return "ibm/CP437.F14";
        case "IBM EGA43 858":
            return "ibm/CP437.F08";
        case "IBM VGA 860":
            return "ibm/CP860.F16";
        case "IBM VGA50 860":
            return "ibm/CP860.F08";
        case "IBM VGA25G 860":
            return "ibm/CP860.F19";
        case "IBM EGA 860":
            return "ibm/CP860.F14";
        case "IBM EGA43 860":
            return "ibm/CP860.F08";
        case "IBM VGA 861":
            return "ibm/CP861.F16";
        case "IBM VGA50 861":
            return "ibm/CP861.F08";
        case "IBM VGA25G 861":
            return "ibm/CP861.F19";
        case "IBM EGA 861":
            return "ibm/CP861.F14";
        case "IBM EGA43 861":
            return "ibm/CP861.F08";
        case "IBM VGA 862":
            return "ibm/CP862.F16";
        case "IBM VGA50 862":
            return "ibm/CP862.F08";
        case "IBM VGA25G 862":
            return "ibm/CP437.F19";
        case "IBM EGA 862":
            return "ibm/CP862.F14";
        case "IBM EGA43 862":
            return "ibm/CP862.F08";
        case "IBM VGA 863":
            return "ibm/CP863.F16";
        case "IBM VGA50 863":
            return "ibm/CP863.F08";
        case "IBM VGA25G 863":
            return "ibm/CP863.F19";
        case "IBM EGA 863":
            return "ibm/CP863.F14";
        case "IBM EGA43 863":
            return "ibm/CP863.F08";
        case "IBM VGA 864":
            return "ibm/CP864.F16";
        case "IBM VGA50 864":
            return "ibm/CP864.F08";
        case "IBM VGA25G 864":
            return "ibm/CP437.F19";
        case "IBM EGA 864":
            return "ibm/CP864.F14";
        case "IBM EGA43 864":
            return "ibm/CP864.F08";
        case "IBM VGA 865":
            return "ibm/CP865.F16";
        case "IBM VGA50 865":
            return "ibm/CP865.F08";
        case "IBM VGA25G 865":
            return "ibm/CP865.F19";
        case "IBM EGA 865":
            return "ibm/CP865.F14";
        case "IBM EGA43 865":
            return "ibm/CP865.F08";
        case "IBM VGA 869":
            return "ibm/CP869.F16";
        case "IBM VGA50 869":
            return "ibm/CP869.F08";
        case "IBM VGA25G 869":
            return "ibm/CP437.F19";
        case "IBM EGA 869":
            return "ibm/CP869.F14";
        case "IBM EGA43 869":
            return "ibm/CP869.F08";
        case "IBM VGA 872":
            return "ibm/CP437.F16";
        case "IBM VGA50 872":
            return "ibm/CP437.F08";
        case "IBM VGA25G 872":
            return "ibm/CP437.F19";
        case "IBM EGA 872":
            return "ibm/CP437.F14";
        case "IBM EGA43 872":
            return "ibm/CP437.F08";
        case "IBM VGA KAM":
            return "ibm/CP437.F16";
        case "IBM VGA50 KAM":
            return "ibm/CP437.F08";
        case "IBM VGA25G KAM":
            return "ibm/CP437.F19";
        case "IBM EGA KAM":
            return "ibm/CP437.F14";
        case "IBM EGA43 KAM":
            return "ibm/CP437.F08";
        case "IBM VGA MAZ":
            return "ibm/CP437.F16";
        case "IBM VGA50 MAZ":
            return "ibm/CP437.F08";
        case "IBM VGA25G MAZ":
            return "ibm/CP437.F19";
        case "IBM EGA MAZ":
            return "ibm/CP437.F14";
        case "IBM EGA43 MAZ":
            return "ibm/CP437.F08";
        case "IBM VGA MIK":
            return "ibm/CP866.F16";
        case "IBM VGA50 MIK":
            return "ibm/CP866.F08";
        case "IBM VGA25G MIK":
            return "ibm/CP437.F19";
        case "IBM EGA MIK":
            return "ibm/CP866.F14";
        case "IBM EGA43 MIK":
            return "ibm/CP866.F08";
        case "IBM VGA 667":
            return "ibm/CP437.F16";
        case "IBM VGA50 667":
            return "ibm/CP437.F08";
        case "IBM VGA25G 667":
            return "ibm/CP437.F19";
        case "IBM EGA 667":
            return "ibm/CP437.F14";
        case "IBM EGA43 667":
            return "ibm/CP437.F08";
        case "IBM VGA 790":
            return "ibm/CP437.F16";
        case "IBM VGA50 790":
            return "ibm/CP437.F08";
        case "IBM VGA25G 790":
            return "ibm/CP437.F19";
        case "IBM EGA 790":
            return "ibm/CP437.F14";
        case "IBM EGA43 790":
            return "ibm/CP437.F08";
        case "IBM VGA 866":
            return "ibm/CP866.F16";
        case "IBM VGA50 866":
            return "ibm/CP866.F08";
        case "IBM VGA25G 866":
            return "ibm/CP437.F19";
        case "IBM EGA 866":
            return "ibm/CP866.F14";
        case "IBM EGA43 866":
            return "ibm/CP866.F08";
        case "IBM VGA 867":
            return "ibm/CP437.F16";
        case "IBM VGA50 867":
            return "ibm/CP437.F08";
        case "IBM VGA25G 867":
            return "ibm/CP437.F19";
        case "IBM EGA 867":
            return "ibm/CP437.F14";
        case "IBM EGA43 867":
            return "ibm/CP437.F08";
        case "IBM VGA 895":
            return "ibm/CP437.F16";
        case "IBM VGA50 895":
            return "ibm/CP437.F08";
        case "IBM VGA25G 895":
            return "ibm/CP437.F19";
        case "IBM EGA 895":
            return "ibm/CP437.F14";
        case "IBM EGA43 895":
            return "ibm/CP437.F08";
        case "IBM VGA 991":
            return "ibm/CP437.F16";
        case "IBM VGA50 991":
            return "ibm/CP437.F08";
        case "IBM VGA25G 991":
            return "ibm/CP437.F19";
        case "IBM EGA 991":
            return "ibm/CP437.F14";
        case "IBM EGA43 991":
            return "ibm/CP437.F08";
        case "Amiga Topaz 1":
            return "amiga/TopazA500.F16";
        case "Amiga Topaz 1+":
            return "amiga/TopazPlusA500.F16";
        case "Amiga Topaz 2":
            return "amiga/TopazA1200.F16";
        case "Amiga Topaz 2+":
            return "amiga/TopazPlusA1200.F16";
        case "Amiga P0T-NOoDLE":
            return "amiga/P0T-NOoDLE.F16";
        case "Amiga MicroKnight":
            return "amiga/MicroKnight.F16";
        case "Amiga MicroKnight+":
            return "amiga/MicroKnightPlus.F16";
        case "Amiga mOsOul":
            return "amiga/mO'sOul.F16";
        case "C64 PETSCII unshifted":
            return "c64/PETSCII-unshifted.F08";
        case "C64 PETSCII shifted":
            return "c64/PETSCII-shifted.F08";
        default:
            throw `unknown font name: ${fontName}`;
    }
}
export default class Font {
    constructor(name) {
        this.glyphs = new Array(256);
        this.indexedGlyphs = Array.from({ length: 16 }, () => new Array(256));
        this.indexedBackground = new Array(16);
        this.file = getFileName(name);
    }
    drawCursorAt(ctx, column, row) {
        ctx.drawImage(this.cursor.canvas, column * this.width, row * this.height);
    }
    drawBackgroundAt(ctx, column, row, index) {
        if (this.indexedBackground[index] == null) {
            this.indexedBackground[index] = createContextWithRGB(this.width, this.height, ansiPalette[index]);
        }
        ctx.drawImage(this.indexedBackground[index].canvas, column * this.width, row * this.height);
    }
    clearAt(ctx, column, row) {
        this.drawBackgroundAt(ctx, column, row, 0);
    }
    drawCodeAt(ctx, code, column, row, fg, bg) {
        this.drawBackgroundAt(ctx, column, row, bg);
        if (this.indexedGlyphs[fg][code] == null) {
            if (this.glyphs[code] == null) {
                this.glyphs[code] = this.drawGlyph(code);
            }
            this.indexedGlyphs[fg][code] = sourceInCopy(this.glyphs[code], ansiPalette[fg]);
        }
        ctx.drawImage(this.indexedGlyphs[fg][code].canvas, column * this.width, row * this.height);
    }
    drawGlyph(code) {
        const ctx = createContext(this.width, this.height);
        const imageData = ctx.createImageData(this.width, this.height);
        let imageDataPos = 0;
        let bytePos = code * this.height;
        for (let y = 0; y < this.height; y++) {
            const byte = this.bytes[bytePos++];
            for (let x = 7; x >= 0; x--) {
                const bit = (byte >> x) & 1;
                if (bit == 1) {
                    imageData.data[imageDataPos++] = 255;
                    imageData.data[imageDataPos++] = 255;
                    imageData.data[imageDataPos++] = 255;
                    imageData.data[imageDataPos++] = 255;
                }
                else {
                    imageData.data[imageDataPos++] = 0;
                    imageData.data[imageDataPos++] = 0;
                    imageData.data[imageDataPos++] = 0;
                    imageData.data[imageDataPos++] = 0;
                }
            }
        }
        ctx.putImageData(imageData, 0, 0);
        ctx.globalCompositeOperation = "source-in";
        return ctx;
    }
    fetch(fontPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bytes = yield fetchBytes(`${fontPath}/${this.file}`);
            if (this.bytes.length % 256 != 0) {
                throw `invalid font file ${this.file}`;
            }
            this.width = 8;
            this.height = this.bytes.length / 256;
            if (this.height < 8 || this.height > 32) {
                throw `invalid font file ${this.file}`;
            }
            this.cursor = createContextWithRGB(this.width, this.height, white, this.height - 2);
            this.cursor.globalCompositeOperation = "difference";
        });
    }
}
