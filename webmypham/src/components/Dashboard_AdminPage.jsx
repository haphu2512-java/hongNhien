import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import AdminOrderDetailsModal from './AdminOrderDetailsModal';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [profit, setProfit] = useState(0);
    const [newCustomers, setNewCustomers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: '',
    });
    const [selectAll, setSelectAll] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [prevRevenue, setPrevRevenue] = useState(0);
    const [prevProfit, setPrevProfit] = useState(0);
    const [prevCustomers, setPrevCustomers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Thêm state cho thống kê đơn hàng
    const [orderStats, setOrderStats] = useState({
        total: 0,
        completed: 0,
        canceled: 0,
        shipping: 0,
        pending: 0,
        prevTotal: 0,
        prevCompleted: 0,
        prevCanceled: 0,
        prevShipping: 0,
        prevPending: 0,
    });

    // Hàm tải lại dữ liệu
    const refreshData = () => {
        setIsLoading(true);
        fetchOrderData()
            .then(() => {
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Lỗi khi tải lại dữ liệu:', error);
                setIsLoading(false);
            });
    };

    // Tách hàm fetch data để có thể gọi lại khi cần
    const fetchOrderData = async () => {
        try {
            const response = await fetch('http://localhost:3001/users');
            const users = await response.json();

            const orders = users
                .flatMap((user) =>
                    user.orders.map((order) => ({
                        ...order,
                        customerName: user.name,
                        userId: user.id,
                        rawDate: order.date,
                    }))
                )
                .map((order) => ({
                    orderId: order.id,
                    name: order.customerName,
                    value: formatCurrency(order.totalAmount),
                    date: formatDate(order.date),
                    rawDate: order.date,
                    status: order.status,
                    statusColor: getStatusColor(order.status),
                }));
            setReportData(orders);
            setFilteredData(orders);

            const totalRevenue = users
                .flatMap((user) => user.orders)
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            setRevenue(totalRevenue);
            const profitMargin = 0.35;
            setProfit(totalRevenue * profitMargin);

            const uniqueUsers = new Set(
                users
                    .filter((user) =>
                        user.orders.some(
                            (o) => parseDate(o.date) >= new Date('2025-05-01')
                        )
                    )
                    .map((user) => user.id)
            );
            setNewCustomers(uniqueUsers.size);

            const currentDate = new Date();
            const firstDayOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            );
            const firstDayOfPrevMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
                1
            );
            const lastDayOfPrevMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                0
            );

            // Lọc đơn hàng tháng hiện tại
            const currentMonthOrders = users
                .flatMap((user) => user.orders)
                .filter((order) => {
                    const orderDate = parseDate(order.date);
                    return (
                        orderDate >= firstDayOfMonth && orderDate <= currentDate
                    );
                });

            // Lọc đơn hàng tháng trước
            const prevMonthOrders = users
                .flatMap((user) => user.orders)
                .filter((order) => {
                    const orderDate = parseDate(order.date);
                    return (
                        orderDate >= firstDayOfPrevMonth &&
                        orderDate <= lastDayOfPrevMonth
                    );
                });

            // Tính toán thống kê đơn hàng tháng hiện tại
            const totalOrders = currentMonthOrders.length;
            const completedOrders = currentMonthOrders.filter(
                (order) => order.status === 'Đã giao'
            ).length;
            const canceledOrders = currentMonthOrders.filter(
                (order) => order.status === 'Đã hủy'
            ).length;
            const shippingOrders = currentMonthOrders.filter(
                (order) => order.status === 'Đang giao'
            ).length;
            const pendingOrders = currentMonthOrders.filter(
                (order) => order.status === 'Chưa giao'
            ).length;

            // Tính toán thống kê đơn hàng tháng trước
            const prevTotalOrders = prevMonthOrders.length;
            const prevCompletedOrders = prevMonthOrders.filter(
                (order) => order.status === 'Đã giao'
            ).length;
            const prevCanceledOrders = prevMonthOrders.filter(
                (order) => order.status === 'Đã hủy'
            ).length;
            const prevShippingOrders = prevMonthOrders.filter(
                (order) => order.status === 'Đang giao'
            ).length;
            const prevPendingOrders = prevMonthOrders.filter(
                (order) => order.status === 'Chưa giao'
            ).length;

            // Cập nhật state thống kê đơn hàng
            setOrderStats({
                total: totalOrders,
                completed: completedOrders,
                canceled: canceledOrders,
                shipping: shippingOrders,
                pending: pendingOrders,
                prevTotal: prevTotalOrders,
                prevCompleted: prevCompletedOrders,
                prevCanceled: prevCanceledOrders,
                prevShipping: prevShippingOrders,
                prevPending: prevPendingOrders,
            });

            const prevTotalRevenue = prevMonthOrders.reduce(
                (sum, order) => sum + (order.totalAmount || 0),
                0
            );
            setPrevRevenue(prevTotalRevenue);
            setPrevProfit(prevTotalRevenue * profitMargin);

            const prevUniqueUsers = new Set(
                users
                    .filter((user) =>
                        user.orders.some(
                            (o) =>
                                parseDate(o.date) >= firstDayOfPrevMonth &&
                                parseDate(o.date) <= lastDayOfPrevMonth
                        )
                    )
                    .map((user) => user.id)
            );
            setPrevCustomers(prevUniqueUsers.size);
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Chưa giao':
                return 'text-blue-500';
            case 'Đang giao':
                return 'text-yellow-500';
            case 'Đã giao':
                return 'text-green-500';
            case 'Đã hủy':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const mapStatusToFilter = (status) => {
        switch (status) {
            case 'Chưa giao':
                return 'pending';
            case 'Đang giao':
                return 'shipped';
            case 'Đã giao':
                return 'delivered';
            case 'Đã hủy':
                return 'canceled';
            default:
                return '';
        }
    };

    const mapFilterToStatus = (filter) => {
        switch (filter) {
            case 'pending':
                return 'Chưa giao';
            case 'shipped':
                return 'Đang giao';
            case 'delivered':
                return 'Đã giao';
            case 'canceled':
                return 'Đã hủy';
            default:
                return '';
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

    const calculatePercentChange = (current, previous) => {
        if (previous === 0) return 0;
        return (((current - previous) / previous) * 100).toFixed(2);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchOrderData()
            .then(() => setIsLoading(false))
            .catch(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        let filtered = reportData;

        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(
                (order) => parseDate(order.rawDate) >= start
            );
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            filtered = filtered.filter(
                (order) => parseDate(order.rawDate) <= end
            );
        }
        if (filters.status) {
            const statusDisplay = mapFilterToStatus(filters.status);
            filtered = filtered.filter(
                (order) => order.status === statusDisplay
            );
        }

        setFilteredData(filtered);
        setCurrentPage(1);
        setSelectedOrders([]);
        setSelectAll(false);
    }, [filters, reportData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectAll(false);
            setSelectedOrders([]);
        }
    };

    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
        setSelectAll(false);
        setSelectedOrders([]);
    };

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            const currentPageIndices = paginatedData.map(
                (_, index) => (currentPage - 1) * rowsPerPage + index
            );
            setSelectedOrders(currentPageIndices);
        } else {
            setSelectedOrders([]);
        }
    };

    const handleRowSelect = (index) => {
        const globalIndex = (currentPage - 1) * rowsPerPage + index;
        const order = reportData[globalIndex];

        // Không cho phép chọn đơn hàng đã giao hoặc đã hủy
        if (order.status === 'Đã giao' || order.status === 'Đã hủy') {
            return;
        }

        setSelectedOrders((prev) => {
            if (prev.includes(globalIndex)) {
                const newSelected = prev.filter((i) => i !== globalIndex);
                setSelectAll(
                    newSelected.length ===
                        paginatedData.filter(
                            (row) =>
                                row.status !== 'Đã giao' &&
                                row.status !== 'Đã hủy'
                        ).length
                );
                return newSelected;
            } else {
                const newSelected = [...prev, globalIndex];
                setSelectAll(
                    newSelected.length ===
                        paginatedData.filter(
                            (row) =>
                                row.status !== 'Đã giao' &&
                                row.status !== 'Đã hủy'
                        ).length
                );
                return newSelected;
            }
        });
    };

    const handlePrepareAndDeliver = () => {
        const updatedData = [...reportData];
        let changesMade = false;

        selectedOrders.forEach((globalIndex) => {
            const order = updatedData[globalIndex];
            if (order && order.status === 'Chưa giao') {
                order.status = 'Đang giao';
                order.statusColor = 'text-yellow-500';
                changesMade = true;
            }
        });

        if (changesMade) {
            setReportData(updatedData);
            setFilteredData(updatedData);
            setSelectedOrders([]);
            setSelectAll(false);

            fetch('http://localhost:3001/users')
                .then((response) => response.json())
                .then((users) => {
                    users.forEach((user) => {
                        let userUpdated = false;

                        user.orders.forEach((order) => {
                            const matchingOrder = updatedData.find(
                                (o) => o.orderId === order.id
                            );
                            if (
                                matchingOrder &&
                                order.status !== matchingOrder.status
                            ) {
                                order.status = matchingOrder.status;
                                userUpdated = true;
                            }
                        });

                        if (userUpdated) {
                            fetch(`http://localhost:3001/users/${user.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(user),
                            })
                                .then((response) => {
                                    if (response.ok) {
                                        console.log(
                                            `User ${user.id} updated successfully.`
                                        );
                                    } else {
                                        console.error(
                                            `Failed to update user ${user.id}`
                                        );
                                    }
                                })
                                .catch((error) =>
                                    console.error(
                                        `Error updating user ${user.id}:`,
                                        error
                                    )
                                );
                        }
                    });
                })
                .catch((error) =>
                    console.error('Error fetching users:', error)
                );
        }
    };

    // Thêm hàm xử lý hủy đơn hàng
    const handleCancelOrders = () => {
        const updatedData = [...reportData];
        let changesMade = false;

        selectedOrders.forEach((globalIndex) => {
            const order = updatedData[globalIndex];
            if (
                order &&
                (order.status === 'Chưa giao' || order.status === 'Đang giao')
            ) {
                order.status = 'Đã hủy';
                order.statusColor = 'text-red-500';
                changesMade = true;
            }
        });

        if (changesMade) {
            setReportData(updatedData);
            setFilteredData(updatedData);
            setSelectedOrders([]);
            setSelectAll(false);

            fetch('http://localhost:3001/users')
                .then((response) => response.json())
                .then((users) => {
                    users.forEach((user) => {
                        let userUpdated = false;

                        user.orders.forEach((order) => {
                            const matchingOrder = updatedData.find(
                                (o) => o.orderId === order.id
                            );
                            if (
                                matchingOrder &&
                                order.status !== matchingOrder.status
                            ) {
                                order.status = matchingOrder.status;
                                userUpdated = true;
                            }
                        });

                        if (userUpdated) {
                            fetch(`http://localhost:3001/users/${user.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(user),
                            })
                                .then((response) => {
                                    if (response.ok) {
                                        console.log(
                                            `User ${user.id} updated successfully.`
                                        );
                                    } else {
                                        console.error(
                                            `Failed to update user ${user.id}`
                                        );
                                    }
                                })
                                .catch((error) =>
                                    console.error(
                                        `Error updating user ${user.id}:`,
                                        error
                                    )
                                );
                        }
                    });
                })
                .catch((error) =>
                    console.error('Error fetching users:', error)
                );
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const updatedOrders = jsonData.map((row) => {
                // Xử lý ngày tháng để đảm bảo định dạng d/m/yyyy
                let orderDate =
                    row['Ngày đặt hàng'] ||
                    new Date().toLocaleDateString('vi-VN');

                // Nếu ngày đã ở định dạng d/m/yyyy thì giữ nguyên
                if (!orderDate.includes('/')) {
                    // Nếu không, chuyển đổi sang d/m/yyyy
                    const date = new Date(orderDate);
                    if (!isNaN(date.getTime())) {
                        orderDate = date.toLocaleDateString('vi-VN');
                    } else {
                        orderDate = new Date().toLocaleDateString('vi-VN');
                    }
                }

                return {
                    id: row['Mã đơn hàng'] || `order-${Date.now()}`,
                    date: orderDate,
                    time: new Date().toLocaleTimeString(),
                    createdAt: new Date().toISOString(),
                    customerInfo: {
                        fullName: row['Tên khách hàng'] || 'Unknown',
                        phone: 'N/A',
                        address: 'N/A',
                        city: 'N/A',
                        district: 'N/A',
                        ward: 'N/A',
                        note: '',
                    },
                    totalAmount:
                        parseFloat(
                            row['Giá trị đơn hàng'].replace(/[^0-9.-]+/g, '')
                        ) || 0,
                    status: row['Trạng thái'] || 'Chưa giao',
                    items: [], // Simplified; you can extend to include items if needed
                };
            });

            fetch('http://localhost:3001/users')
                .then((response) => response.json())
                .then((users) => {
                    const targetUser = users.find(
                        (user) => user.id === 'user1746421471332'
                    );
                    if (targetUser) {
                        targetUser.orders.push(...updatedOrders);
                        return fetch('http://localhost:3001/users', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(users),
                        });
                    }
                })
                .then(() => {
                    // Tải lại dữ liệu sau khi nhập
                    refreshData();
                })
                .catch((error) =>
                    console.error('Error importing orders:', error)
                );
        };

        reader.readAsArrayBuffer(file);
    };

    const handleExport = () => {
        const exportData = filteredData.map((row) => ({
            'Mã đơn hàng': row.orderId,
            'Tên khách hàng': row.name,
            'Giá trị đơn hàng': row.value,
            'Ngày đặt hàng': row.date,
            'Trạng thái': row.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
        XLSX.writeFile(workbook, 'orders_export.xlsx');
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    return (
        <div>
            {/* Thêm thống kê đơn hàng */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">
                        Thống kê đơn hàng tháng này
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                Tổng đơn hàng
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                {orderStats.total}
                            </p>
                            <p
                                className={`text-sm ${
                                    calculatePercentChange(
                                        orderStats.total,
                                        orderStats.prevTotal
                                    ) >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                {calculatePercentChange(
                                    orderStats.total,
                                    orderStats.prevTotal
                                ) >= 0
                                    ? '+'
                                    : ''}
                                {calculatePercentChange(
                                    orderStats.total,
                                    orderStats.prevTotal
                                )}
                                % so với tháng trước
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                Đơn thành công
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {orderStats.completed}
                            </p>
                            <p
                                className={`text-sm ${
                                    calculatePercentChange(
                                        orderStats.completed,
                                        orderStats.prevCompleted
                                    ) >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                {calculatePercentChange(
                                    orderStats.completed,
                                    orderStats.prevCompleted
                                ) >= 0
                                    ? '+'
                                    : ''}
                                {calculatePercentChange(
                                    orderStats.completed,
                                    orderStats.prevCompleted
                                )}
                                % so với tháng trước
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                Đơn đang giao
                            </p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {orderStats.shipping}
                            </p>
                            <p
                                className={`text-sm ${
                                    calculatePercentChange(
                                        orderStats.shipping,
                                        orderStats.prevShipping
                                    ) >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                {calculatePercentChange(
                                    orderStats.shipping,
                                    orderStats.prevShipping
                                ) >= 0
                                    ? '+'
                                    : ''}
                                {calculatePercentChange(
                                    orderStats.shipping,
                                    orderStats.prevShipping
                                )}
                                % so với tháng trước
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-gray-600">Đơn đã hủy</p>
                            <p className="text-2xl font-bold text-red-600">
                                {orderStats.canceled}
                            </p>
                            <p
                                className={`text-sm ${
                                    calculatePercentChange(
                                        orderStats.canceled,
                                        orderStats.prevCanceled
                                    ) >= 0
                                        ? 'text-red-500'
                                        : 'text-green-500'
                                }`}>
                                {calculatePercentChange(
                                    orderStats.canceled,
                                    orderStats.prevCanceled
                                ) >= 0
                                    ? '+'
                                    : ''}
                                {calculatePercentChange(
                                    orderStats.canceled,
                                    orderStats.prevCanceled
                                )}
                                % so với tháng trước
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">
                        Thống kê tài chính tháng này
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">Doanh thu</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(revenue)}
                            </p>
                            <p
                                className={`text-sm ${
                                    calculatePercentChange(
                                        revenue,
                                        prevRevenue
                                    ) >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                {calculatePercentChange(revenue, prevRevenue) >=
                                0
                                    ? '+'
                                    : ''}
                                {calculatePercentChange(revenue, prevRevenue)}%
                                so với tháng trước
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">Lợi nhuận</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(profit)}
                            </p>
                            <p
                                className={`text-sm ${
                                    calculatePercentChange(
                                        profit,
                                        prevProfit
                                    ) >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                {calculatePercentChange(profit, prevProfit) >= 0
                                    ? '+'
                                    : ''}
                                {calculatePercentChange(profit, prevProfit)}% so
                                với tháng trước
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                Khách hàng mới
                            </p>
                            <p className="text-2xl font-bold text-purple-600">
                                {newCustomers}
                            </p>
                            <p
                                className={`text-sm ${
                                    calculatePercentChange(
                                        newCustomers,
                                        prevCustomers
                                    ) >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}>
                                {calculatePercentChange(
                                    newCustomers,
                                    prevCustomers
                                ) >= 0
                                    ? '+'
                                    : ''}
                                {calculatePercentChange(
                                    newCustomers,
                                    prevCustomers
                                )}
                                % so với tháng trước
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4 p-4 border rounded">
                    <h3 className="text-lg font-semibold mb-2">
                        Bộ lọc đơn hàng
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
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
                                <option value="pending">Chưa giao</option>
                                <option value="shipped">Đang giao</option>
                                <option value="delivered">Đã giao</option>
                                <option value="canceled">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        Báo cáo chi tiết đơn hàng
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrepareAndDeliver}
                            disabled={
                                selectedOrders.length === 0 ||
                                !selectedOrders.some(
                                    (index) =>
                                        reportData[index]?.status ===
                                        'Chưa giao'
                                )
                            }
                            className={`px-4 py-2 rounded font-semibold ${
                                selectedOrders.length === 0 ||
                                !selectedOrders.some(
                                    (index) =>
                                        reportData[index]?.status ===
                                        'Chưa giao'
                                )
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 text-white'
                            }`}>
                            Chuẩn bị giao hàng
                        </button>
                        <button
                            onClick={handleCancelOrders}
                            disabled={selectedOrders.length === 0}
                            className={`px-4 py-2 rounded font-semibold ${
                                selectedOrders.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-500 text-white'
                            }`}>
                            Hủy đơn hàng
                        </button>
                        <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
                            Nhập
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={handleExport}
                            className="bg-blue-500 text-white px-4 py-2 rounded">
                            Xuất
                        </button>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        Danh sách đơn hàng gần đây
                    </h3>
                    <button
                        onClick={refreshData}
                        className="flex items-center gap-2 px-3 py-2 bg-[#E29578] text-white rounded hover:bg-[#eca78e] transition-colors"
                        disabled={isLoading}>
                        <RefreshCw
                            size={16}
                            className={isLoading ? 'animate-spin' : ''}
                        />
                        {isLoading ? 'Đang tải...' : 'Tải lại dữ liệu'}
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="p-2">Tên khách hàng</th>
                            <th className="p-2">Giá trị đơn hàng</th>
                            <th className="p-2">Ngày đặt hàng</th>
                            <th className="p-2">Trạng thái</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={row.orderId} className="border-b">
                                <td className="p-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(
                                            (currentPage - 1) * rowsPerPage +
                                                index
                                        )}
                                        onChange={() => handleRowSelect(index)}
                                        disabled={
                                            row.status === 'Đã giao' ||
                                            row.status === 'Đã hủy'
                                        }
                                    />
                                </td>
                                <td className="p-2 flex items-center">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
                                    {row.name}
                                </td>
                                <td className="p-2">{row.value}</td>
                                <td className="p-2">{row.date}</td>
                                <td className={`p-2 ${row.statusColor}`}>
                                    {row.status}
                                </td>
                                <td className="p-2">
                                    <button
                                        onClick={() => handleViewDetails(row)}
                                        className="text-blue-500 hover:underline">
                                        Xem
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showModal && selectedOrder && (
                    <AdminOrderDetailsModal
                        isOpen={showModal}
                        onClose={handleCloseModal}
                        order={selectedOrder}
                    />
                )}

                <div className="flex justify-between items-center mt-4">
                    <p>{filteredData.length} kết quả</p>
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
        </div>
    );
};

export default Dashboard;
