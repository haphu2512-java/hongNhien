import React, { useState, useEffect } from 'react';
import LeftArrow from '../assets/img/icons/left-arrow.png';
import RightArrow from '../assets/img/icons/right-arrow.png';
import ChamSocDaMat from '../assets/img/ChamSocDaMat.webp';

const NewsCard = ({ image, title }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-[100px] flex">
        <img
            src={image}
            alt={title}
            className="w-[100px] h-full object-cover"
        />
        <div className="p-3 flex-1">
            <h3 className="text-md font-semibold line-clamp-2">{title}</h3>
        </div>
    </div>
);

const CategoryCard = ({ image, title, onPrev, onNext }) => (
    <div
        className="bg-gray-900 rounded-lg shadow-md overflow-hidden h-[332px] relative "
        style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
        <button
            onClick={onPrev}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <img src={LeftArrow} alt="" />
        </button>
        <button
            onClick={onNext}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <img src={RightArrow} alt="" />
        </button>
        <div className="absolute bottom-0 p-4 w-full">
            <h3 className="text-xl font-semibold relative z-10 shadow-lg bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {title}
            </h3>
        </div>
    </div>
);

export default function CategorySection() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                const response = await fetch(
                    'http://localhost:3001/categories'
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc hiện tại
                const formattedCategories = data.map((category) => {
                    return {
                        title: category.name,
                        image:
                            category.image ||
                            'https://via.placeholder.com/400x300',
                        subCategories: category.subcategories.map((sub) => ({
                            title: sub.name,
                            image:
                                sub.image ||
                                'https://via.placeholder.com/400x200',
                        })),
                    };
                });

                setCategories(formattedCategories);
                setError(null);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError(
                    'Không thể tải dữ liệu danh mục. Vui lòng thử lại sau.'
                );
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

    const handlePrev = () => {
        setCurrentCategoryIndex((prevIndex) =>
            prevIndex === 0 ? categories.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentCategoryIndex((prevIndex) =>
            prevIndex === categories.length - 1 ? 0 : prevIndex + 1
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-4 border-t-2 border-b-2 border-gray-300 ">
                <div className="flex justify-center items-center mb-4">
                    <h2 className="text-2xl font-bold">NGÀNH HÀNG ĐA DẠNG</h2>
                </div>
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4 border-t-2 border-b-2 border-gray-300 mb-10">
                <div className="flex justify-center items-center mb-4">
                    <h2 className="text-2xl font-bold">NGÀNH HÀNG ĐA DẠNG</h2>
                </div>
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-4 border-t-2 border-b-2 border-gray-300 mb-10">
                <div className="flex justify-center items-center mb-4">
                    <h2 className="text-2xl font-bold">NGÀNH HÀNG ĐA DẠNG</h2>
                </div>
                <div className="text-center">Không có dữ liệu danh mục</div>
            </div>
        );
    }

    const currentCategory = categories[currentCategoryIndex];

    return (
        <div className="max-w-7xl mx-auto p-4 border-t-2 border-b-2 border-gray-300 my-10">
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-2xl font-bold">NGÀNH HÀNG ĐA DẠNG</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <CategoryCard
                        image={currentCategory.image}
                        title={currentCategory.title}
                        onPrev={handlePrev}
                        onNext={handleNext}
                    />
                </div>
                <div
                    className="h-[332px] overflow-y-auto space-y-4 pr-2 scrollbar-none"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}>
                    {currentCategory.subCategories.map((subCategory, index) => (
                        <NewsCard
                            key={index}
                            image={subCategory.image}
                            title={subCategory.title}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
