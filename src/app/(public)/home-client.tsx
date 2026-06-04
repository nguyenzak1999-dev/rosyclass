"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SiteSettings } from "@/lib/site-settings"
import { ArrowRight, Download, ChevronRight, MessageCircle } from "lucide-react"
import Image from "next/image"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import ScrollTrigger from "gsap/ScrollTrigger"

import { HeroSection } from "./components/home/HeroSection"
import { FeatureSections } from "./components/home/FeatureSections"
import { StatisticsSection } from "./components/home/StatisticsSection"
import { FeaturedCoursesSection } from "./components/home/FeaturedCoursesSection"
import { TestimonialsSection } from "./components/home/TestimonialsSection"
import { CtaSection } from "./components/home/CtaSection"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export default function HomeClient({ courses, settings }: { courses: any[], settings?: SiteSettings }) {
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
    const sections = gsap.utils.toArray(".reveal-section");
    sections.forEach((sec: any) => {
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
      <HeroSection />

      {/* 2. FEATURE SECTIONS */}
      <FeatureSections />

      {/* 3. THỐNG KÊ (STATISTICS) */}
      <StatisticsSection />

      {/* 4. KHÓA HỌC NỔI BẬT */}
      <FeaturedCoursesSection featuredCourses={featuredCourses} />

      {/* 5. CẢM NHẬN HỌC VIÊN (WhatsApp Chat Style) */}
      <TestimonialsSection />

      {/* 6. FINAL CTA (Transform your business equivalent) */}
      <CtaSection />

    </div>
  )
}
