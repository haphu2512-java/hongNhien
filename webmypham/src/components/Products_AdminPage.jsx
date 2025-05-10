import { useState, useEffect } from 'react';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [skinTypes, setSkinTypes] = useState([]);
    // const [subcategories, setSubcategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        skinType: '',
        brandId: '',
    });
    const [newProduct, setNewProduct] = useState({
        productId: '',
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        onSale: false,
        category: '',
        subcategory: '',
        skinType: '',
    });
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Fetch data from JSON server
    useEffect(() => {
        // Fetch products
        fetch('http://localhost:3001/products')
            .then((response) => response.json())
            .then((data) => {
                setProducts(data);
                setFilteredProducts(data);

                // Set the next product ID based on the count of existing products
                const nextId = (data.length + 1).toString();
                setNewProduct((prev) => ({
                    ...prev,
                    productId: nextId,
                }));
            })
            .catch((error) => console.error('Error fetching products:', error));

        // Fetch categories
        fetch('http://localhost:3001/categories')
            .then((response) => response.json())
            .then((data) => setCategories(data))
            .catch((error) =>
                console.error('Error fetching categories:', error)
            );

        // Fetch skin types
        fetch('http://localhost:3001/skinTypes')
            .then((response) => response.json())
            .then((data) => setSkinTypes(data))
            .catch((error) =>
                console.error('Error fetching skin types:', error)
            );

        // Fetch subcategories
        // fetch('http://localhost:3001/subcategories')
        //     .then((response) => {
        //         if (!response.ok) {
        //             // Nếu không tìm thấy, khởi tạo mảng rỗng thay vì báo lỗi
        //             setSubcategories([]);
        //             throw new Error(`HTTP error! Status: ${response.status}`);
        //         }
        //         return response.json();
        //     })
        //     .then((data) => setSubcategories(data))
        //     .catch((error) => {
        //         console.error('Error fetching subcategories:', error);
        //         // Đảm bảo subcategories là mảng rỗng nếu có lỗi
        //         setSubcategories([]);
        //     });

        // Fetch brands
        fetch('http://localhost:3001/brands')
            .then((response) => response.json())
            .then((data) => setBrands(data))
            .catch((error) => console.error('Error fetching brands:', error));
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = products;

        if (filters.category) {
            filtered = filtered.filter((p) => p.category === filters.category);
        }

        if (filters.skinType) {
            filtered = filtered.filter((p) =>
                p.skinType.includes(filters.skinType)
            );
        }

        setFilteredProducts(filtered);
    }, [filters, products]);

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Format price to VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // Handle input changes for new/editing product
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (editingProduct) {
            if (name === 'category') {
                setEditingProduct({
                    ...editingProduct,
                    [name]: value,
                    subcategory: '', // Reset subcategory when category changes
                });
            } else {
                setEditingProduct({
                    ...editingProduct,
                    [name]: type === 'checkbox' ? checked : value,
                });
            }
        } else {
            if (name === 'category') {
                setNewProduct({
                    ...newProduct,
                    [name]: value,
                    subcategory: '', // Reset subcategory when category changes
                });
            } else {
                setNewProduct({
                    ...newProduct,
                    [name]: type === 'checkbox' ? checked : value,
                });
            }
        }
    };

    // Add new product
    const handleAddProduct = () => {
        fetch('http://localhost:3001/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newProduct,
                price: parseInt(newProduct.price),
                originalPrice: newProduct.originalPrice
                    ? parseInt(newProduct.originalPrice)
                    : null,
                skinType: [newProduct.skinType], // Convert to array for storage
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                const updatedProducts = [...products, data];
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);

                // Reset form
                const nextId = (updatedProducts.length + 1).toString();
                setNewProduct({
                    productId: nextId,
                    title: '',
                    description: '',
                    price: '',
                    originalPrice: '',
                    image: '',
                    onSale: false,
                    category: '',
                    subcategory: '',
                    skinType: '',
                });
                setIsAdding(false);
            })
            .catch((error) => console.error('Error adding product:', error));
    };

    // Update product
    const handleUpdateProduct = () => {
        fetch(`http://localhost:3001/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...editingProduct,
                price: parseInt(editingProduct.price),
                originalPrice: editingProduct.originalPrice
                    ? parseInt(editingProduct.originalPrice)
                    : null,
                skinType: Array.isArray(editingProduct.skinType)
                    ? editingProduct.skinType
                    : [editingProduct.skinType].filter(Boolean),
            }),
        })
            .then(() => {
                const updatedProducts = products.map((p) =>
                    p.id === editingProduct.id ? editingProduct : p
                );
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
                setEditingProduct(null);
            })
            .catch((error) => console.error('Error updating product:', error));
    };

    // Delete product
    const handleDeleteProduct = (id) => {
        fetch(`http://localhost:3001/products/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                const updatedProducts = products.filter((p) => p.id !== id);
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
            })
            .catch((error) => console.error('Error deleting product:', error));
    };

    // Filter subcategories based on selected category
    // const getFilteredSubcategories = () => {
    //     const selectedCategory = editingProduct
    //         ? editingProduct.category
    //         : newProduct.category;
    //     return subcategories.filter(
    //         (subcategory) => subcategory.categoryId === selectedCategory
    //     );
    // };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quản lý sản phẩm</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                {/* Filter Section */}
                <div className="mb-6 p-4 border rounded">
                    <h3 className="text-lg font-semibold mb-2">
                        Bộ lọc sản phẩm
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">Danh mục</label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded">
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Loại da</label>
                            <select
                                name="skinType"
                                value={filters.skinType}
                                onChange={handleFilterChange}
                                className="w-full p-2 border rounded">
                                <option value="">Tất cả loại da</option>
                                {skinTypes.map((skinType) => (
                                    <option
                                        key={skinType.id}
                                        value={skinType.id}>
                                        {skinType.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => {
                            // Calculate next ID based on current products length
                            const nextId = (products.length + 1).toString();
                            setNewProduct((prev) => ({
                                ...prev,
                                productId: nextId,
                            }));
                            setIsAdding(true);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded">
                        Thêm sản phẩm mới
                    </button>
                </div>

                {/* Form for adding/editing product */}
                {(isAdding || editingProduct) && (
                    <div className="mb-6 p-4 border rounded">
                        <h3 className="text-lg font-semibold mb-2">
                            {editingProduct
                                ? 'Sửa sản phẩm'
                                : 'Thêm sản phẩm mới'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="productId"
                                placeholder="Product ID"
                                value={
                                    editingProduct
                                        ? editingProduct.productId
                                        : newProduct.productId
                                }
                                readOnly
                                className="p-2 border rounded bg-gray-100"
                            />
                            <input
                                type="text"
                                name="title"
                                placeholder="Tên sản phẩm"
                                value={
                                    editingProduct
                                        ? editingProduct.title
                                        : newProduct.title
                                }
                                onChange={handleInputChange}
                                className="p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Mô tả"
                                value={
                                    editingProduct
                                        ? editingProduct.description
                                        : newProduct.description
                                }
                                onChange={handleInputChange}
                                className="p-2 border rounded"
                            />
                            {/* Regular price field (always visible) */}
                            <input
                                type="number"
                                name="price"
                                placeholder="Giá sản phẩm"
                                value={
                                    editingProduct
                                        ? editingProduct.price
                                        : newProduct.price
                                }
                                onChange={handleInputChange}
                                className="p-2 border rounded"
                            />
                            {/* Sale checkbox */}
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="onSale"
                                    checked={
                                        editingProduct
                                            ? editingProduct.onSale
                                            : newProduct.onSale
                                    }
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                Đang giảm giá
                            </label>
                            {/* Original price field - only visible when onSale is true */}
                            {(editingProduct
                                ? editingProduct.onSale
                                : newProduct.onSale) && (
                                <input
                                    type="number"
                                    name="originalPrice"
                                    placeholder="Giá gốc (trước khi giảm)"
                                    value={
                                        editingProduct
                                            ? editingProduct.originalPrice
                                            : newProduct.originalPrice
                                    }
                                    onChange={handleInputChange}
                                    className="p-2 border rounded bg-yellow-50"
                                />
                            )}
                            <input
                                type="text"
                                name="image"
                                placeholder="URL hình ảnh"
                                value={
                                    editingProduct
                                        ? editingProduct.image
                                        : newProduct.image
                                }
                                onChange={handleInputChange}
                                className="p-2 border rounded"
                            />
                            <div>
                                <label className="block mb-1">Danh mục</label>
                                <select
                                    name="category"
                                    value={
                                        editingProduct
                                            ? editingProduct.category
                                            : newProduct.category
                                    }
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded">
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* <div>
                                <label className="block mb-1">
                                    Danh mục phụ
                                </label>
                                <select
                                    name="subcategory"
                                    value={
                                        editingProduct
                                            ? editingProduct.subcategory
                                            : newProduct.subcategory
                                    }
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    disabled={
                                        !(editingProduct
                                            ? editingProduct.category
                                            : newProduct.category)
                                    }>
                                    <option value="">Chọn danh mục phụ</option>
                                    {getFilteredSubcategories().map(
                                        (subcategory) => (
                                            <option
                                                key={subcategory.id}
                                                value={subcategory.id}>
                                                {subcategory.name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div> */}
                            <div>
                                <label className="block mb-1">Loại da</label>
                                <select
                                    name="skinType"
                                    value={
                                        editingProduct
                                            ? Array.isArray(
                                                  editingProduct.skinType
                                              )
                                                ? editingProduct.skinType[0] ||
                                                  ''
                                                : editingProduct.skinType || ''
                                            : newProduct.skinType
                                    }
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded">
                                    <option value="">Chọn loại da</option>
                                    {skinTypes.map((skinType) => (
                                        <option
                                            key={skinType.id}
                                            value={skinType.id}>
                                            {skinType.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={
                                    editingProduct
                                        ? handleUpdateProduct
                                        : handleAddProduct
                                }
                                className="bg-blue-500 text-white px-4 py-2 rounded">
                                {editingProduct ? 'Cập nhật' : 'Thêm'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingProduct(null);
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded">
                                Hủy
                            </button>
                        </div>
                    </div>
                )}

                {/* Products table */}
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">ID</th>
                            <th className="p-2">Tên sản phẩm</th>
                            <th className="p-2">Mô tả</th>
                            <th className="p-2">Giá</th>
                            <th className="p-2">Danh mục</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr
                                key={product.id || product.productId}
                                className="border-b">
                                <td className="p-2">{product.productId}</td>
                                <td className="p-2">{product.title}</td>
                                <td className="p-2">{product.description}</td>
                                <td className="p-2">
                                    {formatPrice(product.price)}
                                </td>
                                <td className="p-2">{product.category}</td>
                                <td className="p-2 flex space-x-2">
                                    <button
                                        onClick={() =>
                                            setEditingProduct(product)
                                        }
                                        className="text-blue-500">
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDeleteProduct(product.id)
                                        }
                                        className="text-red-500">
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
