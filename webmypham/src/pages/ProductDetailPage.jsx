import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';
import ProductDescription from '../components/ProductDescription';
import RelatedProducts from '../components/RelatedProducts';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [brand, setBrand] = useState(null);
    const [benefits, setBenefits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            console.log('Fetching data for productId:', productId);
            try {
                // Thử lấy thông tin sản phẩm từ endpoint /products/:productId
                let productData = null;
                const productResponse = await fetch(`http://localhost:3001/products/${productId}`);
                console.log('Product API response status:', productResponse.status);

                if (productResponse.ok) {
                    productData = await productResponse.json();
                    console.log('Product data from /products/:productId:', productData);
                } else {
                    console.log('Endpoint /products/:productId failed, trying to fetch all products...');
                    // Nếu endpoint không hoạt động, lấy tất cả sản phẩm và lọc
                    const allProductsResponse = await fetch('http://localhost:3001/products');
                    if (!allProductsResponse.ok) {
                        throw new Error(`Lỗi khi tải danh sách sản phẩm: ${allProductsResponse.status}`);
                    }
                    const allProductsData = await allProductsResponse.json();
                    productData = allProductsData.find((p) => p.productId === productId);
                    if (!productData) {
                        throw new Error('Sản phẩm không tồn tại trong danh sách');
                    }
                    console.log('Product data from all products:', productData);
                }

                // Lấy danh sách thương hiệu
                const brandsResponse = await fetch('http://localhost:3001/brands');
                if (!brandsResponse.ok) {
                    throw new Error(`Lỗi khi tải thương hiệu: ${brandsResponse.status}`);
                }
                const brandsData = await brandsResponse.json();
                const brandData = brandsData.find((b) => b.id === productData.brandId);
                console.log('Brand data:', brandData);

                // Lấy danh sách công dụng
                const benefitsResponse = await fetch('http://localhost:3001/benefits');
                if (!benefitsResponse.ok) {
                    throw new Error(`Lỗi khi tải công dụng: ${benefitsResponse.status}`);
                }
                const benefitsData = await benefitsResponse.json();
                console.log('Benefits data:', benefitsData);

                setProduct(productData);
                setBrand(brandData || { name: 'Không xác định' });
                setBenefits(benefitsData || []);
                setError(null);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu:', err);
                setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [productId]);

    if (loading) {
        return <div className="text-center py-10">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!product) {
        return <div className="text-center py-10">Không tìm thấy sản phẩm.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pt-20"> {/* Thêm padding-top: 80px (pt-20 tương ứng 80px trong Tailwind) */}
            <ProductDetail product={product} brand={brand} benefits={benefits} />
            <ProductDescription product={product} benefits={benefits} />
            <RelatedProducts category={product.category} />
        </div>
    );
};

export default ProductDetailPage;