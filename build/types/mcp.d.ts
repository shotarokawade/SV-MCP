import { z } from "zod";
export declare const NoteLocatorSchema: z.ZodObject<{
    trackIndex: z.ZodOptional<z.ZodNumber>;
    groupIndex: z.ZodOptional<z.ZodNumber>;
    noteIndex: z.ZodOptional<z.ZodNumber>;
    onset: z.ZodOptional<z.ZodNumber>;
    pitch: z.ZodOptional<z.ZodNumber>;
    lyrics: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    noteIndex?: number | undefined;
    onset?: number | undefined;
    pitch?: number | undefined;
    lyrics?: string | undefined;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    noteIndex?: number | undefined;
    onset?: number | undefined;
    pitch?: number | undefined;
    lyrics?: string | undefined;
}>;
export declare const PhonemeAttributeSchema: z.ZodObject<{
    symbol: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    leftOffset: z.ZodOptional<z.ZodNumber>;
    position: z.ZodOptional<z.ZodNumber>;
    activity: z.ZodOptional<z.ZodNumber>;
    strength: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    symbol?: string | undefined;
    language?: string | undefined;
    leftOffset?: number | undefined;
    position?: number | undefined;
    activity?: number | undefined;
    strength?: number | undefined;
}, {
    symbol?: string | undefined;
    language?: string | undefined;
    leftOffset?: number | undefined;
    position?: number | undefined;
    activity?: number | undefined;
    strength?: number | undefined;
}>;
export declare const NoteAttributesSchema: z.ZodObject<{
    rTone: z.ZodOptional<z.ZodNumber>;
    rIntonation: z.ZodOptional<z.ZodNumber>;
    dF0VbrMod: z.ZodOptional<z.ZodNumber>;
    expValueX: z.ZodOptional<z.ZodNumber>;
    expValueY: z.ZodOptional<z.ZodNumber>;
    phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        symbol: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        leftOffset: z.ZodOptional<z.ZodNumber>;
        position: z.ZodOptional<z.ZodNumber>;
        activity: z.ZodOptional<z.ZodNumber>;
        strength: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol?: string | undefined;
        language?: string | undefined;
        leftOffset?: number | undefined;
        position?: number | undefined;
        activity?: number | undefined;
        strength?: number | undefined;
    }, {
        symbol?: string | undefined;
        language?: string | undefined;
        leftOffset?: number | undefined;
        position?: number | undefined;
        activity?: number | undefined;
        strength?: number | undefined;
    }>, "many">>;
    muted: z.ZodOptional<z.ZodBoolean>;
    evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
    languageOverride: z.ZodOptional<z.ZodString>;
    phonesetOverride: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    rTone: z.ZodOptional<z.ZodNumber>;
    rIntonation: z.ZodOptional<z.ZodNumber>;
    dF0VbrMod: z.ZodOptional<z.ZodNumber>;
    expValueX: z.ZodOptional<z.ZodNumber>;
    expValueY: z.ZodOptional<z.ZodNumber>;
    phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        symbol: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        leftOffset: z.ZodOptional<z.ZodNumber>;
        position: z.ZodOptional<z.ZodNumber>;
        activity: z.ZodOptional<z.ZodNumber>;
        strength: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol?: string | undefined;
        language?: string | undefined;
        leftOffset?: number | undefined;
        position?: number | undefined;
        activity?: number | undefined;
        strength?: number | undefined;
    }, {
        symbol?: string | undefined;
        language?: string | undefined;
        leftOffset?: number | undefined;
        position?: number | undefined;
        activity?: number | undefined;
        strength?: number | undefined;
    }>, "many">>;
    muted: z.ZodOptional<z.ZodBoolean>;
    evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
    languageOverride: z.ZodOptional<z.ZodString>;
    phonesetOverride: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    rTone: z.ZodOptional<z.ZodNumber>;
    rIntonation: z.ZodOptional<z.ZodNumber>;
    dF0VbrMod: z.ZodOptional<z.ZodNumber>;
    expValueX: z.ZodOptional<z.ZodNumber>;
    expValueY: z.ZodOptional<z.ZodNumber>;
    phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        symbol: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodString>;
        leftOffset: z.ZodOptional<z.ZodNumber>;
        position: z.ZodOptional<z.ZodNumber>;
        activity: z.ZodOptional<z.ZodNumber>;
        strength: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        symbol?: string | undefined;
        language?: string | undefined;
        leftOffset?: number | undefined;
        position?: number | undefined;
        activity?: number | undefined;
        strength?: number | undefined;
    }, {
        symbol?: string | undefined;
        language?: string | undefined;
        leftOffset?: number | undefined;
        position?: number | undefined;
        activity?: number | undefined;
        strength?: number | undefined;
    }>, "many">>;
    muted: z.ZodOptional<z.ZodBoolean>;
    evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
    languageOverride: z.ZodOptional<z.ZodString>;
    phonesetOverride: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const NoteDefinitionSchema: z.ZodObject<{
    onset: z.ZodNumber;
    duration: z.ZodNumber;
    pitch: z.ZodNumber;
    lyrics: z.ZodDefault<z.ZodString>;
    phonemes: z.ZodOptional<z.ZodString>;
    languageOverride: z.ZodOptional<z.ZodString>;
    musicalType: z.ZodOptional<z.ZodEnum<["sing", "rap"]>>;
    detune: z.ZodOptional<z.ZodNumber>;
    attributes: z.ZodOptional<z.ZodObject<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    onset: number;
    pitch: number;
    lyrics: string;
    duration: number;
    phonemes?: string | undefined;
    languageOverride?: string | undefined;
    musicalType?: "sing" | "rap" | undefined;
    detune?: number | undefined;
    attributes?: z.objectOutputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    onset: number;
    pitch: number;
    duration: number;
    lyrics?: string | undefined;
    phonemes?: string | undefined;
    languageOverride?: string | undefined;
    musicalType?: "sing" | "rap" | undefined;
    detune?: number | undefined;
    attributes?: z.objectInputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const NoteUpdateSchema: z.ZodObject<{
    noteIndex: z.ZodOptional<z.ZodNumber>;
    locator: z.ZodOptional<z.ZodObject<{
        trackIndex: z.ZodOptional<z.ZodNumber>;
        groupIndex: z.ZodOptional<z.ZodNumber>;
        noteIndex: z.ZodOptional<z.ZodNumber>;
        onset: z.ZodOptional<z.ZodNumber>;
        pitch: z.ZodOptional<z.ZodNumber>;
        lyrics: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    }, {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    }>>;
    onset: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    pitch: z.ZodOptional<z.ZodNumber>;
    lyrics: z.ZodOptional<z.ZodString>;
    phonemes: z.ZodOptional<z.ZodString>;
    languageOverride: z.ZodOptional<z.ZodString>;
    musicalType: z.ZodOptional<z.ZodEnum<["sing", "rap"]>>;
    detune: z.ZodOptional<z.ZodNumber>;
    attributes: z.ZodOptional<z.ZodObject<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    noteIndex?: number | undefined;
    onset?: number | undefined;
    pitch?: number | undefined;
    lyrics?: string | undefined;
    phonemes?: string | undefined;
    languageOverride?: string | undefined;
    duration?: number | undefined;
    musicalType?: "sing" | "rap" | undefined;
    detune?: number | undefined;
    attributes?: z.objectOutputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    locator?: {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    } | undefined;
}, {
    noteIndex?: number | undefined;
    onset?: number | undefined;
    pitch?: number | undefined;
    lyrics?: string | undefined;
    phonemes?: string | undefined;
    languageOverride?: string | undefined;
    duration?: number | undefined;
    musicalType?: "sing" | "rap" | undefined;
    detune?: number | undefined;
    attributes?: z.objectInputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    locator?: {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    } | undefined;
}>;
export declare const PhonemeAssignmentSchema: z.ZodObject<{
    noteIndex: z.ZodOptional<z.ZodNumber>;
    locator: z.ZodOptional<z.ZodObject<{
        trackIndex: z.ZodOptional<z.ZodNumber>;
        groupIndex: z.ZodOptional<z.ZodNumber>;
        noteIndex: z.ZodOptional<z.ZodNumber>;
        onset: z.ZodOptional<z.ZodNumber>;
        pitch: z.ZodOptional<z.ZodNumber>;
        lyrics: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    }, {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    }>>;
    phonemes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phonemes: string;
    noteIndex?: number | undefined;
    locator?: {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    } | undefined;
}, {
    phonemes: string;
    noteIndex?: number | undefined;
    locator?: {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    } | undefined;
}>;
export declare const VoiceSettingsSchema: z.ZodObject<{
    paramLoudness: z.ZodOptional<z.ZodNumber>;
    paramTension: z.ZodOptional<z.ZodNumber>;
    paramBreathiness: z.ZodOptional<z.ZodNumber>;
    paramGender: z.ZodOptional<z.ZodNumber>;
    paramToneShift: z.ZodOptional<z.ZodNumber>;
    vocalModeParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        pitch: z.ZodOptional<z.ZodNumber>;
        timbre: z.ZodOptional<z.ZodNumber>;
        pronunciation: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        pitch?: number | undefined;
        timbre?: number | undefined;
        pronunciation?: number | undefined;
    }, {
        pitch?: number | undefined;
        timbre?: number | undefined;
        pronunciation?: number | undefined;
    }>>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    paramLoudness: z.ZodOptional<z.ZodNumber>;
    paramTension: z.ZodOptional<z.ZodNumber>;
    paramBreathiness: z.ZodOptional<z.ZodNumber>;
    paramGender: z.ZodOptional<z.ZodNumber>;
    paramToneShift: z.ZodOptional<z.ZodNumber>;
    vocalModeParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        pitch: z.ZodOptional<z.ZodNumber>;
        timbre: z.ZodOptional<z.ZodNumber>;
        pronunciation: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        pitch?: number | undefined;
        timbre?: number | undefined;
        pronunciation?: number | undefined;
    }, {
        pitch?: number | undefined;
        timbre?: number | undefined;
        pronunciation?: number | undefined;
    }>>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    paramLoudness: z.ZodOptional<z.ZodNumber>;
    paramTension: z.ZodOptional<z.ZodNumber>;
    paramBreathiness: z.ZodOptional<z.ZodNumber>;
    paramGender: z.ZodOptional<z.ZodNumber>;
    paramToneShift: z.ZodOptional<z.ZodNumber>;
    vocalModeParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        pitch: z.ZodOptional<z.ZodNumber>;
        timbre: z.ZodOptional<z.ZodNumber>;
        pronunciation: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        pitch?: number | undefined;
        timbre?: number | undefined;
        pronunciation?: number | undefined;
    }, {
        pitch?: number | undefined;
        timbre?: number | undefined;
        pronunciation?: number | undefined;
    }>>>;
}, z.ZodTypeAny, "passthrough">>;
export declare const GetServerStatusSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const OpenProjectFileSchema: z.ZodObject<{
    path: z.ZodString;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    allowReplaceCurrentProject: z.ZodDefault<z.ZodBoolean>;
    application: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    dry_run: boolean;
    allowReplaceCurrentProject: boolean;
    application?: string | undefined;
}, {
    path: string;
    dry_run?: boolean | undefined;
    allowReplaceCurrentProject?: boolean | undefined;
    application?: string | undefined;
}>;
export declare const GetProjectInfoSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ListTracksSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ListGroupsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const GetNotesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const FindNotesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    minOnset: z.ZodOptional<z.ZodNumber>;
    maxOnset: z.ZodOptional<z.ZodNumber>;
    minPitch: z.ZodOptional<z.ZodNumber>;
    maxPitch: z.ZodOptional<z.ZodNumber>;
    lyricsPattern: z.ZodOptional<z.ZodString>;
    phonemesPattern: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    minOnset?: number | undefined;
    maxOnset?: number | undefined;
    minPitch?: number | undefined;
    maxPitch?: number | undefined;
    lyricsPattern?: string | undefined;
    phonemesPattern?: string | undefined;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    minOnset?: number | undefined;
    maxOnset?: number | undefined;
    minPitch?: number | undefined;
    maxPitch?: number | undefined;
    lyricsPattern?: string | undefined;
    phonemesPattern?: string | undefined;
}>;
export declare const AddNotesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodArray<z.ZodObject<{
        onset: z.ZodNumber;
        duration: z.ZodNumber;
        pitch: z.ZodNumber;
        lyrics: z.ZodDefault<z.ZodString>;
        phonemes: z.ZodOptional<z.ZodString>;
        languageOverride: z.ZodOptional<z.ZodString>;
        musicalType: z.ZodOptional<z.ZodEnum<["sing", "rap"]>>;
        detune: z.ZodOptional<z.ZodNumber>;
        attributes: z.ZodOptional<z.ZodObject<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "strip", z.ZodTypeAny, {
        onset: number;
        pitch: number;
        lyrics: string;
        duration: number;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectOutputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }, {
        onset: number;
        pitch: number;
        duration: number;
        lyrics?: string | undefined;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectInputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }>, "many">;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    notes: {
        onset: number;
        pitch: number;
        lyrics: string;
        duration: number;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectOutputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }[];
}, {
    notes: {
        onset: number;
        pitch: number;
        duration: number;
        lyrics?: string | undefined;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectInputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }[];
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
}>;
export declare const UpdateNotesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodArray<z.ZodObject<{
        noteIndex: z.ZodOptional<z.ZodNumber>;
        locator: z.ZodOptional<z.ZodObject<{
            trackIndex: z.ZodOptional<z.ZodNumber>;
            groupIndex: z.ZodOptional<z.ZodNumber>;
            noteIndex: z.ZodOptional<z.ZodNumber>;
            onset: z.ZodOptional<z.ZodNumber>;
            pitch: z.ZodOptional<z.ZodNumber>;
            lyrics: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        }, {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        }>>;
        onset: z.ZodOptional<z.ZodNumber>;
        duration: z.ZodOptional<z.ZodNumber>;
        pitch: z.ZodOptional<z.ZodNumber>;
        lyrics: z.ZodOptional<z.ZodString>;
        phonemes: z.ZodOptional<z.ZodString>;
        languageOverride: z.ZodOptional<z.ZodString>;
        musicalType: z.ZodOptional<z.ZodEnum<["sing", "rap"]>>;
        detune: z.ZodOptional<z.ZodNumber>;
        attributes: z.ZodOptional<z.ZodObject<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough">>>;
    }, "strip", z.ZodTypeAny, {
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        duration?: number | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectOutputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }, {
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        duration?: number | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectInputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }>, "many">;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    notes: {
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        duration?: number | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectOutputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }[];
}, {
    notes: {
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
        phonemes?: string | undefined;
        languageOverride?: string | undefined;
        duration?: number | undefined;
        musicalType?: "sing" | "rap" | undefined;
        detune?: number | undefined;
        attributes?: z.objectInputType<{
            rTone: z.ZodOptional<z.ZodNumber>;
            rIntonation: z.ZodOptional<z.ZodNumber>;
            dF0VbrMod: z.ZodOptional<z.ZodNumber>;
            expValueX: z.ZodOptional<z.ZodNumber>;
            expValueY: z.ZodOptional<z.ZodNumber>;
            phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
                symbol: z.ZodOptional<z.ZodString>;
                language: z.ZodOptional<z.ZodString>;
                leftOffset: z.ZodOptional<z.ZodNumber>;
                position: z.ZodOptional<z.ZodNumber>;
                activity: z.ZodOptional<z.ZodNumber>;
                strength: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }, {
                symbol?: string | undefined;
                language?: string | undefined;
                leftOffset?: number | undefined;
                position?: number | undefined;
                activity?: number | undefined;
                strength?: number | undefined;
            }>, "many">>;
            muted: z.ZodOptional<z.ZodBoolean>;
            evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
            languageOverride: z.ZodOptional<z.ZodString>;
            phonesetOverride: z.ZodOptional<z.ZodString>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }[];
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
}>;
export declare const DeleteNotesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    noteIndices: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    noteIndex: z.ZodOptional<z.ZodNumber>;
    locator: z.ZodOptional<z.ZodObject<{
        trackIndex: z.ZodOptional<z.ZodNumber>;
        groupIndex: z.ZodOptional<z.ZodNumber>;
        noteIndex: z.ZodOptional<z.ZodNumber>;
        onset: z.ZodOptional<z.ZodNumber>;
        pitch: z.ZodOptional<z.ZodNumber>;
        lyrics: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    }, {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    }>>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    noteIndex?: number | undefined;
    locator?: {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    } | undefined;
    noteIndices?: number[] | undefined;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    noteIndex?: number | undefined;
    locator?: {
        trackIndex?: number | undefined;
        groupIndex?: number | undefined;
        noteIndex?: number | undefined;
        onset?: number | undefined;
        pitch?: number | undefined;
        lyrics?: string | undefined;
    } | undefined;
    dry_run?: boolean | undefined;
    noteIndices?: number[] | undefined;
}>;
export declare const GetPhonemesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    noteIndex: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    noteIndex?: number | undefined;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    noteIndex?: number | undefined;
}>;
export declare const SetPhonemesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    assignments: z.ZodArray<z.ZodObject<{
        noteIndex: z.ZodOptional<z.ZodNumber>;
        locator: z.ZodOptional<z.ZodObject<{
            trackIndex: z.ZodOptional<z.ZodNumber>;
            groupIndex: z.ZodOptional<z.ZodNumber>;
            noteIndex: z.ZodOptional<z.ZodNumber>;
            onset: z.ZodOptional<z.ZodNumber>;
            pitch: z.ZodOptional<z.ZodNumber>;
            lyrics: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        }, {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        }>>;
        phonemes: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phonemes: string;
        noteIndex?: number | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }, {
        phonemes: string;
        noteIndex?: number | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }>, "many">;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    assignments: {
        phonemes: string;
        noteIndex?: number | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }[];
}, {
    assignments: {
        phonemes: string;
        noteIndex?: number | undefined;
        locator?: {
            trackIndex?: number | undefined;
            groupIndex?: number | undefined;
            noteIndex?: number | undefined;
            onset?: number | undefined;
            pitch?: number | undefined;
            lyrics?: string | undefined;
        } | undefined;
    }[];
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
}>;
export declare const GetComputedPhonemesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const GetSingingProjectSnapshotSchema: z.ZodObject<{
    includeComputed: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    includeComputed: boolean;
}, {
    includeComputed?: boolean | undefined;
}>;
export declare const BeginFreshMusicXmlChoirJobSchema: z.ZodObject<{
    musicxmlPath: z.ZodString;
    expectedOutputPath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    musicxmlPath: string;
    expectedOutputPath: string;
}, {
    musicxmlPath: string;
    expectedOutputPath: string;
}>;
export declare const AuditMusicXmlLyricsSchema: z.ZodObject<{
    musicxmlPath: z.ZodString;
    freshJobId: z.ZodOptional<z.ZodString>;
    trackMap: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    profile: z.ZodDefault<z.ZodLiteral<"ecclesiastical-latin">>;
    requireDirectPhonemes: z.ZodDefault<z.ZodBoolean>;
    requireDirectLyricLabels: z.ZodDefault<z.ZodBoolean>;
    verifyComputedPhonemes: z.ZodDefault<z.ZodBoolean>;
    onsetToleranceBlicks: z.ZodDefault<z.ZodNumber>;
    durationToleranceBlicks: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    musicxmlPath: string;
    trackMap: Record<string, number>;
    profile: "ecclesiastical-latin";
    requireDirectPhonemes: boolean;
    requireDirectLyricLabels: boolean;
    verifyComputedPhonemes: boolean;
    onsetToleranceBlicks: number;
    durationToleranceBlicks: number;
    freshJobId?: string | undefined;
}, {
    musicxmlPath: string;
    freshJobId?: string | undefined;
    trackMap?: Record<string, number> | undefined;
    profile?: "ecclesiastical-latin" | undefined;
    requireDirectPhonemes?: boolean | undefined;
    requireDirectLyricLabels?: boolean | undefined;
    verifyComputedPhonemes?: boolean | undefined;
    onsetToleranceBlicks?: number | undefined;
    durationToleranceBlicks?: number | undefined;
}>;
export declare const RepairMusicXmlLyricsSchema: z.ZodObject<{
    musicxmlPath: z.ZodString;
    freshJobId: z.ZodOptional<z.ZodString>;
    trackMap: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    profile: z.ZodDefault<z.ZodLiteral<"ecclesiastical-latin">>;
    requireDirectPhonemes: z.ZodDefault<z.ZodBoolean>;
    requireDirectLyricLabels: z.ZodDefault<z.ZodBoolean>;
    verifyComputedPhonemes: z.ZodDefault<z.ZodBoolean>;
    onsetToleranceBlicks: z.ZodDefault<z.ZodNumber>;
    durationToleranceBlicks: z.ZodDefault<z.ZodNumber>;
} & {
    auditId: z.ZodOptional<z.ZodString>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    rewriteLyrics: z.ZodDefault<z.ZodBoolean>;
    renderWaitMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    musicxmlPath: string;
    trackMap: Record<string, number>;
    profile: "ecclesiastical-latin";
    requireDirectPhonemes: boolean;
    requireDirectLyricLabels: boolean;
    verifyComputedPhonemes: boolean;
    onsetToleranceBlicks: number;
    durationToleranceBlicks: number;
    rewriteLyrics: boolean;
    renderWaitMs: number;
    freshJobId?: string | undefined;
    auditId?: string | undefined;
}, {
    musicxmlPath: string;
    dry_run?: boolean | undefined;
    freshJobId?: string | undefined;
    trackMap?: Record<string, number> | undefined;
    profile?: "ecclesiastical-latin" | undefined;
    requireDirectPhonemes?: boolean | undefined;
    requireDirectLyricLabels?: boolean | undefined;
    verifyComputedPhonemes?: boolean | undefined;
    onsetToleranceBlicks?: number | undefined;
    durationToleranceBlicks?: number | undefined;
    auditId?: string | undefined;
    rewriteLyrics?: boolean | undefined;
    renderWaitMs?: number | undefined;
}>;
export declare const GetNoteAttributesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    noteIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    noteIndex: number;
}, {
    noteIndex: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const SetNoteAttributesSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    noteIndex: z.ZodNumber;
    attributes: z.ZodOptional<z.ZodObject<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
    detune: z.ZodOptional<z.ZodNumber>;
    languageOverride: z.ZodOptional<z.ZodString>;
    musicalType: z.ZodOptional<z.ZodEnum<["sing", "rap"]>>;
    rapAccent: z.ZodOptional<z.ZodString>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    noteIndex: number;
    dry_run: boolean;
    languageOverride?: string | undefined;
    musicalType?: "sing" | "rap" | undefined;
    detune?: number | undefined;
    attributes?: z.objectOutputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    rapAccent?: string | undefined;
}, {
    noteIndex: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    languageOverride?: string | undefined;
    musicalType?: "sing" | "rap" | undefined;
    detune?: number | undefined;
    attributes?: z.objectInputType<{
        rTone: z.ZodOptional<z.ZodNumber>;
        rIntonation: z.ZodOptional<z.ZodNumber>;
        dF0VbrMod: z.ZodOptional<z.ZodNumber>;
        expValueX: z.ZodOptional<z.ZodNumber>;
        expValueY: z.ZodOptional<z.ZodNumber>;
        phonemes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            symbol: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodString>;
            leftOffset: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodNumber>;
            activity: z.ZodOptional<z.ZodNumber>;
            strength: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }, {
            symbol?: string | undefined;
            language?: string | undefined;
            leftOffset?: number | undefined;
            position?: number | undefined;
            activity?: number | undefined;
            strength?: number | undefined;
        }>, "many">>;
        muted: z.ZodOptional<z.ZodBoolean>;
        evenSyllableDuration: z.ZodOptional<z.ZodBoolean>;
        languageOverride: z.ZodOptional<z.ZodString>;
        phonesetOverride: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    dry_run?: boolean | undefined;
    rapAccent?: string | undefined;
}>;
export declare const GetVoiceSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const SetVoiceSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    voice: z.ZodObject<{
        paramLoudness: z.ZodOptional<z.ZodNumber>;
        paramTension: z.ZodOptional<z.ZodNumber>;
        paramBreathiness: z.ZodOptional<z.ZodNumber>;
        paramGender: z.ZodOptional<z.ZodNumber>;
        paramToneShift: z.ZodOptional<z.ZodNumber>;
        vocalModeParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            pitch: z.ZodOptional<z.ZodNumber>;
            timbre: z.ZodOptional<z.ZodNumber>;
            pronunciation: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }>>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        paramLoudness: z.ZodOptional<z.ZodNumber>;
        paramTension: z.ZodOptional<z.ZodNumber>;
        paramBreathiness: z.ZodOptional<z.ZodNumber>;
        paramGender: z.ZodOptional<z.ZodNumber>;
        paramToneShift: z.ZodOptional<z.ZodNumber>;
        vocalModeParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            pitch: z.ZodOptional<z.ZodNumber>;
            timbre: z.ZodOptional<z.ZodNumber>;
            pronunciation: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }>>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        paramLoudness: z.ZodOptional<z.ZodNumber>;
        paramTension: z.ZodOptional<z.ZodNumber>;
        paramBreathiness: z.ZodOptional<z.ZodNumber>;
        paramGender: z.ZodOptional<z.ZodNumber>;
        paramToneShift: z.ZodOptional<z.ZodNumber>;
        vocalModeParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            pitch: z.ZodOptional<z.ZodNumber>;
            timbre: z.ZodOptional<z.ZodNumber>;
            pronunciation: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }>>>;
    }, z.ZodTypeAny, "passthrough">>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    voice: {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    } & {
        [k: string]: unknown;
    };
}, {
    voice: {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    } & {
        [k: string]: unknown;
    };
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
}>;
export declare const GetParametersSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    paramName: z.ZodString;
    minOnset: z.ZodOptional<z.ZodNumber>;
    maxOnset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    paramName: string;
    minOnset?: number | undefined;
    maxOnset?: number | undefined;
}, {
    paramName: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    minOnset?: number | undefined;
    maxOnset?: number | undefined;
}>;
export declare const SetParametersSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
    paramName: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<["add", "replace_all", "remove_range"]>>;
    minOnset: z.ZodOptional<z.ZodNumber>;
    maxOnset: z.ZodOptional<z.ZodNumber>;
    points: z.ZodOptional<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, "many">>;
    simplifyThreshold: z.ZodOptional<z.ZodNumber>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    paramName: string;
    mode: "add" | "replace_all" | "remove_range";
    minOnset?: number | undefined;
    maxOnset?: number | undefined;
    points?: [number, number][] | undefined;
    simplifyThreshold?: number | undefined;
}, {
    paramName: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    minOnset?: number | undefined;
    maxOnset?: number | undefined;
    mode?: "add" | "replace_all" | "remove_range" | undefined;
    points?: [number, number][] | undefined;
    simplifyThreshold?: number | undefined;
}>;
export declare const PlaySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const PauseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const StopSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SeekSchema: z.ZodObject<{
    positionSeconds: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    positionSeconds: number;
}, {
    positionSeconds: number;
}>;
export declare const GetPlayheadSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const LoopSchema: z.ZodObject<{
    tBegin: z.ZodNumber;
    tEnd: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    tBegin: number;
    tEnd: number;
}, {
    tBegin: number;
    tEnd: number;
}>;
export declare const BatchOperationSchema: z.ZodObject<{
    action: z.ZodEnum<["add_notes", "update_notes", "delete_notes", "set_phonemes", "set_note_attributes", "set_voice", "set_parameters"]>;
    params: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    params: Record<string, any>;
    action: "add_notes" | "update_notes" | "delete_notes" | "set_phonemes" | "set_note_attributes" | "set_voice" | "set_parameters";
}, {
    params: Record<string, any>;
    action: "add_notes" | "update_notes" | "delete_notes" | "set_phonemes" | "set_note_attributes" | "set_voice" | "set_parameters";
}>;
export declare const BatchEditSchema: z.ZodObject<{
    operations: z.ZodArray<z.ZodObject<{
        action: z.ZodEnum<["add_notes", "update_notes", "delete_notes", "set_phonemes", "set_note_attributes", "set_voice", "set_parameters"]>;
        params: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, any>;
        action: "add_notes" | "update_notes" | "delete_notes" | "set_phonemes" | "set_note_attributes" | "set_voice" | "set_parameters";
    }, {
        params: Record<string, any>;
        action: "add_notes" | "update_notes" | "delete_notes" | "set_phonemes" | "set_note_attributes" | "set_voice" | "set_parameters";
    }>, "many">;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    operations: {
        params: Record<string, any>;
        action: "add_notes" | "update_notes" | "delete_notes" | "set_phonemes" | "set_note_attributes" | "set_voice" | "set_parameters";
    }[];
}, {
    operations: {
        params: Record<string, any>;
        action: "add_notes" | "update_notes" | "delete_notes" | "set_phonemes" | "set_note_attributes" | "set_voice" | "set_parameters";
    }[];
    dry_run?: boolean | undefined;
}>;
export declare const GetComputedPitchSchema: z.ZodObject<{
    start: z.ZodNumber;
    interval: z.ZodNumber;
    frames: z.ZodNumber;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    start: number;
    interval: number;
    frames: number;
}, {
    start: number;
    interval: number;
    frames: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const GetPitchControlsSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const EditPitchControlSchema: z.ZodEffects<z.ZodObject<{
    expectedSnapshot: z.ZodString;
    operation: z.ZodEnum<["add", "update", "delete"]>;
    index: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["point", "curve"]>>;
    position: z.ZodOptional<z.ZodNumber>;
    pitch: z.ZodOptional<z.ZodNumber>;
    points: z.ZodOptional<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, "many">>;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "add" | "update" | "delete";
    allowSharedGroup: boolean;
    pitch?: number | undefined;
    type?: "point" | "curve" | undefined;
    position?: number | undefined;
    points?: [number, number][] | undefined;
    index?: number | undefined;
}, {
    expectedSnapshot: string;
    operation: "add" | "update" | "delete";
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    pitch?: number | undefined;
    type?: "point" | "curve" | undefined;
    position?: number | undefined;
    dry_run?: boolean | undefined;
    points?: [number, number][] | undefined;
    index?: number | undefined;
    allowSharedGroup?: boolean | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "add" | "update" | "delete";
    allowSharedGroup: boolean;
    pitch?: number | undefined;
    type?: "point" | "curve" | undefined;
    position?: number | undefined;
    points?: [number, number][] | undefined;
    index?: number | undefined;
}, {
    expectedSnapshot: string;
    operation: "add" | "update" | "delete";
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    pitch?: number | undefined;
    type?: "point" | "curve" | undefined;
    position?: number | undefined;
    dry_run?: boolean | undefined;
    points?: [number, number][] | undefined;
    index?: number | undefined;
    allowSharedGroup?: boolean | undefined;
}>;
export declare const EditorContextSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ConvertTimeSchema: z.ZodObject<{
    unit: z.ZodEnum<["blick", "seconds", "quarter"]>;
    value: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: number;
    unit: "blick" | "seconds" | "quarter";
}, {
    value: number;
    unit: "blick" | "seconds" | "quarter";
}>;
export declare const SampleParameterSchema: z.ZodObject<{
    paramName: z.ZodString;
    positions: z.ZodArray<z.ZodNumber, "many">;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    paramName: string;
    positions: number[];
}, {
    paramName: string;
    positions: number[];
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const GetTrackStateSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
}, {
    trackIndex?: number | undefined;
}>;
export declare const EditTrackStateSchema: z.ZodEffects<z.ZodObject<{
    expectedSnapshot: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    bounced: z.ZodOptional<z.ZodBoolean>;
    gain: z.ZodOptional<z.ZodNumber>;
    pan: z.ZodOptional<z.ZodNumber>;
    mute: z.ZodOptional<z.ZodBoolean>;
    solo: z.ZodOptional<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    name?: string | undefined;
    color?: string | undefined;
    bounced?: boolean | undefined;
    gain?: number | undefined;
    pan?: number | undefined;
    mute?: boolean | undefined;
    solo?: boolean | undefined;
}, {
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    dry_run?: boolean | undefined;
    name?: string | undefined;
    color?: string | undefined;
    bounced?: boolean | undefined;
    gain?: number | undefined;
    pan?: number | undefined;
    mute?: boolean | undefined;
    solo?: boolean | undefined;
}>, {
    trackIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    name?: string | undefined;
    color?: string | undefined;
    bounced?: boolean | undefined;
    gain?: number | undefined;
    pan?: number | undefined;
    mute?: boolean | undefined;
    solo?: boolean | undefined;
}, {
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    dry_run?: boolean | undefined;
    name?: string | undefined;
    color?: string | undefined;
    bounced?: boolean | undefined;
    gain?: number | undefined;
    pan?: number | undefined;
    mute?: boolean | undefined;
    solo?: boolean | undefined;
}>;
export declare const GetGroupReferenceSchema: z.ZodObject<{
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
}, {
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const EditGroupReferenceSchema: z.ZodEffects<z.ZodObject<{
    expectedSnapshot: z.ZodString;
    timeOffset: z.ZodOptional<z.ZodNumber>;
    pitchOffset: z.ZodOptional<z.ZodNumber>;
    mute: z.ZodOptional<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    mute?: boolean | undefined;
    timeOffset?: number | undefined;
    pitchOffset?: number | undefined;
}, {
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    mute?: boolean | undefined;
    timeOffset?: number | undefined;
    pitchOffset?: number | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    mute?: boolean | undefined;
    timeOffset?: number | undefined;
    pitchOffset?: number | undefined;
}, {
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    mute?: boolean | undefined;
    timeOffset?: number | undefined;
    pitchOffset?: number | undefined;
}>;
export declare const GetRetakesSchema: z.ZodObject<{
    noteIndex: z.ZodNumber;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    noteIndex: number;
}, {
    noteIndex: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const EditRetakesSchema: z.ZodEffects<z.ZodObject<{
    noteIndex: z.ZodNumber;
    expectedSnapshot: z.ZodString;
    operation: z.ZodEnum<["generate", "activate", "delete"]>;
    takeId: z.ZodOptional<z.ZodNumber>;
    newDuration: z.ZodDefault<z.ZodBoolean>;
    newPitch: z.ZodDefault<z.ZodBoolean>;
    newTimbre: z.ZodDefault<z.ZodBoolean>;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    noteIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "delete" | "generate" | "activate";
    allowSharedGroup: boolean;
    newDuration: boolean;
    newPitch: boolean;
    newTimbre: boolean;
    takeId?: number | undefined;
}, {
    noteIndex: number;
    expectedSnapshot: string;
    operation: "delete" | "generate" | "activate";
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    takeId?: number | undefined;
    newDuration?: boolean | undefined;
    newPitch?: boolean | undefined;
    newTimbre?: boolean | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    noteIndex: number;
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "delete" | "generate" | "activate";
    allowSharedGroup: boolean;
    newDuration: boolean;
    newPitch: boolean;
    newTimbre: boolean;
    takeId?: number | undefined;
}, {
    noteIndex: number;
    expectedSnapshot: string;
    operation: "delete" | "generate" | "activate";
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    takeId?: number | undefined;
    newDuration?: boolean | undefined;
    newPitch?: boolean | undefined;
    newTimbre?: boolean | undefined;
}>;
export declare const ProjectStructureSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const EditStructureSchema: z.ZodEffects<z.ZodObject<{
    expectedSnapshot: z.ZodString;
    operation: z.ZodEnum<["add_track", "delete_track", "add_group", "delete_group", "add_reference", "delete_reference"]>;
    trackIndex: z.ZodOptional<z.ZodNumber>;
    groupIndex: z.ZodOptional<z.ZodNumber>;
    groupUUID: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    timeOffset: z.ZodDefault<z.ZodNumber>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "add_track" | "delete_track" | "add_group" | "delete_group" | "add_reference" | "delete_reference";
    timeOffset: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    name?: string | undefined;
    groupUUID?: string | undefined;
}, {
    expectedSnapshot: string;
    operation: "add_track" | "delete_track" | "add_group" | "delete_group" | "add_reference" | "delete_reference";
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    name?: string | undefined;
    timeOffset?: number | undefined;
    groupUUID?: string | undefined;
}>, {
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "add_track" | "delete_track" | "add_group" | "delete_group" | "add_reference" | "delete_reference";
    timeOffset: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    name?: string | undefined;
    groupUUID?: string | undefined;
}, {
    expectedSnapshot: string;
    operation: "add_track" | "delete_track" | "add_group" | "delete_group" | "add_reference" | "delete_reference";
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    name?: string | undefined;
    timeOffset?: number | undefined;
    groupUUID?: string | undefined;
}>;
export declare const EditTimeAxisSchema: z.ZodEffects<z.ZodObject<{
    expectedSnapshot: z.ZodString;
    operation: z.ZodEnum<["set_tempo", "delete_tempo", "set_meter", "delete_meter"]>;
    position: z.ZodNumber;
    bpm: z.ZodOptional<z.ZodNumber>;
    numerator: z.ZodOptional<z.ZodNumber>;
    denominator: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    position: number;
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "set_tempo" | "delete_tempo" | "set_meter" | "delete_meter";
    bpm?: number | undefined;
    numerator?: number | undefined;
    denominator?: number | undefined;
}, {
    position: number;
    expectedSnapshot: string;
    operation: "set_tempo" | "delete_tempo" | "set_meter" | "delete_meter";
    dry_run?: boolean | undefined;
    bpm?: number | undefined;
    numerator?: number | undefined;
    denominator?: number | undefined;
}>, {
    position: number;
    dry_run: boolean;
    expectedSnapshot: string;
    operation: "set_tempo" | "delete_tempo" | "set_meter" | "delete_meter";
    bpm?: number | undefined;
    numerator?: number | undefined;
    denominator?: number | undefined;
}, {
    position: number;
    expectedSnapshot: string;
    operation: "set_tempo" | "delete_tempo" | "set_meter" | "delete_meter";
    dry_run?: boolean | undefined;
    bpm?: number | undefined;
    numerator?: number | undefined;
    denominator?: number | undefined;
}>;
export declare const EditorViewSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SetEditorViewSchema: z.ZodEffects<z.ZodObject<{
    left: z.ZodOptional<z.ZodNumber>;
    right: z.ZodOptional<z.ZodNumber>;
    scale: z.ZodOptional<z.ZodNumber>;
    centerPitch: z.ZodOptional<z.ZodNumber>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    left?: number | undefined;
    right?: number | undefined;
    scale?: number | undefined;
    centerPitch?: number | undefined;
}, {
    dry_run?: boolean | undefined;
    left?: number | undefined;
    right?: number | undefined;
    scale?: number | undefined;
    centerPitch?: number | undefined;
}>, {
    dry_run: boolean;
    left?: number | undefined;
    right?: number | undefined;
    scale?: number | undefined;
    centerPitch?: number | undefined;
}, {
    dry_run?: boolean | undefined;
    left?: number | undefined;
    right?: number | undefined;
    scale?: number | undefined;
    centerPitch?: number | undefined;
}>;
export declare const SetNoteSelectionSchema: z.ZodObject<{
    expectedGroupUUID: z.ZodString;
    mode: z.ZodEnum<["replace", "add", "remove", "clear"]>;
    noteIndices: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    noteIndices: number[];
    mode: "replace" | "add" | "remove" | "clear";
    expectedGroupUUID: string;
}, {
    mode: "replace" | "add" | "remove" | "clear";
    expectedGroupUUID: string;
    dry_run?: boolean | undefined;
    noteIndices?: number[] | undefined;
}>;
export declare const ConvertPitchSchema: z.ZodEffects<z.ZodObject<{
    unit: z.ZodEnum<["midi", "hz"]>;
    value: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: number;
    unit: "midi" | "hz";
}, {
    value: number;
    unit: "midi" | "hz";
}>, {
    value: number;
    unit: "midi" | "hz";
}, {
    value: number;
    unit: "midi" | "hz";
}>;
export declare const GetPhraseContextSchema: z.ZodEffects<z.ZodObject<{
    start: z.ZodNumber;
    end: z.ZodNumber;
    limit: z.ZodDefault<z.ZodNumber>;
    includePitch: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    start: number;
    end: number;
    limit: number;
    includePitch: boolean;
}, {
    start: number;
    end: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    limit?: number | undefined;
    includePitch?: boolean | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    start: number;
    end: number;
    limit: number;
    includePitch: boolean;
}, {
    start: number;
    end: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    limit?: number | undefined;
    includePitch?: boolean | undefined;
}>;
export declare const TransformNotesSchema: z.ZodEffects<z.ZodObject<{
    expectedSnapshot: z.ZodString;
    noteIndices: z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>;
    pitchOffset: z.ZodDefault<z.ZodNumber>;
    onsetOffset: z.ZodDefault<z.ZodNumber>;
    durationScale: z.ZodDefault<z.ZodNumber>;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    noteIndices: number[];
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    pitchOffset: number;
    onsetOffset: number;
    durationScale: number;
}, {
    noteIndices: number[];
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    pitchOffset?: number | undefined;
    onsetOffset?: number | undefined;
    durationScale?: number | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    noteIndices: number[];
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    pitchOffset: number;
    onsetOffset: number;
    durationScale: number;
}, {
    noteIndices: number[];
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    pitchOffset?: number | undefined;
    onsetOffset?: number | undefined;
    durationScale?: number | undefined;
}>;
export declare const InspectMusicXmlSchema: z.ZodObject<{
    path: z.ZodString;
    previewLimit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    path: string;
    previewLimit: number;
}, {
    path: string;
    previewLimit?: number | undefined;
}>;
export declare const SelectionDetailsSchema: z.ZodObject<{
    paramName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    paramName?: string | undefined;
}, {
    paramName?: string | undefined;
}>;
export declare const ConvertCoordinatesSchema: z.ZodObject<{
    direction: z.ZodEnum<["time_to_x", "x_to_time", "pitch_to_y", "y_to_pitch", "snap_time"]>;
    value: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    value: number;
    direction: "time_to_x" | "x_to_time" | "pitch_to_y" | "y_to_pitch" | "snap_time";
}, {
    value: number;
    direction: "time_to_x" | "x_to_time" | "pitch_to_y" | "y_to_pitch" | "snap_time";
}>;
export declare const SetEditorObjectsSchema: z.ZodObject<{
    expectedGroupUUID: z.ZodString;
    kind: z.ZodEnum<["group", "pitch_control"]>;
    mode: z.ZodEnum<["replace", "add", "remove", "clear"]>;
    indices: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    mode: "replace" | "add" | "remove" | "clear";
    expectedGroupUUID: string;
    kind: "group" | "pitch_control";
    indices: number[];
}, {
    mode: "replace" | "add" | "remove" | "clear";
    expectedGroupUUID: string;
    kind: "group" | "pitch_control";
    dry_run?: boolean | undefined;
    indices?: number[] | undefined;
}>;
export declare const AutomationStateSchema: z.ZodObject<{
    paramName: z.ZodString;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    paramName: string;
}, {
    paramName: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
}>;
export declare const EditAutomationSchema: z.ZodEffects<z.ZodObject<{
    paramName: z.ZodString;
    expectedSnapshot: z.ZodString;
    mode: z.ZodEnum<["add", "remove_range", "replace_range", "simplify"]>;
    start: z.ZodOptional<z.ZodNumber>;
    end: z.ZodOptional<z.ZodNumber>;
    points: z.ZodDefault<z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>, "many">>;
    threshold: z.ZodOptional<z.ZodNumber>;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    paramName: string;
    mode: "add" | "remove_range" | "replace_range" | "simplify";
    points: [number, number][];
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    start?: number | undefined;
    end?: number | undefined;
    threshold?: number | undefined;
}, {
    paramName: string;
    mode: "add" | "remove_range" | "replace_range" | "simplify";
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    points?: [number, number][] | undefined;
    start?: number | undefined;
    allowSharedGroup?: boolean | undefined;
    end?: number | undefined;
    threshold?: number | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    paramName: string;
    mode: "add" | "remove_range" | "replace_range" | "simplify";
    points: [number, number][];
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    start?: number | undefined;
    end?: number | undefined;
    threshold?: number | undefined;
}, {
    paramName: string;
    mode: "add" | "remove_range" | "replace_range" | "simplify";
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    points?: [number, number][] | undefined;
    start?: number | undefined;
    allowSharedGroup?: boolean | undefined;
    end?: number | undefined;
    threshold?: number | undefined;
}>;
export declare const CopyVoiceSchema: z.ZodObject<{
    sourceTrack: z.ZodNumber;
    sourceGroup: z.ZodNumber;
    targetTrack: z.ZodNumber;
    targetGroup: z.ZodNumber;
    expectedSource: z.ZodString;
    expectedTarget: z.ZodString;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    sourceTrack: number;
    sourceGroup: number;
    targetTrack: number;
    targetGroup: number;
    expectedSource: string;
    expectedTarget: string;
}, {
    sourceTrack: number;
    sourceGroup: number;
    targetTrack: number;
    targetGroup: number;
    expectedSource: string;
    expectedTarget: string;
    dry_run?: boolean | undefined;
}>;
export declare const ExpressionPresetSchema: z.ZodEffects<z.ZodObject<{
    preset: z.ZodEnum<["scoop", "falloff", "vibrato", "crescendo", "breathiness"]>;
    start: z.ZodNumber;
    end: z.ZodNumber;
    amount: z.ZodNumber;
    cycles: z.ZodDefault<z.ZodNumber>;
    expectedSnapshot: z.ZodString;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    start: number;
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    end: number;
    preset: "scoop" | "falloff" | "vibrato" | "crescendo" | "breathiness";
    amount: number;
    cycles: number;
}, {
    start: number;
    expectedSnapshot: string;
    end: number;
    preset: "scoop" | "falloff" | "vibrato" | "crescendo" | "breathiness";
    amount: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    cycles?: number | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    start: number;
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    end: number;
    preset: "scoop" | "falloff" | "vibrato" | "crescendo" | "breathiness";
    amount: number;
    cycles: number;
}, {
    start: number;
    expectedSnapshot: string;
    end: number;
    preset: "scoop" | "falloff" | "vibrato" | "crescendo" | "breathiness";
    amount: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    cycles?: number | undefined;
}>;
export declare const HumanizeNotesSchema: z.ZodEffects<z.ZodObject<{
    expectedSnapshot: z.ZodString;
    noteIndices: z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>;
    seed: z.ZodNumber;
    onsetJitter: z.ZodNumber;
    durationJitter: z.ZodNumber;
    preserveChords: z.ZodDefault<z.ZodBoolean>;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    noteIndices: number[];
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    seed: number;
    onsetJitter: number;
    durationJitter: number;
    preserveChords: boolean;
}, {
    noteIndices: number[];
    expectedSnapshot: string;
    seed: number;
    onsetJitter: number;
    durationJitter: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    preserveChords?: boolean | undefined;
}>, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    noteIndices: number[];
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    seed: number;
    onsetJitter: number;
    durationJitter: number;
    preserveChords: boolean;
}, {
    noteIndices: number[];
    expectedSnapshot: string;
    seed: number;
    onsetJitter: number;
    durationJitter: number;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
    preserveChords?: boolean | undefined;
}>;
export declare const FitLyricsSchema: z.ZodObject<{
    expectedSnapshot: z.ZodString;
    assignments: z.ZodEffects<z.ZodArray<z.ZodObject<{
        noteIndex: z.ZodNumber;
        lyrics: z.ZodString;
        phonemes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        noteIndex: number;
        lyrics: string;
        phonemes?: string | undefined;
    }, {
        noteIndex: number;
        lyrics: string;
        phonemes?: string | undefined;
    }>, "many">, {
        noteIndex: number;
        lyrics: string;
        phonemes?: string | undefined;
    }[], {
        noteIndex: number;
        lyrics: string;
        phonemes?: string | undefined;
    }[]>;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    assignments: {
        noteIndex: number;
        lyrics: string;
        phonemes?: string | undefined;
    }[];
    expectedSnapshot: string;
    allowSharedGroup: boolean;
}, {
    assignments: {
        noteIndex: number;
        lyrics: string;
        phonemes?: string | undefined;
    }[];
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    allowSharedGroup?: boolean | undefined;
}>;
export declare const HostClipboardSchema: z.ZodEffects<z.ZodObject<{
    operation: z.ZodEnum<["read", "write"]>;
    text: z.ZodOptional<z.ZodString>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    operation: "read" | "write";
    text?: string | undefined;
}, {
    operation: "read" | "write";
    dry_run?: boolean | undefined;
    text?: string | undefined;
}>, {
    dry_run: boolean;
    operation: "read" | "write";
    text?: string | undefined;
}, {
    operation: "read" | "write";
    dry_run?: boolean | undefined;
    text?: string | undefined;
}>;
export declare const EditVoiceSettingsSchema: z.ZodObject<{
    expectedSnapshot: z.ZodString;
    voice: z.ZodEffects<z.ZodObject<{
        paramLoudness: z.ZodOptional<z.ZodNumber>;
        paramTension: z.ZodOptional<z.ZodNumber>;
        paramBreathiness: z.ZodOptional<z.ZodNumber>;
        paramGender: z.ZodOptional<z.ZodNumber>;
        paramToneShift: z.ZodOptional<z.ZodNumber>;
        vocalModeParams: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            pitch: z.ZodOptional<z.ZodNumber>;
            timbre: z.ZodOptional<z.ZodNumber>;
            pronunciation: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }>>>;
    }, "strict", z.ZodTypeAny, {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    }, {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    }>, {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    }, {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    }>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    voice: {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    };
    expectedSnapshot: string;
}, {
    voice: {
        paramLoudness?: number | undefined;
        paramTension?: number | undefined;
        paramBreathiness?: number | undefined;
        paramGender?: number | undefined;
        paramToneShift?: number | undefined;
        vocalModeParams?: Record<string, {
            pitch?: number | undefined;
            timbre?: number | undefined;
            pronunciation?: number | undefined;
        }> | undefined;
    };
    expectedSnapshot: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
}>;
export declare const ImportScoreLaneSchema: z.ZodObject<{
    path: z.ZodString;
    sourceSha256: z.ZodString;
    partId: z.ZodOptional<z.ZodString>;
    voice: z.ZodOptional<z.ZodString>;
    staff: z.ZodOptional<z.ZodString>;
    midiTrack: z.ZodOptional<z.ZodNumber>;
    midiChannel: z.ZodOptional<z.ZodNumber>;
    startIndex: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    defaultLyric: z.ZodDefault<z.ZodString>;
    expectedSnapshot: z.ZodString;
    allowSharedGroup: z.ZodDefault<z.ZodBoolean>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    trackIndex: number;
    groupIndex: number;
    path: string;
    dry_run: boolean;
    expectedSnapshot: string;
    allowSharedGroup: boolean;
    limit: number;
    sourceSha256: string;
    startIndex: number;
    defaultLyric: string;
    voice?: string | undefined;
    partId?: string | undefined;
    staff?: string | undefined;
    midiTrack?: number | undefined;
    midiChannel?: number | undefined;
}, {
    path: string;
    expectedSnapshot: string;
    sourceSha256: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    dry_run?: boolean | undefined;
    voice?: string | undefined;
    allowSharedGroup?: boolean | undefined;
    limit?: number | undefined;
    partId?: string | undefined;
    staff?: string | undefined;
    midiTrack?: number | undefined;
    midiChannel?: number | undefined;
    startIndex?: number | undefined;
    defaultLyric?: string | undefined;
}>;
export declare const ScriptDataSchema: z.ZodEffects<z.ZodObject<{
    noteIndex: z.ZodOptional<z.ZodNumber>;
    object: z.ZodEnum<["project", "track", "group_reference", "group", "note"]>;
    key: z.ZodString;
    operation: z.ZodEnum<["read", "set", "remove"]>;
    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
    expectedSnapshot: z.ZodOptional<z.ZodString>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
    trackIndex: z.ZodDefault<z.ZodNumber>;
    groupIndex: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    object: "group" | "project" | "track" | "group_reference" | "note";
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    operation: "set" | "remove" | "read";
    key: string;
    noteIndex?: number | undefined;
    value?: string | number | boolean | undefined;
    expectedSnapshot?: string | undefined;
}, {
    object: "group" | "project" | "track" | "group_reference" | "note";
    operation: "set" | "remove" | "read";
    key: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    noteIndex?: number | undefined;
    value?: string | number | boolean | undefined;
    dry_run?: boolean | undefined;
    expectedSnapshot?: string | undefined;
}>, {
    object: "group" | "project" | "track" | "group_reference" | "note";
    trackIndex: number;
    groupIndex: number;
    dry_run: boolean;
    operation: "set" | "remove" | "read";
    key: string;
    noteIndex?: number | undefined;
    value?: string | number | boolean | undefined;
    expectedSnapshot?: string | undefined;
}, {
    object: "group" | "project" | "track" | "group_reference" | "note";
    operation: "set" | "remove" | "read";
    key: string;
    trackIndex?: number | undefined;
    groupIndex?: number | undefined;
    noteIndex?: number | undefined;
    value?: string | number | boolean | undefined;
    dry_run?: boolean | undefined;
    expectedSnapshot?: string | undefined;
}>;
export declare const DialogSchema: z.ZodObject<{
    kind: z.ZodEnum<["message", "input", "ok_cancel", "yes_no_cancel"]>;
    title: z.ZodString;
    message: z.ZodString;
    defaultText: z.ZodDefault<z.ZodString>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    message: string;
    dry_run: boolean;
    kind: "message" | "input" | "ok_cancel" | "yes_no_cancel";
    title: string;
    defaultText: string;
}, {
    message: string;
    kind: "message" | "input" | "ok_cancel" | "yes_no_cancel";
    title: string;
    dry_run?: boolean | undefined;
    defaultText?: string | undefined;
}>;
export declare const DialogResultSchema: z.ZodObject<{
    dialogId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    dialogId: number;
}, {
    dialogId: number;
}>;
export declare const SetAutomationSelectionSchema: z.ZodObject<{
    expectedGroupUUID: z.ZodString;
    paramName: z.ZodString;
    mode: z.ZodEnum<["replace", "add", "remove", "clear"]>;
    positions: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    dry_run: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    dry_run: boolean;
    paramName: string;
    mode: "replace" | "add" | "remove" | "clear";
    positions: number[];
    expectedGroupUUID: string;
}, {
    paramName: string;
    mode: "replace" | "add" | "remove" | "clear";
    expectedGroupUUID: string;
    dry_run?: boolean | undefined;
    positions?: number[] | undefined;
}>;
