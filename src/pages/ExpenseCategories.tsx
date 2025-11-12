import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingDown,
  BarChart3,
  Eye,
  Move,
  Palette
} from 'lucide-react';
import api from '../config/api';
import { FaDollarSign, FaChartLine, FaCreditCard, FaReceipt, FaBuilding, FaCar, FaHome, FaUtensils, FaBolt, FaWifi, FaPhone, FaTruck, FaWrench, FaHeart, FaStar, FaGift, FaCoffee, FaBriefcase, FaCalculator, FaFileAlt } from 'react-icons/fa';

interface ExpenseCategory {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  expenseCount: number;
  totalAmount: number;
  createdByName: string;
  createdAt: string;
}

const ExpenseCategories: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#EF4444',
    icon: 'DollarSign',
    sortOrder: 0
  });

  const iconOptions = [
    { name: 'DollarSign', icon: FaDollarSign },
    { name: 'ChartLine', icon: FaChartLine },
    { name: 'CreditCard', icon: FaCreditCard },
    { name: 'Receipt', icon: FaReceipt },
    { name: 'Building', icon: FaBuilding },
    { name: 'Car', icon: FaCar },
    { name: 'Home', icon: FaHome },
    { name: 'Utensils', icon: FaUtensils },
    { name: 'Bolt', icon: FaBolt },
    { name: 'Wifi', icon: FaWifi },
    { name: 'Phone', icon: FaPhone },
    { name: 'Truck', icon: FaTruck },
    { name: 'Wrench', icon: FaWrench },
    { name: 'Heart', icon: FaHeart },
    { name: 'Star', icon: FaStar },
    { name: 'Gift', icon: FaGift },
    { name: 'Coffee', icon: FaCoffee },
    { name: 'Briefcase', icon: FaBriefcase },
    { name: 'Calculator', icon: FaCalculator },
    { name: 'FileAlt', icon: FaFileAlt },
  ];

  const colorOptions = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#6B7280'
  ];

  useEffect(() => {
    loadCategories();
  }, [currentPage, searchTerm]);

  const loadCategories = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/api/expense-categories?${params}`);
      setCategories(response.data.categories || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err) {
      error('Failed to load expense categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/api/expense-categories/${editingCategory._id}`, formData);
        success('Expense category updated successfully');
      } else {
        await api.post('/api/expense-categories', formData);
        success('Expense category created successfully');
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#EF4444',
        icon: 'DollarSign',
        sortOrder: 0
      });
      loadCategories();
    } catch (err: any) {
      error('Failed to save expense category', err.response?.data?.message);
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      sortOrder: category.sortOrder
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense category?')) return;

    try {
      await api.delete(`/api/expense-categories/${categoryId}`);
      success('Expense category deleted successfully');
      loadCategories();
    } catch (err: any) {
      error('Failed to delete expense category', err.response?.data?.message);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = iconOptions.find(opt => opt.name === iconName);
    const IconComponent = iconObj ? iconObj.icon : FaDollarSign;
    return <IconComponent className="w-5 h-5" />;
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
  
        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mr-3"></div>
                  <div>
                    <div className="h-6 w-40 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Categories</h1>
          <p className="text-gray-600 mt-1">Organize your business expenses</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({
                name: '',
                description: '',
                color: '#EF4444',
                icon: 'DollarSign',
                sortOrder: 0
              });
              setShowModal(true);
            }}
            className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense Category
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expense categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div 
                  className="p-3 rounded-lg mr-3"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {getIconComponent(category.icon)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.expenseCount} expenses</p>
                </div>
              </div>
              
              {user?.role === 'admin' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {category.description && (
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-red-600">LKR {category.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order:</span>
                <span className="text-gray-900">{category.sortOrder}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-red-400">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {editingCategory ? 'Edit Expense Category' : 'Add New Expense Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold px-2"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 text-lg">
              {/* Category Name */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                  required
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                />
              </div>
              {/* Color */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-10 h-10 rounded-lg border-4 ${formData.color === color ? 'border-red-500' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {/* Icon */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Icon
                </label>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">
                    {(() => {
                      const iconObj = iconOptions.find(opt => opt.name === formData.icon);
                      const IconComponent = iconObj ? iconObj.icon : FaDollarSign;
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                  </div>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.name} value={opt.name}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Sort Order */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg font-semibold"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategories;