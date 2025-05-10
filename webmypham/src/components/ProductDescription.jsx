import React from 'react';

const ProductDescription = ({ product, benefits }) => {
    const getBenefitNames = (benefitIds) => {
        if (
            !benefitIds ||
            !Array.isArray(benefitIds) ||
            benefitIds.length === 0
        ) {
            return [];
        }

        return benefitIds
            .map((id) => benefits.find((b) => b.id === id)?.name)
            .filter(Boolean);
    };

    return (
        <div className="container mx-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Lợi ích */}
            {/* <div className="w-full md:w-1/2">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Lợi Ích
                </h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                    {getBenefitNames(product.benefit).length > 0 ? (
                        getBenefitNames(product.benefit).map(
                            (benefit, index) => <li key={index}>{benefit}</li>
                        )
                    ) : (
                        <li>Không có thông tin công dụng cụ thể.</li>
                    )}
                </ul>
            </div>

            {/* Hình ảnh mô tả */}
            {/*<div className="w-full md:w-1/2">
                <img
                    src={product.image || 'https://via.placeholder.com/500x300'}
                    alt="Hình mô tả sản phẩm"
                    className="w-full h-auto rounded-lg shadow-md"
                />
            </div>{' '}
            */}
        </div>
    );
};

export default ProductDescription;
