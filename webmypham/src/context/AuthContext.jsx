import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Loaded user from localStorage:', parsedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Đăng nhập: kiểm tra user theo email
    const login = async ({ email, password }) => {
        try {
            setError(null);
            console.log('Attempting login with:', email, 'password:', password);

            // Gọi API từ JSON Server
            const response = await fetch(
                `http://localhost:3001/users?email=${email}`
            );
            if (!response.ok) {
                console.error(
                    'API Error:',
                    response.status,
                    response.statusText
                );
                throw new Error('Không thể kết nối đến cơ sở dữ liệu');
            }

            const users = await response.json();
            console.log('API Response:', users);

            // Tìm user theo email và password
            const foundUser = users.find(
                (u) => u.email === email && u.password === password
            );
            console.log('Found user:', foundUser);

            if (foundUser) {
                // Đảm bảo user có trường cart
                if (!foundUser.cart) {
                    foundUser.cart = [];

                    // Cập nhật user trên server để thêm trường cart
                    await fetch(`http://localhost:3001/users/${foundUser.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(foundUser),
                    });
                }

                const userToStore = {
                    id: foundUser.id,
                    name: foundUser.name,
                    email: foundUser.email,
                    skinType: foundUser.skinType,
                    wishlist: foundUser.wishlist || [],
                    role: foundUser.role || 'user',
                };

                console.log('Login successful, storing user:', userToStore);
                setUser(userToStore);
                localStorage.setItem('user', JSON.stringify(userToStore));
                return true;
            }

            console.log('Login failed: Invalid credentials');
            setError('Email hoặc mật khẩu không đúng');
            return false;
        } catch (error) {
            console.error('Login error:', error);
            setError('Đã xảy ra lỗi khi đăng nhập');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            console.log('Attempting registration with:', userData.email);

            // Kiểm tra email đã tồn tại chưa
            const checkResponse = await fetch(
                `http://localhost:3001/users?email=${userData.email}`
            );
            if (!checkResponse.ok) {
                throw new Error('Không thể kết nối đến cơ sở dữ liệu');
            }

            const existingUsers = await checkResponse.json();
            if (existingUsers.length > 0) {
                console.log('Registration failed: Email already exists');
                setError('Email đã tồn tại');
                return false;
            }

            // Tạo user mới
            const newUser = {
                id: `user${Date.now()}`,
                name: userData.name,
                email: userData.email,
                password: userData.password,
                skinType: userData.skinType || 'normal',
                wishlist: [],
                orders: [],
                cart: [],
                role: 'user',
            };

            // Thêm user mới vào database
            const addResponse = await fetch('http://localhost:3001/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (!addResponse.ok) {
                throw new Error('Không thể đăng ký tài khoản');
            }

            const userToStore = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                skinType: newUser.skinType,
                wishlist: newUser.wishlist,
            };

            console.log('Registration successful, storing user:', userToStore);
            setUser(userToStore);
            localStorage.setItem('user', JSON.stringify(userToStore));
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            setError('Đã xảy ra lỗi khi đăng ký');
            return false;
        }
    };

    const logout = () => {
        console.log('Logging out');
        // Xóa user từ state
        setUser(null);
        // Xóa dữ liệu từ localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
    };

    // Hàm xóa lỗi
    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        setError, // Thêm hàm setError để có thể xóa lỗi từ bên ngoài
        clearError, // Thêm hàm clearError để xóa lỗi
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
