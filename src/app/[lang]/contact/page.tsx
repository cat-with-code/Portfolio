import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactMap } from "@/components/contact/contact-map";
import { AvailabilityCard, Faq } from "@/components/contact/sidebar";
import { SectionHeading } from "@/components/ui/section-heading";
import { getLocale } from "@/i18n/dictionaries";
import { pageMetadata, sectionMeta } from "@/lib/seo";
import { tr } from "@/i18n/content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return pageMetadata({ lang, path: "/contact", ...sectionMeta(lang, "contact") });
}

/**
 * Contact (Figma Desktop 843:46112 · Tablet 843:61319 · Mobile 843:61934).
 * Desktop/Tablet: heading → form beside a 360 (Tablet 320) sidebar of availability + FAQ → map.
 * Mobile: map → heading → availability → form → FAQ.
 */
export default async function ContactPage() {
  const lang = await getLocale();
  const contact = tr(lang, "contact");
  return (
    <div className="flex w-full flex-col items-stretch gap-16 pb-96 tablet:gap-20 desktop:gap-24">
      <div className="order-2 tablet:order-none">
        <SectionHeading title={contact.title} description={contact.description} />
      </div>
      <div className="contents tablet:flex tablet:items-start tablet:gap-20 desktop:gap-24">
        <div className="order-4 flex w-full tablet:order-none tablet:min-w-0 tablet:flex-1 tablet:self-stretch">
          <ContactForm />
        </div>
        <div className="contents tablet:flex tablet:w-320 tablet:shrink-0 tablet:flex-col tablet:gap-16 desktop:w-360">
          <div className="order-3 tablet:order-none">
            <AvailabilityCard />
          </div>
          <div className="order-5 tablet:order-none">
            <Faq />
          </div>
        </div>
      </div>
      <div className="order-1 tablet:order-none">
        <ContactMap />
      </div>
    </div>
  );
}
