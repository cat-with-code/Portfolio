"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ArrowUpRightIcon, CloseIcon, ContactIcon, FacebookIcon, GitHubIcon, InstagramIcon, MapIcon, TelegramIcon, XIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { PanelClose, SidePanel } from "@/components/ui/side-panel";
import { contactRows, profile, profileLinks, socials } from "@/content/profile";
import type { Dictionary } from "@/i18n/dictionaries";
import { useDrawer, useDrawerState } from "./drawer-provider";

const contactIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = { email: ContactIcon, telegram: TelegramIcon };
const socialIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = { github: GitHubIcon, instagram: InstagramIcon, facebook: FacebookIcon, x: XIcon };

/** A link when the URL is known; otherwise the same element without behaviour. */
function MaybeLink({ href, className, label, children }: { href: string | null; className: string; label?: string; children: ReactNode }) {
  if (!href) return <div className={className} aria-label={label}>{children}</div>;
  const external = /^https?:/.test(href);
  return (
    <a href={href} className={className} aria-label={label} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

/** Section label: Typography/Table heading, color/text/muted */
const Label = ({ children }: { children: ReactNode }) => <p className="type-table-heading w-full text-muted">{children}</p>;

/** Developer profile drawer (Figma Desktop 1143:108025 · Tablet 837:61013 · Mobile 837:46054). */
export function ProfileDrawer({ lang, dict }: { lang: string; dict: Dictionary }) {
  const state = useDrawerState("profile");
  const { setOpen } = useDrawer();
  const router = useRouter();
  const email = profileLinks.email ? `mailto:${profileLinks.email}` : null;
  const hrefs: Record<string, string | null> = { ...profileLinks, email };

  return (
    <SidePanel
      {...state}
      title={profile.eyebrow}
      className="inset-8 overflow-y-auto bg-page [scrollbar-width:none] px-20 pt-20 pb-24 tablet:inset-y-16 tablet:right-16 tablet:left-auto tablet:w-420"
    >
      <div className="flex w-full flex-col items-start gap-20">
        <div className="flex w-full items-center justify-between overflow-clip">
          <p className="type-table-heading whitespace-nowrap text-brand">{profile.eyebrow}</p>
          <PanelClose className="flex size-32 shrink-0 cursor-pointer items-center justify-center overflow-clip rounded-full bg-surface-primary text-icon-general-primary" aria-label={dict.a11y.close}>
            <CloseIcon />
          </PanelClose>
        </div>

        <div className="flex w-full flex-col items-center gap-12 overflow-clip">
          <span className="relative flex size-88 shrink-0 items-center justify-center overflow-clip rounded-full bg-brand">
            <Image src="/images/memoji.png" alt="" width={512} height={512} className="absolute top-1/2 left-1/2 h-110 w-[93.5px] max-w-none -translate-1/2 object-cover" />
          </span>
          <div className="flex w-full flex-col items-center gap-4 overflow-clip text-center">
            <p className="type-page-title w-full text-primary">{profile.name}</p>
            <p className="type-table-heading w-full text-brand">{profile.role}</p>
          </div>
          <div className="flex w-full flex-wrap content-center items-center justify-center gap-8 overflow-clip">
            <span className="type-caption flex items-center gap-8 overflow-clip rounded-full bg-surface-primary px-12 py-4 whitespace-nowrap text-primary">
              <span className="size-8 shrink-0 rounded-full bg-status-success" />
              {profile.availability}
            </span>
            <span className="type-caption flex items-center gap-4 overflow-clip rounded-full bg-surface-primary py-4 pr-12 pl-8 whitespace-nowrap text-muted">
              <MapIcon className="shrink-0" />
              {profile.location}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-8 overflow-clip">
          <Label>{profile.aboutLabel}</Label>
          <p className="type-body w-full text-primary">{profile.about}</p>
        </div>

        <div className="flex w-full flex-col items-start gap-8 overflow-clip">
          <Label>{profile.skillsLabel}</Label>
          <ul className="flex w-full flex-wrap content-start items-start gap-8 overflow-clip">
            {profile.skills.map((s) => (
              <li key={s} className="type-label flex items-center justify-center overflow-clip rounded-full bg-surface-primary px-12 py-4 whitespace-nowrap text-brand">
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full flex-col items-start gap-8 overflow-clip">
          <Label>{profile.contactLabel}</Label>
          {contactRows.map((row) => {
            const Icon = contactIcons[row.key];
            return (
              <MaybeLink key={row.key} href={hrefs[row.key]} className="flex w-full items-center gap-12 overflow-clip rounded-lg bg-surface-primary p-12 transition-colors duration-(--duration-fast) [a&]:hover:bg-surface-hover">
                <span className="flex size-36 shrink-0 items-center justify-center overflow-clip rounded-md bg-page text-icon-general-primary">
                  <Icon />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start gap-2 overflow-clip">
                  <span className="type-label w-full text-primary">{row.title}</span>
                  <span className="type-caption w-full text-muted">{row.detail}</span>
                </span>
                <ArrowUpRightIcon className="shrink-0 text-muted" />
              </MaybeLink>
            );
          })}
        </div>

        <div className="flex w-full flex-col items-start gap-8 overflow-clip">
          <Label>{profile.socialLabel}</Label>
          <div className="flex items-start gap-8 overflow-clip">
            {socials.map((s) => {
              const Icon = socialIcons[s.key];
              return (
                <MaybeLink key={s.key} href={hrefs[s.key]} label={s.label} className="flex size-44 shrink-0 items-center justify-center overflow-clip rounded-full bg-surface-primary text-icon-general-primary transition-colors duration-(--duration-fast) [a&]:hover:bg-surface-hover">
                  <Icon />
                </MaybeLink>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-8 overflow-clip">
          <button
            type="button"
            onClick={() => {
              setOpen(null);
              router.push(`/${lang}/contact`);
            }}
            className={`${buttonClasses("primary", "medium")} w-full`}
          >
            {profile.contactMe}
          </button>
          <button
            type="button"
            onClick={() => {
              router.push(`/${lang}`);
              setOpen("approach");
            }}
            className={`${buttonClasses("secondary", "medium")} w-full`}
          >
            {profile.myApproach}
          </button>
        </div>
        {/* Profile / Bottom safe area — scroll spacer */}
        <div className="h-64 w-full shrink-0" />
      </div>
    </SidePanel>
  );
}
