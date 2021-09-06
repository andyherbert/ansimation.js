import Font from "./font.js";
import Rgb from "./rgb.js";
import { createContext } from "./context.js";

enum BlinkState {
    On,
    Off,
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
    cursorX: number = 0;
    cursorY: number = 0;

    constructor(columns: number, rows: number) {
        this.columns = columns;
        this.rows = rows;
    }

    async redraw(cursor: boolean): Promise<void> {
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        switch (this.blinkState) {
            case BlinkState.On: {
                this.buffer.drawImage(this.blinkOn.canvas, 0, 0);
                break;
            }
            case BlinkState.Off: {
                this.buffer.drawImage(this.blinkOff.canvas, 0, 0);
                if (cursor) {
                    this.font.cursorAt(
                        this.buffer,
                        this.cursorX * this.font.width,
                        this.cursorY * this.font.height,
                    );
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
        await this.clearScreen(false);
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

    async clearScreen(cursor: boolean) {
        for (let column = 0; column < this.columns; column++) {
            for (let row = 0; row < this.rows; row++) {
                this.clearAt(column, row);
            }
        }
        await this.redraw(cursor);
    }

    clearAt(column: number, row: number) {
        const x = column * this.font.width;
        const y = row * this.font.height;
        this.font.clearAt(this.blinkOn, x, y);
        this.font.clearAt(this.blinkOff, x, y);
    }

    drawCode(code: number, fg: Rgb, bg: Rgb, blink: boolean, wrap: boolean) {
        if (this.cursorY == this.rows) {
            this.lineFeed(wrap);
        }
        const x = this.cursorX * this.font.width;
        const y = this.cursorY * this.font.height;
        if (blink) {
            this.font.backgroundAt(this.blinkOn, x, y, bg);
        } else {
            this.font.drawCodeAt(this.blinkOn, code, x, y, fg, bg);
        }
        this.font.drawCodeAt(this.blinkOff, code, x, y, fg, bg);
        this.advanceCursor();
    }

    moveCursorTo(column: number, row: number) {
        this.cursorX = Math.min(Math.max(0, column), this.columns - 1);
        this.cursorY = Math.min(Math.max(0, row), this.rows - 1);
    }

    cursorUp(count: number) {
        for (let i = 0; i < count; i++) {
            if (this.cursorY == 0) {
                break;
            }
            this.cursorY -= 1;
        }
    }

    cursorDown(count: number) {
        for (let i = 0; i < count; i++) {
            if (this.cursorY == this.rows - 1) {
                break;
            }
            this.cursorY += 1;
        }
    }

    cursorForward(count: number) {
        for (let i = 0; i < count; i++) {
            if (this.cursorX == this.columns - 1) {
                break;
            }
            this.cursorX += 1;
        }
    }

    cursorBack(count: number) {
        for (let i = 0; i < count; i++) {
            if (this.cursorX == 0) {
                break;
            }
            this.cursorX -= 1;
        }
    }

    carriageReturn() {
        this.cursorX = 0;
    }

    lineFeed(wrap: boolean) {
        if (this.cursorY == this.rows) {
            if (wrap) {
                this.cursorY = 0;
            } else {
                const sy = this.font.height;
                const width = this.buffer.canvas.width;
                const height = this.buffer.canvas.height - this.font.height;
                this.buffer.drawImage(
                    this.buffer.canvas,
                    0,
                    sy,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height,
                );
                this.blinkOn.drawImage(
                    this.blinkOn.canvas,
                    0,
                    sy,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height,
                );
                this.blinkOff.drawImage(
                    this.blinkOff.canvas,
                    0,
                    sy,
                    width,
                    height,
                    0,
                    0,
                    width,
                    height,
                );
                for (let x = 0; x < this.columns - 1; x++) {
                    this.clearAt(x, this.rows - 1);
                }
                this.cursorY -= 1;
            }
        } else {
            this.cursorY += 1;
        }
    }

    advanceCursor() {
        if (this.cursorX == this.columns - 1) {
            this.cursorX = 0;
            this.cursorY += 1;
        } else {
            this.cursorX += 1;
        }
    }
}
