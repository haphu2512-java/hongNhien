import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const AdminOrderDetailsModal = ({ isOpen, onClose, order }) => {
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fullOrderData, setFullOrderData] = useState(null);
    const [userData, setUserData] = useState(null);
    const modalRef = useRef(null);

    // Xử lý click ra ngoài để đóng modal
    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    // Format tiền VND
    const formatVND = (amount) => {
        if (amount === undefined || amount === null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Lấy thông tin chi tiết đơn hàng, người dùng và sản phẩm
    useEffect(() => {
        async function fetchData() {
            if (!order) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('Order summary data:', order);

                // Lấy danh sách tất cả người dùng
                const usersResponse = await fetch(
                    'http://localhost:3001/users'
                );
                if (!usersResponse.ok) {
                    throw new Error('Không thể tải danh sách người dùng');
                }

                const users = await usersResponse.json();
                console.log('All users:', users);

                // Tìm người dùng có đơn hàng này
                let foundUser = null;
                let foundOrder = null;

                for (const user of users) {
                    if (user.orders && user.orders.length > 0) {
                        const matchingOrder = user.orders.find(
                            (o) => o.id === order.orderId
                        );
                        if (matchingOrder) {
                            foundUser = user;
                            foundOrder = matchingOrder;
                            break;
                        }
                    }
                }

                if (foundUser) {
                    console.log('Found user:', foundUser);
                    setUserData(foundUser);
                }

                if (foundOrder) {
                    console.log('Found full order data:', foundOrder);
                    setFullOrderData(foundOrder);

                    // Kiểm tra xem order có items không
                    const items = foundOrder.items || [];
                    if (items.length === 0) {
                        setLoading(false);
                        return;
                    }

                    // Lấy tất cả sản phẩm
                    const productsResponse = await fetch(
                        'http://localhost:3001/products'
                    );
                    if (!productsResponse.ok) {
                        throw new Error('Không thể tải danh sách sản phẩm');
                    }

                    const allProducts = await productsResponse.json();
                    console.log('Tất cả sản phẩm:', allProducts);

                    // Tạo map từ productId đến thông tin sản phẩm
                    const productDetails = {};

                    // Lọc sản phẩm theo productId trong đơn hàng
                    items.forEach((item) => {
                        if (!item.productId) return;

                        const product = allProducts.find(
                            (p) =>
                                String(p.productId) === String(item.productId)
                        );
                        if (product) {
                            productDetails[item.productId] = product;
                        } else {
                            console.warn(
                                `Không tìm thấy sản phẩm với productId: ${item.productId}`
                            );
                        }
                    });

                    console.log('Sản phẩm trong đơn hàng:', productDetails);
                    setProducts(productDetails);
                } else {
                    setError('Không tìm thấy thông tin đầy đủ của đơn hàng');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Không thể tải thông tin: ' + error.message);
            } finally {
                setLoading(false);
            }
        }

        if (isOpen && order) {
            fetchData();
        }
    }, [isOpen, order]);

    // Thêm event listener cho click ra ngoài
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !order) return null;

    // Lấy hình ảnh sản phẩm
    const getProductImage = (productId) => {
        return products[productId]?.image || '/placeholder.svg';
    };

    // Sử dụng dữ liệu đầy đủ nếu có, nếu không thì sử dụng dữ liệu tóm tắt
    const displayOrder = fullOrderData || order;

    // Kiểm tra dữ liệu order
    const orderItems = fullOrderData?.items || [];
    const customerInfo = fullOrderData?.customerInfo || {};
    const orderStatus = displayOrder.status || 'Không có thông tin';
    const orderDate = displayOrder.date || 'Không có thông tin';
    const orderTime = fullOrderData?.time || 'Không có thông tin';
    const orderId = displayOrder.id || displayOrder.orderId || 'N/A';
    const totalAmount = fullOrderData?.totalAmount || 0;
    const shippingFee = fullOrderData?.shippingFee || 0;
    const subtotal = fullOrderData?.subtotal || totalAmount;

    // Kiểm tra xem có sản phẩm nào được tìm thấy không
    const hasProducts = Object.keys(products).length > 0;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleOutsideClick}>
            <div
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
                ref={modalRef}>
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">
                        Chi tiết đơn hàng #{orderId}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <p className="text-center py-4">
                            Đang tải thông tin...
                        </p>
                    ) : error ? (
                        <div className="text-center text-red-500 py-4">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Ngày đặt hàng:
                                    </p>
                                    <p>{orderDate}</p>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Thời gian đặt:
                                    </p>
                                    <p>{orderTime || 'Không có thông tin'}</p>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Trạng thái giao hàng:
                                    </p>
                                    <p
                                        className={`font-semibold px-2 py-1 rounded ${
                                            orderStatus === 'Chưa giao'
                                                ? 'text-blue-500 '
                                                : orderStatus === 'Đang giao'
                                                ? 'text-yellow-500 '
                                                : orderStatus === 'Đã giao'
                                                ? 'text-green-500 '
                                                : orderStatus === 'Đã hủy'
                                                ? 'text-red-500 '
                                                : 'text-gray-600 '
                                        }`}>
                                        {orderStatus}
                                    </p>
                                </div>
                            </div>

                            {customerInfo &&
                            Object.keys(customerInfo).length > 0 ? (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-lg mb-3">
                                        Thông tin người nhận
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="mb-2">
                                            <span className="font-medium">
                                                Họ tên:
                                            </span>{' '}
                                            {customerInfo.fullName ||
                                                userData?.name ||
                                                'N/A'}
                                        </p>
                                        <p className="mb-2">
                                            <span className="font-medium">
                                                Số điện thoại:
                                            </span>{' '}
                                            {customerInfo.phone || 'N/A'}
                                        </p>
                                        <p className="mb-2">
                                            <span className="font-medium">
                                                Địa chỉ:
                                            </span>{' '}
                                            {customerInfo.address
                                                ? `${customerInfo.address}, ${
                                                      customerInfo.ward || ''
                                                  }, ${
                                                      customerInfo.district ||
                                                      ''
                                                  }, ${customerInfo.city || ''}`
                                                : 'N/A'}
                                        </p>
                                        {customerInfo.note && (
                                            <p className="mb-2">
                                                <span className="font-medium">
                                                    Ghi chú:
                                                </span>{' '}
                                                {customerInfo.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : userData ? (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-lg mb-3">
                                        Thông tin người đặt
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="mb-2">
                                            <span className="font-medium">
                                                Họ tên:
                                            </span>{' '}
                                            {userData.name || 'N/A'}
                                        </p>
                                        <p className="mb-2">
                                            <span className="font-medium">
                                                Email:
                                            </span>{' '}
                                            {userData.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {orderItems.length > 0 && hasProducts ? (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-lg mb-3">
                                        Sản phẩm đã đặt
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600">
                                            <div className="col-span-6">
                                                Sản phẩm
                                            </div>
                                            <div className="col-span-2 text-center">
                                                Đơn giá
                                            </div>
                                            <div className="col-span-2 text-center">
                                                Số lượng
                                            </div>
                                            <div className="col-span-2 text-center">
                                                Thành tiền
                                            </div>
                                        </div>

                                        {orderItems.map((item, index) => (
                                            <div
                                                key={`${item.productId}-${index}`}
                                                className="border-t border-gray-100 p-4">
                                                <div className="grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-6 flex items-center gap-4">
                                                        <div className="relative">
                                                            <img
                                                                src={getProductImage(
                                                                    item.productId
                                                                )}
                                                                alt={
                                                                    products[
                                                                        item
                                                                            .productId
                                                                    ]?.title ||
                                                                    'Sản phẩm'
                                                                }
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-800">
                                                                {products[
                                                                    item
                                                                        .productId
                                                                ]?.title ||
                                                                    `Sản phẩm #${item.productId}`}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    <div className="col-span-2 text-center">
                                                        {formatVND(
                                                            item.price ||
                                                                products[
                                                                    item
                                                                        .productId
                                                                ]?.price ||
                                                                0
                                                        )}
                                                    </div>

                                                    <div className="col-span-2 text-center">
                                                        {item.quantity || 1}
                                                    </div>

                                                    <div className="col-span-2 text-center font-medium text-red-500">
                                                        {formatVND(
                                                            (item.price ||
                                                                products[
                                                                    item
                                                                        .productId
                                                                ]?.price ||
                                                                0) *
                                                                (item.quantity ||
                                                                    1)
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6 text-center text-gray-500 py-4 bg-gray-50 rounded">
                                    Không có thông tin sản phẩm
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">Tạm tính:</p>
                                    <p>{formatVND(subtotal)}</p>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Phí vận chuyển:
                                    </p>
                                    {shippingFee === 0 ? (
                                        <p className="text-green-500">
                                            Miễn phí
                                        </p>
                                    ) : (
                                        <p>{formatVND(shippingFee)}</p>
                                    )}
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <p>Tổng cộng:</p>
                                    <p className="text-red-500">
                                        {formatVND(totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end p-6 border-t sticky bottom-0 bg-white">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailsModal;
