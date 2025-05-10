import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const modalRef = useRef(null);

    // Xử lý click ra ngoài để đóng modal
    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    // Format tiền VND
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Lấy thông tin chi tiết sản phẩm
    useEffect(() => {
        async function fetchProductDetails() {
            if (!order || !order.items || order.items.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const productIds = order.items.map((item) => item.productId);
                const uniqueProductIds = [...new Set(productIds)];
                const productDetails = {};

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

        if (isOpen && order) {
            fetchProductDetails();
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

    // Xử lý khi người dùng xác nhận đã nhận hàng
    const handleConfirmReceived = async () => {
        if (!user || !user.id) {
            alert('Bạn cần đăng nhập để thực hiện thao tác này');
            return;
        }

        try {
            // Hiển thị thông báo xác nhận
            if (
                window.confirm(
                    'Vui lòng chỉ xác nhận khi bạn đã nhận được hàng. Bạn đã nhận được hàng chưa?'
                )
            ) {
                // Lấy thông tin user hiện tại
                const response = await fetch(
                    `http://localhost:3001/users/${user.id}`
                );
                if (!response.ok)
                    throw new Error('Không thể lấy thông tin người dùng');

                const userData = await response.json();

                // Tìm và cập nhật đơn hàng
                const updatedOrders = userData.orders.map((o) => {
                    if (o.id === order.id) {
                        console.log(
                            `Cập nhật đơn hàng ${o.id} từ ${o.status} thành Đã giao`
                        );
                        return { ...o, status: 'Đã giao' };
                    }
                    return o;
                });

                // Cập nhật lên server
                const updateResponse = await fetch(
                    `http://localhost:3001/users/${user.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orders: updatedOrders,
                        }),
                    }
                );

                if (!updateResponse.ok)
                    throw new Error('Không thể cập nhật trạng thái đơn hàng');

                alert('Cảm ơn bạn đã xác nhận!');
                onClose();

                // Sử dụng navigate để chuyển đến trang hồ sơ
                navigate('/ho-so');
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
            alert('Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    // Xử lý khi người dùng hủy đơn hàng
    const handleCancelOrder = async () => {
        if (!user || !user.id) {
            alert('Bạn cần đăng nhập để thực hiện thao tác này');
            return;
        }

        try {
            // Hiển thị thông báo xác nhận
            if (
                window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')
            ) {
                // Lấy thông tin user hiện tại
                const response = await fetch(
                    `http://localhost:3001/users/${user.id}`
                );
                if (!response.ok)
                    throw new Error('Không thể lấy thông tin người dùng');

                const userData = await response.json();

                // Tìm và cập nhật đơn hàng
                const updatedOrders = userData.orders.map((o) => {
                    if (o.id === order.id) {
                        console.log(
                            `Cập nhật đơn hàng ${o.id} từ ${o.status} thành Đã hủy`
                        );
                        return { ...o, status: 'Đã hủy' };
                    }
                    return o;
                });

                // Cập nhật lên server
                const updateResponse = await fetch(
                    `http://localhost:3001/users/${user.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orders: updatedOrders,
                        }),
                    }
                );

                if (!updateResponse.ok)
                    throw new Error('Không thể cập nhật trạng thái đơn hàng');

                alert('Đơn hàng đã được hủy thành công!');
                onClose();

                // Sử dụng navigate để chuyển đến trang hồ sơ
                navigate('/ho-so');
            }
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            alert('Đã xảy ra lỗi khi hủy đơn hàng');
        }
    };

    if (!isOpen || !order) return null;

    // Lấy hình ảnh sản phẩm
    const getProductImage = (productId) => {
        return products[productId]?.image || '/placeholder.svg';
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleOutsideClick}>
            <div
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
                ref={modalRef}>
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">
                        Chi tiết đơn hàng #{order.id}
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
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Ngày đặt hàng:
                                    </p>
                                    <p>{order.date}</p>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Thời gian đặt:
                                    </p>
                                    <p>{order.time || 'Không có thông tin'}</p>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Trạng thái giao hàng:
                                    </p>
                                    <p
                                        className={`font-semibold px-2 py-1 rounded ${
                                            order.status === 'Chưa giao'
                                                ? 'text-blue-500 '
                                                : order.status === 'Đang giao'
                                                ? 'text-yellow-500 '
                                                : order.status === 'Đã giao'
                                                ? 'text-green-500 '
                                                : order.status === 'Đã hủy'
                                                ? 'text-red-500 '
                                                : 'text-gray-600 '
                                        }`}>
                                        {order.status || 'Không có thông tin'}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-3">
                                    Thông tin người nhận
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="mb-2">
                                        <span className="font-medium">
                                            Họ tên:
                                        </span>{' '}
                                        {order.customerInfo.fullName}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-medium">
                                            Số điện thoại:
                                        </span>{' '}
                                        {order.customerInfo.phone}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-medium">
                                            Địa chỉ:
                                        </span>{' '}
                                        {order.customerInfo.address},{' '}
                                        {order.customerInfo.ward},{' '}
                                        {order.customerInfo.district},{' '}
                                        {order.customerInfo.city}
                                    </p>
                                    {order.customerInfo.note && (
                                        <p className="mb-2">
                                            <span className="font-medium">
                                                Ghi chú:
                                            </span>{' '}
                                            {order.customerInfo.note}
                                        </p>
                                    )}
                                </div>
                            </div>

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

                                    {order.items.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="border-t border-gray-100 p-4">
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-6 flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={getProductImage(
                                                                item.productId
                                                            )}
                                                            alt={
                                                                item.title ||
                                                                'Sản phẩm'
                                                            }
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-800">
                                                            {item.title ||
                                                                products[
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
                                                                item.productId
                                                            ]?.price ||
                                                            0
                                                    )}
                                                </div>

                                                <div className="col-span-2 text-center">
                                                    {item.quantity}
                                                </div>

                                                <div className="col-span-2 text-center font-medium text-red-500">
                                                    {formatVND(
                                                        (item.price ||
                                                            products[
                                                                item.productId
                                                            ]?.price ||
                                                            0) * item.quantity
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">Tạm tính:</p>
                                    <p>
                                        {formatVND(
                                            order.subtotal || order.totalAmount
                                        )}
                                    </p>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <p className="font-medium">
                                        Phí vận chuyển:
                                    </p>
                                    {order.shippingFee === 0 ? (
                                        <p className="text-green-500">
                                            Miễn phí
                                        </p>
                                    ) : (
                                        <p>
                                            {formatVND(order.shippingFee || 0)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <p>Tổng cộng:</p>
                                    <p className="text-red-500">
                                        {formatVND(order.totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end p-6 border-t sticky bottom-0 bg-white">
                    {order.status === 'Đang giao' && (
                        <button
                            onClick={handleConfirmReceived}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2">
                            Đã nhận hàng
                        </button>
                    )}
                    {order.status === 'Chưa giao' && (
                        <button
                            onClick={handleCancelOrder}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 mr-2">
                            Hủy đơn hàng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
