import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';
import {
    ChevronDown,
    User,
    LogOut,
    Search,
    ShoppingBasket,
    Menu,
    X,
} from 'lucide-react';

export default function Header() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Debug logs
    useEffect(() => {
        console.log('Header - User:', user);
        console.log('Header - isAuthenticated:', isAuthenticated);
    }, [user, isAuthenticated]);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Kiểm tra đường dẫn hiện tại để xác định mục đang được chọn
    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') {
            return true;
        }
        if (path !== '/' && location.pathname.startsWith(path)) {
            return true;
        }
        return false;
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        console.log('Header: Handling logout');
        logout();
        setIsDropdownOpen(false);
        navigate('/');
        window.scrollTo(0, 0);
    };

    // Render user section based on authentication status
    const renderUserSection = () => {
        if (user) {
            return (
                <div className="relative" ref={dropdownRef}>
                    <button
                        className={`flex items-center gap-2 text-base font-medium hover:underline ${
                            isDropdownOpen ? 'text-[#006D77]' : 'text-white'
                        }`}
                        onClick={toggleDropdown}>
                        <span>Xin chào, {user.name}</span>
                        <ChevronDown
                            size={16}
                            className={
                                isDropdownOpen
                                    ? 'transform rotate-180 transition-transform '
                                    : 'transition-transform'
                            }
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-5 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                            <Link
                                to="/ho-so"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#EDF6F9] hover:text-[#006D77]"
                                onClick={() => setIsDropdownOpen(false)}>
                                <User size={16} className="mr-2" />
                                Hồ sơ người dùng
                            </Link>

                            {user.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#EDF6F9] hover:text-[#006D77]"
                                    onClick={() => setIsDropdownOpen(false)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mr-2">
                                        <path d="M3 3h18v18H3z" />
                                        <path d="M7 7h10v10H7z" />
                                    </svg>
                                    Quản lý cửa hàng
                                </Link>
                            )}

                            <button
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#EDF6F9] hover:text-[#006D77]"
                                onClick={handleLogout}>
                                <LogOut size={16} className="mr-2" />
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <button
                    className="bg-[#006D77] text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-[#005F69] transition"
                    onClick={openLoginModal}>
                    Đăng nhập
                </button>
            );
        }
    };

    return (
        <>
            <header className="bg-[#83C5BE] shadow-sm w-full z-10">
                <div className="px-6 py-4 flex justify-between items-center rounded-b-lg bg-[#83C5BE] space-x-5">
                    <div className="flex items-baseline">
                        <span className="text-2xl font-extrabold  tracking-wide uppercase">
                            FRUVIA
                        </span>
                        <span className="text-2xl font-medium tracking-widest uppercase">
                            BEAUTY
                        </span>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-white"
                        onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-5 text-base text-white font-semibold">
                        <Link
                            to="/"
                            className={`hover:text-[#005F69] transition-colors ${
                                isActive('/')
                                    ? 'text-white border-b-2 border-b-white'
                                    : ''
                            }`}>
                            Trang chủ
                        </Link>
                        <Link
                            to="/san-pham"
                            className={`hover:text-[#005F69] transition-colors ${
                                isActive('/san-pham')
                                    ? 'text-white border-b-2 border-b-white'
                                    : ''
                            }`}>
                            Sản phẩm
                        </Link>
                        <Link
                            to="/dich-vu"
                            className={`hover:text-[#005F69] transition-colors ${
                                isActive('/dich-vu')
                                    ? 'text-white border-b-2 border-b-white'
                                    : ''
                            }`}>
                            Dịch vụ
                        </Link>
                        <Link
                            to="/gioi-thieu"
                            className={`hover:text-[#005F69] transition-colors ${
                                isActive('/gioi-thieu')
                                    ? 'text-white border-b-2 border-b-white'
                                    : ''
                            }`}>
                            Giới thiệu
                        </Link>
                        {/* <Link
                            to="/lien-he"
                            className={`hover:text-[#005F69] transition-colors ${
                                isActive('/lien-he')
                                    ? 'text-white border-b-2 border-b-white'
                                    : ''
                            }`}>
                            Liên hệ
                        </Link> */}
                    </nav>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="absolute top-16 left-0 right-0 bg-[#EDF6F9] shadow-md md:hidden z-20">
                            <div className="flex flex-col p-4 space-y-3 bg-[#83C5BE]">
                                <Link
                                    to="/"
                                    className={`text-white  py-2 ${
                                        isActive('/') ? 'font-bold' : ''
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}>
                                    Trang chủ
                                </Link>
                                <Link
                                    to="/san-pham"
                                    className={`text-white py-2 ${
                                        isActive('/san-pham') ? 'font-bold' : ''
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}>
                                    Sản phẩm
                                </Link>
                                <Link
                                    to="/dich-vu"
                                    className={`text-white py-2 ${
                                        isActive('/dich-vu') ? 'font-bold' : ''
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}>
                                    Dịch vụ
                                </Link>
                                <Link
                                    to="/gioi-thieu"
                                    className={`text-white py-2 ${
                                        isActive('/gioi-thieu')
                                            ? 'font-bold'
                                            : ''
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}>
                                    Giới thiệu
                                </Link>
                                {/* <Link
                                    to="/lien-he"
                                    className={`text-white py-2 ${
                                        isActive('/lien-he') ? 'font-bold' : ''
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}>
                                    Liên hệ
                                </Link> */}
                                <Link
                                    to="/gio-hang"
                                    className={`text-white py-2 flex items-center gap-2 ${
                                        isActive('/gio-hang') ? 'font-bold' : ''
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}>
                                    Giỏ hàng
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs ">
                        <Link
                            to="/gio-hang"
                            className={`hidden md:flex font-semibold items-center gap-1 text-white hover:text-[#0f4d53]  ${
                                isActive('/gio-hang') ? 'text-[#0f4d53]' : ''
                            }`}>
                            <ShoppingBasket size={30} />
                        </Link>

                        {renderUserSection()}
                    </div>
                </div>
            </header>

            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        </>
    );
}
