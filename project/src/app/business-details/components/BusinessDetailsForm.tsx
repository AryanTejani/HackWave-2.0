"use client"

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Users, 
  Target, 
  Handshake,
  Leaf,
  Plus,
  X,
  Save,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanyFormData {
  name: string;
  logo: string;
  tagline: string;
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
  size: string;
  website: string;
  email: string;
  phone: string;
  socialMedia: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  certifications: string[];
  awards: string[];
  teamSize: number;
  annualRevenue: string;
  keyProducts: string[];
  targetMarkets: string[];
  partnerships: string[];
  sustainability: {
    isCertified: boolean;
    initiatives: string[];
    goals: string[];
  };
}

const initialFormData: CompanyFormData = {
  name: '',
  logo: '',
  tagline: '',
  industry: '',
  founded: '',
  headquarters: {
    city: '',
    country: '',
    address: '',
  },
  description: '',
  mission: '',
  vision: '',
  values: [],
  size: 'startup',
  website: '',
  email: '',
  phone: '',
  socialMedia: {
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
  },
  certifications: [],
  awards: [],
  teamSize: 0,
  annualRevenue: '',
  keyProducts: [],
  targetMarkets: [],
  partnerships: [],
  sustainability: {
    isCertified: false,
    initiatives: [],
    goals: [],
  },
};

export function BusinessDetailsForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CompanyFormData],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field: string, value: string, action: 'add' | 'remove' | 'update') => {
    setFormData(prev => {
      const currentArray = prev[field as keyof CompanyFormData] as string[];
      if (action === 'add') {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else if (action === 'remove') {
        return {
          ...prev,
          [field]: currentArray.filter((_, index) => index !== parseInt(value))
        };
      }
      return prev;
    });
  };

  const addArrayItem = (field: string, inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current && inputRef.current.value.trim()) {
      handleArrayChange(field, inputRef.current.value.trim(), 'add');
      inputRef.current.value = '';
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    handleArrayChange(field, index.toString(), 'remove');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('User session not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        toast.success('Company profile saved successfully!');
        router.push('/admin-dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save company profile');
      }
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast.error('An error occurred while saving your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/admin-dashboard');
  };

  const renderArrayInput = (
    field: string, 
    label: string, 
    placeholder: string,
    items: string[]
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    return (
      <div className="space-y-3">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            onKeyPress={(e) => e.key === 'Enter' && addArrayItem(field, inputRef)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addArrayItem(field, inputRef)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge key={index} variant="secondary" className="gap-2">
                {item}
                <button
                  type="button"
                  onClick={() => removeArrayItem(field, index)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="Brief company description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g., Technology, Manufacturing"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    value={formData.founded}
                    onChange={(e) => handleInputChange('founded', e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your company..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="small">Small (11-50)</SelectItem>
                      <SelectItem value="medium">Medium (51-200)</SelectItem>
                      <SelectItem value="large">Large (201-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={formData.teamSize || ''}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 0)}
                    placeholder="Number of employees"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Headquarters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.headquarters.city}
                    onChange={(e) => handleNestedChange('headquarters', 'city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.headquarters.country}
                    onChange={(e) => handleNestedChange('headquarters', 'country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={formData.headquarters.address}
                  onChange={(e) => handleNestedChange('headquarters', 'address', e.target.value)}
                  placeholder="Complete address"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mission & Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  value={formData.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  placeholder="What is your company's mission?"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  value={formData.vision}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  placeholder="What is your company's vision for the future?"
                  rows={3}
                />
              </div>
              {renderArrayInput('values', 'Core Values', 'Add a core value', formData.values)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.company.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Products & Markets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderArrayInput('keyProducts', 'Key Products/Services', 'Add a product or service', formData.keyProducts)}
              {renderArrayInput('targetMarkets', 'Target Markets', 'Add a target market', formData.targetMarkets)}
              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Annual Revenue (Optional)</Label>
                <Input
                  id="annualRevenue"
                  value={formData.annualRevenue}
                  onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                  placeholder="e.g., $1M, $10M+"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Partnerships & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderArrayInput('partnerships', 'Strategic Partnerships', 'Add a partner', formData.partnerships)}
              {renderArrayInput('certifications', 'Certifications', 'Add a certification', formData.certifications)}
              {renderArrayInput('awards', 'Awards & Recognition', 'Add an award', formData.awards)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sustainability Tab */}
        <TabsContent value="sustainability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Sustainability & ESG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCertified"
                  checked={formData.sustainability.isCertified}
                  onCheckedChange={(checked) => 
                    handleNestedChange('sustainability', 'isCertified', checked)
                  }
                />
                <Label htmlFor="isCertified">We have sustainability certifications</Label>
              </div>
              {renderArrayInput('initiatives', 'Current Initiatives', 'Add an initiative', formData.sustainability.initiatives)}
              {renderArrayInput('goals', 'Future Goals', 'Add a goal', formData.sustainability.goals)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleSkip}
          disabled={isSubmitting}
        >
          Skip for Now
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
