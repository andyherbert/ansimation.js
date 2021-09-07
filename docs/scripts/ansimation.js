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
import { parseSequences, SequenceType } from "./parser.js";
import { TerminalDisplay } from "./terminal_display.js";
function terminalDisplayPlayer(term, sequences, terminalBlink, baud, cursor) {
    return () => __awaiter(this, void 0, void 0, function* () {
        const charsPerFrame = baud / 8 / 60;
        let charCount = 0;
        let fg = 7;
        let bg = 0;
        let bold = false;
        let blink = false;
        let savedCursorPositionX = null;
        let savedCursorPositionY = null;
        let wrap = false;
        for (const sequence of sequences) {
            switch (sequence.type) {
                case SequenceType.Literal: {
                    for (const code of sequence.data) {
                        switch (code) {
                            case 9: {
                                term.tab();
                                break;
                            }
                            case 13: {
                                term.carriageReturn();
                                break;
                            }
                            case 10: {
                                term.lineFeed(wrap);
                                break;
                            }
                            default: {
                                if (terminalBlink) {
                                    term.drawCode(code, bold ? fg + 8 : fg, bg, blink && terminalBlink, wrap);
                                }
                                else {
                                    term.drawCode(code, bold ? fg + 8 : fg, blink ? bg + 8 : bg, false, wrap);
                                }
                                while (sequence.pos > charCount) {
                                    charCount += charsPerFrame;
                                    yield term.redraw(cursor);
                                }
                                break;
                            }
                        }
                    }
                    break;
                }
                case SequenceType.SelectGraphicsRendition: {
                    for (const code of sequence.data) {
                        if (code == 0) {
                            fg = 7;
                            bg = 0;
                            bold = false;
                            blink = false;
                        }
                        else if (code == 1) {
                            bold = true;
                        }
                        else if (code == 5) {
                            blink = true;
                        }
                        else if (code >= 30 && code <= 37) {
                            fg = code - 30;
                        }
                        else if (code >= 40 && code <= 47) {
                            bg = code - 40;
                        }
                    }
                    break;
                }
                case SequenceType.SavePosition: {
                    term.saveCursor();
                    break;
                }
                case SequenceType.RestorePosition: {
                    term.restoreCursor();
                    break;
                }
                case SequenceType.CursorUp: {
                    const count = sequence.data[0] == null ? 1 : sequence.data[0];
                    term.cursorUp(count);
                    break;
                }
                case SequenceType.CursorDown: {
                    const count = sequence.data[0] == null ? 1 : sequence.data[0];
                    term.cursorDown(count);
                    break;
                }
                case SequenceType.CursorForward: {
                    const count = sequence.data[0] == null ? 1 : sequence.data[0];
                    term.cursorForward(count);
                    break;
                }
                case SequenceType.CursorBack: {
                    const count = sequence.data[0] == null ? 1 : sequence.data[0];
                    term.cursorBack(count);
                    break;
                }
                case SequenceType.CursorPosition: {
                    const row = sequence.data[0] == null ? 1 : sequence.data[0];
                    const column = sequence.data[1] == null ? 1 : sequence.data[1];
                    term.moveCursorTo(column - 1, row - 1);
                    break;
                }
                case SequenceType.EraseDisplay: {
                    const code = sequence.data[0] == null ? 0 : sequence.data[0];
                    switch (code) {
                        case 0: {
                            term.clearToEndOfDisplay();
                            break;
                        }
                        case 1: {
                            term.clearToStartOfDisplay();
                            break;
                        }
                        case 2: {
                            yield term.clearScreen(cursor);
                            break;
                        }
                    }
                    break;
                }
                case SequenceType.EraseInLine: {
                    const code = sequence.data[0] == null ? 0 : sequence.data[0];
                    switch (code) {
                        case 0: {
                            term.clearToEndOfLine();
                            break;
                        }
                        case 1: {
                            term.clearToStartOfLine();
                            break;
                        }
                        case 2: {
                            term.clearLine();
                            break;
                        }
                    }
                    break;
                }
                case SequenceType.SetScreenMode: {
                    if (sequence.data[0] == 7) {
                        wrap = true;
                    }
                    break;
                }
                case SequenceType.ResetScreenMode: {
                    if (sequence.data[0] == 7) {
                        wrap = true;
                    }
                    break;
                }
                default: {
                    console.log(sequence.type);
                    break;
                }
            }
        }
        while (true) {
            yield term.redraw(cursor);
        }
    });
}
export function terminalDisplay(url, { scale = 1.0, fontName = "IBM VGA", fontPath = "./", cursor = true, } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const term = new TerminalDisplay(80, 25);
        const canvas = yield term.fetchFont(fontName, fontPath, scale);
        const bytes = yield fetchBytes(url);
        const sequences = parseSequences(bytes);
        return {
            canvas,
            play: terminalDisplayPlayer(term, sequences, true, 57600, cursor),
        };
    });
}
