import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SalesCRMLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <Target className="h-8 w-8 text-orange-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">
            Sales CRM
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-orange-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium hover:text-orange-600 transition-colors"
          >
            Reviews
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:text-orange-600 transition-colors"
          >
            Contact
          </Link>
        </nav>
        <div className="ml-6 flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="https://sales.sannty.in">Sign In</Link>
          </Button>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
            asChild
          >
            <Link href="https://sales.sannty.in">Get Started Free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    #1 Sales CRM Platform
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Close More Deals with Smart CRM
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Transform your sales process with our AI-powered CRM. Track
                    leads, manage pipelines, and boost revenue with intelligent
                    automation.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="bg-orange-600 hover:bg-orange-700"
                    asChild
                  >
                    <Link href="https://sales.sannty.in">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    Watch Demo
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <span>100% Free Forever</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <span>No setup fees</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/images/hero-illustration.svg"
                  width="600"
                  height="400"
                  alt="Shopping and Sales Illustration"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="text-3xl font-bold text-orange-600">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="text-3xl font-bold text-orange-600">2.5M+</div>
                <div className="text-sm text-gray-600">Deals Closed</div>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="text-3xl font-bold text-orange-600">35%</div>
                <div className="text-sm text-gray-600">
                  Average Revenue Increase
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="text-3xl font-bold text-orange-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-50"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  Features
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Everything You Need to Sell More
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive CRM platform provides all the tools your
                  sales team needs to succeed.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-orange-600" />
                  <CardTitle>Lead Management</CardTitle>
                  <CardDescription>
                    Capture, qualify, and nurture leads from multiple sources
                    with intelligent lead scoring.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Automated lead capture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Lead scoring & qualification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Multi-channel communication</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-orange-600" />
                  <CardTitle>Sales Pipeline</CardTitle>
                  <CardDescription>
                    Visualize and manage your entire sales process with
                    customizable pipeline stages.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Drag & drop pipeline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Deal probability tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Automated follow-ups</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-orange-600" />
                  <CardTitle>Analytics & Reporting</CardTitle>
                  <CardDescription>
                    Get deep insights into your sales performance with advanced
                    analytics and custom reports.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Real-time dashboards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Custom report builder</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Performance forecasting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-orange-600" />
                  <CardTitle>Automation</CardTitle>
                  <CardDescription>
                    Automate repetitive tasks and workflows to focus on what
                    matters most - selling.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Email sequences</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Task automation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Workflow triggers</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Phone className="h-10 w-10 text-orange-600" />
                  <CardTitle>Communication Hub</CardTitle>
                  <CardDescription>
                    Centralize all customer communications with built-in
                    calling, emailing, and messaging.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Built-in phone system</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Email integration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>SMS messaging</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-orange-600" />
                  <CardTitle>Security & Compliance</CardTitle>
                  <CardDescription>
                    Enterprise-grade security with GDPR compliance and advanced
                    data protection.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>256-bit encryption</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>GDPR compliant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-600" />
                      <span>Role-based access</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="w-full py-12 md:py-24 lg:py-32 bg-white"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  Testimonials
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Loved by Sales Teams Worldwide
                </h2>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <CardDescription>
                    "Sales CRM increased our conversion rate by 40% in just 3
                    months. The automation features are game-changing."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width="40"
                      height="40"
                      alt="Sarah Johnson"
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold">Sarah Johnson</div>
                      <div className="text-sm text-gray-600">
                        Sales Director, TechCorp
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <CardDescription>
                    "The pipeline visualization and reporting features give us
                    complete visibility into our sales process."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width="40"
                      height="40"
                      alt="Michael Chen"
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold">Michael Chen</div>
                      <div className="text-sm text-gray-600">
                        VP Sales, GrowthCo
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <CardDescription>
                    "Easy to use, powerful features, and excellent customer
                    support. Our team adopted it within days."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/placeholder.svg?height=40&width=40"
                      width="40"
                      height="40"
                      alt="Emily Rodriguez"
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold">Emily Rodriguez</div>
                      <div className="text-sm text-gray-600">
                        Sales Manager, StartupXYZ
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  Ready to Transform Your Sales?
                </h2>
                <p className="mx-auto max-w-[600px] text-orange-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of sales teams using our completely free CRM
                  platform.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your work email"
                    className="max-w-lg flex-1 bg-white"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="bg-white text-orange-600 hover:bg-gray-100"
                    asChild
                  >
                    <Link href="https://sales.sannty.in">Get Started Free</Link>
                  </Button>
                </form>
                <p className="text-xs text-orange-100">
                  100% Free • No hidden costs • Start immediately
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-50"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    Get in Touch
                  </h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Have questions? Our sales team is here to help you find the
                    perfect plan for your business.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-orange-600" />
                    <span>+91 989 977 1880</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-orange-600" />
                    <span>ashish@sannty.in</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <span>Schedule a demo call</span>
                  </div>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Request a Demo</CardTitle>
                  <CardDescription>
                    See Sales CRM in action with a personalized demo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="First name" />
                    <Input placeholder="Last name" />
                  </div>
                  <Input placeholder="Work email" type="email" />
                  <Input placeholder="Company name" />
                  <Input placeholder="Phone number" type="tel" />
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    asChild
                  >
                    <Link href="https://sales.sannty.in">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-600">
          © 2025 Sales CRM. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-600"
          >
            Terms of Service
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-600"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-gray-600"
          >
            Cookie Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
