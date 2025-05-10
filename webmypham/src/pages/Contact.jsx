import React, { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            setStatus('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        setLoading(true);
        setStatus('');

        const newContact = {
            id: Date.now(), // Temporary ID, json-server will auto-increment
            name: formData.name,
            email: formData.email,
            message: formData.message,
            date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        };

        fetch('http://localhost:3001/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact),
        })
            .then((response) => {
                if (!response.ok) throw new Error('Failed to send message');
                setFormData({ name: '', email: '', message: '' });
                setStatus('Tin nhắn đã được gửi thành công!');
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                setStatus('Có lỗi xảy ra, vui lòng thử lại sau.');
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="w-full min-h-screen flex flex-col relative">
            <main
                className="flex-grow pt-24"
                style={{ backgroundColor: '#E2F3FC' }}>
                <div className="py-20 px-4 md:px-20 min-h-screen">
                    <div className="max-w-5xl mx-auto bg-white grid md:grid-cols-2 gap-4 overflow-hidden shadow-lg rounded-xl">
                        <div className="flex items-center justify-center p-8">
                            <div className="w-full">
                                <h3 className="text-2xl font-semibold mb-6">
                                    Liên hệ chúng tôi
                                </h3>
                                {status && (
                                    <p
                                        className={`mb-4 text-center ${
                                            status.includes('thành công')
                                                ? 'text-green-500'
                                                : 'text-red-500'
                                        }`}>
                                        {status}
                                    </p>
                                )}
                                <form
                                    className="space-y-4"
                                    onSubmit={handleSubmit}>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Họ tên
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Tên của bạn"
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Lời nhắn
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Nhập lời nhắn của bạn..."
                                            className="w-full mt-1 p-2 h-24 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className={`w-full py-2 bg-[#D5BDAF] font-semibold rounded-md text-black  transition duration-300 ease-in-out ${
                                            loading
                                                ? 'bg-[#D5BDAF]  cursor-not-allowed'
                                                : 'bg-[#D5BDAF] hover:bg-[#b59887] hover:text-white border-2 '
                                        }`}>
                                        {loading ? 'Đang gửi...' : 'Gửi'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <iframe
                                title="Map"
                                className="w-full h-[450px] md:h-full rounded-r-xl"
                                src="https://maps.google.com/maps?q=Gò%20Vấp,%20Ho%20Chi%20Minh,%20Vietnam&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
