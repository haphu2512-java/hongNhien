import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Minus,
    Plus,
    Trash2,
    X,
    AlertCircle,
    HelpCircle,
    CheckCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [checkoutInfo, setCheckoutInfo] = useState({
        fullName: user?.name || '',
        phone: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        note: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrderId, setLastOrderId] = useState(null);

    // Xử lý xóa sản phẩm với xác nhận
    const handleRemoveItem = (productId) => {
        setProductToDelete(productId);
        setShowDeleteConfirm(true);
    };

    // Xác nhận xóa sản phẩm
    const confirmDelete = () => {
        if (productToDelete) {
            removeFromCart(productToDelete);
            setToast({
                message: 'Đã xóa sản phẩm khỏi giỏ hàng',
                type: 'success',
            });
        }
        setShowDeleteConfirm(false);
        setProductToDelete(null);
    };

    // Xử lý xóa tất cả với xác nhận
    const handleClearCart = () => {
        setShowClearConfirm(true);
    };

    // Xác nhận xóa tất cả
    const confirmClearCart = () => {
        clearCart();
        setToast({
            message: 'Đã xóa tất cả sản phẩm khỏi giỏ hàng',
            type: 'success',
        });
        setShowClearConfirm(false);
    };

    // Xử lý thay đổi form checkout
    const handleCheckoutChange = (e) => {
        const { name, value } = e.target;
        setCheckoutInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Xử lý thanh toán
    const handleCheckout = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Lọc các sản phẩm đã chọn
            const selectedProducts = cartItems.filter((item) =>
                selectedItems.includes(item.productId)
            );

            if (isAuthenticated && user) {
                // Lấy thông tin user hiện tại
                const userResponse = await fetch(
                    `http://localhost:3001/users/${user.id}`
                );
                if (!userResponse.ok) {
                    throw new Error('Không thể lấy thông tin người dùng');
                }

                const userData = await userResponse.json();

                // Tạo đơn hàng mới với thời gian đầy đủ
                const now = new Date();
                const shippingFee = getShippingFee();
                const subtotal = getSelectedTotal();
                const newOrder = {
                    id: `order-${Date.now()}`,
                    date: now.toLocaleDateString('vi-VN'),
                    time: now.toLocaleTimeString('vi-VN'),
                    createdAt: now.toISOString(), // Lưu thời gian đầy đủ theo chuẩn ISO
                    customerInfo: checkoutInfo,
                    subtotal: subtotal,
                    shippingFee: shippingFee,
                    totalAmount: subtotal + shippingFee,
                    status: 'Chưa giao',
                    items: selectedProducts.map((item) => ({
                        productId: item.productId,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                };

                // Thêm đơn hàng mới vào mảng orders
                const updatedOrders = [...(userData.orders || []), newOrder];

                // Cập nhật thông tin user
                const updateResponse = await fetch(
                    `http://localhost:3001/users/${user.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ orders: updatedOrders }),
                    }
                );

                if (!updateResponse.ok) {
                    throw new Error(
                        'Không thể cập nhật đơn hàng vào tài khoản'
                    );
                }

                // Lưu ID đơn hàng vừa tạo
                setLastOrderId(newOrder.id);

                // Xóa các sản phẩm đã đặt hàng khỏi giỏ hàng
                selectedItems.forEach((productId) => {
                    removeFromCart(productId);
                });

                // Đóng form checkout
                setShowCheckoutForm(false);
                setSelectedItems([]);
            } else {
                throw new Error('Vui lòng đăng nhập để đặt hàng');
            }
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            setToast({
                message: error.message || 'Có lỗi xảy ra khi đặt hàng',
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm format số tiền theo định dạng VND
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Tính tổng tiền cho các sản phẩm đã chọn
    const getSelectedTotal = () => {
        return cartItems
            .filter((item) => selectedItems.includes(item.productId))
            .reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Tính phí vận chuyển
    const getShippingFee = () => {
        const subtotal = getSelectedTotal();
        return subtotal >= 300000 ? 0 : 35000;
    };

    // Tính tổng tiền bao gồm phí vận chuyển
    const getFinalTotal = () => {
        return getSelectedTotal() + getShippingFee();
    };

    const toggleItemSelection = (productId) => {
        if (selectedItems.includes(productId)) {
            setSelectedItems(selectedItems.filter((id) => id !== productId));
        } else {
            setSelectedItems([...selectedItems, productId]);
        }
    };

    // Lấy thông tin chi tiết của sản phẩm từ API
    useEffect(() => {
        async function fetchProductDetails() {
            if (cartItems.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const productIds = cartItems.map((item) => item.productId);
                const uniqueProductIds = [...new Set(productIds)];

                const productDetails = {};

                // Lấy thông tin chi tiết cho từng sản phẩm
                for (const id of uniqueProductIds) {
                    const response = await fetch(
                        `http://localhost:3001/products?productId=${id}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        if (data.length > 0) {
                            productDetails[id] = data[0];
                        }
                    }
                }

                setProducts(productDetails);
            } catch (error) {
                console.error('Error fetching product details:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProductDetails();
    }, [cartItems]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-24 min-h-screen">
                <div className="max-w-6xl mx-auto text-center">
                    <p>Đang tải thông tin giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 min-h-screen">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-8">
                        Giỏ hàng của bạn
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Giỏ hàng của bạn đang trống.
                    </p>
                    <Link
                        to="/san-pham"
                        className="inline-block bg-[#006D77] text-white px-6 py-3 rounded-md hover:bg-[#004248] transition-colors">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    // Lấy hình ảnh sản phẩm từ thông tin chi tiết nếu có
    const getProductImage = (productId) => {
        return products[productId]?.image || '/placeholder.svg';
    };

    return (
        <div className="container mx-auto px-4 py-24 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Giỏ hàng của bạn</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Danh sách sản phẩm */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600">
                                <div className="col-span-1"></div>
                                <div className="col-span-4">Sản phẩm</div>
                                <div className="col-span-2 text-center">
                                    Đơn giá
                                </div>
                                <div className="col-span-2 text-center">
                                    Số lượng
                                </div>
                                <div className="col-span-2 text-center">
                                    Thành tiền
                                </div>
                                <div className="col-span-1 text-center">
                                    Thao tác
                                </div>
                            </div>

                            {cartItems.map((item) => (
                                <div
                                    key={item.productId}
                                    className="border-t border-gray-100 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        {/* Checkbox */}
                                        <div className="md:col-span-1 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(
                                                    item.productId
                                                )}
                                                onChange={() =>
                                                    toggleItemSelection(
                                                        item.productId
                                                    )
                                                }
                                                className="w-4 h-4"
                                            />
                                        </div>

                                        {/* Sản phẩm */}
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={getProductImage(
                                                        item.productId
                                                    )}
                                                    alt={item.title}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                {products[item.productId]
                                                    ?.onSale && (
                                                    <span className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 py-0.5">
                                                        Sale
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800 text-sm">
                                                    {item.title}
                                                </h3>

                                                <div className="flex items-center gap-2 mt-1 md:hidden">
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.productId
                                                            )
                                                        }
                                                        className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700">
                                                        <Trash2 size={12} />
                                                        <span>Xóa</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Giá */}
                                        <div className="col-span-2 text-center">
                                            {products[item.productId]
                                                ?.originalPrice && (
                                                <div className="text-gray-400 line-through text-xs">
                                                    {formatCurrency(
                                                        products[item.productId]
                                                            .originalPrice
                                                    )}
                                                </div>
                                            )}
                                            <div className="text-red-500 font-medium">
                                                {formatCurrency(item.price)}
                                            </div>
                                        </div>

                                        {/* Số lượng */}
                                        <div className="col-span-2 flex justify-center">
                                            <div className="flex items-center border rounded-md">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 border-r">
                                                    <Minus size={14} />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateQuantity(
                                                            item.productId,
                                                            parseInt(
                                                                e.target.value
                                                            ) || 1
                                                        )
                                                    }
                                                    className="w-10 text-center border-none focus:outline-none"
                                                />
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 border-l">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tổng */}
                                        <div className="col-span-2 text-center font-medium text-red-500">
                                            {formatCurrency(
                                                item.price * item.quantity
                                            )}
                                        </div>

                                        {/* Thao tác */}
                                        <div className="col-span-1 text-center hidden md:block">
                                            <button
                                                onClick={() =>
                                                    handleRemoveItem(
                                                        item.productId
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={handleClearCart}
                                    className="text-sm text-red-500 hover:text-red-700 hover:font-semibold">
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tổng đơn hàng */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Tổng đơn hàng
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Tạm tính ({selectedItems.length} sản
                                        phẩm)
                                    </span>
                                    <span>
                                        {formatCurrency(getSelectedTotal())}
                                    </span>
                                </div>

                                {selectedItems.length > 0 ? (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center">
                                                Phí vận chuyển
                                                <div className="relative ml-1 group">
                                                    <HelpCircle
                                                        size={14}
                                                        className="text-gray-400 cursor-help"
                                                    />
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                                                        Đơn hàng từ{' '}
                                                        {formatCurrency(300000)}{' '}
                                                        được miễn phí vận
                                                        chuyển.
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </span>
                                            {getShippingFee() === 0 ? (
                                                <span className="text-green-500">
                                                    Miễn phí
                                                </span>
                                            ) : (
                                                <span>
                                                    {formatCurrency(
                                                        getShippingFee()
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {getShippingFee() > 0 && (
                                            <div className="text-xs text-gray-500 italic">
                                                Mua thêm{' '}
                                                {formatCurrency(
                                                    300000 - getSelectedTotal()
                                                )}{' '}
                                                để được miễn phí vận chuyển
                                            </div>
                                        )}
                                    </>
                                ) : null}

                                <div className="border-t pt-3 flex justify-between font-bold">
                                    <span>Tổng cộng</span>
                                    {selectedItems.length === 0 ? (
                                        <span className="text-gray-400">-</span>
                                    ) : (
                                        <span>
                                            {formatCurrency(getFinalTotal())}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (selectedItems.length > 0) {
                                        if (!isAuthenticated) {
                                            setToast({
                                                message:
                                                    'Vui lòng đăng nhập để thanh toán',
                                                type: 'error',
                                            });
                                            return;
                                        }
                                        setShowCheckoutForm(true);
                                    }
                                }}
                                className={`w-full py-3 rounded-md transition-colors ${
                                    selectedItems.length > 0
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={selectedItems.length === 0}>
                                Thanh toán
                            </button>

                            <div className="mt-4">
                                <Link
                                    to="/san-pham"
                                    className="text-sm text-gray-600 hover:text-blue-700 hover:font-semibold">
                                    ← Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Form Modal */}
            {showCheckoutForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">
                                Thông tin thanh toán
                            </h2>
                            <button
                                onClick={() => setShowCheckoutForm(false)}
                                className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCheckout} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={checkoutInfo.fullName}
                                        onChange={handleCheckoutChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={checkoutInfo.phone}
                                        onChange={handleCheckoutChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tỉnh/Thành phố
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={checkoutInfo.city}
                                        onChange={handleCheckoutChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quận/Huyện
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={checkoutInfo.district}
                                        onChange={handleCheckoutChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phường/Xã
                                    </label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={checkoutInfo.ward}
                                        onChange={handleCheckoutChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa chỉ chi tiết
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={checkoutInfo.address}
                                    onChange={handleCheckoutChange}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Số nhà, tên đường..."
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ghi chú
                                </label>
                                <textarea
                                    name="note"
                                    value={checkoutInfo.note}
                                    onChange={handleCheckoutChange}
                                    className="w-full p-2 border border-gray-300 rounded-md h-20"
                                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                                />
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <h3 className="font-medium mb-3">
                                    Chi tiết đơn hàng
                                </h3>
                                <div className="space-y-2">
                                    {cartItems
                                        .filter((item) =>
                                            selectedItems.includes(
                                                item.productId
                                            )
                                        )
                                        .map((item) => (
                                            <div
                                                key={item.productId}
                                                className="flex justify-between">
                                                <span>
                                                    {item.title} x{' '}
                                                    {item.quantity}
                                                </span>
                                                <span>
                                                    {formatCurrency(
                                                        item.price *
                                                            item.quantity
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    <div className="pt-2 flex justify-between">
                                        <span>Tạm tính</span>
                                        <span>
                                            {formatCurrency(getSelectedTotal())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí vận chuyển</span>
                                        {getShippingFee() === 0 ? (
                                            <span className="text-green-500">
                                                Miễn phí
                                            </span>
                                        ) : (
                                            <span>
                                                {formatCurrency(
                                                    getShippingFee()
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="border-t pt-2 font-bold flex justify-between">
                                        <span>Tổng cộng</span>
                                        <span>
                                            {formatCurrency(getFinalTotal())}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCheckoutForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400">
                                    {isSubmitting
                                        ? 'Đang xử lý...'
                                        : 'Xác nhận đặt hàng'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa sản phẩm */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4 text-red-500">
                            <AlertCircle className="mr-2" size={24} />
                            <h3 className="text-lg font-medium">
                                Xác nhận xóa
                            </h3>
                        </div>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ
                            hàng?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal xác nhận xóa tất cả */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4 text-red-500">
                            <AlertCircle className="mr-2" size={24} />
                            <h3 className="text-lg font-medium">
                                Xác nhận xóa tất cả
                            </h3>
                        </div>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ
                            hàng?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Hủy
                            </button>
                            <button
                                onClick={confirmClearCart}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ">
                                Xóa tất cả
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thông báo đặt hàng thành công */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center mb-4 text-green-500">
                            <CheckCircle className="mr-2" size={24} />
                            <h3 className="text-lg font-medium">
                                Đặt hàng thành công!
                            </h3>
                        </div>
                        <div className="mb-6">
                            <p className="mb-2">
                                Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng
                                tôi.
                            </p>
                            <p className="mb-2">
                                Mã đơn hàng:{' '}
                                <span className="font-medium">
                                    {lastOrderId}
                                </span>
                            </p>
                            <p>
                                Bạn có thể theo dõi đơn hàng trong phần "Lịch sử
                                đơn hàng" ở trang hồ sơ cá nhân.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Link
                                to="/ho-so"
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                Xem đơn hàng
                            </Link>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
