import BackgroundImage from '../assets/img/backgrounds.png';

export default function Hero() {
    return (
        <section className="relative h-[600px] bg-cover bg-center">
            <img
                src={BackgroundImage}
                alt=""
                className="absolute top-2 w-full h-full"
            />
            <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 mt-10 bg-gray-800 bg-opacity-40 flex items-center justify-center shadow-lg p-8 w-fit">
                <div className="text-center text-white drop-shadow-md">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-snug">
                        Khơi nguồn vẻ đẹp tự nhiên <br /> Tỏa sáng theo cách của
                        bạn
                    </h1>
                    <p className="text-lg md:text-xl mb-6">
                        Fruvia Beauty – Vẻ đẹp tinh khiết, chuẩn phong cách mới
                    </p>
                </div>
            </div>
        </section>
    );
}
