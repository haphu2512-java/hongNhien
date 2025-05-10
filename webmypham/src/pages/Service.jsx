import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import DichVuBanner from '../assets/img/DichVuBanner.png';
import Toast from '../components/Toast';

const HeroSection = ({ scrollToBooking, scrollToServices }) => (
    <section className="relative h-[600px] mb-16 overflow-hidden rounded-lg">
        <img
            src={DichVuBanner}
            alt="Dịch vụ tư vấn mỹ phẩm"
            className="w-full h-full object-cover"
            loading="lazy"
        />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-1">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Dịch vụ tư vấn chọn sản phẩm
            </h1>
            <p className="text-lg md:text-xl text-white max-w-2xl mb-8">
                Để có làn da khỏe đẹp, việc lựa chọn sản phẩm phù hợp là vô cùng
                quan trọng. Hãy để chuyên gia của chúng tôi giúp bạn!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={scrollToBooking}
                    className="bg-white text-black hover:bg-gray-100 py-3 px-6 rounded-md text-lg">
                    Đặt lịch tư vấn
                </button>
                <button
                    onClick={scrollToServices}
                    className="text-black border bg-[#d4ecfe] hover:bg-[#6bb8f2] hover:text-black py-3 px-6 rounded-md text-lg">
                    Tìm hiểu thêm
                </button>
            </div>
        </div>
    </section>
);

