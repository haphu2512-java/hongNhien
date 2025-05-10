import ProductGrid from '../components/ProductGrid';
import ProductBanner from '../assets/img/ProductBanner.png';

export default function ProductPage() {
    return (
        <>
            <img className="w-full h-[500px]" src={ProductBanner} />
            <ProductGrid />
        </>
    );
}
