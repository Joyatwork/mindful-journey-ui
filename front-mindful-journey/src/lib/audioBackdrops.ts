export type AudioBackdropType = 'immediate' | 'challenge' | 'content';

// Central configuration for audio backdrops.
// Update the arrays below to point to any images placed under `public/visuals/...`.
// You can also override per item via `suggestion.backdrop_images`.
const config: Record<AudioBackdropType, string[]> = {
    immediate: [
        '/visuals/annual/nature1.jpg',
        '/visuals/annual/nature2.jpg',
        '/visuals/annual/nature3.jpg',
        '/visuals/annual/nature4.jpg',
        '/visuals/annual/nature5.jpg',
        '/visuals/annual/nature6.jpg',
        '/visuals/annual/nature7.jpg',
    ],
    challenge: [
        '/visuals/annual/nature1.jpg',
        '/visuals/annual/nature2.jpg',
        '/visuals/annual/nature3.jpg',
        '/visuals/annual/nature4.jpg',
        '/visuals/annual/nature5.jpg',
        '/visuals/annual/nature6.jpg',
        '/visuals/annual/nature7.jpg',
    ],
    content: [
        '/visuals/annual/nature1.jpg',
        '/visuals/annual/nature2.jpg',
        '/visuals/annual/nature3.jpg',
        '/visuals/annual/nature4.jpg',
        '/visuals/annual/nature5.jpg',
        '/visuals/annual/nature6.jpg',
        '/visuals/annual/nature7.jpg',
    ],
};

// Optional per-category overrides, e.g. challenge category 'respiration' -> specific set.
// Example:
// {
//   challenge: {
//     breathing: ['/visuals/audio/challenge/breath/1.jpg', '/visuals/audio/challenge/breath/2.jpg']
//   }
// }
const byCategory: Partial<Record<AudioBackdropType, Record<string, string[]>>> = {
    // challenge: { breathing: ['...'] }
};

export function getBackdropImages(kind: AudioBackdropType, category?: string): string[] | undefined {
    if (category && byCategory[kind] && byCategory[kind]![category]) {
        const arr = byCategory[kind]![category] as string[];
        if (arr && arr.length) return arr;
    }
    const base = config[kind];
    return base && base.length ? base : undefined;
}
