
// components/AddShipmentForm.tsx
'use client';

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  category: string;
  supplier: string;
}

interface AddShipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddShipmentForm({ onSuccess, onCancel }: AddShipmentFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    origin: '',
    destination: '',
    expectedDelivery: '',
    trackingNumber: '',
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    supplier: '',
  });
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : [];
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.origin || !formData.destination || !formData.expectedDelivery) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        setFormData({
          productId: '',
          origin: '',
          destination: '',
          expectedDelivery: '',
          trackingNumber: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category || !newProduct.supplier) {
      alert('Please fill in all product fields');
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const product = result.data;
          setProducts([...products, product]);
          setFormData({ ...formData, productId: product._id });
          setNewProduct({ name: '', category: '', supplier: '' });
          setShowNewProductForm(false);
        } else {
          alert(result.error || 'Failed to create product');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    }
  };

  return (
    <div className="space-y-6">
      {showNewProductForm && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3>
          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-3 flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Create Product
              </button>
              <button
                type="button"
                onClick={() => setShowNewProductForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <div className="flex space-x-2">
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.supplier}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewProductForm(!showNewProductForm)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              + New
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Delivery *
          </label>
          <input
            type="date"
            value={formData.expectedDelivery}
            onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origin *
          </label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Shanghai, China"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination *
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Los Angeles, USA"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tracking Number
          </label>
          <input
            type="text"
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional tracking number"
          />
        </div>

        <div className="md:col-span-2 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Shipment'}
          </button>
        </div>
      </form>
    </div>
  );
}