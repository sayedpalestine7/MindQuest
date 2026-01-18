import React from "react"
import Navbar from "../components/homePage/Navbar.jsx"
import Hero from "../components/homePage/Hero.jsx"
import Features from "../components/homePage/Features.jsx"
import AnimationShowcase from "../components/homePage/AnimationShowcase.jsx"
import HowItWorks from "../components/homePage/HowItWorks.jsx"
import Courses from "../components/homePage/Courses.jsx"
import Statistics from "../components/homePage/Statistics.jsx"
import FAQ from "../components/homePage/FAQ.jsx"
import CTA from "../components/homePage/CTA.jsx"
import Footer from "../components/homePage/Footer.jsx"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <AnimationShowcase />
      <Courses />
      <HowItWorks />
      <Statistics />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
