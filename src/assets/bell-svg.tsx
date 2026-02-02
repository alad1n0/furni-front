import React from 'react';

const StatisticsSvg: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="2" y1="20" x2="22" y2="20" />
        <path d="M5,20V8.2A.2.2,0,0,1,5.2,8H7.8a.2.2,0,0,1,.2.2V20" />
        <path d="M11,20V4.27c0-.15.09-.27.2-.27h2.6c.11,0,.2.12.2.27V20" />
        <path d="M17,20V11.15c0-.08.09-.15.2-.15h2.6c.11,0,.2.07.2.15V20" />
    </svg>
);

export default StatisticsSvg;
