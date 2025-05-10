import React, { useState } from 'react';
import LeftArrow from '../assets/img/icons/left-arrow.png';
import RightArrow from '../assets/img/icons/right-arrow.png';

export default function FeedbackSection() {
    const feedbacks = [
        {
            name: 'Ngọc Anh – 26 tuổi, Hà Nội',
            feedback:
                'Da mình trước đây rất hay nổi mụn và đổ dầu nhiều. Sau khi được tư vấn và sử dụng sản phẩm của shop, da cải thiện rõ rệt sau 2 tuần!',
        },
        {
            name: 'Linh Chi – 30 tuổi, TP.HCM',
            feedback:
                'Sản phẩm chính hãng, đóng gói đẹp và giao hàng nhanh. Rất thích dịch vụ tư vấn da miễn phí, nhân viên nhiệt tình và hiểu rõ từng loại da.',
        },
        {
            name: 'Thu Hương – 22 tuổi, Đà Nẵng',
            feedback:
                'Mình dùng combo serum & kem dưỡng được 1 tháng, da đều màu và mịn hơn. Cảm ơn shop vì đã tư vấn đúng sản phẩm phù hợp với da mình!',
        },
    ];

    const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);

    const handlePrev = () => {
        setCurrentFeedbackIndex((prevIndex) =>
            prevIndex === 0 ? feedbacks.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentFeedbackIndex((prevIndex) =>
            prevIndex === feedbacks.length - 1 ? 0 : prevIndex + 1
        );
    };

    const currentFeedback = feedbacks[currentFeedbackIndex];

    return (
        <div className="max-w-7xl mx-auto p-4 border-t-2 border-b-2">
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-2xl font-bold">PHẢN HỒI TỪ KHÁCH HÀNG</h2>
            </div>
            <div className="relative">
                <div className="relative h-[400px] flex items-center justify-center">
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10">
                        <img src={LeftArrow} alt="Trước" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10">
                        <img src={RightArrow} alt="Sau" />
                    </button>

                    <div className="flex items-center justify-center w-full max-w-2xl">
                        <div className="bg-white text-black p-8 rounded-xl shadow-md text-center w-full">
                            <h3 className="text-xl font-semibold mb-4">
                                {currentFeedback.name}
                            </h3>
                            <p className="text-lg italic">
                                "{currentFeedback.feedback}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
