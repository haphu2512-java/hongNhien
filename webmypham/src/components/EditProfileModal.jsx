import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Toast from './Toast';
import { useNavigate } from 'react-router-dom';
export default function EditProfileModal({
    isOpen,
    onClose,
    user,
    onUserUpdate,
}) {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            confirmPassword: '',
            skinType: user?.skinType || 'normal',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);

    // Cập nhật giá trị mặc định khi user thay đổi
    React.useEffect(() => {
        if (user) {
            setValue('name', user.name || '');
            setValue('email', user.email || '');
            setValue('skinType', user.skinType || 'normal');
            // Luôn xóa trường mật khẩu khi modal mở hoặc user thay đổi
            setValue('password', '');
            setValue('confirmPassword', '');
        }
    }, [user, setValue, isOpen]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Kiểm tra mật khẩu xác nhận
            if (data.password && data.password !== data.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp');
                setIsSubmitting(false);
                return;
            }

            // Kiểm tra email đã tồn tại chưa (nếu email thay đổi)
            if (data.email !== user.email) {
                const checkResponse = await fetch(
                    `http://localhost:3001/users?email=${data.email}`
                );

                if (!checkResponse.ok) {
                    throw new Error('Không thể kết nối đến cơ sở dữ liệu');
                }

                const existingUsers = await checkResponse.json();
                if (existingUsers.length > 0) {
                    setError('Email đã tồn tại');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Chuẩn bị dữ liệu cập nhật
            const updatedUser = {
                ...user,
                name: data.name,
                email: data.email,
                skinType: data.skinType,
            };

            if (data.password) {
                updatedUser.password = data.password;
            }

            const updateResponse = await fetch(
                `http://localhost:3001/users/${user.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedUser),
                }
            );

            if (!updateResponse.ok) {
                throw new Error('Không thể cập nhật thông tin');
            }

            const userToStore = {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                skinType: updatedUser.skinType,
                wishlist: updatedUser.wishlist || [],
            };

            localStorage.setItem('user', JSON.stringify(userToStore));

            if (onUserUpdate) {
                onUserUpdate(userToStore);
            }

            // Xóa giá trị mật khẩu
            setValue('password', '');
            setValue('confirmPassword', '');

            // Hiển thị thông báo thành công
            setToast({
                message: 'Cập nhật thông tin thành công!',
                type: 'success',
            });

            // Đóng modal sau 1 giây
            setTimeout(() => {
                onClose();
                // Bỏ navigate('/ho-so');
            }, 1000);
        } catch (error) {
            console.error('Update error:', error);
            setError('Đã xảy ra lỗi khi cập nhật thông tin');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">
                    Chỉnh sửa thông tin cá nhân
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">
                            Mật khẩu mới (để trống nếu không thay đổi)
                        </label>
                        <input
                            type="password"
                            {...register('password', {
                                minLength: {
                                    value: 6,
                                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                                },
                            })}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Nhập mật khẩu mới"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-1">
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            {...register('confirmPassword')}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Nhập lại mật khẩu mới"
                        />
                    </div>

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

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition duration-200 disabled:opacity-50">
                        {isSubmitting ? 'Đang xử lý...' : 'Cập nhật thông tin'}
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
        </div>
    );
}
