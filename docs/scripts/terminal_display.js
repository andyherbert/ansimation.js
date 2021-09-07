var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Font from "./font.js";
import { createContext } from "./context.js";
var BlinkState;
(function (BlinkState) {
    BlinkState[BlinkState["On"] = 0] = "On";
    BlinkState[BlinkState["Off"] = 1] = "Off";
})(BlinkState || (BlinkState = {}));
export class TerminalDisplay {
    constructor(columns, rows) {
        this.blinkState = BlinkState.Off;
        this.cursorCol = 0;
        this.cursorRow = 0;
        this.columns = columns;
        this.rows = rows;
    }
    redraw(cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => window.requestAnimationFrame(resolve));
            switch (this.blinkState) {
                case BlinkState.On: {
                    this.buffer.drawImage(this.blinkOn.canvas, 0, 0);
                    break;
                }
                case BlinkState.Off: {
                    this.buffer.drawImage(this.blinkOff.canvas, 0, 0);
                    if (cursor) {
                        this.font.cursorAt(this.buffer, this.cursorCol, this.cursorRow);
                    }
                    break;
                }
            }
        });
    }
    fetchFont(fontName, fontPath, scale) {
        return __awaiter(this, void 0, void 0, function* () {
            this.font = new Font(fontName);
            yield this.font.fetch(fontPath);
            const width = this.columns * this.font.width;
            const height = this.rows * this.font.height;
            this.buffer = createContext(width, height);
            this.blinkOn = createContext(width, height);
            this.blinkOff = createContext(width, height);
            yield this.clearScreen(false);
            this.interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                switch (this.blinkState) {
                    case BlinkState.On: {
                        this.blinkState = BlinkState.Off;
                        break;
                    }
                    case BlinkState.Off: {
                        this.blinkState = BlinkState.On;
                        break;
                    }
                }
            }), 250);
            this.buffer.canvas.style.cssText = `
        image-rendering: crisp-edges;
        image-rendering: pixelated;
        width: ${this.buffer.canvas.width * scale}px;
        height: ${this.buffer.canvas.height * scale}px;
        `;
            return this.buffer.canvas;
        });
    }
    clearScreen(cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let column = 0; column < this.columns; column++) {
                for (let row = 0; row < this.rows; row++) {
                    this.clearAt(column, row);
                }
            }
            yield this.redraw(cursor);
        });
    }
    clearAt(column, row) {
        this.font.clearAt(this.blinkOn, column, row);
        this.font.clearAt(this.blinkOff, column, row);
    }
    drawCode(code, fg, bg, blink, wrap) {
        if (this.cursorRow == this.rows) {
            this.lineFeed(wrap);
        }
        if (blink) {
            this.font.backgroundAt(this.blinkOn, this.cursorCol, this.cursorRow, bg);
        }
        else {
            this.font.drawCodeAt(this.blinkOn, code, this.cursorCol, this.cursorRow, fg, bg);
        }
        this.font.drawCodeAt(this.blinkOff, code, this.cursorCol, this.cursorRow, fg, bg);
        this.advanceCursor();
    }
    moveCursorTo(column, row) {
        this.cursorCol = Math.min(Math.max(0, column), this.columns - 1);
        this.cursorRow = Math.min(Math.max(0, row), this.rows - 1);
    }
    cursorUp(count) {
        for (let i = 0; i < count; i++) {
            if (this.cursorRow == 0) {
                break;
            }
            this.cursorRow -= 1;
        }
    }
    cursorDown(count) {
        for (let i = 0; i < count; i++) {
            if (this.cursorRow == this.rows - 1) {
                break;
            }
            this.cursorRow += 1;
        }
    }
    cursorForward(count) {
        for (let i = 0; i < count; i++) {
            if (this.cursorCol == this.columns - 1) {
                break;
            }
            this.cursorCol += 1;
        }
    }
    cursorBack(count) {
        for (let i = 0; i < count; i++) {
            if (this.cursorCol == 0) {
                break;
            }
            this.cursorCol -= 1;
        }
    }
    tab() {
        this.cursorForward(8);
    }
    carriageReturn() {
        this.cursorCol = 0;
    }
    lineFeed(wrap) {
        if (this.cursorRow == this.rows) {
            if (wrap) {
                this.cursorRow = 0;
            }
            else {
                const sy = this.font.height;
                const width = this.buffer.canvas.width;
                const height = this.buffer.canvas.height - this.font.height;
                this.buffer.drawImage(this.buffer.canvas, 0, sy, width, height, 0, 0, width, height);
                this.blinkOn.drawImage(this.blinkOn.canvas, 0, sy, width, height, 0, 0, width, height);
                this.blinkOff.drawImage(this.blinkOff.canvas, 0, sy, width, height, 0, 0, width, height);
                for (let x = 0; x < this.columns - 1; x++) {
                    this.clearAt(x, this.rows - 1);
                }
                this.cursorRow -= 1;
            }
        }
        else {
            this.cursorRow += 1;
        }
    }
    advanceCursor() {
        if (this.cursorCol == this.columns - 1) {
            this.cursorCol = 0;
            this.cursorRow += 1;
        }
        else {
            this.cursorCol += 1;
        }
    }
}
