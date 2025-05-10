import React from 'react';
import { useNavigate } from 'react-router-dom';
import TuVan from '../assets/img/dichvutuvan.png';

export default function ServiceSection() {
    const navigate = useNavigate();

    const handleBookingClick = () => {
        // Điều hướng đến trang dịch vụ với tham số để cuộn đến form đặt lịch
        navigate('/dich-vu?scrollTo=booking');
    };

    return (
        <div className="bg-gradient-to-r from-[#BDF4F1] via-[#70DED9] to-[#70DED9] text-gray-800 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl min-h-[180px]">
                <div className="md:w-1/2 p-8 pl-40">
                    <h2 className="text-3xl font-bold mb-4">Dịch vụ tư vấn</h2>
                    <p className="text-sm mb-6">
                        Nhận tư vấn sản phẩm phù hợp với nhu cầu và tình trạng
                        da của bạn từ các chuyên gia hàng đầu trong ngành. Chúng
                        tôi cam kết mang đến cho bạn những sản phẩm chất lượng
                        nhất, giúp bạn tự tin tỏa sáng với làn da khỏe mạnh và
                        rạng rỡ.
                    </p>
                    <button
                        onClick={handleBookingClick}
                        className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-full hover:bg-white hover:text-black border-gray-500 transition">
                        Nhận tư vấn miễn phí
                    </button>
                </div>
                <div className="flex justify-end h-[250px]">
                    <img src={TuVan} alt="Profile" />
                </div>
            </div>
        </div>
    );
}
