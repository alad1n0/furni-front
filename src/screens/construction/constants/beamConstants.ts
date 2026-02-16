export const BEAM_NAMES = {
    TOP: 'Верхня балка',
    BOTTOM: 'Нижня балка',
    LEFT: 'Ліва балка',
    RIGHT: 'Права балка'
} as const;

export type BeamName = typeof BEAM_NAMES[keyof typeof BEAM_NAMES];

export function getBeamNames(): BeamName[] {
    return Object.values(BEAM_NAMES);
}

export function isHorizontalBeam(beamName: string): boolean {
    return beamName === BEAM_NAMES.TOP || beamName === BEAM_NAMES.BOTTOM;
}

export function isVerticalBeam(beamName: string): boolean {
    return beamName === BEAM_NAMES.LEFT || beamName === BEAM_NAMES.RIGHT;
}