"use client"
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Users, 
  Award, 
  Target, 
  Handshake,
  Leaf,
  Edit3,
  Share2,
  Download,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

// TypeScript interfaces
interface CompanyProfile {
  id: string;
  name: string;
  logo?: string;
  tagline?: string;
  industry: string;
  founded: string;
  headquarters: {
    city: string;
    country: string;
    address: string;
  };
  description: string;
  mission: string;
  vision: string;
  values: string[];
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website: string;
  email: string;
  phone: string;
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  certifications: string[];
  awards: string[];
  teamSize: number;
  annualRevenue?: string;
  keyProducts: string[];
  targetMarkets: string[];
  partnerships: string[];
  sustainability: {
    isCertified: boolean;
    initiatives: string[];
    goals: string[];
  };
}

// Sample company data
const sampleCompany: CompanyProfile = {
  id: '1',
  name: 'TechFlow Solutions',
  tagline: 'Innovating Tomorrow\'s Digital Infrastructure',
  logo: '/api/placeholder/120/120',
  industry: 'Technology',
  founded: '2015',
  headquarters: {
    city: 'San Francisco',
    country: 'United States',
    address: '123 Innovation Drive, San Francisco, CA 94105'
  },
  description: 'TechFlow Solutions is a leading technology company specializing in cloud infrastructure, AI-powered analytics, and enterprise software solutions. We help businesses transform their digital operations through cutting-edge technology and innovative approaches.',
  mission: 'To empower businesses worldwide with intelligent technology solutions that drive growth, efficiency, and innovation.',
  vision: 'To be the global leader in transformative technology solutions, creating a more connected and intelligent world.',
  values: ['Innovation', 'Integrity', 'Customer Success', 'Sustainability', 'Collaboration'],
  size: 'medium',
  website: 'https://techflow.solutions',
  email: 'contact@techflow.solutions',
  phone: '+1 (555) 123-4567',
  socialMedia: {
    linkedin: 'https://linkedin.com/company/techflow',
    twitter: 'https://twitter.com/techflow',
    facebook: 'https://facebook.com/techflow',
    instagram: 'https://instagram.com/techflow'
  },
  certifications: ['ISO 27001', 'SOC 2 Type II', 'AWS Advanced Partner', 'Google Cloud Premier'],
  awards: ['Tech Innovation Award 2023', 'Best Workplace 2022', 'Sustainable Business Leader 2023'],
  teamSize: 250,
  annualRevenue: '$50M+',
  keyProducts: ['CloudOps Platform', 'AI Analytics Suite', 'Enterprise Security Hub', 'Digital Transformation Services'],
  targetMarkets: ['Enterprise', 'Mid-Market', 'Government', 'Healthcare'],
  partnerships: ['Amazon Web Services', 'Microsoft Azure', 'Google Cloud', 'Salesforce'],
  sustainability: {
    isCertified: true,
    initiatives: ['Carbon Neutral Operations', 'Remote-First Workplace', 'Sustainable Supply Chain'],
    goals: ['Net Zero by 2030', '100% Renewable Energy', 'Waste Reduction Program']
  }
};

const CompanyProfile: React.FC = () => {
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch company data on component mount
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch('/api/company');
        if (response.ok) {
          const data = await response.json();
          setCompany(data.company);
        } else {
          // If no company profile found, use sample data
          setCompany(sampleCompany);
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
        // Fallback to sample data
        setCompany(sampleCompany);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const getSizeColor = (size: string) => {
    const colors = {
      startup: 'bg-green-100 text-green-800',
      small: 'bg-blue-100 text-blue-800',
      medium: 'bg-purple-100 text-purple-800',
      large: 'bg-orange-100 text-orange-800',
      enterprise: 'bg-red-100 text-red-800'
    };
    return colors[size as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSizeLabel = (size: string) => {
    const labels = {
      startup: 'Startup',
      small: 'Small (1-50)',
      medium: 'Medium (51-500)',
      large: 'Large (501-1000)',
      enterprise: 'Enterprise (1000+)'
    };
    return labels[size as keyof typeof labels] || size;
  };

  const ProfileHeader = () => {
    if (!company) return null;
    
    return (
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={company.logo} alt={company.name} />
              <AvatarFallback className="text-2xl font-bold">
                {company.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {company.name}
                </h1>
                {company.tagline && (
                  <p className="text-lg text-gray-600 mb-4">{company.tagline}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">
                    <Building2 className="w-4 h-4 mr-1" />
                    {company.industry}
                  </Badge>
                  <Badge className={getSizeColor(company.size)}>
                    <Users className="w-4 h-4 mr-1" />
                    {getSizeLabel(company.size)}
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="w-4 h-4 mr-1" />
                    Founded {company.founded}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Company Profile</DialogTitle>
                      <DialogDescription>
                        Update your company information and settings.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input id="company-name" defaultValue={company.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-tagline">Tagline</Label>
                        <Input id="company-tagline" defaultValue={company.tagline} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-description">Description</Label>
                        <Textarea id="company-description" defaultValue={company.description} rows={4} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setEditDialogOpen(false)}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const OverviewSection = () => {
    if (!company) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">{company.description}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">{company.mission}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">{company.vision}</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Core Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {company.values.map((value, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-2 px-3">
                  {value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ContactSection = () => {
    if (!company) return null;
    
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Headquarters</p>
                  <p className="text-gray-600">
                    {company.headquarters.address}<br />
                    {company.headquarters.city}, {company.headquarters.country}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                    {company.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                    {company.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">Website</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline flex items-center gap-1">
                    {company.website.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {company.socialMedia.linkedin && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {company.socialMedia.twitter && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {company.socialMedia.facebook && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {company.socialMedia.instagram && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Key Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Size:</span>
                    <span className="font-medium">{company.teamSize}+ employees</span>
                  </div>
                  {company.annualRevenue && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Revenue:</span>
                      <span className="font-medium">{company.annualRevenue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const BusinessSection = () => {
    if (!company) return null;
    
    return (
      <Tabs defaultValue="products" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="awards">Recognition</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Key Products & Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.keyProducts.map((product, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <h4 className="font-medium mb-2">{product}</h4>
                    <p className="text-sm text-gray-600">
                      Advanced technology solution designed to meet enterprise needs.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="markets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Target Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {company.targetMarkets.map((market, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-2 px-3">
                    {market}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="partners" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                Strategic Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.partnerships.map((partner, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="font-medium">{partner}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="awards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Awards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.awards.map((award, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>{award}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  const SustainabilitySection = () => {
    if (!company) return null;
    
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" />
            Sustainability & ESG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                Current Initiatives
                {company.sustainability.isCertified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Certified
                  </Badge>
                )}
              </h4>
              <div className="space-y-2">
                {company.sustainability.initiatives.map((initiative, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{initiative}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Future Goals</h4>
              <div className="space-y-2">
                {company.sustainability.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No company profile found</p>
          <Button onClick={() => window.location.href = '/business-details'}>
            Set Up Company Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader />
        <OverviewSection />
        <ContactSection />
        <BusinessSection />
        <SustainabilitySection />
      </div>
    </div>
  );
};

export default CompanyProfile;