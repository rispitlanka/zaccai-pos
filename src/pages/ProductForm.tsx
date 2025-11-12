import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { ArrowLeft, Plus, X, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../config/api';

interface Category {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface ProductVariation {
  _id: string;
  name: string;
  type: 'single' | 'multiple';
  isRequired: boolean;
  values: Array<{
    _id: string;
    value: string;
    priceAdjustment: number;
    isActive: boolean;
  }>;
}

interface VariationCombination {
  id: string;
  name: string;
  combinationName: string;
  selectedValues: Array<{
    variationId: string;
    variationName: string;
    valueId: string;
    value: string;
  }>;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  sku: string;
  image?: File | string;
  minStock?: number;
}

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  barcodeId: string;
  unit: string;
  taxRate: number;
  hasVariations: boolean;
  variations: Array<{
    variationId: string;
    variationName: string;
    selectedValues: string[];
  }>;
  variationCombinations: VariationCombination[];
}

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableVariations, setAvailableVariations] = useState<ProductVariation[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    category: '',
    description: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    barcodeId: '',
    unit: 'piece',
    taxRate: 0,
    hasVariations: false,
    variations: [],
    variationCombinations: []
  });

  useEffect(() => {
    loadCategories();
    loadVariations();
    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (
      formData.hasVariations &&
      formData.variations.length > 0 &&
      formData.variationCombinations.length === 0
    ) {
      generateVariationCombinations();
    }
  }, [formData.variations, formData.hasVariations]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/categories/all');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadVariations = async () => {
    try {
      const response = await api.get('/api/product-variations/all');
      setAvailableVariations(response.data.variations);
    } catch (err) {
      console.error('Failed to load variations:', err);
    }
  };

  const loadProduct = async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      const product = response.data.product;

      // Map variations to expected format
      const mappedVariations = (product.variations || []).map((v: any) => ({
        variationId: v.variationId,
        variationName: v.variationName,
        selectedValues: (v.selectedValues || []).map((val: any) => val.valueId)
      }));

      // Map variationCombinations to have 'id' field
      const mappedCombinations = (product.variationCombinations || []).map((vc: any) => ({
        ...vc,
        id: vc._id || vc.id,
      }));

      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description || '',
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        minStock: product.minStock,
        barcodeId: product.barcodeId,
        unit: product.unit,
        taxRate: product.taxRate,
        hasVariations: !!product.hasVariations,
        variations: mappedVariations,
        variationCombinations: mappedCombinations
      });
    } catch (err) {
      error('Failed to load product');
      navigate('/products');
    }
  };

  const generateVariationCombinations = () => {
    if (formData.variations.length === 0) {
      setFormData(prev => ({ ...prev, variationCombinations: [] }));
      return;
    }

    const combinations: VariationCombination[] = [];
    
    // For each selected variation, use all its active values
    const allVariationValues = formData.variations.map(variation => {
      const availableVariation = availableVariations.find(v => v._id === variation.variationId);
      if (!availableVariation) return [];
      return availableVariation.values.filter(v => v.isActive).map(value => ({
        variationId: variation.variationId,
        variationName: variation.variationName,
        valueId: value._id,
        value: value.value
      }));
    });

    // Helper to generate cartesian product
    function cartesianProduct(arr: any[][]): any[][] {
      return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
    }

    const combos = cartesianProduct(allVariationValues);

    combos.forEach(currentCombo => {
      const comboName = currentCombo.map(c => c.value).join(' / ');
      const comboId = currentCombo.map(c => c.valueId).join('-');
      const comboSku = (Math.floor(1000 + Math.random() * 9000)).toString();
      // Check if this combination already exists
      const existingCombo = formData.variationCombinations.find(vc => vc.id === comboId);
      combinations.push({
        id: comboId,
        name: comboName,
        combinationName: comboName,
        selectedValues: [...currentCombo],
        purchasePrice: existingCombo?.purchasePrice || 0,
        sellingPrice: existingCombo?.sellingPrice || 0,
        stock: existingCombo?.stock || 0,
        sku: existingCombo?.sku || comboSku,
        image: existingCombo?.image,
        minStock: existingCombo?.minStock ?? 5,
      });
    });

    setFormData(prev => ({
      ...prev,
      variationCombinations: combinations
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.category) {
      error('Please fill in all required fields');
      return;
    }

    if (!formData.hasVariations) {
      if (formData.sellingPrice <= 0) {
        error('Selling price must be greater than 0');
        return;
      }
    } else {
      if (formData.variations.length === 0) {
        error('Please add at least one variation');
        return;
      }
    }

    setLoading(true);
    try {
      if (id) {
        // Build backend variations
        const backendVariations = formData.variations.map(v => {
          const available = availableVariations.find(av => av._id === v.variationId);
          return {
            variationId: v.variationId,
            variationName: v.variationName,
            selectedValues: v.selectedValues.map(valueId => {
              const valueObj = available?.values.find(val => val._id === valueId);
              return valueObj
                ? {
                    valueId: valueObj._id,
                    value: valueObj.value,
                    priceAdjustment: valueObj.priceAdjustment,
                    _id: valueObj._id
                  }
                : { valueId };
            })
          };
        });

        // Prepare variationCombinations for JSON (remove image field for JSON)
        const combos = formData.variationCombinations.map(combo => {
          const { image, ...comboData } = combo;
          // Fill missing/invalid fields with 0 or default values
          return {
            ...comboData,
            purchasePrice: isNaN(comboData.purchasePrice) ? 0 : comboData.purchasePrice,
            sellingPrice: isNaN(comboData.sellingPrice) ? 0 : comboData.sellingPrice,
            stock: isNaN(comboData.stock) ? 0 : comboData.stock,
            sku: comboData.sku || '0',
            minStock: isNaN(comboData.minStock ?? 0) ? 0 : (comboData.minStock ?? 0)
          };
        });

        const payload = {
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          description: formData.description || '',
          purchasePrice: formData.purchasePrice,
          sellingPrice: formData.sellingPrice,
          stock: formData.stock,
          minStock: formData.minStock,
          barcodeId: formData.barcodeId || '',
          taxRate: formData.taxRate,
          unit: formData.unit,
          isActive: true,
          hasVariations: formData.hasVariations,
          variations: backendVariations,
          variationCombinations: combos
        };

        await api.put(`/api/products/${id}`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        success('Product updated successfully');
      } else {
        // Use FormData for POST (if you need to upload images)
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('sku', formData.sku);
        submitData.append('category', formData.category);
        submitData.append('description', formData.description || '');
        submitData.append('purchasePrice', String(formData.purchasePrice));
        submitData.append('sellingPrice', String(formData.sellingPrice));
        submitData.append('stock', String(formData.stock));
        submitData.append('minStock', String(formData.minStock));
        submitData.append('barcodeId', formData.barcodeId || '');
        submitData.append('taxRate', String(formData.taxRate));
        submitData.append('unit', formData.unit);
        submitData.append('isActive', 'true');
        submitData.append('hasVariations', String(formData.hasVariations));
        // Map variations to backend format
        const backendVariations = formData.variations.map(v => {
          const available = availableVariations.find(av => av._id === v.variationId);
          return {
            variationId: v.variationId,
            variationName: v.variationName,
            selectedValues: v.selectedValues.map(valueId => {
              const valueObj = available?.values.find(val => val._id === valueId);
              return valueObj
                ? {
                    valueId: valueObj._id,
                    value: valueObj.value,
                    priceAdjustment: valueObj.priceAdjustment,
                    _id: valueObj._id
                  }
                : { valueId };
            })
          };
        });
        submitData.append('variations', JSON.stringify(backendVariations));
        // Prepare variationCombinations for JSON and images
        const combos = formData.variationCombinations.map((combo, i) => {
          if (combo.image && combo.image instanceof File) {
            submitData.append(`variationCombinations[${i}][image]`, combo.image);
          }
          // Exclude image from JSON
          const { image, ...comboData } = combo;
          // Fill missing/invalid fields with 0 or default values
          return {
            ...comboData,
            purchasePrice: isNaN(comboData.purchasePrice) ? 0 : comboData.purchasePrice,
            sellingPrice: isNaN(comboData.sellingPrice) ? 0 : comboData.sellingPrice,
            stock: isNaN(comboData.stock) ? 0 : comboData.stock,
            sku: comboData.sku || '0',
            minStock: isNaN(comboData.minStock ?? 0) ? 0 : (comboData.minStock ?? 0)
          };
        });
        submitData.append('variationCombinations', JSON.stringify(combos));
        // Attach main product image
        if (image && image instanceof File) {
          submitData.append('image', image);
        }
        await api.post('/api/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        success('Product created successfully');
      }
      navigate('/products');

      // Debugging
      // for (let pair of submitData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }
    } catch (err: any) {
      console.log(JSON.stringify(formData))
      error('Failed to save product', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('stock') || name.includes('Rate') 
        ? Number(value) 
        : value
    }));
  };

  const generateSKU = () => {
    const timestamp = Math.abs(Date.now()).toString().slice(-6); // always positive, last 6 digits
    setFormData(prev => ({ ...prev, sku: timestamp }));
  };
  

  const toggleVariations = () => {
    setFormData(prev => ({
      ...prev,
      hasVariations: !prev.hasVariations,
      variations: !prev.hasVariations ? prev.variations : [],
      variationCombinations: !prev.hasVariations ? prev.variationCombinations : []
    }));
  };

  const addVariation = (variationId: string) => {
    const variation = availableVariations.find(v => v._id === variationId);
    if (!variation) return;

    const existingVariation = formData.variations.find(v => v.variationId === variationId);
    if (existingVariation) return;

    setFormData(prev => ({
      ...prev,
      variations: [...prev.variations, {
        variationId,
        variationName: variation.name,
        selectedValues: []
      }]
    }));
  };

  const removeVariation = (variationId: string) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter(v => v.variationId !== variationId)
    }));
  };

  const updateVariationValues = (variationId: string, valueId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map(v => {
        if (v.variationId !== variationId) return v;
        
        const variation = availableVariations.find(av => av._id === variationId);
        if (!variation) return v;

        if (variation.type === 'single') {
          return { ...v, selectedValues: checked ? [valueId] : [] };
        } else {
          return {
            ...v,
            selectedValues: checked 
              ? [...v.selectedValues, valueId]
              : v.selectedValues.filter(id => id !== valueId)
          };
        }
      })
    }));
  };

  const updateVariationCombination = (comboId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variationCombinations: prev.variationCombinations.map(combo =>
        combo.id === comboId ? { ...combo, [field]: value } : combo
      )
    }));
  };

  const handleVariationComboImageChange = (comboId: string, file: File | undefined) => {
    setFormData(prev => ({
      ...prev,
      variationCombinations: prev.variationCombinations.map(combo =>
        combo.id === comboId ? { ...combo, image: file } : combo
      )
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('Only image files are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      error('Image must be less than 2MB');
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    const fakeEvent = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleImageChange(fakeEvent);
  };

  // Add a function to remove a variation combination by id
  const removeVariationCombination = (comboId: string) => {
    setFormData(prev => ({
      ...prev,
      variationCombinations: prev.variationCombinations.filter(combo => combo.id !== comboId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Package className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter SKU"
                />
                <button
                  type="button"
                  onClick={generateSKU}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="piece">Piece</option>
                <option value="kg">Kilogram</option>
                <option value="liter">Liter</option>
                <option value="meter">Meter</option>
                <option value="pack">Pack</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode ID
              </label>
              <input
                type="text"
                name="barcodeId"
                value={formData.barcodeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
            </div>
          </div>
        </div>

        {/* Variations Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Product Variations</h2>
              <p className="text-sm text-gray-600 mt-1">
                Enable if this product has different variations like size, color, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleVariations}
              className={`flex items-center p-2 rounded-lg transition-colors ${
                formData.hasVariations 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {formData.hasVariations ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
              <span className="ml-2 font-medium">
                {formData.hasVariations ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>
        </div>

        {/* Conditional Content Based on Variations */}
        {!formData.hasVariations ? (
          /* Simple Pricing & Stock */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Price *
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price *
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Alert
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                />
              </div>
            </div>

            {/* Profit Margin Display */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Profit Margin:</strong> {' '}
                {formData.purchasePrice > 0 && formData.sellingPrice > 0
                  ? `${(((formData.sellingPrice - formData.purchasePrice) / formData.purchasePrice) * 100).toFixed(2)}%`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        ) : (
          /* Variations Management */
          <div className="space-y-6">
            {/* Add Variations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Select Variations</h2>
                <select
                  onChange={(e) => e.target.value && addVariation(e.target.value)}
                  value=""
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Add Variation</option>
                  {availableVariations
                    .filter(v => !formData.variations.find(fv => fv.variationId === v._id))
                    .map(variation => (
                      <option key={variation._id} value={variation._id}>
                        {variation.name}
                      </option>
                    ))}
                </select>
              </div>

              {formData.variations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No variations selected. Choose from the dropdown above to add variations.
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.variations.map((productVariation) => {
                    const variation = availableVariations.find(v => v._id === productVariation.variationId);
                    if (!variation) return null;

                    return (
                      <div key={productVariation.variationId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {variation.name}
                            {variation.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeVariation(productVariation.variationId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {variation.values.filter(v => v.isActive).map((value) => (
                            <label key={value._id} className="flex items-center">
                              <input
                                type={variation.type === 'single' ? 'radio' : 'checkbox'}
                                name={`variation-${productVariation.variationId}`}
                                checked={productVariation.selectedValues.includes(value._id)}
                                onChange={(e) => updateVariationValues(
                                  productVariation.variationId, 
                                  value._id, 
                                  e.target.checked
                                )}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {value.value}
                                {value.priceAdjustment !== 0 && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({value.priceAdjustment > 0 ? '+' : ''}LKR {value.priceAdjustment})
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Variation Combinations */}
            {formData.variationCombinations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Variation Combinations</h2>
                <div className="space-y-4">
                  {formData.variationCombinations.map((combo) => (
                    <div key={combo.id} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        type="button"
                        onClick={() => removeVariationCombination(combo.id)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800 bg-white rounded-full p-1 shadow"
                        title="Remove this combination"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      {/* <h3 className="text-md font-medium text-gray-900 mb-1">{combo.name}</h3> */}
                      {combo.combinationName && (
                        <div className="text-md font-medium text-gray-900 mb-1"> {combo.combinationName}</div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image
                          </label>
                          <div className="flex flex-col items-center">
                            {combo.image ? (
                              <div className="relative w-20 h-20 mb-2">
                                <img
                                  src={typeof combo.image === 'string' ? combo.image : URL.createObjectURL(combo.image)}
                                  alt="Preview"
                                  className="object-cover w-full h-full rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVariationComboImageChange(combo.id, undefined)}
                                  className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-white hover:bg-red-600"
                                  title="Remove image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
                                <Plus className="w-6 h-6 text-blue-400" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files && e.target.files[0];
                                    if (file) {
                                      if (!file.type.startsWith('image/')) {
                                        error('Only image files are allowed');
                                        return;
                                      }
                                      if (file.size > 2 * 1024 * 1024) {
                                        error('Image must be less than 2MB');
                                        return;
                                      }
                                      handleVariationComboImageChange(combo.id, file);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SKU *
                          </label>
                          <input
                            type="text"
                            value={combo.sku}
                            onChange={(e) => updateVariationCombination(combo.id, 'sku', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter SKU"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Purchase Price *
                          </label>
                          <input
                            type="number"
                            value={combo.purchasePrice}
                            onChange={(e) => updateVariationCombination(combo.id, 'purchasePrice', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Selling Price *
                          </label>
                          <input
                            type="number"
                            value={combo.sellingPrice}
                            onChange={(e) => updateVariationCombination(combo.id, 'sellingPrice', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock *
                          </label>
                          <input
                            type="number"
                            value={combo.stock}
                            onChange={(e) => updateVariationCombination(combo.id, 'stock', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Stock Alert
                          </label>
                          <input
                            type="number"
                            value={combo.minStock ?? 5}
                            onChange={e => updateVariationCombination(combo.id, 'minStock', Number(e.target.value))}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="5"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="text-sm text-gray-600">
                            <strong>Profit:</strong> {' '}
                            {combo.purchasePrice > 0 && combo.sellingPrice > 0
                              ? `${(((combo.sellingPrice - combo.purchasePrice) / combo.purchasePrice) * 100).toFixed(2)}%`
                              : 'N/A'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image <span className="text-xs text-gray-500">(max 1, 2MB)</span></label>
          <div
            className={`relative flex flex-col items-center justify-center border-2 border-dashed ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded-xl p-6 transition-colors duration-200 cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('product-image-input')?.click()}
            style={{ minHeight: '120px' }}
          >
            <input
              id="product-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!!image}
              className="hidden"
            />
            {!imagePreview ? (
              <>
                <Plus className="w-8 h-8 text-blue-400 mb-2" />
                <span className="text-gray-600 font-medium">Click or drag an image here to upload</span>
              </>
            ) : (
              <div className="relative w-32 h-32">
                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full rounded-lg border" />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemoveImage(); }}
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-white hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {id ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              id ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;