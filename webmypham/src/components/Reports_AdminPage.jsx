import { useState, useEffect } from 'react';

const Reports = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });
    // Thêm state cho dữ liệu tháng trước
    const [prevMonthMetrics, setPrevMonthMetrics] = useState({
        totalRevenue: 0,
        sold: 0,
        unsold: 0,
        overdue: 0,
    });

    const productPrices = {
        skincare: 500000,
        makeup: 300000,
        haircare: 400000,
        hair: 400000,
        bodycare: 600000,
    };

    const productNames = {
        skincare: 'Kem chăm sóc da',
        makeup: 'Bộ trang điểm',
        haircare: 'Dầu gội dưỡng tóc',
        hair: 'Dầu gội dưỡng tóc',
        bodycare: 'Sữa tắm dưỡng thể',
    };

    const parseDate = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') {
            return {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
            };
        }

        try {
            if (dateStr.includes('/')) {
                // Định dạng d/m/yyyy
                const [day, month, year] = dateStr.split('/').map(Number);
                return { year, month };
            } else {
                // Định dạng yyyy-mm-dd
                const [year, month] = dateStr.split('-').map(Number);
                return { year, month };
            }
        } catch (error) {
            console.error('Error parsing date:', error, dateStr);
            return {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
            };
        }
    };

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch('http://localhost:3001/bookings')
            .then((res) => {
                if (!res.ok) throw new Error('Không thể lấy dữ liệu lịch hẹn');
                return res.json();
            })
            .then((data) => {
                console.log('Bookings:', data);
                setBookings(data);
                setFilteredBookings(data);

                // Tính toán dữ liệu tháng trước
                const today = new Date();
                const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDayOfPrevMonth = new Date(firstDayOfCurrentMonth);
                lastDayOfPrevMonth.setDate(lastDayOfPrevMonth.getDate() - 1);
                const firstDayOfPrevMonth = new Date(lastDayOfPrevMonth.getFullYear(), lastDayOfPrevMonth.getMonth(), 1);

                const prevMonthBookings = data.filter(booking => {
                    const bookingDate = new Date(booking.date);
                    return bookingDate >= firstDayOfPrevMonth && bookingDate <= lastDayOfPrevMonth;
                });

                const prevSold = prevMonthBookings.filter(b => b.status === 'completed').length;
                const prevUnsold = prevMonthBookings.filter(b => b.status !== 'completed').length;
                const prevOverdue = prevMonthBookings.filter(b => {
                    const bookingDate = parseDate(b.date);
                    return (
                        bookingDate.year < lastDayOfPrevMonth.getFullYear() ||
                        (bookingDate.year === lastDayOfPrevMonth.getFullYear() &&
                            bookingDate.month < lastDayOfPrevMonth.getMonth() + 1 &&
                            b.status !== 'completed')
                    );
                }).length;

                const prevTotalRevenue = prevMonthBookings
                    .filter(b => b.status === 'completed')
                    .reduce((sum, b) => sum + (productPrices[b.service] || 0), 0);

                setPrevMonthMetrics({
                    totalRevenue: prevTotalRevenue,
                    sold: prevSold,
                    unsold: prevUnsold,
                    overdue: prevOverdue
                });
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error.message);
                setBookings([]);
                setFilteredBookings([]);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let tempBookings = [...bookings];
        if (filters.startDate) {
            const start = new Date(filters.startDate);
            tempBookings = tempBookings.filter(
                (booking) =>
                    parseDate(booking.date).month >= start.getMonth() + 1 &&
                    parseDate(booking.date).year >= start.getFullYear()
            );
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            tempBookings = tempBookings.filter(
                (booking) =>
                    parseDate(booking.date).month <= end.getMonth() + 1 &&
                    parseDate(booking.date).year <= end.getFullYear()
            );
        }
        setFilteredBookings(tempBookings);
    }, [filters, bookings]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const calculateMetrics = () => {
        const sold = filteredBookings.filter(
            (b) => b.status === 'completed'
        ).length;
        const unsold = filteredBookings.filter(
            (b) => b.status !== 'completed'
        ).length;
        const overdue = filteredBookings.filter((b) => {
            const bookingDate = parseDate(b.date);
            const today = new Date();
            return (
                bookingDate.year < today.getFullYear() ||
                (bookingDate.year === today.getFullYear() &&
                    bookingDate.month < today.getMonth() + 1 &&
                    b.status !== 'completed')
            );
        }).length;
        const total = filteredBookings.length;
        const completionRate =
            total > 0 ? ((sold / total) * 100).toFixed(1) : 0;

        const totalRevenue = filteredBookings
            .filter((b) => b.status === 'completed')
            .reduce((sum, b) => sum + (productPrices[b.service] || 0), 0);

        const salesByProduct = filteredBookings
            .filter((b) => b.status === 'completed')
            .reduce((acc, b) => {
                acc[b.service] = (acc[b.service] || 0) + 1;
                return acc;
            }, {});

        const topProducts = Object.entries(salesByProduct)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([product]) => product);

        const bottomProducts = Object.entries(salesByProduct)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 3)
            .map(([product]) => product);

        return {
            sold,
            unsold,
            overdue,
            total,
            completionRate,
            totalRevenue,
            salesByProduct,
            topProducts,
            bottomProducts,
        };
    };

    const metrics = calculateMetrics();

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
    };

    const drawBarChart = () => {
        const canvas = document.getElementById('barChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const products = Object.keys(metrics.salesByProduct);
        const quantities = Object.values(metrics.salesByProduct);
        const maxQuantity = Math.max(...quantities, 1);
        const barWidth = (canvas.width - 60) / products.length / 1.5;
        const barSpacing = barWidth / 2;

        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, canvas.height - 30);
        ctx.lineTo(canvas.width - 10, canvas.height - 30);
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = canvas.height - 30 - (i * (canvas.height - 60)) / 5;
            ctx.fillText(i, 35, y);
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(45, y);
            ctx.stroke();
        }

        products.forEach((product, index) => {
            const x = 40 + index * (barWidth + barSpacing);
            const height =
                (metrics.salesByProduct[product] / maxQuantity) *
                (canvas.height - 60) || 0;
            ctx.fillStyle = '#4B5EFC';
            ctx.fillRect(x, canvas.height - 30 - height, barWidth, height);

            ctx.fillStyle = '#000';
            ctx.fillText(
                metrics.salesByProduct[product],
                x + barWidth / 2,
                canvas.height - 35 - height
            );
            ctx.fillText(
                productNames[product] || product,
                x + barWidth / 2,
                canvas.height - 10
            );
        });
    };

    const drawPieChart = () => {
        const canvas = document.getElementById('pieChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const products = Object.keys(metrics.salesByProduct);
        const quantities = Object.values(metrics.salesByProduct);
        const totalQuantity = metrics.sold;
        let startAngle = 0;

        ctx.textAlign = 'center';
        products.forEach((product, index) => {
            const angle =
                (metrics.salesByProduct[product] / totalQuantity) * 2 * Math.PI;
            ctx.fillStyle = ['#4B5EFC', '#FF6B6B', '#4ECDC4', '#45B7D1'][
                index % 4
            ];
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.arc(100, 100, 80, startAngle, startAngle + angle);
            ctx.closePath();
            ctx.fill();

            const labelX = 100 + 90 * Math.cos(startAngle + angle / 2);
            const labelY = 100 + 90 * Math.sin(startAngle + angle / 2);
            ctx.fillStyle = '#000';
            ctx.fillText(
                `${productNames[product]} (${metrics.salesByProduct[product]})`,
                labelX,
                labelY
            );

            startAngle += angle;
        });
    };

    useEffect(() => {
        drawBarChart();
        drawPieChart();
    }, [metrics.salesByProduct]);

    // Thêm hàm tính phần trăm thay đổi
    const calculatePercentChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Báo cáo doanh thu và doanh số sản phẩm
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">
                        Bộ lọc báo cáo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 p-4">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
                                <p className="text-sm text-gray-500">Đã bán</p>
                                <p className="text-2xl font-semibold text-green-600">
                                    {metrics.sold}
                                </p>
                                <p className={`text-sm ${calculatePercentChange(metrics.sold, prevMonthMetrics.sold) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {calculatePercentChange(metrics.sold, prevMonthMetrics.sold) >= 0 ? '+' : ''}
                                    {calculatePercentChange(metrics.sold, prevMonthMetrics.sold)}% so với tháng trước
                                </p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg bg-yellow-50">
                                <p className="text-sm text-gray-500">
                                    Chưa bán
                                </p>
                                <p className="text-2xl font-semibold text-yellow-600">
                                    {metrics.unsold}
                                </p>
                                <p className={`text-sm ${calculatePercentChange(metrics.unsold, prevMonthMetrics.unsold) >= 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {calculatePercentChange(metrics.unsold, prevMonthMetrics.unsold) >= 0 ? '+' : ''}
                                    {calculatePercentChange(metrics.unsold, prevMonthMetrics.unsold)}% so với tháng trước
                                </p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg bg-red-50">
                                <p className="text-sm text-gray-500">Quá hạn</p>
                                <p className="text-2xl font-semibold text-red-600">
                                    {metrics.overdue}
                                </p>
                                <p className={`text-sm ${calculatePercentChange(metrics.overdue, prevMonthMetrics.overdue) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {calculatePercentChange(metrics.overdue, prevMonthMetrics.overdue) >= 0 ? '+' : ''}
                                    {calculatePercentChange(metrics.overdue, prevMonthMetrics.overdue)}% so với tháng trước
                                </p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                                <p className="text-sm text-gray-500">
                                    Tổng cộng
                                </p>
                                <p className="text-2xl font-semibold text-blue-600">
                                    {metrics.total}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Tỷ lệ: {metrics.completionRate}%
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                                    Doanh số bán ra
                                </h3>
                                <canvas
                                    id="barChart"
                                    width="400"
                                    height="200"
                                    className="border border-gray-200 rounded-lg"></canvas>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-700">
                                    Phân bổ doanh số theo sản phẩm
                                </h3>
                                <canvas
                                    id="pieChart"
                                    width="400"
                                    height="200"
                                    className="border border-gray-200 rounded-lg"></canvas>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-700">
                                Tổng quan tài chính
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg bg-green-50">
                                    <p className="text-sm text-gray-500">
                                        Doanh thu tổng
                                    </p>
                                    <p className="text-2xl font-semibold text-green-600">
                                        {formatCurrency(metrics.totalRevenue)}
                                    </p>
                                    <p className={`text-sm ${calculatePercentChange(metrics.totalRevenue, prevMonthMetrics.totalRevenue) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {calculatePercentChange(metrics.totalRevenue, prevMonthMetrics.totalRevenue) >= 0 ? '+' : ''}
                                        {calculatePercentChange(metrics.totalRevenue, prevMonthMetrics.totalRevenue)}% so với tháng trước
                                    </p>
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${Math.min(100, (metrics.totalRevenue / (prevMonthMetrics.totalRevenue || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                                    <p className="text-sm text-gray-500">
                                        Lợi nhuận ước tính
                                    </p>
                                    <p className="text-2xl font-semibold text-blue-600">
                                        {formatCurrency(metrics.totalRevenue * 0.35)}
                                    </p>
                                    <p className={`text-sm ${calculatePercentChange(metrics.totalRevenue * 0.35, prevMonthMetrics.totalRevenue * 0.35) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {calculatePercentChange(metrics.totalRevenue * 0.35, prevMonthMetrics.totalRevenue * 0.35) >= 0 ? '+' : ''}
                                        {calculatePercentChange(metrics.totalRevenue * 0.35, prevMonthMetrics.totalRevenue * 0.35)}% so với tháng trước
                                    </p>
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${Math.min(100, (metrics.totalRevenue / (prevMonthMetrics.totalRevenue || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-700">
                                Phân tích sản phẩm
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
                                    <p className="text-sm text-gray-500">
                                        Sản phẩm bán chạy (Top 3)
                                    </p>
                                    <ul className="list-disc pl-5">
                                        {metrics.topProducts.map(
                                            (product, index) => (
                                                <li
                                                    key={index}
                                                    className="text-gray-700">
                                                    {productNames[product] ||
                                                        product}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg bg-red-50">
                                    <p className="text-sm text-gray-500">
                                        Sản phẩm bán chậm (Ít nhất 3)
                                    </p>
                                    <ul className="list-disc pl-5">
                                        {metrics.bottomProducts.map(
                                            (product, index) => (
                                                <li
                                                    key={index}
                                                    className="text-gray-700">
                                                    {productNames[product] ||
                                                        product}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            Tải báo cáo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
