import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar_AdminPage.jsx';
import Header from '../components/Header_AdminPage.jsx';
import Dashboard from '../components/Dashboard_AdminPage.jsx';
import Products from '../components/Products_AdminPage.jsx';
import Services from '../components/Services_AdminPage.jsx';
import Contact from '../components/Contact_AdminPage.jsx';
import Users from '../components/Users_AdminPage.jsx';
import Reports from '../components/Reports_AdminPage.jsx';
import Settings from '../components/Settings_AdminPage.jsx';

const AdminPage = () => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 p-6 ml-64">
                <div className="flex justify-between items-center mb-6">
                    <Header />
                </div>
                <Routes>
                    <Route path="orders" element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="services" element={<Services />} />
                    {/* <Route path="contact" element={<Contact />} /> */}
                    <Route path="users" element={<Users />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Dashboard />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminPage;
