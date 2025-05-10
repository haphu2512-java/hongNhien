import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const sidebarItems = [
        { path: '/admin/orders', label: 'Quản lý đơn hàng' },
        { path: '/admin/products', label: 'Quản lý sản phẩm' },
        { path: '/admin/services', label: 'Quản lý dịch vụ' },
        // { path: '/admin/contact', label: 'Quản lý liên hệ' },
        { path: '/admin/users', label: 'Quản lý người dùng' },
        // { path: '/admin/reports', label: 'Báo cáo' },
        // { path: '/admin/settings', label: 'Cài đặt' },
    ];

    return (
        <div className="w-64 h-full bg-[#006D77] text-white fixed top-0 left-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold">FRUVIA BEAUTY</h1>
            </div>
            <nav className="mt-6">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`block p-4 hover:bg-[#049eac] ${
                            location.pathname === item.path
                                ? 'bg-[#049eac]'
                                : ''
                        }`}>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
