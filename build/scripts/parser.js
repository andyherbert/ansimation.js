export var SequenceType;
(function (SequenceType) {
    SequenceType[SequenceType["Literal"] = 0] = "Literal";
    SequenceType[SequenceType["CursorUp"] = 1] = "CursorUp";
    SequenceType[SequenceType["CursorDown"] = 2] = "CursorDown";
    SequenceType[SequenceType["CursorForward"] = 3] = "CursorForward";
    SequenceType[SequenceType["CursorBack"] = 4] = "CursorBack";
    SequenceType[SequenceType["HorizontalAndVerticalPosition"] = 5] = "HorizontalAndVerticalPosition";
    SequenceType[SequenceType["SetScreenMode"] = 6] = "SetScreenMode";
    SequenceType[SequenceType["CursorPosition"] = 7] = "CursorPosition";
    SequenceType[SequenceType["EraseDisplay"] = 8] = "EraseDisplay";
    SequenceType[SequenceType["EraseInLine"] = 9] = "EraseInLine";
    SequenceType[SequenceType["ResetScreenMode"] = 10] = "ResetScreenMode";
    SequenceType[SequenceType["SelectGraphicsRendition"] = 11] = "SelectGraphicsRendition";
    SequenceType[SequenceType["SavePosition"] = 12] = "SavePosition";
    SequenceType[SequenceType["TrueColor"] = 13] = "TrueColor";
    SequenceType[SequenceType["RestorePosition"] = 14] = "RestorePosition";
    SequenceType[SequenceType["Unknown"] = 15] = "Unknown";
})(SequenceType || (SequenceType = {}));
export class Sequence {
    constructor(type, data, pos) {
        this.type = type;
        this.data = data;
        this.pos = pos;
    }
}
class SequenceBuilder {
    constructor() {
        this.data = [];
        this.currentValue = null;
    }
    parseNumber(value) {
        if (this.currentValue == null) {
            this.currentValue = value;
        }
        else {
            this.currentValue = this.currentValue * 10 + value;
        }
    }
    push(value) {
        this.data.push(value);
    }
    empty() {
        return this.data.length == 0;
    }
    insertValue() {
        this.data.push(this.currentValue);
        if (this.currentValue != null) {
            this.currentValue = null;
        }
    }
    build(type, pos) {
        if (this.currentValue != null) {
            this.insertValue();
        }
        const data = Object.assign([], this.data);
        this.data = [];
        return new Sequence(type, data, pos);
    }
}
var ParseState;
(function (ParseState) {
    ParseState[ParseState["Literal"] = 0] = "Literal";
    ParseState[ParseState["Escape"] = 1] = "Escape";
    ParseState[ParseState["Sequence"] = 2] = "Sequence";
})(ParseState || (ParseState = {}));
export function parseSequences(bytes) {
    let sequences = [];
    let current = new SequenceBuilder();
    let state = ParseState.Literal;
    byteLoop: for (let pos = 0; pos < bytes.length; pos++) {
        const byte = bytes[pos];
        switch (state) {
            case ParseState.Literal: {
                switch (byte) {
                    case 0x1a: {
                        // EOF
                        break byteLoop;
                    }
                    case 0x1b: {
                        // Escape
                        state = ParseState.Escape;
                        break;
                    }
                    default: {
                        current.push(byte);
                        sequences.push(current.build(SequenceType.Literal, pos));
                        current = new SequenceBuilder();
                        break;
                    }
                }
                break;
            }
            case ParseState.Escape: {
                switch (byte) {
                    case 0x5b: {
                        // '['
                        state = ParseState.Sequence;
                        if (!current.empty()) {
                            sequences.push(current.build(SequenceType.Literal, pos));
                            current = new SequenceBuilder();
                        }
                        break;
                    }
                    default: {
                        state = ParseState.Literal;
                        current.push(0x1b); // escape
                        sequences.push(current.build(SequenceType.Literal, pos));
                        current = new SequenceBuilder();
                        break;
                    }
                }
                break;
            }
            case ParseState.Sequence: {
                if (byte >= 0x30 && byte <= 0x39) {
                    // '0' -> '9'
                    current.parseNumber(byte - 0x30);
                }
                else if (byte >= 0x40 && byte <= 0x7e) {
                    // '@' -> '~'
                    state = ParseState.Literal;
                    switch (byte) {
                        case 0x41: {
                            // 'A'
                            sequences.push(current.build(SequenceType.CursorUp, pos));
                            break;
                        }
                        case 0x42: {
                            // 'B'
                            sequences.push(current.build(SequenceType.CursorDown, pos));
                            break;
                        }
                        case 0x43: {
                            // 'C'
                            sequences.push(current.build(SequenceType.CursorForward, pos));
                            break;
                        }
                        case 0x44: {
                            // 'D'
                            sequences.push(current.build(SequenceType.CursorBack, pos));
                            break;
                        }
                        case 0x66: {
                            // 'f'
                            sequences.push(current.build(SequenceType.HorizontalAndVerticalPosition, pos));
                            break;
                        }
                        case 0x68: {
                            // 'h'
                            sequences.push(current.build(SequenceType.SetScreenMode, pos));
                            break;
                        }
                        case 0x48: {
                            // 'H'
                            sequences.push(current.build(SequenceType.CursorPosition, pos));
                            break;
                        }
                        case 0x4a: {
                            // 'J'
                            sequences.push(current.build(SequenceType.EraseDisplay, pos));
                            break;
                        }
                        case 0x4b: {
                            // 'K'
                            sequences.push(current.build(SequenceType.EraseInLine, pos));
                            break;
                        }
                        case 0x6c: {
                            // 'l'
                            sequences.push(current.build(SequenceType.ResetScreenMode, pos));
                            break;
                        }
                        case 0x6d: {
                            // 'm'
                            sequences.push(current.build(SequenceType.SelectGraphicsRendition, pos));
                            break;
                        }
                        case 0x73: {
                            // 's'
                            sequences.push(current.build(SequenceType.SavePosition, pos));
                            break;
                        }
                        case 0x73: {
                            // 't'
                            sequences.push(current.build(SequenceType.TrueColor, pos));
                            break;
                        }
                        case 0x75: {
                            // 'u'
                            sequences.push(current.build(SequenceType.RestorePosition, pos));
                            break;
                        }
                        default: {
                            // unknown
                            const seq = current.build(SequenceType.Unknown, pos);
                            sequences.push(seq);
                            break;
                        }
                    }
                    current = new SequenceBuilder();
                }
                else if (byte == 0x3b) {
                    // ';'
                    current.insertValue();
                }
                break;
            }
        }
    }
    if (state == ParseState.Literal && !current.empty()) {
        sequences.push(current.build(SequenceType.Literal, bytes.length));
    }
    return sequences;
}
