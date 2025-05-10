import React from 'react';

export default function AboutSection() {
    return (
        <section className=" px-6 flex flex-col items-center text-center mt-[100px] ">
            <div className="max-w-2xl">
                <div className="flex items-baseline justify-center space-x-1 ">
                    <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-wide uppercase">
                        FRUVIA
                    </span>
                    <span className="text-2xl md:text-3xl font-medium text-gray-500 tracking-widest uppercase">
                        BEAUTY
                    </span>
                </div>
                <p className="text-gray-600 mb-2 whitespace-nowrap">
                    Chúng tôi mang đến những sản phẩm làm đẹp được tuyển chọn kỹ
                    lưỡng từ các thương hiệu uy tín toàn cầu.
                </p>
                <p className="text-gray-600 whitespace-nowrap">
                    Tôn vinh vẻ đẹp tự nhiên, an toàn và tinh tế dành cho bạn.
                </p>
            </div>
        </section>
    );
}
