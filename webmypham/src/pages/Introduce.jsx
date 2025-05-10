import React from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from '../assets/img/backgrounds.png';
function Introduce() {
    return (
        <div
            className=" min-h-screen px-6 mb-4"
            style={{ backgroundColor: '#EDF6F9' }}>
            <div className="max-w-5xl mx-auto mb-10">
                <img
                    src={BackgroundImage}
                    alt="Fruvia Beauty Banner"
                    className="rounded-xl shadow-lg w-full object-cover h-64 md:h-96 mt-10"
                />
            </div>
            <div className="max-w-5xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-[#006D77] mb-4">
                    Chào mừng đến với FRUVIA BEAUTY
                </h1>
                <p className="text-lg text-gray-700 mb-2 italic">
                    "Vẻ đẹp luôn hướng về tương lai"
                </p>
                <p className="text-lg text-gray-700 mb-8 italic">
                    "Vẻ đẹp để truyền cảm hứng"
                </p>

                <div className="p-8 text-left">
                    <p className="text-lg text-gray-800 mb-4">
                        Tại{' '}
                        <strong className="text-[#006D77]">
                            FRUVIA BEAUTY
                        </strong>
                        , chúng tôi tin rằng vẻ đẹp không chỉ là làn da hay lớp
                        trang điểm, mà là sự tự tin, tinh thần tích cực và cảm
                        hứng lan tỏa mỗi ngày.
                    </p>
                    <p className="text-lg text-gray-800 mb-4">
                        Sản phẩm của chúng tôi được chọn lọc từ những thành phần
                        thiên nhiên an toàn, kết hợp với công nghệ làm đẹp tiên
                        tiến – mang lại hiệu quả cao mà vẫn giữ trọn sự dịu nhẹ
                        cho làn da.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 my-8">
                        <div className="bg-[#f1ece8] border-gray-500 p-6 rounded-lg shadow-xl transition ">
                            <h3 className="text-xl font-semibold text-black mb-2">
                                {' '}
                                Tự nhiên
                            </h3>
                            <p className="text-gray-700 text-sm">
                                Nguyên liệu thiên nhiên, an toàn cho làn da nhạy
                                cảm, không thử nghiệm trên động vật.
                            </p>
                        </div>
                        <div className="bg-[#f1ece8] border-gray-500 p-6 rounded-lg shadow-xl transition ">
                            <h3 className="text-xl font-semibold text-black mb-2">
                                Chất lượng
                            </h3>
                            <p className="text-gray-700 text-sm">
                                Sản phẩm kiểm định kỹ càng, được tin dùng bởi
                                hàng nghìn khách hàng mỗi năm.
                            </p>
                        </div>
                        <div className="bg-[#f1ece8] border-gray-500 p-6 rounded-lg shadow-xl transition">
                            <h3 className="text-xl font-semibold text-black mb-2">
                                Cảm hứng
                            </h3>
                            <p className="text-gray-700 text-sm">
                                Không chỉ bán mỹ phẩm, chúng tôi lan tỏa thông
                                điệp yêu bản thân và sống tích cực mỗi ngày.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <Link
                            to="/san-pham"
                            className="inline-block bg-[#D5BDAF] text-black text-xl font-bold px-6 py-3 rounded-full hover:bg-[#b59887] transition">
                            Khám phá sản phẩm
                        </Link>
                    </div>
                </div>

                <div className="mt-10 text-sm text-gray-500 italic">
                    Được phát triển bởi{' '}
                    <span className="text-[#006D77] font-semibold">
                        Innovative Fruits
                    </span>{' '}
                    — vì một thế giới đẹp hơn từng ngày.
                </div>
            </div>
        </div>
    );
}

export default Introduce;
