import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Toast from './Toast';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
const ProductGrid = () => {
    const { addToCart } = useCart();
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [skinTypes, setSkinTypes] = useState([]);
    const [benefits, setBenefits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [activeCategory, setActiveCategory] = useState('all');
    const [activeSubcategories, setActiveSubcategories] = useState([]);
    const [activeSkinTypes, setActiveSkinTypes] = useState([]);
    const [activeBenefits, setActiveBenefits] = useState([]);
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
    const [toast, setToast] = useState(null);
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [
                    productsResponse,
                    categoriesResponse,
                    skinTypesResponse,
                    benefitsResponse,
                ] = await Promise.all([
                    fetch('http://localhost:3001/products'),
                    fetch('http://localhost:3001/categories'),
                    fetch('http://localhost:3001/skinTypes'),
                    fetch('http://localhost:3001/benefits'),
                ]);

                if (
                    !productsResponse.ok ||
                    !categoriesResponse.ok ||
                    !skinTypesResponse.ok ||
                    !benefitsResponse.ok
                ) {
                    throw new Error('Lỗi khi tải dữ liệu');
                }

                const [
                    productsData,
                    categoriesData,
                    skinTypesData,
                    benefitsData,
                ] = await Promise.all([
                    productsResponse.json(),
                    categoriesResponse.json(),
                    skinTypesResponse.json(),
                    benefitsResponse.json(),
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
                setSkinTypes(skinTypesData);
                setBenefits(benefitsData);
                setError(null);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu:', err);
                setError(
                    'Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.'
                );
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const toggleSubcategory = (subcategoryId) => {
        setActiveSubcategories((prev) =>
            prev.includes(subcategoryId)
                ? prev.filter((id) => id !== subcategoryId)
                : [...prev, subcategoryId]
        );
        setCurrentPage(1);
    };

    const toggleSkinType = (skinTypeId) => {
        setActiveSkinTypes((prev) =>
            prev.includes(skinTypeId)
                ? prev.filter((id) => id !== skinTypeId)
                : [...prev, skinTypeId]
        );
        setCurrentPage(1);
    };

    const toggleBenefit = (benefitId) => {
        setActiveBenefits((prev) =>
            prev.includes(benefitId)
                ? prev.filter((id) => id !== benefitId)
                : [...prev, benefitId]
        );
        setCurrentPage(1);
    };

    const filteredProducts = products.filter((product) => {
        // Filter by search term
        if (
            searchTerm &&
            !product.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
            return false;
        }

        if (activeCategory !== 'all' && product.category !== activeCategory)
            return false;
        if (
            activeSubcategories.length > 0 &&
            !activeSubcategories.includes(product.subcategory)
        )
            return false;
        if (
            activeSkinTypes.length > 0 &&
            !product.skinType.some(
                (type) => activeSkinTypes.includes(type) || type === 'all'
            )
        )
            return false;
        if (
            activeBenefits.length > 0 &&
            !product.benefit.some((benefit) => activeBenefits.includes(benefit))
        )
            return false;
        if (product.price < priceRange.min || product.price > priceRange.max)
            return false;
        return true;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
        return 0;
    });

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setActiveSubcategories([]);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handlePriceChange = (type, value) => {
        setPriceRange({
            ...priceRange,
            [type]: Number.parseInt(value) || 0,
        });
    };

    const resetFilters = () => {
        setActiveCategory('all');
        setActiveSubcategories([]);
        setActiveSkinTypes([]);
        setActiveBenefits([]);
        setPriceRange({ min: 0, max: 10000000 });
        setSortBy('default');
    };

    const productsPerPage = 12;
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );

    const currentSubcategories =
        activeCategory === 'all'
            ? []
            : categories.find((cat) => cat.id === activeCategory)
                  ?.subcategories || [];

    const allSubcategoriesSelected =
        currentSubcategories.length > 0 &&
        currentSubcategories.every((sub) =>
            activeSubcategories.includes(sub.id)
        );

    const toggleAllSubcategories = () => {
        if (allSubcategoriesSelected) {
            setActiveSubcategories([]);
        } else {
            setActiveSubcategories(currentSubcategories.map((sub) => sub.id));
        }
        setCurrentPage(1);
    };

    const handleAddToCart = (product) => {
        const cartItem = {
            productId: product.productId,
            title: product.title,
            price: product.price,
            quantity: 1,
        };
        addToCart(cartItem);
        setToast({
            message: `Đã thêm "${product.title}" vào giỏ hàng!`,
            type: 'success',
        });
    };

    const getBenefitNames = (benefitIds) => {
        if (
            !benefitIds ||
            !Array.isArray(benefitIds) ||
            benefitIds.length === 0
        ) {
            return '';
        }

        return benefitIds.join(', ');
    };

    if (loading) {
        return <div className="text-center py-10">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="mx-auto px-4 py-8 bg-[#EDF6F9]">
            <div className="md:hidden mb-4">
                <button
                    className="w-full py-2 px-4 bg-gray-100 rounded-md flex items-center justify-between"
                    onClick={() => setShowFilters(!showFilters)}>
                    <span>Bộ lọc</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform ${
                            showFilters ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 ">
                <div
                    className={`md:w-1/4 lg:w-1/5 space-y-6 ${
                        showFilters ? 'block' : 'hidden md:block'
                    } bg-white p-4 rounded-lg shadow-sm`}>
                    <div>
                        <h3 className="font-semibold text-lg mb-3">Danh mục</h3>
                        <div className="space-y-2">
                            <div
                                className={`cursor-pointer ${
                                    activeCategory === 'all'
                                        ? 'font-medium text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => handleCategoryChange('all')}>
                                Tất cả sản phẩm
                            </div>
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className={`cursor-pointer ${
                                        activeCategory === category.id
                                            ? 'font-medium text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    onClick={() =>
                                        handleCategoryChange(category.id)
                                    }>
                                    {category.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {activeCategory !== 'all' &&
                        currentSubcategories.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-lg">
                                        {
                                            categories.find(
                                                (cat) =>
                                                    cat.id === activeCategory
                                            )?.name
                                        }
                                    </h3>
                                    <button
                                        onClick={toggleAllSubcategories}
                                        className="text-xs text-gray-700 hover:text-gray-900 hover:underline">
                                        {allSubcategoriesSelected
                                            ? 'Bỏ chọn tất cả'
                                            : 'Chọn tất cả'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {currentSubcategories.map((subcategory) => (
                                        <div
                                            key={subcategory.id}
                                            className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`subcategory-${subcategory.id}`}
                                                checked={activeSubcategories.includes(
                                                    subcategory.id
                                                )}
                                                onChange={() =>
                                                    toggleSubcategory(
                                                        subcategory.id
                                                    )
                                                }
                                                className="mr-2 h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                                            />
                                            <label
                                                htmlFor={`subcategory-${subcategory.id}`}
                                                className="text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                                                {subcategory.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    <div>
                        <h3 className="font-semibold text-lg mb-3">
                            Phù hợp theo da
                        </h3>
                        <div className="space-y-2">
                            {skinTypes.map((skinType) => (
                                <div
                                    key={skinType.id}
                                    className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`skin-${skinType.id}`}
                                        checked={activeSkinTypes.includes(
                                            skinType.id
                                        )}
                                        onChange={() =>
                                            toggleSkinType(skinType.id)
                                        }
                                        className="mr-2 h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500"
                                    />
                                    <label
                                        htmlFor={`skin-${skinType.id}`}
                                        className="text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                                        {skinType.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <div className="mb-6">
                        <h3 className="font-medium mb-2">Công dụng</h3>
                        <div className="space-y-2">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.id}
                                    className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`benefit-${benefit.id}`}
                                        checked={activeBenefits.includes(
                                            benefit.id
                                        )}
                                        onChange={() =>
                                            toggleBenefit(benefit.id)
                                        }
                                        className="mr-2"
                                    />
                                    <label htmlFor={`benefit-${benefit.id}`}>
                                        {benefit.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    <div>
                        <h3 className="font-semibold text-lg mb-3">
                            Khoảng giá
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    min="0"
                                    max={priceRange.max}
                                    value={priceRange.min}
                                    onChange={(e) =>
                                        handlePriceChange('min', e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md text-sm"
                                    placeholder="Từ"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    min={priceRange.min}
                                    value={priceRange.max}
                                    onChange={(e) =>
                                        handlePriceChange('max', e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md text-sm"
                                    placeholder="Đến"
                                />
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>{formatVND(priceRange.min)}</span>
                                <span>{formatVND(priceRange.max)}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={resetFilters}
                        className="w-full py-2 px-4 bg-[#006D77] hover:bg-[#06494f] rounded-md text-white transition-colors">
                        Xóa bộ lọc
                    </button>
                </div>

                <div className="flex-1">
                    {(activeCategory !== 'all' ||
                        activeSubcategories.length > 0 ||
                        activeSkinTypes.length > 0 ||
                        activeBenefits.length > 0) && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {activeCategory !== 'all' &&
                                activeSubcategories.length === 0 && (
                                    <div className="bg-[#97d3e7] text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>
                                            {
                                                categories.find(
                                                    (cat) =>
                                                        cat.id ===
                                                        activeCategory
                                                )?.name
                                            }
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleCategoryChange('all')
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700">
                                            ×
                                        </button>
                                    </div>
                                )}

                            {activeSubcategories.map((subId) => {
                                const subcategory = currentSubcategories.find(
                                    (sub) => sub.id === subId
                                );
                                if (!subcategory) return null;
                                return (
                                    <div
                                        key={subId}
                                        className="bg-[#97d3e7] text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>{subcategory.name}</span>
                                        <button
                                            onClick={() =>
                                                toggleSubcategory(subId)
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700">
                                            ×
                                        </button>
                                    </div>
                                );
                            })}

                            {activeSkinTypes.map((skinTypeId) => {
                                const skinType = skinTypes.find(
                                    (type) => type.id === skinTypeId
                                );
                                return (
                                    <div
                                        key={skinTypeId}
                                        className="bg-[#97d3e7] text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>{skinType.name}</span>
                                        <button
                                            onClick={() =>
                                                toggleSkinType(skinTypeId)
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700">
                                            ×
                                        </button>
                                    </div>
                                );
                            })}

                            {activeBenefits.map((benefitId) => {
                                const benefit = benefits.find(
                                    (b) => b.id === benefitId
                                );
                                return (
                                    <div
                                        key={benefitId}
                                        className="bg-[#97d3e7] text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>{benefit.name}</span>
                                        <button
                                            onClick={() =>
                                                toggleBenefit(benefitId)
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700">
                                            ×
                                        </button>
                                    </div>
                                );
                            })}

                            {(activeCategory !== 'all' ||
                                activeSubcategories.length > 0 ||
                                activeSkinTypes.length > 0 ||
                                activeBenefits.length > 0) && (
                                <button
                                    onClick={() => handleCategoryChange('all')}
                                    className="ml-2 text-gray-500 hover:text-gray-700">
                                    ×
                                </button>
                            )}

                            {activeSubcategories.map((subId) => {
                                const subcategory = currentSubcategories.find(
                                    (sub) => sub.id === subId
                                );
                                if (!subcategory) return null;
                                return (
                                    <div
                                        key={subId}
                                        className="bg-[#97d3e7] text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>{subcategory.name}</span>
                                        <button
                                            onClick={() =>
                                                toggleSubcategory(subId)
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700">
                                            ×
                                        </button>
                                    </div>
                                );
                            })}

                            {activeSkinTypes.map((skinTypeId) => {
                                const skinType = skinTypes.find(
                                    (type) => type.id === skinTypeId
                                );
                                return (
                                    <div
                                        key={skinTypeId}
                                        className="bg-[#97d3e7] text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>{skinType.name}</span>
                                        <button
                                            onClick={() =>
                                                toggleSkinType(skinTypeId)
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700">
                                            ×
                                        </button>
                                    </div>
                                );
                            })}

                            {activeBenefits.map((benefitId) => {
                                const benefit = benefits.find(
                                    (b) => b.id === benefitId
                                );
                                return (
                                    <div
                                        key={benefitId}
                                        className="bg-[#97d3e7] text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>{benefit.name}</span>
                                        <button
                                            onClick={() =>
                                                toggleBenefit(benefitId)
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700">
                                            ×
                                        </button>
                                    </div>
                                );
                            })}

                            {(activeCategory !== 'all' ||
                                activeSubcategories.length > 0 ||
                                activeSkinTypes.length > 0 ||
                                activeBenefits.length > 0) && (
                                <button
                                    onClick={resetFilters}
                                    className="text-gray-700 text-sm hover:text-gray-900 hover:underline">
                                    Xóa tất cả
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <p className="text-gray-600 mb-2 sm:mb-0">
                            Hiển thị {sortedProducts.length} sản phẩm{' '}
                            {activeCategory !== 'all' &&
                                activeSubcategories.length === 0 &&
                                `trong ${
                                    categories.find(
                                        (cat) => cat.id === activeCategory
                                    )?.name
                                }`}
                        </p>

                        <div className="flex items-center">
                            {activeCategory === 'all' &&
                                activeSubcategories.length === 0 &&
                                activeSkinTypes.length === 0 &&
                                activeBenefits.length === 0 && (
                                    <div className="w-64 mr-4 flex items-center bg-white rounded-full px-3 py-2 shadow-md border border-[#006D77]">
                                        <Search
                                            size={16}
                                            className="text-[#006D77] mr-2"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm tên sản phẩm..."
                                            className="bg-transparent flex-1 focus:outline-none text-sm text-[#006D77] font-medium"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                )}

                            <select
                                className="bg-[#CBD5D3] text-[#2F4F4F] border border-transparent rounded-xl px-4 py-2 font-medium shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-[#94A3B8]
                 hover:bg-[#d8e0de] hover:shadow-md
                 transition-all duration-200 ease-in-out"
                                value={sortBy}
                                onChange={handleSortChange}>
                                <option value="default">Sắp xếp theo</option>
                                <option value="price-asc">
                                    Giá: Thấp đến cao
                                </option>
                                <option value="price-desc">
                                    Giá: Cao đến thấp
                                </option>
                                <option value="name-asc">Tên: A-Z</option>
                                <option value="name-desc">Tên: Z-A</option>
                            </select>
                        </div>
                    </div>

                    {currentProducts.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">
                                Không tìm thấy sản phẩm phù hợp với bộ lọc đã
                                chọn.
                            </p>
                            <button
                                onClick={resetFilters}
                                className="mt-4 py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {currentProducts.map((product) => (
                                    <Link
                                        key={product.productId}
                                        to={`/san-pham/${product.productId}`}
                                        className="relative"
                                        onClick={() =>
                                            console.log(
                                                `Navigating to /san-pham/${product.productId}`
                                            )
                                        }>
                                        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow min-w-[260px]">
                                            <div className="relative">
                                                <img
                                                    src={
                                                        product.image ||
                                                        '/placeholder.svg'
                                                    }
                                                    alt={product.title}
                                                    className="w-full h-64 "
                                                />
                                                {product.onSale && (
                                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                        Giảm giá
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {product.title}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <span className="font-bold text-lg">
                                                            {formatVND(
                                                                product.price
                                                            )}
                                                        </span>
                                                        {product.originalPrice && (
                                                            <span className="text-gray-400 line-through ml-2 text-sm">
                                                                {formatVND(
                                                                    product.originalPrice
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleAddToCart(
                                                                product
                                                            );
                                                        }}>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5 text-gray-600"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-10">
                            <nav className="flex items-center space-x-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                        currentPage === 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}>
                                    {'<'}
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            setCurrentPage(index + 1)
                                        }
                                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                            currentPage === index + 1
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                        currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}>
                                    {'>'}
                                </button>
                            </nav>
                        </div>
                    )}
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
};

export default ProductGrid;
