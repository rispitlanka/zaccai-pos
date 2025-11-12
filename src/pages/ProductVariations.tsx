import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Settings,
  Tag,
  X,
  Move,
  Check,
  AlertCircle,
  Save
} from 'lucide-react';
import api from '../config/api';

interface VariationValue {
  _id?: string;
  value: string;
  priceAdjustment: number;
  isActive: boolean;
  sortOrder: number;
}

interface ProductVariation {
  _id: string;
  name: string;
  description: string;
  type: 'single' | 'multiple';
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  values: VariationValue[];
  createdByName: string;
  createdAt: string;
}

const ProductVariations: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showValuesModal, setShowValuesModal] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'single' as 'single' | 'multiple',
    isRequired: false,
    sortOrder: 0,
    values: [] as VariationValue[]
  });

  const [valueFormData, setValueFormData] = useState({
    value: '',
    priceAdjustment: 0,
    sortOrder: 0
  });

  const [editingValueIndex, setEditingValueIndex] = useState<number | null>(null);

  useEffect(() => {
    loadVariations();
  }, [currentPage, searchTerm]);

  const loadVariations = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/api/product-variations?${params}`);
      setVariations(response.data.variations || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      error('Failed to load product variations');
      setVariations([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'single',
      isRequired: false,
      sortOrder: 0,
      values: []
    });
    setEditingValueIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      error('Variation name is required');
      return;
    }

    try {
      const submitData = {
        ...formData,
        values: formData.values.map((value, index) => ({
          ...value,
          sortOrder: index
        }))
      };

      if (editingVariation) {
        await api.put(`/api/product-variations/${editingVariation._id}`, submitData);
        success('Product variation updated successfully');
      } else {
        await api.post('/api/product-variations', submitData);
        success('Product variation created successfully');
      }
      
      setShowModal(false);
      setEditingVariation(null);
      resetForm();
      loadVariations();
    } catch (err: any) {
      error('Failed to save product variation', err.response?.data?.message);
    }
  };

  const handleEdit = (variation: ProductVariation) => {
    setEditingVariation(variation);
    setFormData({
      name: variation.name,
      description: variation.description,
      type: variation.type,
      isRequired: variation.isRequired,
      sortOrder: variation.sortOrder,
      values: [...variation.values]
    });
    setShowModal(true);
  };

  const handleDelete = async (variationId: string) => {
    if (!window.confirm('Are you sure you want to delete this product variation?')) return;

    try {
      await api.delete(`/api/product-variations/${variationId}`);
      success('Product variation deleted successfully');
      loadVariations();
    } catch (err: any) {
      error('Failed to delete product variation', err.response?.data?.message);
    }
  };

  const handleManageValues = (variation: ProductVariation) => {
    setSelectedVariation(variation);
    setShowValuesModal(true);
  };

  // Form value management functions
  const addValueToForm = () => {
    if (!valueFormData.value.trim()) {
      error('Value is required');
      return;
    }

    // Check for duplicate values
    const exists = formData.values.some(v => 
      v.value.toLowerCase() === valueFormData.value.toLowerCase()
    );

    if (exists) {
      error('This value already exists');
      return;
    }

    const newValue: VariationValue = {
      value: valueFormData.value.trim(),
      priceAdjustment: valueFormData.priceAdjustment,
      isActive: true,
      sortOrder: formData.values.length
    };

    setFormData(prev => ({
      ...prev,
      values: [...prev.values, newValue]
    }));

    setValueFormData({
      value: '',
      priceAdjustment: 0,
      sortOrder: 0
    });
  };

  const removeValueFromForm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const editValueInForm = (index: number) => {
    const value = formData.values[index];
    setValueFormData({
      value: value.value,
      priceAdjustment: value.priceAdjustment,
      sortOrder: value.sortOrder
    });
    setEditingValueIndex(index);
  };

  const saveEditedValue = () => {
    if (!valueFormData.value.trim()) {
      error('Value is required');
      return;
    }

    if (editingValueIndex === null) return;

    // Check for duplicate values (excluding current one)
    const exists = formData.values.some((v, i) => 
      i !== editingValueIndex && v.value.toLowerCase() === valueFormData.value.toLowerCase()
    );

    if (exists) {
      error('This value already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      values: prev.values.map((value, i) => 
        i === editingValueIndex 
          ? {
              ...value,
              value: valueFormData.value.trim(),
              priceAdjustment: valueFormData.priceAdjustment
            }
          : value
      )
    }));

    setValueFormData({
      value: '',
      priceAdjustment: 0,
      sortOrder: 0
    });
    setEditingValueIndex(null);
  };

  const cancelEditValue = () => {
    setValueFormData({
      value: '',
      priceAdjustment: 0,
      sortOrder: 0
    });
    setEditingValueIndex(null);
  };

  // Modal value management functions
  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valueFormData.value || !selectedVariation) {
      error('Value is required');
      return;
    }

    try {
      await api.post(`/api/product-variations/${selectedVariation._id}/values`, valueFormData);
      success('Variation value added successfully');
      setValueFormData({ value: '', priceAdjustment: 0, sortOrder: 0 });
      
      // Reload the selected variation
      const response = await api.get(`/api/product-variations/${selectedVariation._id}`);
      setSelectedVariation(response.data.variation);
      loadVariations();
    } catch (err: any) {
      error('Failed to add variation value', err.response?.data?.message);
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!selectedVariation) return;
    
    if (!window.confirm('Are you sure you want to delete this variation value?')) return;

    try {
      await api.delete(`/api/product-variations/${selectedVariation._id}/values/${valueId}`);
      success('Variation value deleted successfully');
      
      // Reload the selected variation
      const response = await api.get(`/api/product-variations/${selectedVariation._id}`);
      setSelectedVariation(response.data.variation);
      loadVariations();
    } catch (err: any) {
      error('Failed to delete variation value', err.response?.data?.message);
    }
  };

  const toggleValueStatus = async (valueId: string, currentStatus: boolean) => {
    if (!selectedVariation) return;

    try {
      await api.put(`/api/product-variations/${selectedVariation._id}/values/${valueId}`, {
        isActive: !currentStatus
      });
      success(`Variation value ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Reload the selected variation
      const response = await api.get(`/api/product-variations/${selectedVariation._id}`);
      setSelectedVariation(response.data.variation);
      loadVariations();
    } catch (err: any) {
      error('Failed to update variation value status', err.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-48 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg mt-4 sm:mt-0 animate-pulse"></div>
        </div>
  
        {/* Search Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
  
        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-4">
                          <div className="h-5 w-32 bg-gray-200 rounded"></div>
                          <div className="h-4 w-48 bg-gray-200 rounded mt-2"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded mt-1"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* Pagination Skeleton */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Variations</h1>
          <p className="text-gray-600 mt-1">Manage product variations and their values</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setEditingVariation(null);
              resetForm();
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Variation
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search product variations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Variations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Values
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variations.map((variation) => (
                <tr key={variation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Tag className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{variation.name}</div>
                        {variation.description && (
                          <div className="text-sm text-gray-500">{variation.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      variation.type === 'single' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {variation.type === 'single' ? 'Single Select' : 'Multiple Select'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {variation.values.filter(v => v.isActive).length} active / {variation.values.length} total
                    </div>
                    <div className="text-xs text-gray-500">
                      {variation.values.slice(0, 3).map(v => v.value).join(', ')}
                      {variation.values.length > 3 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      variation.isRequired 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {variation.isRequired ? 'Required' : 'Optional'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      variation.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {variation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleManageValues(variation)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Manage Values"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => handleEdit(variation)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Variation"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(variation._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Variation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Variation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingVariation ? 'Edit Product Variation' : 'Add New Product Variation'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variation Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    placeholder="e.g., Size, Color, Material"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selection Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'single' | 'multiple' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="single">Single Select (Radio buttons)</option>
                    <option value="multiple">Multiple Select (Checkboxes)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required variation</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Values Section */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Variation Values</h4>
                
                {/* Add Value Form */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={valueFormData.value}
                        onChange={(e) => setValueFormData(prev => ({ ...prev, value: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Small, Red, Cotton"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Adjustment (LKR)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={valueFormData.priceAdjustment}
                        onChange={(e) => setValueFormData(prev => ({ ...prev, priceAdjustment: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      {editingValueIndex !== null ? (
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={saveEditedValue}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditValue}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={addValueToForm}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Value
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Values List */}
                {formData.values.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    No values added yet. Add some values above to get started.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.values.map((value, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{value.value}</span>
                          {value.priceAdjustment !== 0 && (
                            <span className="ml-2 text-sm text-gray-600">
                              ({value.priceAdjustment > 0 ? '+' : ''}LKR {value.priceAdjustment})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => editValueInForm(index)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Value"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeValueFromForm(index)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove Value"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingVariation ? 'Update Variation' : 'Create Variation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Values Modal (for existing variations) */}
      {showValuesModal && selectedVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Manage Values - {selectedVariation.name}
              </h3>
              <button
                onClick={() => setShowValuesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Add Value Form */}
            <form onSubmit={handleAddValue} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-md font-medium mb-3">Add New Value</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={valueFormData.value}
                    onChange={(e) => setValueFormData(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Small, Red, Cotton"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Adjustment (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valueFormData.priceAdjustment}
                    onChange={(e) => setValueFormData(prev => ({ ...prev, priceAdjustment: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add Value
                  </button>
                </div>
              </div>
            </form>

            {/* Values List */}
            <div>
              <h4 className="text-md font-medium mb-3">Current Values ({selectedVariation.values.length})</h4>
              {selectedVariation.values.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No values added yet. Add some values above to get started.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedVariation.values.map((value) => (
                    <div key={value._id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      value.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                    }`}>
                      <div className="flex-1">
                        <span className={`font-medium ${value.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {value.value}
                        </span>
                        {value.priceAdjustment !== 0 && (
                          <span className="ml-2 text-sm text-gray-600">
                            ({value.priceAdjustment > 0 ? '+' : ''}LKR {value.priceAdjustment})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleValueStatus(value._id!, value.isActive)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            value.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title={value.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {value.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => handleDeleteValue(value._id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Value"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariations;