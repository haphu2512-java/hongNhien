import { useState, useEffect } from 'react';

const Services = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: '',
        service: '',
        skinType: '',
    });
    const [sortOrder, setSortOrder] = useState('desc');
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isAddingAppointment, setIsAddingAppointment] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        name: '',
        phone: '',
        email: '',
        date: '',
        service: '',
        skinType: '',
        message: '',
        status: 'pending',
    });

    const serviceMap = {
        skincare: 'Chăm sóc da mặt',
        makeup: 'Trang điểm',
        haircare: 'Chăm sóc tóc',
        bodycare: 'Chăm sóc cơ thể',
        hair: 'Chăm sóc tóc', // Handle 'hair' from db.json
    };

    const skinTypeMap = {
        oily: 'Da dầu',
        dry: 'Da khô',
        sensitive: 'Da nhạy cảm',
        combination: 'Da hỗn hợp',
        normal: 'Da thường',
    };

    const formatDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') {
            return 'N/A';
        }

        try {
            // Nếu đã ở định dạng d/m/yyyy, trả về nguyên bản
            if (dateStr.includes('/')) {
                return dateStr;
            }

            // Chuyển từ yyyy-mm-dd sang d/m/yyyy
            const [year, month, day] = dateStr.split('-');
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        } catch (error) {
            console.error('Error formatting date:', error, dateStr);
            return dateStr;
        }
    };

    const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') {
            return new Date();
        }

        try {
            if (dateStr.includes('/')) {
                // Định dạng d/m/yyyy
                const [day, month, year] = dateStr.split('/').map(Number);
                return new Date(year, month - 1, day);
            } else {
                // Định dạng yyyy-mm-dd
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day);
            }
        } catch (error) {
            console.error('Error parsing date:', error, dateStr);
            return new Date();
        }
    };

    useEffect(() => {
        fetch('http://localhost:3001/bookings')
            .then((response) => response.json())
            .then((data) => {
                const formattedData = data.map((booking) => ({
                    id: booking.id,
                    customer: booking.name,
                    phone: booking.phone,
                    email: booking.email,
                    date: formatDate(booking.date),
                    rawDate: booking.date,
                    service: serviceMap[booking.service] || booking.service,
                    skinType: skinTypeMap[booking.skinType] || booking.skinType,
                    message: booking.message,
                    status:
                        {
                            pending: 'Chờ xử lý',
                            confirmed: 'Xác nhận',
                            completed: 'Hoàn thành',
                            canceled: 'Đã hủy',
                        }[booking.status] || booking.status,
                    createdAt: booking.createdAt,
                }));
                setAppointments(formattedData);
                setFilteredAppointments(formattedData);
            })
            .catch((error) => console.error('Error fetching bookings:', error));
    }, []);

    useEffect(() => {
        let filtered = [...appointments];

        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(
                (app) => parseDate(app.rawDate) >= start
            );
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            filtered = filtered.filter((app) => parseDate(app.rawDate) <= end);
        }
        if (filters.status) {
            filtered = filtered.filter((app) => app.status === filters.status);
        }
        if (filters.service) {
            filtered = filtered.filter(
                (app) => app.service === filters.service
            );
        }
        if (filters.skinType) {
            filtered = filtered.filter(
                (app) => app.skinType === filters.skinType
            );
        }

        // Sort by rawDate
        filtered.sort((a, b) => {
            const dateA = parseDate(a.rawDate);
            const dateB = parseDate(b.rawDate);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setFilteredAppointments(filtered);
        setCurrentPage(1);
    }, [filters, sortOrder, appointments]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
            fetch(`http://localhost:3001/bookings/${id}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (!response.ok)
                        throw new Error('Failed to delete booking');
                    setAppointments(
                        appointments.filter((app) => app.id !== id)
                    );
                })
                .catch((error) =>
                    console.error('Error deleting booking:', error)
                );
        }
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleCheckboxChange = (id) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setSelectedIds(
            isChecked
                ? new Set(paginatedAppointments.map((app) => app.id))
                : new Set()
        );
    };

    const updateStatus = (newStatus) => {
        if (selectedIds.size === 0) return;

        const updates = Array.from(selectedIds).map((id) =>
            fetch(`http://localhost:3001/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status:
                        newStatus === 'Chờ xử lý'
                            ? 'pending'
                            : newStatus === 'Xác nhận'
                            ? 'confirmed'
                            : newStatus === 'Hoàn thành'
                            ? 'completed'
                            : 'canceled',
                }),
            })
        );

        Promise.all(updates)
            .then((responses) => {
                if (responses.every((res) => res.ok)) {
                    setAppointments((prev) =>
                        prev.map((app) =>
                            selectedIds.has(app.id)
                                ? { ...app, status: newStatus }
                                : app
                        )
                    );
                    setSelectedIds(new Set());
                }
            })
            .catch((error) => console.error('Error updating status:', error));
    };

    const totalPages = Math.ceil(filteredAppointments.length / rowsPerPage);
    const paginatedAppointments = filteredAppointments.slice(
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

    const handleAppointmentInputChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddAppointment = () => {
        // Validate required fields
        if (
            !newAppointment.name ||
            !newAppointment.phone ||
            !newAppointment.date ||
            !newAppointment.service
        ) {
            alert(
                'Vui lòng điền đầy đủ thông tin bắt buộc: Tên, Số điện thoại, Ngày hẹn, Dịch vụ'
            );
            return;
        }

        const appointment = {
            id: `booking-${Date.now()}`,
            name: newAppointment.name,
            phone: newAppointment.phone,
            email: newAppointment.email,
            date: newAppointment.date,
            service: newAppointment.service,
            skinType: newAppointment.skinType,
            message: newAppointment.message,
            status: newAppointment.status,
            createdAt: new Date().toISOString(),
        };

        fetch('http://localhost:3001/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to add appointment');
                return response.json();
            })
            .then((data) => {
                // Format the new appointment to match the existing format
                const formattedAppointment = {
                    id: data.id,
                    customer: data.name,
                    phone: data.phone,
                    email: data.email,
                    date: formatDate(data.date),
                    rawDate: data.date,
                    service: serviceMap[data.service] || data.service,
                    skinType: skinTypeMap[data.skinType] || data.skinType,
                    message: data.message,
                    status:
                        {
                            pending: 'Chờ xử lý',
                            confirmed: 'Xác nhận',
                            completed: 'Hoàn thành',
                            canceled: 'Đã hủy',
                        }[data.status] || data.status,
                    createdAt: data.createdAt,
                };

                // Add to appointments list
                setAppointments([formattedAppointment, ...appointments]);
                setFilteredAppointments([
                    formattedAppointment,
                    ...filteredAppointments,
                ]);

                // Reset form and close modal
                setNewAppointment({
                    name: '',
                    phone: '',
                    email: '',
                    date: '',
                    service: '',
                    skinType: '',
                    message: '',
                    status: 'pending',
                });
                setIsAddingAppointment(false);
            })
            .catch((error) => {
                console.error('Error adding appointment:', error);
                alert('Có lỗi xảy ra khi thêm lịch hẹn. Vui lòng thử lại.');
            });
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Quản lý dịch vụ</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4 p-4 border rounded">
                    <h3 className="text-lg font-semibold mb-2">
                        Bộ lọc lịch hẹn
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1">Từ ngày</label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Đến ngày</label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Trạng thái</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded">
                                <option value="">Tất cả</option>
                                <option value="Chờ xử lý">Chờ xử lý</option>
                                <option value="Xác nhận">Xác nhận</option>
                                <option value="Hoàn thành">Hoàn thành</option>
                                <option value="Đã hủy">Đã hủy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">
                                Sản phẩm tư vấn
                            </label>
                            <select
                                name="service"
                                value={filters.service}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded">
                                <option value="">Tất cả</option>
                                <option value="Chăm sóc da mặt">
                                    Chăm sóc da mặt
                                </option>
                                <option value="Trang điểm">Trang điểm</option>
                                <option value="Chăm sóc tóc">
                                    Chăm sóc tóc
                                </option>
                                <option value="Chăm sóc cơ thể">
                                    Chăm sóc cơ thể
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Loại da</label>
                            <select
                                name="skinType"
                                value={filters.skinType}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded">
                                <option value="">Tất cả</option>
                                <option value="Da dầu">Da dầu</option>
                                <option value="Da khô">Da khô</option>
                                <option value="Da nhạy cảm">Da nhạy cảm</option>
                                <option value="Da hỗn hợp">Da hỗn hợp</option>
                                <option value="Da thường">Da thường</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">
                                Sắp xếp theo ngày
                            </label>
                            <select
                                value={sortOrder}
                                onChange={handleSortChange}
                                className="w-full p-2 border rounded">
                                <option value="desc">Mới nhất trước</option>
                                <option value="asc">Cũ nhất trước</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => {
                                setFilters({
                                    startDate: '',
                                    endDate: '',
                                    status: '',
                                    service: '',
                                    skinType: '',
                                });
                                setSortOrder('desc');
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                <div className="flex justify-end mb-4 space-x-2">
                    <button
                        onClick={() => setIsAddingAppointment(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Thêm lịch hẹn
                    </button>
                    <button
                        onClick={() => updateStatus('Xác nhận')}
                        disabled={selectedIds.size === 0}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        Xác nhận
                    </button>
                    <button
                        onClick={() => updateStatus('Hoàn thành')}
                        disabled={selectedIds.size === 0}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        Hoàn thành
                    </button>
                    <button
                        onClick={() => updateStatus('Đã hủy')}
                        disabled={selectedIds.size === 0}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        Hủy
                    </button>
                </div>

                {/* Form thêm lịch hẹn nằm dưới các nút */}
                {isAddingAppointment && (
                    <div className="mb-6 p-4 border rounded bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Thêm lịch hẹn mới
                            </h3>
                            <button
                                onClick={() => setIsAddingAppointment(false)}
                                className="text-gray-500 hover:text-gray-700">
                                <span className="text-xl">&times;</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1">
                                    Tên khách hàng{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newAppointment.name}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1">
                                    Số điện thoại{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={newAppointment.phone}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newAppointment.email}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">
                                    Ngày hẹn{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={newAppointment.date}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1">
                                    Dịch vụ tư vấn sản phẩm{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="service"
                                    value={newAppointment.service}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded"
                                    required>
                                    <option value="">
                                        Chọn sản phẩm tư vấn
                                    </option>
                                    <option value="skincare">
                                        Chăm sóc da mặt
                                    </option>
                                    <option value="makeup">Trang điểm</option>
                                    <option value="haircare">
                                        Chăm sóc tóc
                                    </option>
                                    <option value="bodycare">
                                        Chăm sóc cơ thể
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1">Loại da</label>
                                <select
                                    name="skinType"
                                    value={newAppointment.skinType}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded">
                                    <option value="">Chọn loại da</option>
                                    <option value="oily">Da dầu</option>
                                    <option value="dry">Da khô</option>
                                    <option value="sensitive">
                                        Da nhạy cảm
                                    </option>
                                    <option value="combination">
                                        Da hỗn hợp
                                    </option>
                                    <option value="normal">Da thường</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1">Trạng thái</label>
                                <select
                                    name="status"
                                    value={newAppointment.status}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded">
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="confirmed">Xác nhận</option>
                                    <option value="completed">
                                        Hoàn thành
                                    </option>
                                    <option value="canceled">Đã hủy</option>
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block mb-1">Lời nhắn</label>
                                <textarea
                                    name="message"
                                    value={newAppointment.message}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-2 border rounded"
                                    rows="3"></textarea>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setIsAddingAppointment(false)}
                                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
                                Hủy
                            </button>
                            <button
                                onClick={handleAddAppointment}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                                Thêm lịch hẹn
                            </button>
                        </div>
                    </div>
                )}

                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedIds.size ===
                                            paginatedAppointments.length &&
                                        paginatedAppointments.length > 0
                                    }
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="p-2">ID</th>
                            <th className="p-2">Tên khách hàng</th>
                            <th className="p-2">Số điện thoại</th>
                            <th className="p-2">Ngày hẹn</th>
                            <th className="p-2">Sản phẩm tư vấn</th>
                            <th className="p-2">Loại da</th>
                            <th className="p-2">Trạng thái</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAppointments.map((appointment) => (
                            <tr key={appointment.id} className="border-b">
                                <td className="p-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(
                                            appointment.id
                                        )}
                                        onChange={() =>
                                            handleCheckboxChange(appointment.id)
                                        }
                                    />
                                </td>
                                <td className="p-2">{appointment.id}</td>
                                <td className="p-2">{appointment.customer}</td>
                                <td className="p-2">{appointment.phone}</td>
                                <td className="p-2">{appointment.date}</td>
                                <td className="p-2">{appointment.service}</td>
                                <td className="p-2">{appointment.skinType}</td>
                                <td className="p-2">{appointment.status}</td>
                                <td className="p-2 flex space-x-2">
                                    <button
                                        onClick={() => handleView(appointment)}
                                        className="text-green-500 hover:underline">
                                        Xem
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(appointment.id)
                                        }
                                        className="text-red-500 hover:underline">
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                    <p>{filteredAppointments.length} kết quả</p>
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

            {/* Modal chi tiết lịch hẹn giữ nguyên */}
            {showModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            Chi tiết lịch hẹn
                        </h3>
                        <div className="space-y-2">
                            <p>
                                <strong>ID:</strong> {selectedAppointment.id}
                            </p>
                            <p>
                                <strong>Tên khách hàng:</strong>{' '}
                                {selectedAppointment.customer}
                            </p>
                            <p>
                                <strong>Số điện thoại:</strong>{' '}
                                {selectedAppointment.phone}
                            </p>
                            <p>
                                <strong>Email:</strong>{' '}
                                {selectedAppointment.email}
                            </p>
                            <p>
                                <strong>Ngày hẹn:</strong>{' '}
                                {selectedAppointment.date}
                            </p>
                            <p>
                                <strong>Dịch vụ:</strong>{' '}
                                {selectedAppointment.service}
                            </p>
                            <p>
                                <strong>Loại da:</strong>{' '}
                                {selectedAppointment.skinType}
                            </p>
                            <p>
                                <strong>Lời nhắn:</strong>{' '}
                                {selectedAppointment.message}
                            </p>
                            <p>
                                <strong>Trạng thái:</strong>{' '}
                                {selectedAppointment.status}
                            </p>
                            <p>
                                <strong>Ngày tạo:</strong>{' '}
                                {new Date(
                                    selectedAppointment.createdAt
                                ).toLocaleString()}
                            </p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
