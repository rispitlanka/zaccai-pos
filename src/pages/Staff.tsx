import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck,
  Phone,
  Mail,
  Shield,
  User
} from 'lucide-react';
import api from '../config/api';

interface StaffMember {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'cashier';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  commissionTotal?: number;
  salesCount?: number;
  commissionMonth?: string;
}

const Staff: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [commissionEnabled, setCommissionEnabled] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'cashier' as 'admin' | 'cashier'
  });

  useEffect(() => {
    loadSettings();
    loadStaff();
  }, [searchTerm]);

  const loadSettings = async () => {
    try {
      const response = await api.get('/api/settings/');
      setCommissionEnabled(response.data.settings?.commission?.enabled || false);
    } catch (err) {
      console.error('Failed to load settings');
    }
  };

  const loadStaff = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/api/staff?${params}`);
      setStaff(response.data.staff);
    } catch (err) {
      error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.fullName) {
      error('Please fill in all required fields');
      return;
    }

    if (!editingStaff && !formData.password) {
      error('Password is required for new staff');
      return;
    }

    try {
      if (editingStaff) {
        await api.put(`/api/staff/${editingStaff._id}`, formData);
        success('Staff member updated successfully');
      } else {
        await api.post('/api/staff', formData);
        success('Staff member created successfully');
      }
      
      setShowAddModal(false);
      setEditingStaff(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'cashier'
      });
      loadStaff();
    } catch (err: any) {
      error('Failed to save staff member', err.response?.data?.message);
    }
  };

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      username: staffMember.username,
      email: staffMember.email,
      password: '',
      fullName: staffMember.fullName,
      phone: staffMember.phone || '',
      role: staffMember.role
    });
    setShowAddModal(true);
  };

  const handleDelete = async (staffId: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await api.delete(`/api/staff/${staffId}`);
      success('Staff member deleted successfully');
      loadStaff();
    } catch (err) {
      error('Failed to delete staff member');
    }
  };

  const toggleStatus = async (staffId: string, isActive: boolean) => {
    try {
      await api.patch(`/api/staff/${staffId}/status`, { isActive: !isActive });
      success(`Staff member ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadStaff();
    } catch (err) {
      error('Failed to update staff status');
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  {commissionEnabled && (
                    <th className="px-6 py-3">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                    </th>
                  )}
                  <th className="px-6 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
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
                      <div className="h-5 w-28 bg-gray-200 rounded"></div>
                      <div className="h-4 w-36 bg-gray-200 rounded mt-2"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 w-20 bg-gray-200 rounded"></div>
                    </td>
                    {commissionEnabled && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded mt-1"></div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their access</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setEditingStaff(null);
              setFormData({
                username: '',
                email: '',
                password: '',
                fullName: '',
                phone: '',
                role: 'cashier'
              });
              setShowAddModal(true);
            }}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {commissionEnabled && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission (This Month)
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.fullName}</div>
                        <div className="text-sm text-gray-500">@{member.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.isActive)}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {commissionEnabled && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-semibold text-green-600">
                          LKR {(member.commissionTotal || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.salesCount || 0} sales
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.lastLogin 
                        ? new Date(member.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {user?.role === 'admin' && member._id !== user._id && (
                        <>
                          <button
                            onClick={() => toggleStatus(member._id, member.isActive)}
                            className={`${member.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={member.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Staff Member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Staff Member"
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
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-blue-400">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold px-2"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 text-lg">
              {/* Full Name */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                />
              </div>
              {/* Username */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'cashier' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                >
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {/* Password */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Password {editingStaff ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required={!editingStaff}
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
                >
                  {editingStaff ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;