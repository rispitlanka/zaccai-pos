import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Eye,
  Barcode,
  Download
} from 'lucide-react';
import api from '../config/api';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  barcodeId: string;
  qrCode: string;
  isActive: boolean;
  createdAt: string;
  hasVariations?: boolean;
  variationCombinations?: any[];
  selectedVariation?: any;
}

// Helper to get total stock (including variations)
const getProductStock = (product: Product & { variationCombinations?: any[], hasVariations?: boolean }) => {
  if (product.hasVariations && Array.isArray(product.variationCombinations) && product.variationCombinations.length > 0) {
    return product.variationCombinations.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock;
};

const Products: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await api.get(`/api/products?${params}`);
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/products/categories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/api/products/${productId}`);
      success('Product deleted successfully');
      loadProducts();
    } catch (err) {
      error('Failed to delete product');
    }
  };

  const printBarcode = (barcodeUrl: string, name: string, price: number) => {
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) {
      console.error('Unable to open print window (popup blocked).');
      return;
    }

    const printContents = `
    <html>
      <head>
        <title>Print Barcode</title>
        <style>
          @page { size: auto; margin: 0; } /* let printer margins handle it */
          html, body {
            height: 100%;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: sans-serif;
          }
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4mm;
          }
          .barcode-label { font-size: 10px; margin-top: 8px; text-align: center; }
          img { display: block; }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${barcodeUrl}" alt="Barcode" style="width:300px;height:80px;" />
          <div class="barcode-label">${name} - LKR ${price.toFixed(2)}</div>
        </div>
      </body>
    </html>
  `;

    // write contents to popup, print, then close popup
    printWindow.document.open();
    printWindow.document.write(printContents);
    printWindow.document.close();

    // ensure content is loaded before printing
    printWindow.focus();
    printWindow.onload = () => {
      try {
        printWindow.print();
      } catch (err) {
        console.error('Print failed', err);
      }
      // close popup after a short delay so print dialog appears
      setTimeout(() => {
        printWindow.close();
      }, 500);
    };
  };


  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= minStock) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-100 rounded" />
          </div>
          <div className="h-10 w-32 bg-blue-200 rounded-lg mt-4 sm:mt-0" />
        </div>
        {/* Filters Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-full bg-gray-100 rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Skeleton */}
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-8 w-40 bg-gray-100 rounded" />
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        {user?.role === 'admin' && (
          <Link
            to="/products/new"
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {products && products.length > 0 ? (
                products.map((product, productIdx) => {
                  const stock = getProductStock(product);
                  const stockStatus = getStockStatus(stock, product.minStock);
                  if (product.hasVariations && Array.isArray(product.variationCombinations) && product.variationCombinations.length > 0) {
                    // Product with variations: render main row, then sub-rows for each variation
                    const variations = product.variationCombinations;
                    return (
                      <React.Fragment key={product._id}>
                        {variations && variations.length > 0 && (
                          <tr className={
                            `transition-colors ${productIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`
                          }>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold align-middle" rowSpan={variations.length}>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-semibold align-middle" rowSpan={variations.length}>
                              <div className="text-sm text-gray-900">{product.category}</div>
                            </td>
                            {/* First variation row */}
                            <td className="px-6 py-3 whitespace-nowrap align-middle">
                              <div className="flex flex-col text-xs">
                                <span className="font-semibold">{variations[0].combinationName}</span>
                                <span>Selling: LKR {variations[0].sellingPrice?.toFixed(2) ?? '-'}</span>
                                <span>Cost: LKR {variations[0].purchasePrice?.toFixed(2) ?? '-'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap align-middle">
                              <div className="flex items-center text-xs">
                                <span>{variations[0].stock ?? 0} units</span>
                                {(variations[0].stock ?? 0) <= (variations[0].minStock ?? product.minStock) && (
                                  <span className="flex items-center text-red-600 text-xs ml-2">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Low Stock
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap align-middle">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(variations[0].stock ?? 0, variations[0].minStock ?? product.minStock).color}`}>
                                {getStockStatus(variations[0].stock ?? 0, variations[0].minStock ?? product.minStock).label}
                              </span>
                            </td>
                            {/* Barcode column for first variation, centered */}
                            <td className="px-6 py-3 whitespace-nowrap text-center align-middle">
                              <button
                                onClick={() => {
                                  setSelectedProduct({ ...product, selectedVariation: variations[0] });
                                  setShowBarcodeModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 rounded-full p-2 border border-blue-100 hover:border-blue-300 transition"
                                title="View Barcode"
                              >
                                <Barcode className="w-5 h-5 mx-auto" />
                              </button>
                            </td>
                            {/* Actions column only in first row, spans all variations */}
                            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium align-middle" rowSpan={variations.length}>
                              <div className="flex items-center space-x-2">
                                {user?.role === 'admin' && (
                                  <>
                                    <Link
                                      to={`/products/edit/${product._id}`}
                                      className="text-indigo-600 hover:text-indigo-900 rounded-full p-2 border border-indigo-100 hover:border-indigo-300 transition"
                                      title="Edit Product"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                      onClick={() => handleDeleteProduct(product._id)}
                                      className="text-red-600 hover:text-red-900 rounded-full p-2 border border-red-100 hover:border-red-300 transition"
                                      title="Delete Product"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        {/* Render remaining variation rows */}
                        {variations && variations.length > 1
                          ? variations.slice(1).map((variation, vIdx) => {
                            const vStock = variation.stock ?? 0;
                            const vMinStock = variation.minStock ?? product.minStock;
                            const vStatus = getStockStatus(vStock, vMinStock);
                            return (
                              <tr key={variation._id} className={`transition-colors ${productIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                <td className="px-6 py-3 whitespace-nowrap align-middle">
                                  <div className="flex flex-col text-xs">
                                    <span className="font-semibold">{variation.combinationName}</span>
                                    <span>Selling: LKR {variation.sellingPrice?.toFixed(2) ?? '-'}</span>
                                    <span>Cost: LKR {variation.purchasePrice?.toFixed(2) ?? '-'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap align-middle">
                                  <div className="flex items-center text-xs">
                                    <span>{vStock} units</span>
                                    {vStock <= vMinStock && (
                                      <span className="flex items-center text-red-600 text-xs ml-2">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Low Stock
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap align-middle">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${vStatus.color}`}>
                                    {vStatus.label}
                                  </span>
                                </td>
                                {/* Barcode column for this variation, centered */}
                                <td className="px-6 py-3 whitespace-nowrap text-center align-middle">
                                  <button
                                    onClick={() => {
                                      setSelectedProduct({ ...product, selectedVariation: variation });
                                      setShowBarcodeModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900 rounded-full p-2 border border-blue-100 hover:border-blue-300 transition"
                                    title="View Barcode"
                                  >
                                    <Barcode className="w-5 h-5 mx-auto" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                          : null}
                      </React.Fragment>
                    );
                  }
                  // Product without variations
                  return (
                    <tr key={product._id} className={`transition-colors ${productIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="text-sm text-gray-900">LKR {product.sellingPrice.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Cost: LKR {product.purchasePrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="text-sm text-gray-900">{stock} units</div>
                        {stock <= product.minStock && (
                          <div className="flex items-center text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      {/* Barcode column for product without variations, centered */}
                      <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowBarcodeModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 rounded-full p-2 border border-blue-100 hover:border-blue-300 transition"
                          title="View Barcode"
                        >
                          <Barcode className="w-5 h-5 mx-auto" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-middle">
                        <div className="flex items-center space-x-2">
                          {user?.role === 'admin' && (
                            <>
                              <Link
                                to={`/products/edit/${product._id}`}
                                className="text-indigo-600 hover:text-indigo-900 rounded-full p-2 border border-indigo-100 hover:border-indigo-300 transition"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900 rounded-full p-2 border border-red-100 hover:border-red-300 transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
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

      {/* Barcode Modal */}
      {showBarcodeModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Barcode</h3>
              <button
                onClick={() => setShowBarcodeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              {/* If product has variations and a selectedVariation, show that variation's barcode. Else, show all variations' barcodes. */}
              {selectedProduct.hasVariations && Array.isArray(selectedProduct.variationCombinations) && selectedProduct.variationCombinations.length > 0 ? (
                (selectedProduct as Product & { selectedVariation?: any }).selectedVariation ? (
                  (selectedProduct as Product & { selectedVariation?: any }).selectedVariation.barcodeId ? (
                    <>
                      <img
                        src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent((selectedProduct as Product & { selectedVariation?: any }).selectedVariation.barcodeId)}&code=Code128&translate-esc=false`}
                        alt="Barcode"
                        className="mx-auto mb-4"
                        style={{ width: '200px', height: '80px' }}
                      />
                      <p className="text-sm text-gray-600 mb-4">
                        {selectedProduct.name} - {(selectedProduct as Product & { selectedVariation?: any }).selectedVariation.combinationName} <br />
                        <span className="font-semibold">LKR {(selectedProduct as Product & { selectedVariation?: any }).selectedVariation.sellingPrice?.toFixed(2) ?? '-'}</span>
                      </p>
                      <button
                        onClick={() => printBarcode(
                          `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent((selectedProduct as Product & { selectedVariation?: any }).selectedVariation.barcodeId)}&code=Code128&translate-esc=false`,
                          `${selectedProduct.name} - ${(selectedProduct as Product & { selectedVariation?: any }).selectedVariation.combinationName}`,
                          (selectedProduct as Product & { selectedVariation?: any }).selectedVariation.sellingPrice ?? 0
                        )}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Print Barcode
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500">Barcode not available for this variation</p>
                  )
                ) : (
                  // Show all variations' barcodes
                  <div className="space-y-6">
                    {selectedProduct.variationCombinations.map((variation) => (
                      <div key={variation._id} className="mb-4">
                        {variation.barcodeId ? (
                          <>
                            <img
                              src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(variation.barcodeId)}&code=Code128&translate-esc=false`}
                              alt="Barcode"
                              className="mx-auto mb-2"
                              style={{ width: '200px', height: '80px' }}
                            />
                            <p className="text-sm text-gray-600 mb-2">
                              {selectedProduct.name} - {variation.combinationName} <br />
                              <span className="font-semibold">LKR {variation.sellingPrice?.toFixed(2) ?? '-'}</span>
                            </p>
                            <button
                              onClick={() => printBarcode(
                                `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(variation.barcodeId)}&code=Code128&translate-esc=false`,
                                `${selectedProduct.name} - ${variation.combinationName}`,
                                variation.sellingPrice ?? 0
                              )}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Print Barcode
                            </button>
                          </>
                        ) : (
                          <p className="text-gray-500">Barcode not available for {variation.combinationName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // No variations: show product barcode
                selectedProduct.barcodeId ? (
                  <>
                    <img
                      src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(selectedProduct.barcodeId)}&code=Code128&translate-esc=false`}
                      alt="Barcode"
                      className="mx-auto mb-4"
                      style={{ width: '200px', height: '80px' }}
                    />
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedProduct.name} <br />
                      <span className="font-semibold">LKR {selectedProduct.sellingPrice.toFixed(2)}</span>
                    </p>
                    <button
                      onClick={() => printBarcode(
                        `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(selectedProduct.barcodeId)}&code=Code128&translate-esc=false`,
                        selectedProduct.name,
                        selectedProduct.sellingPrice
                      )}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Print Barcode
                    </button>
                  </>
                ) : (
                  <p className="text-gray-500">Barcode not available</p>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;