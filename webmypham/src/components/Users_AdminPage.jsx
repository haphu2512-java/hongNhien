import { useState, useEffect } from 'react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        name: '',
        role: '',
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);

    // Fetch user data
    useEffect(() => {
        console.log('Fetching users from API...');
        fetch('http://localhost:3001/users')
            .then((response) => {
                if (!response.ok)
                    throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then((data) => {
                console.log('Users fetched:', data);
                // Gán role: admin cho admin001, Khách hàng cho các user khác
                const updatedData = data.map((user) => ({
                    ...user,
                    role: user.id === 'admin001' ? 'admin' : 'Khách hàng',
                }));
                setUsers(updatedData);
                setFilteredUsers(updatedData);
                setError(null);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                setError('Lỗi khi tải danh sách người dùng: ' + error.message);
            });
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = users;

        if (filters.name) {
            filtered = filtered.filter((user) =>
                user.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
        if (filters.role) {
            filtered = filtered.filter((user) => user.role === filters.role);
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [filters, users]);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Fetch user details (orders, bookings, contacts)
    const fetchUserDetails = async (userId) => {
        console.log('Fetching details for user ID:', userId);
        setError(null);
        setUserDetails(null);
        setSelectedUser(userId);
        try {
            const response = await fetch('http://localhost:3001/db');
            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            console.log('DB data fetched:', data);

            const user = data.users.find((u) => u.id === userId);
            if (!user)
                throw new Error(`Không tìm thấy người dùng với ID: ${userId}`);

            const bookings = data.bookings
                ? data.bookings.filter((b) => b.userId === userId)
                : [];
            const contacts = data.contacts
                ? data.contacts.filter((c) => c.email === user.email)
                : [];

            const userDetails = {
                ...user,
                orders: user.orders || [],
                bookings: bookings || [],
                contacts: contacts || [],
                role: user.id === 'admin001' ? 'admin' : 'Khách hàng',
            };

            console.log('User details prepared:', userDetails);
            setUserDetails(userDetails);
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Lỗi khi tải chi tiết người dùng: ' + error.message);
        }
    };

    // Close user details modal
    const closeDetails = () => {
        setSelectedUser(null);
        setUserDetails(null);
        setError(null);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Quản lý người dùng</h2>
            {error && !selectedUser && (
                <p className="text-red-500 mb-4">{error}</p>
            )}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4 p-4 border rounded">
                    <h3 className="text-lg font-semibold mb-2">
                        Bộ lọc người dùng
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">Tên</label>
                            <input
                                type="text"
                                name="name"
                                value={filters.name}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                                placeholder="Nhập tên..."
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Vai trò</label>
                            <select
                                name="role"
                                value={filters.role}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded">
                                <option value="">Tất cả</option>
                                <option value="admin">Admin</option>
                                <option value="Khách hàng">Khách hàng</option>
                            </select>
                        </div>
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b bg-gray-100">
                            <th className="p-2">ID</th>
                            <th className="p-2">Tên</th>
                            <th className="p-2">Vai trò</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="p-2">{user.id}</td>
                                <td className="p-2">{user.name}</td>
                                <td className="p-2">{user.role}</td>
                                <td className="p-2">{user.email}</td>
                                <td className="p-2 flex space-x-2">
                                    <button
                                        onClick={() =>
                                            fetchUserDetails(user.id)
                                        }
                                        className="text-blue-500 hover:underline">
                                        Xem
                                    </button>
                                    {/* <button className="text-red-500 hover:underline">
                                        Xóa
                                    </button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                    <p>{filteredUsers.length} kết quả</p>
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-2">
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                className="border px-3 py-1 rounded disabled:opacity-50">
                                Trước
                            </button>
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded ${
                                        currentPage === page
                                            ? 'bg-blue-500 text-white'
                                            : 'border'
                                    }`}>
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                className="border px-3 py-1 rounded disabled:opacity-50">
                                Sau
                            </button>
                        </div>
                        <select
                            value={rowsPerPage}
                            onChange={handleRowsPerPageChange}
                            className="border p-2 rounded">
                            <option value={5}>5 hàng/trang</option>
                            <option value={10}>10 hàng/trang</option>
                            <option value={20}>20 hàng/trang</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl max-h-[80vh] overflow-y-auto">
                        {error ? (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">
                                    Lỗi
                                </h3>
                                <p className="text-red-500">{error}</p>
                                <button
                                    onClick={closeDetails}
                                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                    Đóng
                                </button>
                            </div>
                        ) : userDetails ? (
                            <>
                                <h3 className="text-lg font-semibold mb-4">
                                    Chi tiết người dùng: {userDetails.name}
                                </h3>

                                {/* Orders */}
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold mb-2">
                                        Đơn hàng
                                    </h4>
                                    {userDetails.orders.length > 0 ? (
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b bg-gray-100">
                                                    <th className="p-2">
                                                        Mã đơn
                                                    </th>
                                                    <th className="p-2">
                                                        Ngày đặt
                                                    </th>
                                                    <th className="p-2">
                                                        Tổng tiền
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userDetails.orders.map(
                                                    (order) => (
                                                        <tr
                                                            key={order.id}
                                                            className="border-b">
                                                            <td className="p-2">
                                                                {order.id}
                                                            </td>
                                                            <td className="p-2">
                                                                {order.date}
                                                            </td>
                                                            <td className="p-2">
                                                                {order.totalAmount.toLocaleString(
                                                                    'vi-VN',
                                                                    {
                                                                        style: 'currency',
                                                                        currency:
                                                                            'VND',
                                                                    }
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500">
                                            Không có đơn hàng nào.
                                        </p>
                                    )}
                                </div>

                                {/* Bookings */}
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold mb-2">
                                        Dịch vụ đã đặt
                                    </h4>
                                    {userDetails.bookings.length > 0 ? (
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b bg-gray-100">
                                                    <th className="p-2">
                                                        Mã đặt lịch
                                                    </th>
                                                    <th className="p-2">
                                                        Dịch vụ
                                                    </th>
                                                    <th className="p-2">
                                                        Ngày đặt
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userDetails.bookings.map(
                                                    (booking) => (
                                                        <tr
                                                            key={booking.id}
                                                            className="border-b">
                                                            <td className="p-2">
                                                                {booking.id}
                                                            </td>
                                                            <td className="p-2">
                                                                {
                                                                    booking.service
                                                                }
                                                            </td>
                                                            <td className="p-2">
                                                                {booking.date}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500">
                                            Không có dịch vụ nào được đặt.
                                        </p>
                                    )}
                                </div>

                                {/* Contacts */}
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold mb-2">
                                        Liên hệ
                                    </h4>
                                    {userDetails.contacts.length > 0 ? (
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b bg-gray-100">
                                                    <th className="p-2">
                                                        Ngày
                                                    </th>
                                                    <th className="p-2">
                                                        Tin nhắn
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userDetails.contacts.map(
                                                    (contact) => (
                                                        <tr
                                                            key={contact.id}
                                                            className="border-b">
                                                            <td className="p-2">
                                                                {contact.date}
                                                            </td>
                                                            <td className="p-2">
                                                                {
                                                                    contact.message
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500">
                                            Không có liên hệ nào.
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={closeDetails}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                    Đóng
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-500">Đang tải dữ liệu...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
