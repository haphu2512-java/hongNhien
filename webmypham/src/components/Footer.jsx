import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-[#83C5BE] text-black py-8">
            <div className="px-6 flex flex-col md:flex-row justify-between gap-y-8 md:gap-x-12">
                {/* Phần thương hiệu bên trái */}
                <div className="w-full md:w-1/3 max-w-2xl">
                    <div className="flex items-baseline justify-center md:justify-start space-x-1 mb-2">
                        <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-wide uppercase">
                            FRUVIA
                        </span>
                        <span className="text-2xl md:text-3xl font-medium text-gray-900 tracking-widest uppercase">
                            BEAUTY
                        </span>
                    </div>
                    <span className="text-black mt-4">
                        Chúng tôi mang đến sản phẩm làm đẹp an toàn, tinh tế và
                        được tuyển chọn kỹ lưỡng từ các thương hiệu uy tín toàn
                        cầu.
                    </span>
                </div>

                {/* Các liên kết bên phải */}
                <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-semibold text-black mb-2">
                            Trang chính
                        </h4>
                        <Link
                            to="/"
                            className="block text-black text-sm hover:font-bold">
                            Trang chủ
                        </Link>
                        <Link
                            to="/san-pham"
                            className="block text-black text-sm hover:font-bold">
                            Sản phẩm
                        </Link>
                        <Link
                            to="/dich-vu"
                            className="block text-black text-sm hover:font-bold">
                            Dịch vụ
                        </Link>
                        <Link
                            to="/gioi-thieu"
                            className="block text-black text-sm hover:font-bold">
                            Giới thiệu
                        </Link>
                        <Link
                            to="/lien-he"
                            className="block text-black text-sm hover:font-bold">
                            Liên hệ
                        </Link>
                    </div>
                    <div>
                        <h4 className="font-semibold text-black mb-2">
                            Liên kết
                        </h4>
                        <a
                            href="#"
                            className="block text-black text-sm hover:font-bold">
                            Điều khoản sử dụng
                        </a>
                        <a
                            href="#"
                            className="block text-black text-sm hover:font-bold">
                            Chính sách bảo mật
                        </a>
                        <a
                            href="#"
                            className="block text-black text-sm hover:font-bold">
                            Tuyển dụng
                        </a>
                    </div>
                    <div>
                        <h4 className="font-semibold text-black mb-2">
                            Kết nối với chúng tôi
                        </h4>
                        <a
                            href="#"
                            className="block text-black text-sm hover:font-bold">
                            Facebook
                        </a>
                        <a
                            href="#"
                            className="block text-black text-sm hover:font-bold">
                            Instagram
                        </a>
                        <a
                            href="#"
                            className="block text-black text-sm hover:font-bold">
                            Twitter
                        </a>
                    </div>
                    <div>
                        <h4 className="font-semibold text-black mb-2">
                            Thông tin liên hệ
                        </h4>
                        <p className="text-black text-sm">
                            Địa chỉ: 12 Nguyễn Văn Bảo, Gò Vấp, TP Hồ Chí Minh
                        </p>
                        <p className="text-black text-sm">SĐT: 0999 999 999</p>
                    </div>
                </div>
            </div>

            {/* Footer dưới */}
            <div className="container mx-auto px-6 mt-8 border-t border-black pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-black">
                <p className="text-center md:text-left">
                    © 2025 Fruvia Beauty, Inc. ·{' '}
                    <a href="#" className="hover:font-bold">
                        Quyền riêng tư
                    </a>{' '}
                    ·{' '}
                    <a href="#" className="hover:font-bold">
                        Điều khoản
                    </a>{' '}
                    ·{' '}
                    <a href="#" className="hover:font-bold">
                        Sơ đồ trang
                    </a>
                </p>
            </div>
        </footer>
    );
}
