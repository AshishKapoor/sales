"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  FileText,
  BarChart3,
  Target,
  Zap,
  Mail,
  Calendar,
  Slack,
  CloudIcon as Salesforce,
  HelpCircle,
  BookOpen,
  FileCheck,
  TrendingUp,
  MapPin,
  Phone,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function SalesCRMLandingPage() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 120; // Account for fixed header height
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-teal-300 to-emerald-400 rounded-full opacity-30 transform translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-10 transform -translate-x-32"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4 bg-purple-700/90 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Top badge */}
          <div className="absolute -top-[-8px] left-1/2 transform -translate-x-1/2">
            <Badge
              variant="secondary"
              className="bg-white/10 text-white border-white/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
              Sales CRM <Heart className="w-3 h-3 fill-current" /> Trusted by
              Sales Teams
            </Badge>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-8 w-full justify-between mt-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xl font-semibold">Sales CRM</span>
            </div>

            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("integrations")}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Integrations
              </button>
              <button
                onClick={() => scrollToSection("resources")}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Resources
              </button>
              <Link
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                Support
              </Link>
              <Link
                href="https://sannty.in/about"
                className="text-white/80 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="https://sales.sannty.in"
                className="text-white/80 hover:text-white transition-colors"
              >
                Login
              </Link>
            </nav>

            <Link href="https://sales.sannty.in">
              <Button className="bg-white text-purple-700 hover:bg-white/90 font-semibold px-6">
                Start For Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 lg:px-6 pt-36 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="max-w-4xl mb-32">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
              Stop losing deals in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                spreadsheets
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-2xl leading-relaxed">
              Sales CRM is the all-in-one platform for managing leads,
              opportunities, and quotations. Close more deals faster with
              intelligent automation and powerful insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="https://sales.sannty.in">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 rounded-xl flex items-center gap-3 text-lg font-semibold">
                  <Zap className="w-6 h-6" />
                  Start For Free
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-xl flex items-center gap-3 text-lg bg-transparent"
              >
                <Users className="w-6 h-6" />
                Book a Demo
              </Button>
            </div>

            {/* Feature highlights */}
            <div
              id="features"
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Lead Management</h3>
                  <p className="text-white/70">
                    Capture and nurture every lead
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Opportunities</h3>
                  <p className="text-white/70">
                    Track deals through your pipeline
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Quotations</h3>
                  <p className="text-white/70">Generate quotes in seconds</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-end mb-32">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                One platform to manage your entire{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                  sales process
                </span>
              </h2>
              <p className="text-xl text-white/80 mb-8">
                From first contact to closed deal, Sales CRM streamlines every
                step of your sales journey.
              </p>

              {/* Additional features */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span className="text-white/90">
                    Advanced reporting & analytics
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span className="text-white/90">
                    Email & calendar integration
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span className="text-white/90">
                    Mobile app for iOS & Android
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span className="text-white/90">
                    Custom workflows & automation
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-teal-400 mb-2">
                      $2.4M+
                    </div>
                    <div className="text-white/80">Revenue Generated</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-400 mb-2">
                      15,000+
                    </div>
                    <div className="text-white/80">Deals Closed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-400 mb-2">
                      98%
                    </div>
                    <div className="text-white/80">Customer Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-400 mb-2">
                      45%
                    </div>
                    <div className="text-white/80">Faster Deal Closure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations Section */}
          <section id="integrations" className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Seamlessly integrate with your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                  favorite tools
                </span>
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Connect Sales CRM with the tools you already use to create a
                unified workflow that boosts productivity.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { icon: Mail, name: "Gmail", description: "Email sync" },
                {
                  icon: Calendar,
                  name: "Outlook",
                  description: "Calendar integration",
                },
                {
                  icon: Slack,
                  name: "Slack",
                  description: "Team communication",
                },
                { icon: Salesforce, name: "Zapier", description: "Automation" },
                {
                  icon: FileText,
                  name: "DocuSign",
                  description: "E-signatures",
                },
                {
                  icon: BarChart3,
                  name: "HubSpot",
                  description: "Marketing tools",
                },
                {
                  icon: Users,
                  name: "LinkedIn",
                  description: "Social selling",
                },
                {
                  icon: Target,
                  name: "Mailchimp",
                  description: "Email marketing",
                },
                { icon: Globe, name: "Zoom", description: "Video calls" },
                {
                  icon: FileCheck,
                  name: "QuickBooks",
                  description: "Accounting",
                },
                {
                  icon: TrendingUp,
                  name: "Google Analytics",
                  description: "Web analytics",
                },
                { icon: Phone, name: "Twilio", description: "SMS & calls" },
              ].map((integration, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors text-center"
                >
                  <integration.icon className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{integration.name}</h3>
                  <p className="text-sm text-white/70">
                    {integration.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Resources Section */}
          <section id="resources" className="mb-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Resources to help you{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                  succeed
                </span>
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Access guides, templates, and expert insights to maximize your
                sales performance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
                <BookOpen className="w-12 h-12 text-teal-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Sales Playbooks</h3>
                <p className="text-white/80 mb-6">
                  Proven strategies and templates to accelerate your sales
                  process and close more deals.
                </p>
                <Button
                  variant="outline"
                  className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white bg-transparent"
                >
                  Download Now
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
                <FileCheck className="w-12 h-12 text-teal-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Case Studies</h3>
                <p className="text-white/80 mb-6">
                  Real success stories from companies that transformed their
                  sales with our CRM platform.
                </p>
                <Button
                  variant="outline"
                  className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white bg-transparent"
                >
                  Read Stories
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
                <HelpCircle className="w-12 h-12 text-teal-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Help Center</h3>
                <p className="text-white/80 mb-6">
                  Comprehensive documentation, tutorials, and FAQs to get the
                  most out of Sales CRM.
                </p>
                <Button
                  variant="outline"
                  className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white bg-transparent"
                >
                  Get Help
                </Button>
              </div>
            </div>
          </section>

          {/* Trust indicators */}
          <div className="text-center mb-32">
            <p className="text-white/60 mb-8">Trusted by sales teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="bg-white/10 px-6 py-3 rounded-lg">TechCorp</div>
              <div className="bg-white/10 px-6 py-3 rounded-lg">
                SalesForce Inc
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-lg">Growth Co</div>
              <div className="bg-white/10 px-6 py-3 rounded-lg">
                Revenue Labs
              </div>
              <div className="bg-white/10 px-6 py-3 rounded-lg">
                Deal Masters
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-purple-900/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xl font-semibold">Sales CRM</span>
              </div>
              <p className="text-white/80 mb-6 max-w-md">
                The all-in-one CRM platform that helps sales teams manage leads,
                opportunities, and quotations more effectively.
              </p>
              <div className="space-y-2">
                {/* <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="w-4 h-4" />
                  <span></span>
                </div> */}
                <div className="flex items-center gap-3 text-white/70">
                  <Phone className="w-4 h-4" />
                  <span>+91 9899771880</span>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Mail className="w-4 h-4" />
                  <span>ashish@sannty.in</span>
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Mobile App
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Templates
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Partners
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 mb-4 md:mb-0">
              © 2025 Sales CRM. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 right-4 z-20 bg-white/10 hover:bg-white/20"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12H21M3 6H21M3 18H21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  );
}
