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
class Cursor {
    constructor(column, row) {
        this.column = column;
        this.row = row;
    }
    clone() {
        return new Cursor(this.column, this.row);
    }
}
export class TerminalDisplay {
    constructor(columns, rows, iceColors, showCursor) {
        this.blinkState = BlinkState.Off;
        this.cursor = new Cursor(0, 0);
        this.savedCursor = null;
        this.fg = 7;
        this.bg = 0;
        this.bold = false;
        this.blink = false;
        this.wrap = false;
        this.columns = columns;
        this.rows = rows;
        this.iceColors = iceColors;
        this.showCursor = showCursor;
    }
    redraw() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => window.requestAnimationFrame(resolve));
            switch (this.blinkState) {
                case BlinkState.On: {
                    this.buffer.drawImage(this.blinkOn.canvas, 0, 0);
                    break;
                }
                case BlinkState.Off: {
                    this.buffer.drawImage(this.blinkOff.canvas, 0, 0);
                    if (this.showCursor) {
                        this.font.cursorAt(this.buffer, this.cursor.column, this.cursor.row);
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
            yield this.clearScreen();
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
    clearScreen() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let column = 0; column < this.columns; column++) {
                for (let row = 0; row < this.rows; row++) {
                    this.clearAt(column, row);
                }
            }
            this.moveCursorTo(0, 0);
            yield this.redraw();
        });
    }
    clearToEndOfLine() {
        if (this.cursor.row < this.rows) {
            for (let column = this.cursor.column; column < this.columns; column++) {
                this.clearAt(column, this.cursor.row);
            }
        }
    }
    clearToStartOfLine() {
        if (this.cursor.row < this.rows) {
            for (let column = 0; column <= this.cursor.column; column++) {
                this.clearAt(column, this.cursor.row);
            }
        }
    }
    clearLine() {
        if (this.cursor.row < this.rows) {
            for (let column = 0; column < this.columns; column++) {
                this.clearAt(column, this.cursor.row);
            }
        }
    }
    clearToEndOfDisplay() {
        this.clearToEndOfLine();
        for (let row = this.cursor.row + 1; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                this.clearAt(column, row);
            }
        }
    }
    clearToStartOfDisplay() {
        this.clearToStartOfLine();
        for (let row = 0; row < this.cursor.row; row++) {
            for (let column = 0; column < this.columns; column++) {
                this.clearAt(column, row);
            }
        }
    }
    clearAt(column, row) {
        this.font.clearAt(this.blinkOn, column, row);
        this.font.clearAt(this.blinkOff, column, row);
    }
    drawCode(code) {
        if (this.cursor.row == this.rows) {
            this.lineFeed();
        }
        if (this.iceColors) {
            const fg = this.bold ? this.fg + 8 : this.fg;
            const bg = this.blink ? this.bg + 8 : this.bg;
            this.font.drawCodeAt(this.blinkOn, code, this.cursor.column, this.cursor.row, fg, bg);
            this.font.drawCodeAt(this.blinkOff, code, this.cursor.column, this.cursor.row, fg, bg);
        }
        else {
            const fg = this.bold ? this.fg + 8 : this.fg;
            if (this.blink) {
                this.font.backgroundAt(this.blinkOn, this.cursor.column, this.cursor.row, this.bg);
            }
            else {
                this.font.drawCodeAt(this.blinkOn, code, this.cursor.column, this.cursor.row, fg, this.bg);
            }
            this.font.drawCodeAt(this.blinkOff, code, this.cursor.column, this.cursor.row, fg, this.bg);
        }
        if (this.cursor.column == this.columns - 1) {
            this.cursor.column = 0;
            this.cursor.row += 1;
        }
        else {
            this.cursor.column += 1;
        }
    }
    moveToColumn(column) {
        this.cursor.column = Math.min(Math.max(0, column), this.columns - 1);
    }
    moveToRow(row) {
        this.cursor.row = Math.min(Math.max(0, row), this.rows - 1);
    }
    moveCursorTo(column, row) {
        this.moveToColumn(column);
        this.moveToRow(row);
    }
    cursorUp(amount) {
        this.moveToRow(this.cursor.row - amount);
    }
    cursorDown(amount) {
        this.moveToRow(this.cursor.row + amount);
    }
    cursorForward(amount) {
        this.moveToColumn(this.cursor.column + amount);
    }
    cursorBack(amount) {
        this.moveToColumn(this.cursor.column - amount);
    }
    tab() {
        this.cursorForward(8);
    }
    carriageReturn() {
        this.cursor.column = 0;
    }
    scrollUp() {
        const sy = this.font.height;
        const width = this.buffer.canvas.width;
        const height = this.buffer.canvas.height - this.font.height;
        this.buffer.drawImage(this.buffer.canvas, 0, sy, width, height, 0, 0, width, height);
        this.blinkOn.drawImage(this.blinkOn.canvas, 0, sy, width, height, 0, 0, width, height);
        this.blinkOff.drawImage(this.blinkOff.canvas, 0, sy, width, height, 0, 0, width, height);
        for (let x = 0; x < this.columns - 1; x++) {
            this.clearAt(x, this.rows - 1);
        }
    }
    lineFeed() {
        if (this.cursor.row == this.rows) {
            if (this.wrap) {
                this.cursor.row = 0;
            }
            else {
                this.scrollUp();
                this.cursor.row -= 1;
            }
        }
        else {
            this.cursor.row += 1;
        }
    }
    saveCursor() {
        this.savedCursor = this.cursor.clone();
    }
    restoreCursor() {
        if (this.savedCursor != null) {
            this.moveCursorTo(this.savedCursor.column, this.savedCursor.row);
            this.savedCursor = null;
        }
    }
    pause(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            let frames = Math.ceil(ms / (1000 / 60));
            while (frames > 0) {
                yield this.redraw();
                frames -= 1;
            }
        });
    }
}
