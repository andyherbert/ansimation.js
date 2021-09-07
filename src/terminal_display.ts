import Font from "./font.js";
import { createContext } from "./context.js";

enum BlinkState {
    On,
    Off,
}

class Cursor {
    column: number;
    row: number;

    constructor(column: number, row: number) {
        this.column = column;
        this.row = row;
    }

    clone() {
        return new Cursor(this.column, this.row);
    }
}

export class TerminalDisplay {
    columns: number;
    rows: number;
    font: Font;
    buffer: CanvasRenderingContext2D;
    blinkOn: CanvasRenderingContext2D;
    blinkOff: CanvasRenderingContext2D;
    empty: CanvasRenderingContext2D;
    background: CanvasRenderingContext2D;
    interval: number;
    blinkState: BlinkState = BlinkState.Off;
    cursor: Cursor = new Cursor(0, 0);
    savedCursor: Cursor | null = null;
    fg: number = 7;
    bg: number = 0;
    bold: boolean = false;
    blink: boolean = false;
    wrap: boolean = false;
    iceColors: boolean;
    showCursor: boolean;

    constructor(columns: number, rows: number, iceColors: boolean, showCursor: boolean) {
        this.columns = columns;
        this.rows = rows;
        this.iceColors = iceColors;
        this.showCursor = showCursor;
    }

    async redraw(): Promise<void> {
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
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
    }

    async fetchFont(fontName: string, fontPath: string, scale: number): Promise<HTMLCanvasElement> {
        this.font = new Font(fontName);
        await this.font.fetch(fontPath);
        const width = this.columns * this.font.width;
        const height = this.rows * this.font.height;
        this.buffer = createContext(width, height);
        this.blinkOn = createContext(width, height);
        this.blinkOff = createContext(width, height);
        await this.clearScreen();
        this.interval = setInterval(async () => {
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
        }, 250);
        this.buffer.canvas.style.cssText = `
        image-rendering: crisp-edges;
        image-rendering: pixelated;
        width: ${this.buffer.canvas.width * scale}px;
        height: ${this.buffer.canvas.height * scale}px;
        `;
        return this.buffer.canvas;
    }

    async clearScreen() {
        for (let column = 0; column < this.columns; column++) {
            for (let row = 0; row < this.rows; row++) {
                this.clearAt(column, row);
            }
        }
        this.moveCursorTo(0, 0);
        await this.redraw();
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

    clearAt(column: number, row: number) {
        this.font.clearAt(this.blinkOn, column, row);
        this.font.clearAt(this.blinkOff, column, row);
    }

    drawCode(code: number) {
        if (this.cursor.row == this.rows) {
            this.lineFeed();
        }
        if (this.iceColors) {
            const fg = this.bold ? this.fg + 8 : this.fg;
            const bg = this.blink ? this.bg + 8 : this.bg;
            this.font.drawCodeAt(this.blinkOn, code, this.cursor.column, this.cursor.row, fg, bg);
            this.font.drawCodeAt(this.blinkOff, code, this.cursor.column, this.cursor.row, fg, bg);
        } else {
            const fg = this.bold ? this.fg + 8 : this.fg;
            if (this.blink) {
                this.font.backgroundAt(this.blinkOn, this.cursor.column, this.cursor.row, this.bg);
            } else {
                this.font.drawCodeAt(
                    this.blinkOn,
                    code,
                    this.cursor.column,
                    this.cursor.row,
                    fg,
                    this.bg,
                );
            }
            this.font.drawCodeAt(
                this.blinkOff,
                code,
                this.cursor.column,
                this.cursor.row,
                fg,
                this.bg,
            );
        }
        if (this.cursor.column == this.columns - 1) {
            this.cursor.column = 0;
            this.cursor.row += 1;
        } else {
            this.cursor.column += 1;
        }
    }

    moveToColumn(column: number) {
        this.cursor.column = Math.min(Math.max(0, column), this.columns - 1);
    }

    moveToRow(row: number) {
        this.cursor.row = Math.min(Math.max(0, row), this.rows - 1);
    }

    moveCursorTo(column: number, row: number) {
        this.moveToColumn(column);
        this.moveToRow(row);
    }

    cursorUp(amount: number) {
        this.moveToRow(this.cursor.row - amount);
    }

    cursorDown(amount: number) {
        this.moveToRow(this.cursor.row + amount);
    }

    cursorForward(amount: number) {
        this.moveToColumn(this.cursor.column + amount);
    }

    cursorBack(amount: number) {
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
            } else {
                this.scrollUp();
                this.cursor.row -= 1;
            }
        } else {
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

    async pause(ms: number) {
        let frames = Math.ceil(ms / (1000 / 60));
        while (frames > 0) {
            await this.redraw();
            frames -= 1;
        }
    }
}
