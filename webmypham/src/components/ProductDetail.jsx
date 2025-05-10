import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import Toast from './Toast';
const ProductDetail = ({ product }) => {
    const { addToCart } = useCart();
    const [skinTypes, setSkinTypes] = useState([]);
    const [toast, setToast] = useState(null);
    useEffect(() => {
        // Fetch skin types data
        const fetchSkinTypes = async () => {
            try {
                const response = await fetch('http://localhost:3001/skinTypes');
                if (response.ok) {
                    const data = await response.json();
                    setSkinTypes(data);
                }
            } catch (error) {
                console.error('Error fetching skin types:', error);
            }
        };

        fetchSkinTypes();
    }, []);

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleAddToCart = () => {
        const cartItem = {
            productId: product.productId,
            title: product.title,
            price: product.price,
            quantity: 1,
        };
        addToCart(cartItem);
        setToast({
            message: `Đã thêm "${product.title}" vào giỏ hàng!`,
            type: 'success',
        });
    };

    const getSkinTypeNames = (skinTypeIds) => {
        if (!skinTypeIds || skinTypeIds.length === 0) return 'Tất cả loại da';

        return skinTypeIds
            .map((id) => {
                const skinType = skinTypes.find((st) => st.id === id);
                return skinType ? skinType.name : id;
            })
            .join(', ');
    };

    return (
        <div className="container mx-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Hình ảnh sản phẩm */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                <img
                    src={product.image || 'https://via.placeholder.com/400x400'}
                    alt={product.title}
                    className="w-full h-auto rounded-lg shadow-md"
                />
                {/* Không có additionalImages, bỏ phần hiển thị ảnh thu nhỏ */}
            </div>

            {/* Thông tin sản phẩm */}
            <div className="w-full md:w-2/3">
                <h1 className="text-2xl font-bold text-gray-800">
                    {product.title}
                </h1>
                {/* <p className="text-lg text-gray-600 mt-1">
                    Thương hiệu: {brand?.name || 'Không xác định'}
                </p> */}
                <p className="text-3xl font-semibold text-gray-800 mt-2">
                    {formatVND(product.price)}
                </p>
                {product.originalPrice && (
                    <p className="text-gray-400 line-through mt-1">
                        {formatVND(product.originalPrice)}
                    </p>
                )}
                <p className="text-gray-600 mt-4">{product.description}</p>

                <p className="text-gray-600 mt-2">
                    Phù hợp với:{' '}
                    {getSkinTypeNames(product.skinType) || 'Tất cả loại da'}
                </p>
                <div className="mt-4 flex gap-4">
                    <button
                        className="bg-[#006D77] text-white px-6 py-2 rounded-lg hover:bg-[#004349]"
                        onClick={handleAddToCart}>
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default ProductDetail;
