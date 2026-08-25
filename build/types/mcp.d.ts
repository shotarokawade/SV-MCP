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
    dry_run: boolean;
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
    dry_run: boolean;
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
    minOnset?: number | undefined;
    maxOnset?: number | undefined;
    dry_run?: boolean | undefined;
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
