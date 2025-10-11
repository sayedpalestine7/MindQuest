import React from "react"
import Navbar from "../components/homePage/Navbar.jsx"
import Hero from "../components/homePage/Hero.jsx"
import Features from "../components/homePage/Features.jsx"
import HowItWorks from "../components/homePage/HowItWorks.jsx"
import Courses from "../components/homePage/Courses.jsx"
import CTA from "../components/homePage/CTA.jsx"
import Footer from "../components/homePage/Footer.jsx"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Courses />
      <CTA />
      <Footer />
    </div>
  )
}
