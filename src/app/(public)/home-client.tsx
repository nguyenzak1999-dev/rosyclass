"use client"

import { SiteSettings } from "@/lib/site-settings"
import { type Course } from "@prisma/client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import ScrollTrigger from "gsap/ScrollTrigger"

import { HeroSection, type HeroSlide } from "./components/home/HeroSection"
import { FeatureSections } from "./components/home/FeatureSections"
import { StatisticsSection } from "./components/home/StatisticsSection"
import { FeaturedCoursesSection } from "./components/home/FeaturedCoursesSection"
import { TestimonialsSection } from "./components/home/TestimonialsSection"
import { CtaSection } from "./components/home/CtaSection"
import { LearningPathSection } from "./components/home/LearningPathSection"
import { UpcomingClassesSection, type UpcomingClass } from "./components/home/UpcomingClassesSection"
import { FeaturedTeachersSection, type FeaturedTeacher } from "./components/home/FeaturedTeachersSection"
import { HomeFaqSection } from "./components/home/HomeFaqSection"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export default function HomeClient({
  courses,
  settings,
  heroSlides,
  upcomingClasses,
  teachers,
}: {
  courses: Course[]
  settings?: SiteSettings
  heroSlides: HeroSlide[]
  upcomingClasses: UpcomingClass[]
  teachers: FeaturedTeacher[]
}) {
  const container = useRef<HTMLDivElement>(null);
  const featuredCourses = courses.slice(0, 3);

  useGSAP(() => {
    // Hero Animation (Staggered fade up)
    gsap.from(".hero-element", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.1
    });

    // Chat Bubbles float in
    gsap.from(".chat-bubble", {
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "back.out(1.7)",
      delay: 0.6
    });

    // Reveal Sections on scroll
    const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
    sections.forEach((sec) => {
      gsap.from(sec, {
        scrollTrigger: {
          trigger: sec,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col w-full font-sans pb-10 bg-background relative overflow-hidden">

      {/* 1. HERO SECTION */}
      <HeroSection settings={settings} slides={heroSlides} />

      {/* 2. FEATURE SECTIONS */}
      <FeatureSections settings={settings} />

      {/* 3. THỐNG KÊ (STATISTICS) */}
      <StatisticsSection settings={settings} />

      {/* 4. LỘ TRÌNH HỌC */}
      <LearningPathSection settings={settings} />

      {/* 5. KHÓA HỌC NỔI BẬT */}
      <FeaturedCoursesSection featuredCourses={featuredCourses} settings={settings} />

      {/* 6. LỚP SẮP KHAI GIẢNG */}
      <UpcomingClassesSection classes={upcomingClasses} />

      {/* 7. GIÁO VIÊN NỔI BẬT */}
      <FeaturedTeachersSection teachers={teachers} />

      {/* 8. CẢM NHẬN HỌC VIÊN (WhatsApp Chat Style) */}
      <TestimonialsSection settings={settings} />

      {/* 9. FAQ */}
      <HomeFaqSection settings={settings} />

      {/* 10. FINAL CTA (Transform your business equivalent) */}
      <CtaSection settings={settings} />

    </div>
  )
}
