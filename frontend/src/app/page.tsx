
import { HeroSection } from '@/components/HeroSection';
import { BenefitsSection } from '@/components/BenefitsSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { CtaSection } from '@/components/CtaSection';
import { ModalitiesPreview } from '@/components/ModalitiesPreview';
import { MainLayout } from '@/components/layout/MainLayout';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MainLayout>
        <BenefitsSection />
        <ModalitiesPreview />
        <TestimonialsSection />
        <CtaSection />
      </MainLayout>
    </>
  );
}
