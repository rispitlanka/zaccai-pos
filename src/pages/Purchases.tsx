import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import {
  User,
  Search,
  Calendar,
  Receipt,
  DollarSign,
  Filter,
  X as XIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';

interface SaleItem {
  product: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: string;
  totalPrice: number;
  _id: string;
  hasVariations: boolean;
  variationDetails?: {
    combinationName: string;
  };
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: string;
  tax: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  payments: any[];
  status: string;
  cashierName: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'partial', label: 'Partial' },
  { value: 'refunded', label: 'Refunded' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" />Completed</span>;
    case 'partial':
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800"><AlertCircle className="w-4 h-4 mr-1" />Partial</span>;
    case 'refunded':
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800"><RefreshCcw className="w-4 h-4 mr-1" />Refunded</span>;
    default:
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">Unknown</span>;
  }
};

const Purchases: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 1 });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerName, setCustomerName] = useState<string>('');

  useEffect(() => {
    fetchCustomer();
    fetchSales();
    // eslint-disable-next-line
  }, [pagination.page, startDate, endDate, invoiceSearch, statusFilter, id]);

  const fetchCustomer = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/api/customers/${id}`);
      setCustomerName(response.data.customer?.name || '');
    } catch (err) {
      setCustomerName('');
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        customer: id || '',
      });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (invoiceSearch) params.append('search', invoiceSearch);
      if (statusFilter) params.append('status', statusFilter);
      const response = await api.get(`/api/sales?${params}`);
      setSales(response.data.sales);
      setPagination(response.data.pagination);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'startDate') setStartDate(e.target.value);
    else setEndDate(e.target.value);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setInvoiceSearch('');
    setStatusFilter('');
    setPagination(p => ({ ...p, page: 1 }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Card */}
      <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-2">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mr-6">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Receipt className="w-6 h-6 mr-2 text-blue-500" /> Customer Purchases
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <FileText className="w-4 h-4 mr-1 text-gray-400" />
            Purchases for <span className="font-semibold text-blue-700 ml-1">{customerName}</span>
          </p>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => navigate('/customers')}
          className="ml-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <XIcon className="w-4 h-4 mr-1" /> Back
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={invoiceSearch}
              onChange={e => { setInvoiceSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleDateChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={handleDateChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" /> Clear Filters
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Receipt className="inline w-4 h-4 mr-1 text-blue-500" /> Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Calendar className="inline w-4 h-4 mr-1 text-blue-500" /> Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <DollarSign className="inline w-4 h-4 mr-1 text-blue-500" /> Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Loading purchases...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No purchases found for this customer.
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale._id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100 font-semibold text-blue-900">
                      <span className="flex items-center"><Receipt className="w-4 h-4 mr-1 text-blue-400" />{sale.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400" />{new Date(sale.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 font-semibold">
                      <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1 text-green-500" />LKR {sale.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <ul className="list-disc pl-4">
                        {sale.items.map(item => (
                          <li key={item._id} className="text-gray-700">
                            {item.productName}
                            {item.hasVariations && item.variationDetails?.combinationName && (
                              <span className="ml-2 text-xs text-blue-500">
                                ({item.variationDetails.combinationName})
                              </span>
                            )}
                            <span className="text-xs text-gray-400"> x {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 px-4 pb-4">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-50 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border rounded disabled:opacity-50 bg-gray-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases; 