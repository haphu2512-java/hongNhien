import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import EditProfileModal from '../components/EditProfileModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { Pencil, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserProfileDetails() {
    const { user, isAuthenticated } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] =
        useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    // Mở modal chi tiết đơn hàng
    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsOrderDetailsModalOpen(true);
    };

    // Đóng modal chi tiết đơn hàng
    const closeOrderDetails = () => {
        setIsOrderDetailsModalOpen(false);
        setSelectedOrder(null);
        refreshUserData(); // Refresh data when modal closes
    };
    // VND formatter
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    // Lấy thông tin chi tiết của người dùng từ API
    useEffect(() => {
        async function fetchUserData() {
            if (!user || !user.id) return;

            try {
                const response = await fetch(
                    `http://localhost:3001/users/${user.id}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Thông tin chi tiết người dùng:', data);
                setUserDetails(data);
            } catch (err) {
                console.error('Error fetching user details:', err);
            }
        }

        fetchUserData();
    }, [user]);

    useEffect(() => {
        // Tải lịch đặt tư vấn của người dùng
        async function fetchUserBookings() {
            if (!user || !user.id) return;

            setLoading(true);
            try {
                // Tìm tất cả các booking có userId trùng với id của người dùng hiện tại
                const response = await fetch(
                    `http://localhost:3001/bookings?userId=${user.id}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Lịch đặt tư vấn của người dùng:', data);
                setBookings(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching user bookings:', err);
                setError(
                    'Không thể tải lịch đặt tư vấn. Vui lòng thử lại sau.'
                );
            } finally {
                setLoading(false);
            }
        }

        fetchUserBookings();
    }, [user]);

    // Nếu chưa đăng nhập, chuyển hướng về trang chủ
    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    // Nếu không có user, hiển thị thông báo
    if (!user)
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p>Vui lòng đăng nhập để xem thông tin cá nhân</p>
            </div>
        );

    // Sử dụng thông tin chi tiết nếu có, nếu không thì dùng thông tin cơ bản
    const displayUser = userDetails || user;

    const handleUserUpdate = (updatedUser) => {
        setUserDetails(updatedUser);
    };

    const getServiceName = (serviceId) => {
        const serviceMap = {
            skincare: 'Tư vấn chăm sóc da mặt',
            makeup: 'Tư vấn trang điểm',
            body: 'Tư vấn chăm sóc cơ thể',
            hair: 'Tư vấn chăm sóc tóc',
            bodycare: 'Tư vấn chăm sóc cơ thể',
            haircare: 'Tư vấn chăm sóc tóc',
        };

        return serviceMap[serviceId] || 'Dịch vụ khác';
    };

    const getSkinTypeName = (skinType) => {
        const skinTypeMap = {
            oily: 'Da dầu',
            dry: 'Da khô',
            sensitive: 'Da nhạy cảm',
            combination: 'Da hỗn hợp',
            normal: 'Da thường',
        };

        return skinTypeMap[skinType] || skinType || 'Chưa xác định';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            // Nếu đã ở định dạng d/m/yyyy, trả về nguyên bản
            if (dateString.includes('/')) {
                return dateString;
            }

            // Nếu là định dạng ISO hoặc yyyy-mm-dd
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // Nếu không phải định dạng ISO, thử xử lý yyyy-mm-dd
                const [year, month, day] = dateString.split('-');
                return `${day.padStart(2, '0')}/${month.padStart(
                    2,
                    '0'
                )}/${year}`;
            }

            // Định dạng ISO thành d/m/yyyy
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return dateString;
        }
    };

    const refreshUserData = async () => {
        if (user && user.id) {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:3001/users/${user.id}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setUserDetails(data);
                }
            } catch (error) {
                console.error('Error refreshing user data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Thông tin cá nhân
                        </h2>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Chỉnh sửa thông tin">
                            <Pencil size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-gray-200 rounded-full h-16 w-16 flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-600">
                                    {displayUser.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {displayUser.name}
                                </h3>
                                <p className="text-gray-600">
                                    {displayUser.email}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h4 className="font-semibold mb-2">
                                Thông tin chi tiết
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Loại da:</span>{' '}
                                {getSkinTypeName(displayUser.skinType)}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">
                                    Sản phẩm yêu thích:
                                </span>{' '}
                                {displayUser.wishlist?.length || 0} sản phẩm
                            </p>
                        </div>

                        {displayUser.wishlist &&
                            displayUser.wishlist.length > 0 && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h4 className="font-semibold mb-2">
                                        Sản phẩm yêu thích
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {displayUser.wishlist.map(
                                            (productId) => (
                                                <div
                                                    key={productId}
                                                    className="border rounded p-3 flex justify-between items-center">
                                                    <p>
                                                        Sản phẩm ID: {productId}
                                                    </p>
                                                    <Link
                                                        to={`/san-pham/${productId}`}
                                                        className="text-sm text-blue-600 hover:underline">
                                                        Xem chi tiết
                                                    </Link>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Hiển thị lịch đặt tư vấn */}
                        {loading ? (
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h4 className="font-semibold mb-2">
                                    Lịch đặt tư vấn
                                </h4>
                                <p className="text-gray-500">
                                    Đang tải lịch đặt tư vấn...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h4 className="font-semibold mb-2">
                                    Lịch đặt tư vấn
                                </h4>
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : bookings.length > 0 ? (
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h4 className="font-semibold mb-2">
                                    Lịch đặt tư vấn
                                </h4>
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h5 className="font-medium text-lg">
                                                        {getServiceName(
                                                            booking.service
                                                        )}
                                                    </h5>
                                                    <p className="text-sm text-gray-600">
                                                        Ngày hẹn:{' '}
                                                        {formatDate(
                                                            booking.date
                                                        )}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        booking.status ===
                                                        'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : booking.status ===
                                                              'confirmed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : booking.status ===
                                                              'completed'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : booking.status ===
                                                              'canceled'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {booking.status ===
                                                    'pending'
                                                        ? 'Chờ xác nhận'
                                                        : booking.status ===
                                                          'confirmed'
                                                        ? 'Đã xác nhận'
                                                        : booking.status ===
                                                          'completed'
                                                        ? 'Hoàn thành'
                                                        : booking.status ===
                                                          'canceled'
                                                        ? 'Đã hủy'
                                                        : booking.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                                                <p>
                                                    <span className="font-medium">
                                                        Loại da:
                                                    </span>{' '}
                                                    {getSkinTypeName(
                                                        booking.skinType
                                                    )}
                                                </p>
                                                <p>
                                                    <span className="font-medium">
                                                        Số điện thoại:
                                                    </span>{' '}
                                                    {booking.phone}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-700 border-t pt-2 mt-2">
                                                <span className="font-medium">
                                                    Nhu cầu:
                                                </span>{' '}
                                                {booking.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Đặt lịch vào:{' '}
                                                {new Date(
                                                    booking.createdAt
                                                ).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h4 className="font-semibold mb-2">
                                    Lịch đặt tư vấn
                                </h4>
                                <p className="text-gray-500">
                                    Bạn chưa có lịch đặt tư vấn nào.
                                </p>
                            </div>
                        )}

                        {displayUser.orders &&
                            displayUser.orders.length > 0 && (
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <h4 className="font-semibold mb-2">
                                        Lịch sử đơn hàng
                                    </h4>
                                    <div className="space-y-4">
                                        {displayUser.orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border rounded p-4">
                                                <div className="flex justify-between mb-2">
                                                    <p className="font-medium">
                                                        Đơn hàng: {order.id}
                                                    </p>
                                                    <div className="text-sm text-gray-600">
                                                        <p>{order.date}</p>
                                                        {order.time && (
                                                            <p className="text-xs">
                                                                {order.time}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-medium">
                                                        Tổng tiền:{' '}
                                                        {formatVND(
                                                            order.totalAmount
                                                        )}
                                                    </p>
                                                    <button
                                                        onClick={() =>
                                                            openOrderDetails(
                                                                order
                                                            )
                                                        }
                                                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                                        <Eye
                                                            size={16}
                                                            className="mr-1"
                                                        />
                                                        Chi tiết đơn hàng
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>

                    <EditProfileModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        user={displayUser}
                        onUserUpdate={(updatedUser) => {
                            setUserDetails(updatedUser);
                            refreshUserData(); // Gọi hàm refreshUserData để làm mới toàn bộ dữ liệu
                        }}
                    />

                    <OrderDetailsModal
                        isOpen={isOrderDetailsModalOpen}
                        onClose={closeOrderDetails}
                        order={selectedOrder}
                    />
                </div>
            </div>
        </div>
    );
}
