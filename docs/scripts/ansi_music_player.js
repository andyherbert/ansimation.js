var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const freqs = [
    65.406, 69.296, 73.416, 77.782, 82.406, 87.308, 92.498, 97.998, 103.826, 110.0, 116.54, 123.47,
    130.812, 138.592, 146.832, 155.564, 164.821, 174.614, 185.0, 195.998, 207.66, 220.0, 233.08,
    246.94, 261.62, 277.18, 296.66, 311.12, 329.62, 349.22, 370.0, 392.0, 415.3, 440.0, 466.16,
    493.88, 523.26, 554.36, 587.32, 622.26, 659.26, 698.46, 739.98, 784.0, 830.6, 880.0, 892.32,
    987.76, 1046.5, 1108.74, 1174.66, 1244.5, 1318.52, 1396.92, 1479.98, 1567.98, 1661.22, 1760.0,
    1864.66, 1975.54, 2093.0, 2217.4, 2349.4, 2489.0, 2637.0, 2793.8, 2960.0, 3136.0, 3322.4,
    3520.0, 3729.4, 3951.0, 4186.0, 4435.0, 4698.6, 4978.0, 5274.0, 5587.6, 5920.0, 6272.0, 6644.8,
    7040.0, 7458.6, 7902.2,
];
function getFrequency(octave, note, sharp, flat) {
    let index = octave * 12;
    switch (note) {
        case 2: {
            // 'C'
            index += 0;
            break;
        }
        case 3: {
            // 'D'
            index += 2;
            break;
        }
        case 4: {
            // 'E'
            index += 4;
            break;
        }
        case 5: {
            // 'F'
            index += 5;
            break;
        }
        case 6: {
            // 'G'
            index += 7;
            break;
        }
        case 0: {
            // 'A'
            index += 9;
            break;
        }
        case 1: {
            // 'B'
            index += 11;
            break;
        }
    }
    if (sharp) {
        index += 1;
    }
    else if (flat) {
        index -= 1;
    }
    return freqs[index];
}
export class Beeper {
    constructor() {
        this.ctx = new AudioContext();
        this.operation = Operation.Foreground;
        this.articulation = Articulation.Normal;
        this.tempo = 120;
        this.length = 1;
        this.octave = 4;
        this.oscillator = this.ctx.createOscillator();
        this.gain = this.ctx.createGain();
        this.oscillator.connect(this.gain);
        this.oscillator.type = "square";
        this.gain.connect(this.ctx.destination);
        this.oscillator.start();
        this.gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    }
    resumeIfSuspended() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ctx.state == "suspended") {
                yield this.ctx.resume();
            }
        });
    }
    playFreq(freq, length, dots, term) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullNote = (((60 * 1000) / this.tempo) * 4) / length;
            let noteLength = fullNote;
            switch (this.articulation) {
                case Articulation.Staccato: {
                    noteLength *= 3 / 4;
                    break;
                }
                case Articulation.Normal: {
                    noteLength *= 7 / 8;
                    break;
                }
                default: {
                    break;
                }
            }
            this.oscillator.frequency.setValueAtTime(freq, this.ctx.currentTime);
            let extra = 0;
            let countDots = dots;
            while (countDots > 0) {
                if (extra == 0) {
                    extra += noteLength * (1 / 2);
                }
                else {
                    extra += extra * (1 / 2);
                }
                countDots -= 1;
            }
            this.gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            yield term.pause(noteLength + extra);
            this.gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
            const pauseLength = fullNote - noteLength;
            if (pauseLength > 0) {
                yield new Promise((resolve) => setTimeout(resolve, pauseLength));
            }
        });
    }
    playKey(key, sharp, flat, length, dots, term) {
        return __awaiter(this, void 0, void 0, function* () {
            const freq = getFrequency(this.octave, key, sharp, flat);
            yield this.playFreq(freq, length, dots, term);
        });
    }
    pause(quarternotes, term) {
        return __awaiter(this, void 0, void 0, function* () {
            const ms = (((60 * 1000) / this.tempo) * 4) / quarternotes;
            yield term.pause(ms);
        });
    }
}
var Operation;
(function (Operation) {
    Operation[Operation["Foreground"] = 0] = "Foreground";
    Operation[Operation["Background"] = 1] = "Background";
})(Operation || (Operation = {}));
var Articulation;
(function (Articulation) {
    Articulation[Articulation["Normal"] = 0] = "Normal";
    Articulation[Articulation["Staccato"] = 1] = "Staccato";
    Articulation[Articulation["Legato"] = 2] = "Legato";
})(Articulation || (Articulation = {}));
function parseInt(bytes, start, term) {
    let numberString = "";
    for (let pos = start; pos < bytes.length; pos++) {
        const byte = bytes[pos];
        if (byte >= 0x30 && byte <= 0x39) {
            // '0'..'9'
            numberString = numberString.concat(String.fromCharCode(byte));
            term.drawCode(byte);
        }
        else {
            break;
        }
    }
    return numberString;
}
function parseDots(bytes, start, term) {
    let count = 0;
    for (let pos = start; pos < bytes.length; pos++) {
        const byte = bytes[pos];
        if (byte == 0x2e) {
            // '.'
            count += 1;
            term.drawCode(byte);
        }
        else {
            break;
        }
    }
    return count;
}
export class AnsiMusicPlayer {
    constructor(beeper) {
        this.beeper = beeper;
    }
    parse(bytes, term) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.beeper.resumeIfSuspended();
            for (let pos = 0; pos < bytes.length; pos++) {
                const byte = bytes[pos];
                term.drawCode(byte);
                if (byte >= 0x41 && byte <= 0x47) {
                    // 'A'..'G'
                    const note = byte - 0x41;
                    let sharp = false;
                    let flat = false;
                    switch (bytes[pos + 1]) {
                        case 0x23: {
                            // '#'
                            sharp = true;
                            pos += 1;
                            term.drawCode(byte);
                            break;
                        }
                        case 0x2b: {
                            // '+'
                            sharp = true;
                            pos += 1;
                            term.drawCode(byte);
                            break;
                        }
                        case 0x2d: {
                            // '-'
                            flat = true;
                            pos += 1;
                            term.drawCode(byte);
                            break;
                        }
                    }
                    const numberString = parseInt(bytes, pos + 1, term);
                    pos += numberString.length;
                    let length = this.beeper.length;
                    if (numberString.length != 0) {
                        length = Number.parseInt(numberString, 10);
                    }
                    const dots = parseDots(bytes, pos + 1, term);
                    pos += dots;
                    yield term.redraw();
                    yield this.beeper.playKey(note, sharp, flat, length, dots, term);
                }
                else {
                    switch (byte) {
                        case 0x3e: {
                            // '<'
                            this.beeper.octave = Math.max(0, this.beeper.octave - 1);
                            yield term.redraw();
                            break;
                        }
                        case 0x3c: {
                            // '>'
                            this.beeper.octave = Math.min(this.beeper.octave + 1, 6);
                            yield term.redraw();
                            break;
                        }
                        case 0x4c: {
                            // 'L'
                            const stringInt = parseInt(bytes, pos + 1, term);
                            pos += stringInt.length;
                            const newLength = Number.parseInt(stringInt);
                            if (newLength >= 1 && newLength <= 64) {
                                this.beeper.length = newLength;
                            }
                            break;
                        }
                        case 0x4e: {
                            // 'N'
                            const stringInt = parseInt(bytes, pos + 1, term);
                            pos += stringInt.length;
                            const note = Number.parseInt(stringInt);
                            if (note >= 0 && note <= 84) {
                                this.beeper.playFreq(freqs[note], this.beeper.length, 0, term);
                            }
                            break;
                        }
                        case 0x4f: {
                            // 'O'
                            const stringInt = parseInt(bytes, pos + 1, term);
                            pos += stringInt.length;
                            const newOctave = Number.parseInt(stringInt);
                            if (newOctave >= 0 && newOctave <= 6) {
                                this.beeper.octave = newOctave;
                            }
                            break;
                        }
                        case 0x50: {
                            // 'P'
                            const stringInt = parseInt(bytes, pos + 1, term);
                            pos += stringInt.length;
                            const pause = Number.parseInt(stringInt);
                            const dots = parseDots(bytes, pos + 1, term);
                            pos += dots;
                            if (pause >= 1 && pause <= 64) {
                                yield this.beeper.pause(pause, term);
                            }
                            break;
                        }
                        case 0x54: {
                            // 'T'
                            const stringInt = parseInt(bytes, pos + 1, term);
                            pos += stringInt.length;
                            const newTempo = Number.parseInt(stringInt);
                            if (newTempo >= 32 && newTempo <= 255) {
                                this.beeper.tempo = newTempo;
                            }
                            break;
                        }
                        case 0x4d: {
                            // 'M'
                            switch (bytes[pos + 1]) {
                                case 0x42: {
                                    // 'B'
                                    this.beeper.operation = Operation.Background;
                                    pos += 1;
                                    break;
                                }
                                case 0x46: {
                                    // 'F'
                                    this.beeper.operation = Operation.Foreground;
                                    pos += 1;
                                    break;
                                }
                                case 0x4c: {
                                    // 'L'
                                    this.beeper.articulation = Articulation.Legato;
                                    pos += 1;
                                    break;
                                }
                                case 0x4e: {
                                    // 'N'
                                    this.beeper.articulation = Articulation.Normal;
                                    pos += 1;
                                    break;
                                }
                                case 0x53: {
                                    // 'S'
                                    this.beeper.articulation = Articulation.Staccato;
                                    pos += 1;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }
        });
    }
}
