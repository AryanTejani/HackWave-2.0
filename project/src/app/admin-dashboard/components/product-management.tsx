'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Users,
  Building,
  Star,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Product {
  _id: string;
  name: string;
  category: string;
  supplier: string;
  origin: string;
  description: string;
  unitCost: number;
  leadTime: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  riskLevel: 'low' | 'medium' | 'high';
  certifications: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  _id: string;
  name: string;
  location: string;
  country: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  riskLevel: 'low' | 'medium' | 'high';
  specialties: string[];
  leadTime: number;
  minimumOrder: number;
  maximumOrder: number;
}

export function ProductManagement() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (status === 'authenticated' && session) {
      fetchData();
    } else if (status === 'unauthenticated') {
      setError('User not authenticated');
      setLoading(false);
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products and suppliers in parallel
      const [productsRes, suppliersRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/suppliers', { credentials: 'include' })
      ]);

      if (productsRes.ok) {
        const productsResult = await productsRes.json();
        const productsData = productsResult.success ? productsResult.data : [];
        setProducts(productsData);
      } else {
        const errorData = await productsRes.json();
        setError(`Products API error: ${productsRes.status} - ${errorData.error || 'Unknown error'}`);
      }

      if (suppliersRes.ok) {
        const suppliersResult = await suppliersRes.json();
        const suppliersData = suppliersResult.success ? suppliersResult.data : [];
        setSuppliers(suppliersData);
      } else {
        const errorData = await suppliersRes.json();
        setError(`Suppliers API error: ${suppliersRes.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingProduct(productId);
      
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        // Remove the product from the local state
        setProducts(prev => prev.filter(p => p._id !== productId));
        alert('Product deleted successfully!');
      } else {
        alert(`Failed to delete product: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleDeleteSupplier = async (supplierId: string, supplierName: string) => {
    if (!confirm(`Are you sure you want to delete "${supplierName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingSupplier(supplierId);
      
      const response = await fetch(`/api/suppliers?id=${supplierId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        // Remove the supplier from the local state
        setSuppliers(prev => prev.filter(s => s._id !== supplierId));
        alert('Supplier deleted successfully!');
      } else {
        alert(`Failed to delete supplier: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier. Please try again.');
    } finally {
      setDeletingSupplier(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage products and supplier relationships</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/product-form">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button asChild>
            <Link href="/supplier-form">
              <Building className="h-4 w-4 mr-2" />
              Add Supplier
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{suppliers.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Lead Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.leadTime, 0) / products.length) : 0} days
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Average delivery time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {products.filter(p => p.riskLevel === 'high').length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription>There was an issue loading the data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Products</CardTitle>
                  <CardDescription>Manage your product catalog</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm">{product.name}</CardTitle>
                          <CardDescription className="text-xs">{product.category}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={product.riskLevel === 'high' ? 'destructive' : product.riskLevel === 'medium' ? 'secondary' : 'default'}
                          >
                            {product.riskLevel}
                          </Badge>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            disabled={deletingProduct === product._id}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete product"
                          >
                            {deletingProduct === product._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Supplier:</span>
                          <span className="font-medium">{product.supplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                          <span className="font-medium">{formatCurrency(product.unitCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Lead Time:</span>
                          <span className="font-medium">{product.leadTime} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Origin:</span>
                          <span className="font-medium">{product.origin}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>Manage supplier relationships and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((supplier) => (
                  <Card key={supplier._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm">{supplier.name}</CardTitle>
                          <CardDescription className="text-xs">{supplier.location}, {supplier.country}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={supplier.status === 'active' ? 'default' : supplier.status === 'pending' ? 'secondary' : 'outline'}
                          >
                            {supplier.status}
                          </Badge>
                          <button
                            onClick={() => handleDeleteSupplier(supplier._id, supplier.name)}
                            disabled={deletingSupplier === supplier._id}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete supplier"
                          >
                            {deletingSupplier === supplier._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                            <span className="font-medium">{supplier.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Lead Time:</span>
                          <span className="font-medium">{supplier.leadTime} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                          <span className={`font-medium ${getRiskColor(supplier.riskLevel)}`}>
                            {supplier.riskLevel}
                          </span>
                        </div>
                        {supplier.specialties.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Specialties:</span>
                            <span className="font-medium text-xs">
                              {supplier.specialties.slice(0, 2).join(', ')}
                              {supplier.specialties.length > 2 && '...'}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