const BenefitsSection = () => {
    const benefits = [
        {
            title: 'Sản phẩm phù hợp',
            description:
                'Tìm ra sản phẩm phù hợp với loại da và nhu cầu cụ thể của bạn, tránh lãng phí tiền bạc cho sản phẩm không hiệu quả',
        },
        {
            title: 'Chuyên gia tư vấn',
            description:
                'Được tư vấn bởi đội ngũ chuyên gia có kinh nghiệm và kiến thức chuyên sâu về các sản phẩm mỹ phẩm',
        },
        {
            title: 'Hỗ trợ liên tục',
            description:
                'Được hỗ trợ liên tục trong quá trình sử dụng sản phẩm, giải đáp thắc mắc và điều chỉnh phù hợp',
        },
    ];

    return (
        <section className="mb-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                    Lợi ích khi sử dụng dịch vụ tư vấn
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Chúng tôi cung cấp dịch vụ tư vấn chuyên nghiệp giúp bạn tìm
                    ra sản phẩm phù hợp nhất với làn da và nhu cầu của bạn
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                    <div
                        key={index}
                        className=" border border-gray-200 bg-white rounded-lg p-6 shadow-l hover:bg-[#F5EBE0]">
                        <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-gray-600">
                                {benefit.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const ServicesTabsSection = ({ servicesRef }) => {
    const services = [
        {
            value: 'skincare',
            title: 'Tư vấn chăm sóc da mặt',
            description: 'Giải pháp chăm sóc da mặt toàn diện',
            content:
                'Chúng tôi sẽ phân tích loại da của bạn và đề xuất quy trình chăm sóc da phù hợp với các sản phẩm cụ thể cho từng bước.',
            items: [
                'Phân tích loại da (dầu, khô, hỗn hợp, nhạy cảm)',
                'Tư vấn quy trình chăm sóc da cơ bản và nâng cao',
                'Đề xuất sản phẩm phù hợp cho từng bước skincare',
                'Giải pháp cho các vấn đề da cụ thể (mụn, thâm, lão hóa)',
            ],
        },
        {
            value: 'makeup',
            title: 'Tư vấn trang điểm',
            description: 'Giải pháp trang điểm phù hợp phong cách',
            content:
                'Chúng tôi sẽ giúp bạn tìm ra các sản phẩm trang điểm phù hợp với tông da, kiểu dáng khuôn mặt và phong cách cá nhân.',
            items: [
                'Phân tích tông da và màu sắc phù hợp',
                'Tư vấn kỹ thuật trang điểm cơ bản và nâng cao',
                'Đề xuất sản phẩm phù hợp với từng loại da',
                'Hướng dẫn trang điểm theo từng dịp khác nhau',
            ],
        },
        {
            value: 'body',
            title: 'Tư vấn chăm sóc cơ thể',
            description: 'Giải pháp chăm sóc cơ thể toàn diện',
            content:
                'Chúng tôi sẽ giúp bạn xây dựng quy trình chăm sóc cơ thể toàn diện với các sản phẩm phù hợp với loại da và nhu cầu.',
            items: [
                'Phân tích loại da cơ thể và các vấn đề cụ thể',
                'Tư vấn quy trình chăm sóc cơ thể hàng ngày',
                'Đề xuất sản phẩm phù hợp cho từng nhu cầu',
                'Giải pháp cho các vấn đề da cơ thể (khô, sần, thâm)',
            ],
        },
        {
            value: 'hair',
            title: 'Tư vấn chăm sóc tóc',
            description: 'Giải pháp chăm sóc tóc và da đầu',
            content:
                'Chúng tôi sẽ phân tích tình trạng tóc và da đầu của bạn để đề xuất các sản phẩm chăm sóc tóc phù hợp nhất.',
            items: [
                'Phân tích loại tóc và tình trạng da đầu',
                'Tư vấn quy trình chăm sóc tóc hàng ngày và định kỳ',
                'Đề xuất sản phẩm phù hợp cho từng loại tóc',
                'Giải pháp cho các vấn đề tóc (khô, gãy, rụng, chẻ ngọn)',
            ],
        },
    ];

    return (
        <section ref={servicesRef} className="mb-16 pt-5 scroll-mt-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                    Dịch vụ tư vấn theo nhu cầu
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Chúng tôi cung cấp dịch vụ tư vấn chuyên biệt cho từng danh
                    mục sản phẩm và nhu cầu của bạn
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 hover:bg-[#F5EBE0] transition-shadow bg-white rounded-lg p-6 shadow-lg">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">
                                {service.title}
                            </h3>
                            <p className="text-gray-500 mb-2">
                                {service.description}
                            </p>
                            <p className="text-gray-600 mb-4">
                                {service.content}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {service.items.map((item, itemIndex) => (
                                    <span
                                        key={itemIndex}
                                        className="bg-[#E3D5CA] text-gray-800 text-xs px-2 py-1 rounded-full">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const SkinTypeSection = () => {
    const skinTypes = [
        {
            title: 'Da dầu',
            description: 'Giải pháp kiểm soát dầu và ngăn ngừa mụn',
            content:
                'Các sản phẩm phù hợp với da dầu giúp kiểm soát lượng dầu thừa, se khít lỗ chân lông và ngăn ngừa mụn hiệu quả.',
            tags: [
                'Sữa rửa mặt dành cho da dầu',
                'Toner cân bằng dầu',
                'Kem dưỡng oil-free',
            ],
        },
        {
            title: 'Da khô',
            description: 'Giải pháp cấp ẩm và phục hồi da',
            content:
                'Các sản phẩm dành cho da khô giúp cung cấp độ ẩm, nuôi dưỡng và phục hồi hàng rào bảo vệ da.',
            tags: [
                'Sữa rửa mặt dịu nhẹ',
                'Serum cấp ẩm',
                'Kem dưỡng giàu độ ẩm',
            ],
        },
        {
            title: 'Da nhạy cảm',
            description: 'Giải pháp làm dịu và bảo vệ da',
            content:
                'Các sản phẩm dành cho da nhạy cảm giúp làm dịu, giảm kích ứng và tăng cường hàng rào bảo vệ da.',
            tags: [
                'Sữa rửa mặt không xà phòng',
                'Serum làm dịu',
                'Kem dưỡng không hương liệu',
            ],
        },

        {
            title: 'Da hỗn hợp',
            description: 'Giải pháp cân bằng vùng da khác nhau',
            content:
                'Các sản phẩm dành cho da hỗn hợp giúp cân bằng vùng da dầu (chữ T) và vùng da khô (hai má).',
            tags: ['Sữa rửa mặt cân bằng', 'Toner đa năng', 'Kem dưỡng vùng'],
        },
    ];

    return (
        <section className="mb-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Tư vấn theo loại da</h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Mỗi loại da cần được chăm sóc với những sản phẩm và phương
                    pháp khác nhau. Chúng tôi cung cấp tư vấn chuyên biệt cho
                    từng loại da.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {skinTypes.map((skin, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 hover:bg-[#F5EBE0] transition-shadow bg-white rounded-lg p-6 shadow-lg">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">
                                {skin.title}
                            </h3>
                            <p className="text-gray-500 mb-2">
                                {skin.description}
                            </p>
                            <p className="text-gray-600 mb-4">{skin.content}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {skin.tags.map((tag, tagIndex) => (
                                    <span
                                        key={tagIndex}
                                        className="bg-[#E3D5CA] text-gray-800 text-xs px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const BookingFormSection = ({ bookingRef }) => {
    const { user, isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [loginRequired, setLoginRequired] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm();

    // Nếu người dùng đã đăng nhập, tự động điền thông tin
    useEffect(() => {
        if (user) {
            setValue('name', user.name || '');
            setValue('email', user.email || '');
            setValue('skinType', user.skinType || '');
        }
    }, [user, setValue]);

    const onSubmit = async (data) => {
        // Kiểm tra đăng nhập trước khi đặt lịch
        if (!isAuthenticated) {
            setLoginRequired(true);
            setToast({
                message: 'Vui lòng đăng nhập để đặt lịch tư vấn',
                type: 'error',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const newBooking = {
                id: `booking-${Date.now()}`,
                userId: user.id,
                name: data.name,
                phone: data.phone,
                email: data.email,
                date: data.date,
                service: data.service,
                skinType: data.skinType,
                message: data.message,
                status: 'Chờ xác nhận',
                createdAt: new Date().toISOString(),
            };

            console.log('Đang gửi dữ liệu booking:', newBooking);
            try {
                const response = await fetch('http://localhost:3001/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newBooking),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const responseData = await response.json();
                console.log('Phản hồi từ server:', responseData);

                setToast({
                    message:
                        'Đặt lịch tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
                    type: 'success',
                });

                reset();

                window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
            } catch (bookingError) {
                console.error(
                    'Error saving to bookings collection:',
                    bookingError
                );
                throw bookingError;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setToast({
                message:
                    error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.',
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section ref={bookingRef} className="mb-16 pt-5 scroll-mt-24">
            <div className="max-w-3xl mx-auto border rounded-lg p-8 bg-gray-50">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Đặt lịch tư vấn</h2>
                    <p className="text-gray-500">
                        Điền thông tin của bạn để đặt lịch tư vấn với chuyên gia
                        của chúng tôi
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="font-medium">
                                Họ và tên
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`w-full p-3 border rounded-md ${
                                    errors.name ? 'border-red-500' : ''
                                }`}
                                placeholder="Nhập họ và tên của bạn"
                                {...register('name', {
                                    required: 'Vui lòng nhập họ tên',
                                    minLength: {
                                        value: 2,
                                        message:
                                            'Họ tên phải có ít nhất 2 ký tự',
                                    },
                                })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="font-medium">
                                Số điện thoại
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                className={`w-full p-3 border rounded-md ${
                                    errors.phone ? 'border-red-500' : ''
                                }`}
                                placeholder="Nhập số điện thoại của bạn"
                                {...register('phone', {
                                    required: 'Vui lòng nhập số điện thoại',
                                    pattern: {
                                        value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
                                        message: 'Số điện thoại không hợp lệ',
                                    },
                                })}
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="font-medium">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`w-full p-3 border rounded-md ${
                                    errors.email ? 'border-red-500' : ''
                                }`}
                                placeholder="Nhập email của bạn"
                                {...register('email', {
                                    required: 'Vui lòng nhập email',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Email không hợp lệ',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="date" className="font-medium">
                                Ngày hẹn
                            </label>
                            <input
                                id="date"
                                type="date"
                                className={`w-full p-3 border rounded-md ${
                                    errors.date ? 'border-red-500' : ''
                                }`}
                                {...register('date', {
                                    required: 'Vui lòng chọn ngày hẹn',
                                    validate: (value) => {
                                        const selectedDate = new Date(value);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return (
                                            selectedDate > today ||
                                            'Ngày hẹn phải đặt sau ngày hôm nay'
                                        );
                                    },
                                })}
                            />
                            {errors.date && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.date.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="service" className="font-medium">
                            Dịch vụ tư vấn
                        </label>
                        <select
                            id="service"
                            className={`w-full p-3 border rounded-md ${
                                errors.service ? 'border-red-500' : ''
                            }`}
                            {...register('service', {
                                required: 'Vui lòng chọn dịch vụ tư vấn',
                            })}>
                            <option value="">Chọn dịch vụ tư vấn</option>
                            <option value="skincare">
                                Tư vấn chăm sóc da mặt
                            </option>
                            <option value="makeup">Tư vấn trang điểm</option>
                            <option value="body">Tư vấn chăm sóc cơ thể</option>
                            <option value="hair">Tư vấn chăm sóc tóc</option>
                        </select>
                        {errors.service && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.service.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="skin-type" className="font-medium">
                            Loại da của bạn
                        </label>
                        <select
                            id="skin-type"
                            className={`w-full p-3 border rounded-md ${
                                errors.skinType ? 'border-red-500' : ''
                            }`}
                            {...register('skinType', {
                                required: 'Vui lòng chọn loại da của bạn',
                            })}>
                            <option value="">Chọn loại da của bạn</option>
                            <option value="oily">Da dầu</option>
                            <option value="dry">Da khô</option>
                            <option value="sensitive">Da nhạy cảm</option>
                            <option value="combination">Da hỗn hợp</option>
                        </select>
                        {errors.skinType && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.skinType.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="message" className="font-medium">
                            Nhu cầu cụ thể
                        </label>
                        <textarea
                            id="message"
                            className={`w-full p-3 border rounded-md h-32 ${
                                errors.message ? 'border-red-500' : ''
                            }`}
                            placeholder="Mô tả nhu cầu và vấn đề da của bạn"
                            {...register('message', {
                                required: 'Vui lòng nhập nhu cầu cụ thể',
                                minLength: {
                                    value: 10,
                                    message:
                                        'Nhu cầu cụ thể phải có ít nhất 10 ký tự',
                                },
                            })}></textarea>
                        {errors.message && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.message.message}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#006D77] hover:bg-[#004248] text-white py-3 rounded-md text-lg font-bold disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch ngay'}
                    </button>
                </form>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </section>
    );
};

const CTASection = ({ scrollToBooking }) => (
    <section className="bg-gradient-to-r from-[#154145] to-[#006D77] rounded-lg p-8 text-white text-center mb-5">
        <h2 className="text-3xl font-bold mb-4">
            Bắt đầu hành trình làm đẹp của bạn ngay hôm nay
        </h2>
        <p className="max-w-2xl mx-auto mb-8 text-gray-200">
            Đừng để làn da của bạn phải "thử và sai" với hàng loạt sản phẩm
            không phù hợp. Hãy để chuyên gia của chúng tôi giúp bạn tìm ra giải
            pháp tốt nhất!
        </p>
        <button
            onClick={scrollToBooking}
            className="bg-white text-black font-bold hover:bg-gray-200 py-3 px-6 rounded-md text-lg">
            Đặt lịch tư vấn ngay
        </button>
    </section>
);

export default function Service() {
    const bookingRef = useRef(null);
    const servicesRef = useRef(null);
    const [searchParams] = useSearchParams();

    const scrollToBooking = () => {
        bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToServices = () => {
        servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Xử lý tham số query để cuộn đến form đặt lịch khi trang được tải
    useEffect(() => {
        const scrollTo = searchParams.get('scrollTo');
        if (scrollTo === 'booking') {
            // Đợi một chút để đảm bảo trang đã tải xong
            setTimeout(() => {
                scrollToBooking();
            }, 500);
        }
    }, [searchParams]);

    return (
        <div className="mx-auto px-4 pt-5 bg-[#EDF6F9]">
            <HeroSection
                scrollToBooking={scrollToBooking}
                scrollToServices={scrollToServices}
            />
            <BenefitsSection />
            <ServicesTabsSection servicesRef={servicesRef} />
            <SkinTypeSection />
            <CTASection scrollToBooking={scrollToBooking} />
            <BookingFormSection bookingRef={bookingRef} />
        </div>
    );
}
