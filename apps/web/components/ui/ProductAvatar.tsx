'use client';

import React from 'react';

interface ProductAvatarProps {
    name: string;
}

const ProductAvatar: React.FC<ProductAvatarProps> = ({ name }) => {
    // Generate a consistent color based on the product name
    const generateHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };

    const getPastelColor = (str: string) => {
        const hash = generateHash(str);
        const h = Math.abs(hash % 360);
        // Pastel properties: mid range saturation (40-60%) and high lightness (85-95%)
        return `hsl(${h}, 50%, 92%)`;
    };

    const getInitialColor = (str: string) => {
        const hash = generateHash(str);
        const h = Math.abs(hash % 360);
        // Darker version of the same hue for the text
        return `hsl(${h}, 60%, 30%)`;
    };

    const initials = name
        .split(' ')
        .map((word) => word.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const backgroundColor = getPastelColor(name);
    const textColor = getInitialColor(name);

    return (
        <div
            className="w-full h-32 flex items-center justify-center relative overflow-hidden select-none"
            style={{ backgroundColor }}
        >
            {/* Decorative texture - large, rotated character */}
            <span
                className="absolute -bottom-4 -right-2 text-8xl font-black rotate-12 opacity-[0.03] pointer-events-none"
                style={{ color: textColor }}
            >
                {initials[0] || '?'}
            </span>

            <span
                className="text-2xl font-black tracking-tight z-10"
                style={{ color: textColor, opacity: 0.8 }}
            >
                {initials}
            </span>
        </div>
    );
};

export default ProductAvatar;
