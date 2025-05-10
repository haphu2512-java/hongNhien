import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import Introduce from './pages/Introduce';
import Service from './pages/Service';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import UserProfileDetails from './pages/UserProfileDetails';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';
import { useAuth } from './context/AuthContext';

// Admin route protection component
const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

const MainLayout = ({ children }) => (
    <>
        <Header />
        {children}
        <Footer />
    </>
);

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <ScrollToTop />
                    <Routes>
                        {/* Admin routes */}
                        <Route
                            path="/admin/*"
                            element={
                                <AdminRoute>
                                    <AdminPage />
                                </AdminRoute>
                            }
                        />

                        {/* Regular routes with Header/Footer */}
                        <Route
                            path="/"
                            element={
                                <MainLayout>
                                    <HomePage />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/san-pham"
                            element={
                                <MainLayout>
                                    <ProductPage />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/san-pham/:productId"
                            element={
                                <MainLayout>
                                    <ProductDetailPage />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/gioi-thieu"
                            element={
                                <MainLayout>
                                    <Introduce />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/dich-vu"
                            element={
                                <MainLayout>
                                    <Service />
                                </MainLayout>
                            }
                        />
                        {/* <Route
                            path="/lien-he"
                            element={
                                <MainLayout>
                                    <Contact />
                                </MainLayout>
                            }
                        /> */}
                        <Route
                            path="/ho-so"
                            element={
                                <MainLayout>
                                    <UserProfileDetails />
                                </MainLayout>
                            }
                        />
                        <Route
                            path="/gio-hang"
                            element={
                                <MainLayout>
                                    <Cart />
                                </MainLayout>
                            }
                        />

                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
