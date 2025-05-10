import React from 'react';

const HeroRecipeCard = () => {
    return (
        <div className="absolute transform -translate-y-1/2">
            <div className="relative bg-gray-100 bg-opacity-90 px-12 py-10 flex flex-col items-start text-left w-[500px] max-w-full">
                <h2 className="text-5xl font-bold text-gray-900 mb-4">
                    Món quà cho làn da của bạn
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                    Khám phá công thức làm đẹp tự nhiên, mang đến vẻ rạng rỡ và sức sống mỗi ngày
                </p>
                <div className="flex justify-start">
                    <button className="bg-gray-500 text-white font-semibold px-8 py-3 flex items-center hover:bg-white hover:text-black border-2 border-gray-500 transition duration-300 ease-in-out">
                        Khám phá ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroRecipeCard;