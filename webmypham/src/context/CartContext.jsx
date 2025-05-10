import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    // Lấy giỏ hàng từ localStorage nếu có
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Theo dõi thay đổi của user để xóa giỏ hàng khi đăng xuất
    useEffect(() => {
        // Nếu user chuyển từ có sang null (đăng xuất)
        if (!user) {
            console.log('CartContext: User logged out, clearing cart state');
            setCartItems([]);
        }
    }, [user]);

    // Lấy giỏ hàng từ user khi đăng nhập
    useEffect(() => {
        const fetchUserCart = async () => {
            if (isAuthenticated && user) {
                try {
                    const response = await fetch(
                        `http://localhost:3001/users/${user.id}`
                    );
                    if (!response.ok)
                        throw new Error('Failed to fetch user data');

                    const userData = await response.json();
                    if (userData.cart && userData.cart.length > 0) {
                        setCartItems(userData.cart);
                    }
                } catch (error) {
                    console.error('Error fetching user cart:', error);
                }
            }
        };

        fetchUserCart();
    }, [isAuthenticated, user]);

    // Lưu giỏ hàng vào localStorage và user data nếu đã đăng nhập
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));

        const saveCartToUser = async () => {
            if (isAuthenticated && user) {
                try {
                    const response = await fetch(
                        `http://localhost:3001/users/${user.id}`
                    );
                    if (!response.ok)
                        throw new Error('Failed to fetch user data');

                    const userData = await response.json();
                    userData.cart = cartItems;

                    await fetch(`http://localhost:3001/users/${user.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ cart: cartItems }),
                    });
                } catch (error) {
                    console.error('Error saving cart to user:', error);
                }
            }
        };

        saveCartToUser();
    }, [cartItems, isAuthenticated, user]);

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = (product) => {
        setCartItems((prevItems) => {
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const existingItemIndex = prevItems.findIndex(
                (item) => item.productId === product.productId
            );

            let newItems;
            if (existingItemIndex >= 0) {
                // Nếu đã có, tăng số lượng
                newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1,
                };
            } else {
                // Nếu chưa có, thêm mới với số lượng là 1 và chỉ lưu các thông tin cần thiết
                newItems = [
                    ...prevItems,
                    {
                        productId: product.productId,
                        title: product.title,
                        price: product.price,
                        quantity: 1,
                    },
                ];
            }

            return newItems;
        });
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = (productId) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.productId !== productId)
        );
    };

    // Cập nhật số lượng sản phẩm
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    // Tính tổng số sản phẩm trong giỏ hàng
    const getCartCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Tính tổng tiền
    const getCartTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartCount,
        getCartTotal,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
};
