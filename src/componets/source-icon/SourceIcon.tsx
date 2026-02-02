import { FC } from 'react';
import {OutbrainSvg, GoogleSvg, FacebookSvg, TaboolaSvg, MgidSvg} from '@/assets';

interface SourceIconProps {
    source: string;
    size?: 'sm' | 'md' | 'lg';
}

const SOURCE_ICONS: Record<string, string> = {
    'OB': OutbrainSvg,
    'FB': FacebookSvg,
    'GGDG': GoogleSvg,
    'GGPPC': GoogleSvg,
    'TB': TaboolaSvg,
    'MG': MgidSvg
};

const SIZE_CLASSES = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};

const pulseAnimation = `
    @keyframes pulseGlow {
        0% { box-shadow: 0 0 4px rgba(255,255,255,0.3); transform: scale(1); }
        50% { box-shadow: 0 0 8px rgba(255,255,255,0.6); transform: scale(1.05); }
        100% { box-shadow: 0 0 4px rgba(255,255,255,0.3); transform: scale(1); }
    }
    .pulseGlow {
        animation: pulseGlow 4s infinite ease-in-out;
    }
`;

export const SourceIcon: FC<SourceIconProps> = ({ source, size = 'md' }) => {
    const iconSrc = SOURCE_ICONS[source];
    if (!iconSrc) return null;

    const sizeClass = SIZE_CLASSES[size];

    return (
        <>
            <style>{pulseAnimation}</style>
            <div
                title={source}
                className={`${sizeClass} shrink-0 flex items-center justify-center`}
            >
                <div
                    className={`${sizeClass} rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center shadow-sm pulseGlow`}
                    style={{ filter: "grayscale(60%)" }}
                >
                    <img
                        src={iconSrc}
                        alt={source}
                        className={`${sizeClass} filter brightness-0 invert`}
                    />
                </div>
            </div>
        </>
    );
};