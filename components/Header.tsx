
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="w-full bg-[#313131] shadow-md sticky top-0 z-20">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-xl font-bold text-[#e2e2e2]/90">
                        Görüntüden Excel'e
                    </h1>
                </div>
            </div>
        </header>
    );
};