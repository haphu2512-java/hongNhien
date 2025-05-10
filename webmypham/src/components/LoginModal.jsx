import React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Toast from './Hero';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
    const [isLoginForm, setIsLoginForm] = useState(true);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();
    const {
        login,
        register: registerUser,
        error: authError,
        setError: setAuthError,
    } = useAuth();
    const { syncCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();

    // Làm sạch form và lỗi khi mở modal
    useEffect(() => {
        if (isOpen) {
            reset();
            setLoginError(null);
            // Nếu có hàm setError trong AuthContext, sử dụng nó để xóa lỗi
            if (setAuthError) {
                setAuthError(null);
            }
        }
    }, [isOpen, reset, setAuthError]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setLoginError(null);

        // Nếu có hàm setError trong AuthContext, sử dụng nó để xóa lỗi
        if (setAuthError) {
            setAuthError(null);
        }

        try {
            let success;

            if (isLoginForm) {
                console.log('Đang đăng nhập với:', data.email); // Debug
                // Đăng nhập
                success = await login({
                    email: data.email,
                    password: data.password,
                });

                console.log('Kết quả đăng nhập:', success); // Debug

                if (success) {
                    setToast({
                        message: 'Đăng nhập thành công!',
                        type: 'success',
                    });

                    // Làm sạch form trước khi đóng
                    reset();
                    setLoginError(null);
                    onClose();
                    navigate('/');
                    window.scrollTo(0, 0);
                    window.location.reload();
                } else {
                    // Hiển thị lỗi
                    setLoginError(authError || 'Đăng nhập không thành công');
                }
            } else {
                // Đăng ký
                success = await registerUser({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    skinType: data.skinType || 'normal',
                });

                if (success) {
                    // Hiển thị thông báo thành công
                    setToast({
                        message: 'Đăng ký thành công!',
                        type: 'success',
                    });

                    // Làm sạch form và lỗi
                    reset();
                    setLoginError(null);

                    navigate('/');
                    window.scrollTo(0, 0);

                    // Đóng modal sau 1 giây
                    setTimeout(() => {
                        onClose();
                        // Làm mới trang để cập nhật trạng thái
                        window.location.reload();
                    }, 1000);
                } else {
                    setLoginError(authError || 'Đăng ký không thành công');
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const switchForm = () => {
        setIsLoginForm(!isLoginForm);
        setLoginError(null);
        // Nếu có hàm setError trong AuthContext, sử dụng nó để xóa lỗi
        if (setAuthError) {
            setAuthError(null);
        }
        reset();
    };

    // Hàm đóng modal và làm sạch form
    const handleClose = () => {
        reset();
        setLoginError(null);
        // Nếu có hàm setError trong AuthContext, sử dụng nó để xóa lỗi
        if (setAuthError) {
            setAuthError(null);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLoginForm ? 'Đăng nhập' : 'Đăng ký'}
                </h2>

                {(authError || loginError) && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {authError || loginError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {!isLoginForm && (
                        <div>
                            <label className="block text-gray-700 mb-1">
                                Họ tên
                            </label>
                            <input
                                type="text"
                                {...register('name', {
                                    required: 'Vui lòng nhập họ tên',
                                })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                                placeholder="Nhập họ tên của bạn"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Vui lòng nhập email',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email không hợp lệ',
                                },
                            })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Nhập email của bạn"
                            onChange={() => {
                                setLoginError(null);
                                if (setAuthError) setAuthError(null);
                            }}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            {...register('password', {
                                required: 'Vui lòng nhập mật khẩu',
                                minLength: {
                                    value: 6,
                                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                                },
                            })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Nhập mật khẩu của bạn"
                            onChange={() => {
                                setLoginError(null);
                                if (setAuthError) setAuthError(null);
                            }}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {!isLoginForm && (
                        <div>
                            <label className="block text-gray-700 mb-1">
                                Loại da
                            </label>
                            <select
                                {...register('skinType')}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500">
                                <option value="normal">Da thường</option>
                                <option value="dry">Da khô</option>
                                <option value="oily">Da dầu</option>
                                <option value="combination">Da hỗn hợp</option>
                                <option value="sensitive">Da nhạy cảm</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition duration-200 disabled:opacity-50">
                        {isSubmitting
                            ? 'Đang xử lý...'
                            : isLoginForm
                            ? 'Đăng nhập'
                            : 'Đăng ký'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={switchForm}
                        className="text-gray-600 hover:text-gray-800 underline">
                        {isLoginForm
                            ? 'Chưa có tài khoản? Đăng ký ngay'
                            : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
