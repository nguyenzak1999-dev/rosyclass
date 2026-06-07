"use client"

import { SiteSettings } from "@/lib/site-settings"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import ScrollTrigger from "gsap/ScrollTrigger"

import { HeroSection, type HeroSlide } from "./components/home/HeroSection"
import { FeatureSections } from "./components/home/FeatureSections"
import { StatisticsSection } from "./components/home/StatisticsSection"
import { FeaturedCoursesSection } from "./components/home/FeaturedCoursesSection"
import { TestimonialsSection, type TestimonialItem } from "./components/home/TestimonialsSection"
import { CtaSection } from "./components/home/CtaSection"
import { LearningPathSection } from "./components/home/LearningPathSection"
import { UpcomingClassesSection, type UpcomingClass } from "./components/home/UpcomingClassesSection"
import { FeaturedTeachersSection, type FeaturedTeacher } from "./components/home/FeaturedTeachersSection"
import { HomeFaqSection, type HomeFaqItem } from "./components/home/HomeFaqSection"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export type FeaturedCourseData = {
  id: string
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  level: string
  targetAudience: string | null
  learningOutcomes: string | null
}

export default function HomeClient({
  courses,
  settings,
  heroSlides,
  upcomingClasses,
  teachers,
  testimonials,
  faqs,
}: {
  courses: FeaturedCourseData[]
  settings?: SiteSettings
  heroSlides: HeroSlide[]
  upcomingClasses: UpcomingClass[]
  teachers: FeaturedTeacher[]
  testimonials: TestimonialItem[]
  faqs: HomeFaqItem[]
}) {
  const container = useRef<HTMLDivElement>(null);
  const featuredCourses = courses;

  useGSAP(() => {
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
      <TestimonialsSection settings={settings} testimonials={testimonials} />

      {/* 9. FAQ */}
      <HomeFaqSection settings={settings} faqs={faqs} />

      {/* 10. FINAL CTA (Transform your business equivalent) */}
      <CtaSection settings={settings} />

    </div>
  )
}
