import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  AlertTriangle,
  Truck,
  BrainCircuit,
  BarChart3,
  Upload,
  Monitor,
  Zap,
  CheckCircle,
  Star,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react"

export default function ChainGuardLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Build an Unbreakable Supply Chain with AI-Powered Intelligence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              ChainGuard provides real-time risk detection, predictive analytics, and actionable insights to help you
              navigate supply chain disruptions before they impact your bottom line.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Start Your Free Trial
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Request a Demo
              </Button>
            </div>
          </div>
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-2/20 blur-3xl rounded-full"></div>
            <img
              src="/abstract-supply-chain-network-visualization-with-g.png"
              alt="Supply Chain Network Visualization"
              className="relative mx-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-12 text-muted-foreground">
            Trusted by the world's most resilient supply chains
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold">Maersk</div>
            <div className="text-2xl font-bold">Flexport</div>
            <div className="text-2xl font-bold">Intel</div>
            <div className="text-2xl font-bold">Samsung</div>
            <div className="text-2xl font-bold">DHL</div>
            <div className="text-2xl font-bold">FedEx</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Total Supply Chain Visibility
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered tools to monitor, predict, and optimize your entire supply chain network.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Risk Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI monitors global events, weather, and port congestion 24/7 to alert you of potential
                  disruptions.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Intelligent Shipment Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Go beyond standard tracking with predictive ETAs and automated status updates for all your shipments.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive actionable strategies to mitigate risks, find alternative routes, and optimize your logistics
                  network.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>What-If Simulations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stress-test your supply chain against potential scenarios like port closures or supplier issues to
                  build robust contingency plans.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <Upload className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Upload Your Data</h3>
              <p className="text-muted-foreground">
                Securely upload your product, supplier, and shipment data via Excel or CSV.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <Monitor className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Monitor Your Dashboard</h3>
              <p className="text-muted-foreground">
                Our AI immediately begins analyzing your data and global events, presenting key insights on your central
                dashboard.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Act on Insights</h3>
              <p className="text-muted-foreground">
                Use real-time alerts and recommendations to make proactive decisions and protect your supply chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">Trusted by supply chain professionals worldwide</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "ChainGuard transformed our reactive process into a proactive strategy. We identified a port strike
                  risk two weeks in advance and rerouted our shipments, saving us thousands."
                </p>
                <div className="flex items-center">
                  <Avatar className="mr-3">
                    <AvatarImage src="/professional-woman-headshot.png" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Supply Chain Manager, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The level of visibility is unmatched. I can finally see our entire supply chain in one place and
                  trust the AI-powered alerts."
                </p>
                <div className="flex items-center">
                  <Avatar className="mr-3">
                    <AvatarImage src="/professional-man-headshot.png" />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Logistics Coordinator, GlobalTrade Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your business needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfect for small businesses</CardDescription>
                <div className="text-3xl font-bold">
                  $99<span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Up to 100 shipments/month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Basic risk alerts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Email support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Dashboard access
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-transparent" variant="outline">
                  Get Started
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-primary relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">Most Popular</Badge>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For growing supply chains</CardDescription>
                <div className="text-3xl font-bold">
                  $299<span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Up to 1,000 shipments/month
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Advanced AI recommendations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    What-if simulations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    API access
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Started</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="text-3xl font-bold">Custom</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Unlimited shipments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Dedicated support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    On-premise deployment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    SLA guarantees
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-transparent" variant="outline">
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about ChainGuard</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Yes, absolutely. We use enterprise-grade encryption, SOC 2 compliance, and follow strict data privacy
                regulations. Your supply chain data is encrypted both in transit and at rest, and we never share your
                information with third parties.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What data sources do you monitor?</AccordionTrigger>
              <AccordionContent>
                ChainGuard monitors over 10,000 global data sources including weather patterns, port congestion,
                political events, natural disasters, shipping carrier updates, and economic indicators to provide
                comprehensive risk detection.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How long does setup take?</AccordionTrigger>
              <AccordionContent>
                Most customers are up and running within 24-48 hours. Our onboarding team will help you upload your
                data, configure your dashboard, and set up custom alerts based on your specific supply chain
                requirements.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Do you integrate with existing systems?</AccordionTrigger>
              <AccordionContent>
                Yes, ChainGuard integrates with popular ERP systems, TMS platforms, and logistics providers through our
                robust API. We support integrations with SAP, Oracle, Manhattan Associates, and many others.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>What kind of support do you provide?</AccordionTrigger>
              <AccordionContent>
                We offer 24/7 support for Professional and Enterprise plans, with dedicated customer success managers
                for Enterprise customers. All plans include comprehensive documentation, video tutorials, and access to
                our knowledge base.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Fortify Your Supply Chain?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of supply chain professionals who trust ChainGuard to protect their operations.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Sign Up for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ChainGuard</span>
              </div>
              <p className="text-muted-foreground mb-4">
                AI-powered supply chain risk detection and monitoring platform.
              </p>
              <div className="flex space-x-4">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Github className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 ChainGuard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
