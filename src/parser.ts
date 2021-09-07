export enum SequenceType {
    Literal,
    CursorUp,
    CursorDown,
    CursorForward,
    CursorBack,
    HorizontalAndVerticalPosition,
    SetScreenMode,
    CursorPosition,
    EraseDisplay,
    EraseInLine,
    ResetScreenMode,
    SelectGraphicsRendition,
    SavePosition,
    TrueColor,
    RestorePosition,
    MusicalSequence,
    Unknown,
}

export class Sequence {
    public type: SequenceType;
    public data: Array<number | null>;
    public pos: number;

    constructor(type: SequenceType, data: Array<number | null>, pos: number) {
        this.type = type;
        this.data = data;
        this.pos = pos;
    }
}

class SequenceBuilder {
    data: Array<number | null> = [];
    currentValue: number | null = null;

    parseNumber(value: number) {
        if (this.currentValue == null) {
            this.currentValue = value;
        } else {
            this.currentValue = this.currentValue * 10 + value;
        }
    }

    push(value: number) {
        this.data.push(value);
    }

    empty(): boolean {
        return this.data.length == 0;
    }

    insertValue() {
        this.data.push(this.currentValue);
        if (this.currentValue != null) {
            this.currentValue = null;
        }
    }

    build(type: SequenceType, pos: number): Sequence {
        if (this.currentValue != null) {
            this.insertValue();
        }
        const data = Object.assign([], this.data);
        this.data = [];
        return new Sequence(type, data, pos);
    }
}

enum ParseState {
    Literal,
    Escape,
    Sequence,
    MusicalSequence,
}

export function parseSequences(bytes: Uint8Array): Sequence[] {
    let sequences: Sequence[] = [];
    let current: SequenceBuilder = new SequenceBuilder();
    let state: ParseState = ParseState.Literal;
    byteLoop: for (let pos = 0; pos < bytes.length; pos++) {
        const byte = bytes[pos];
        parseLoop: switch (state) {
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
                } else if (byte >= 0x40 && byte <= 0x7e) {
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
                            sequences.push(
                                current.build(SequenceType.HorizontalAndVerticalPosition, pos),
                            );
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
                            sequences.push(
                                current.build(SequenceType.SelectGraphicsRendition, pos),
                            );
                            break;
                        }
                        case 0x4d: {
                            // 'M'
                            state = ParseState.MusicalSequence;
                            current.push(byte);
                            break parseLoop;
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
                } else if (byte == 0x3b) {
                    // ';'
                    current.insertValue();
                }
                break;
            }
            case ParseState.MusicalSequence: {
                switch (byte) {
                    case 0x0e: {
                        // '♫'
                        state = ParseState.Literal;
                        const seq = current.build(SequenceType.MusicalSequence, pos);
                        sequences.push(seq);
                        current = new SequenceBuilder();
                        break;
                    }
                    default: {
                        current.push(byte);
                    }
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
