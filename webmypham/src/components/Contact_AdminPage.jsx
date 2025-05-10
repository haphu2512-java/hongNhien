import { useState, useEffect } from 'react';

const Contact = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [showViewReplyModal, setShowViewReplyModal] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        name: '',
        email: '',
        replied: '',
    });
    const [sortOrder, setSortOrder] = useState('desc');

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
        setLoading(true);
        fetch('http://localhost:3001/contacts')
            .then((response) => {
                if (!response.ok)
                    throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                const formattedData = data.map((inquiry) => ({
                    ...inquiry,
                    date: formatDate(inquiry.date),
                    rawDate: inquiry.date,
                    replied: inquiry.replied || false,
                    replyMessage: inquiry.replyMessage || '',
                }));
                setInquiries(formattedData);
            })
            .catch((error) => {
                console.error('Error fetching inquiries:', error);
                setInquiries([]);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let filtered = [...inquiries];

        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(
                (inquiry) => parseDate(inquiry.rawDate) >= start
            );
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            filtered = filtered.filter(
                (inquiry) => parseDate(inquiry.rawDate) <= end
            );
        }
        if (filters.name) {
            filtered = filtered.filter((inquiry) =>
                inquiry.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
        if (filters.email) {
            filtered = filtered.filter((inquiry) =>
                inquiry.email
                    .toLowerCase()
                    .includes(filters.email.toLowerCase())
            );
        }
        if (filters.replied) {
            filtered = filtered.filter((inquiry) => {
                if (filters.replied === 'true') return inquiry.replied;
                if (filters.replied === 'false') return !inquiry.replied;
                return true; // 'Tất cả'
            });
        }

        filtered.sort((a, b) => {
            const dateA = parseDate(a.rawDate);
            const dateB = parseDate(b.rawDate);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setInquiries(filtered);
    }, [filters, sortOrder]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
            fetch(`http://localhost:3001/contacts/${id}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (!response.ok)
                        throw new Error('Failed to delete inquiry');
                    setInquiries(
                        inquiries.filter((inquiry) => inquiry.id !== id)
                    );
                })
                .catch((error) =>
                    console.error('Error deleting inquiry:', error)
                );
        }
    };

    const handleReply = (inquiry) => {
        setSelectedInquiry(inquiry);
        setShowReplyModal(true);
    };

    const handleViewReply = (inquiry) => {
        setSelectedInquiry(inquiry);
        setShowViewReplyModal(true);
    };

    const handleSendReply = () => {
        if (!replyMessage.trim()) {
            alert('Vui lòng nhập nội dung phản hồi.');
            return;
        }
        console.log(
            `Gửi phản hồi tới ${selectedInquiry.email}: ${replyMessage}`
        );

        const updatedInquiries = inquiries.map((inquiry) =>
            inquiry.id === selectedInquiry.id
                ? { ...inquiry, replied: true, replyMessage: replyMessage }
                : inquiry
        );
        setInquiries(updatedInquiries);

        fetch(`http://localhost:3001/contacts/${selectedInquiry.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ replied: true, replyMessage: replyMessage }),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to update inquiry');
            })
            .catch((error) => console.error('Error updating inquiry:', error));

        setShowReplyModal(false);
        setReplyMessage('');
        setSelectedInquiry(null);
        alert('Phản hồi đã được gửi!');
    };

    const handleCloseModal = () => {
        setShowReplyModal(false);
        setShowViewReplyModal(false);
        setReplyMessage('');
        setSelectedInquiry(null);
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Quản lý liên hệ</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4 p-4 border rounded">
                    <h3 className="text-lg font-semibold mb-2">
                        Bộ lọc liên hệ
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
                            <label className="block mb-1">Tên</label>
                            <input
                                type="text"
                                name="name"
                                value={filters.name}
                                onChange={handleFilterChange}
                                placeholder="Nhập tên..."
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Email</label>
                            <input
                                type="text"
                                name="email"
                                value={filters.email}
                                onChange={handleFilterChange}
                                placeholder="Nhập email..."
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Trạng thái</label>
                            <select
                                name="replied"
                                value={filters.replied}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded">
                                <option value="">Tất cả</option>
                                <option value="true">Đã phản hồi</option>
                                <option value="false">Chưa phản hồi</option>
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
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        Đang tải...
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        Không có liên hệ nào.
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">ID</th>
                                <th className="p-2">Tên</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Lời nhắn</th>
                                <th className="p-2">Ngày gửi</th>
                                <th className="p-2">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="border-b">
                                    <td className="p-2">{inquiry.id}</td>
                                    <td className="p-2">{inquiry.name}</td>
                                    <td className="p-2">{inquiry.email}</td>
                                    <td className="p-2">{inquiry.message}</td>
                                    <td className="p-2">{inquiry.date}</td>
                                    <td className="p-2 flex space-x-2">
                                        {inquiry.replied ? (
                                            <button
                                                onClick={() =>
                                                    handleViewReply(inquiry)
                                                }
                                                className="text-gray-500 hover:underline">
                                                Đã phản hồi
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleReply(inquiry)
                                                }
                                                className="text-blue-500 hover:underline">
                                                Phản hồi
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleDelete(inquiry.id)
                                            }
                                            className="text-red-500 hover:underline">
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showReplyModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            Phản hồi liên hệ
                        </h3>
                        <div className="space-y-2 mb-4">
                            <p>
                                <strong>Tên:</strong> {selectedInquiry.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedInquiry.email}
                            </p>
                            <p>
                                <strong>Lời nhắn:</strong>{' '}
                                {selectedInquiry.message}
                            </p>
                        </div>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Nhập nội dung phản hồi..."
                            className="w-full p-2 border rounded mb-4"
                            rows="4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                                Hủy
                            </button>
                            <button
                                onClick={handleSendReply}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showViewReplyModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            Xem phản hồi
                        </h3>
                        <div className="space-y-2 mb-4">
                            <p>
                                <strong>Tên:</strong> {selectedInquiry.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedInquiry.email}
                            </p>
                            <p>
                                <strong>Lời nhắn:</strong>{' '}
                                {selectedInquiry.message}
                            </p>
                            <p>
                                <strong>Phản hồi đã gửi:</strong>{' '}
                                {selectedInquiry.replyMessage}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;
