import React, { useState, useEffect } from 'react';

export default function BrandsSection() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchBrands() {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3001/brands');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                // console.log('Fetched brands:', data);
                setBrands(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching brands:', err);
                setError(
                    'Không thể tải dữ liệu thương hiệu. Vui lòng thử lại sau.'
                );
            } finally {
                setLoading(false);
            }
        }

        fetchBrands();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">
                    THƯƠNG HIỆU MỸ PHẨM UY TÍN
                </h2>
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">
                    THƯƠNG HIỆU MỸ PHẨM UY TÍN
                </h2>
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center mb-12">
                THƯƠNG HIỆU MỸ PHẨM UY TÍN
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-center">
                {brands.map((brand) => (
                    <a
                        key={brand.id}
                        href={brand.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center hover:scale-105 transition-transform">
                        <img
                            src={brand.image}
                            alt={brand.name}
                            className="h-20 object-contain mb-2 grayscale hover:grayscale-0 transition duration-300"
                        />
                        {/* <span className="text-sm font-medium">
                            {brand.name}
                        </span> */}
                    </a>
                ))}
            </div>
        </div>
    );
}
