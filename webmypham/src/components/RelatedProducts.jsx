import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RelatedProducts = ({ category }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRelatedProducts() {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/products?category=${category}`);
                if (!response.ok) {
                    throw new Error('Lỗi khi tải sản phẩm liên quan');
                }
                const data = await response.json();
                setRelatedProducts(data.slice(0, 4)); // Giới hạn 4 sản phẩm
            } catch (err) {
                console.error('Lỗi khi tải sản phẩm liên quan:', err);
            } finally {
                setLoading(false);
            }
        }

        if (category) {
            fetchRelatedProducts();
        }
    }, [category]);

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return <div className="text-center py-4">Đang tải...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sản Phẩm Liên Quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                    <Link
                        key={product.productId}
                        to={`/san-pham/${product.productId}`}
                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="font-medium text-gray-900">{product.title}</h3>
                            <p className="font-bold text-lg">{formatVND(product.price)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;