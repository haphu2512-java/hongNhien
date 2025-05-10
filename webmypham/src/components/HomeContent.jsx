import React from 'react';
import AboutSection from './AboutSection';
import CategorySection from './CategorySection';
import ServiceSection from './ServiceSection';
import FeedbackSection from './FeedbackSection';
import BrandsSection from './BrandsSection';

export default function HomeContent() {
    return (
        <div className="space-y-32 bg-[#EDF6F9]">
            {/* <AboutSection /> */}
            <CategorySection />
            <BrandsSection />
            <ServiceSection />
            <FeedbackSection />
        </div>
    );
}
