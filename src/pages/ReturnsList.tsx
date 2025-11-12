import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import {
  Search,
  Eye,
  Receipt,
  Calendar,
  User,
  DollarSign,
  Filter,
  RotateCcw,
  X
} from 'lucide-react';
import api from '../config/api';

interface ReturnItem {
  product: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  totalPrice: number;
  _id: string;
  variationDetails?: {
    combinationName: string;
    combinationId: string;
    sku: string;
    stock: number;
    isActive: boolean;
    variations: any;
    variationTypes: any[];
  };
}

interface ReturnedItemDetail {
  item: ReturnItem;
  returnDate: string;
  returnReason: string;
  _id: string;
}

interface Return {
  _id: string;
  invoiceNumber: string;
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  items: ReturnItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  tax: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  payments: Array<{
    method: string;
    amount: number;
    reference?: string;
    _id: string;
  }>;
  status: string;
  cashier?: {
    _id: string;
    username: string;
    fullName: string;
  };
  cashierName: string;
  returnedItems: ReturnedItemDetail[];
  createdAt: string;
  updatedAt: string;
}

interface ReturnsListProps {
  reload?: boolean;
}

const ReturnsList: React.FC<ReturnsListProps> = ({ reload }) => {
  const { error } = useNotification();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line
  }, [currentPage, searchTerm, reload]);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });
      const response = await api.get(`/api/returns?${params}`);
      setReturns(response.data.returns);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'refunded':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundAmount = (ret: Return) => {
    if (!ret.returnedItems || ret.returnedItems.length === 0) return 0;
    return ret.returnedItems.reduce((sum, r) => sum + (r.item.totalPrice || 0), 0);
  };

  const openModal = (returnData: Return) => {
    setSelectedReturn(returnData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReturn(null);
    setIsModalOpen(false);
  };

  // if (loading) {
  //   return (
      
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Returns</h1>
          <p className="text-gray-600 mt-1">View and manage sales returns</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returns.map((ret) => (
                <tr key={ret._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{ret.invoiceNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ret.customerInfo ? (
                        <div>
                          <div className="font-medium">{ret.customerInfo.name}</div>
                          <div className="text-gray-500">{ret.customerInfo.phone}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Walk-in Customer</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ret.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">LKR {getRefundAmount(ret).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ret.status)}`}>
                      {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{ret.cashierName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(ret.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openModal(ret)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
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

      {/* Modal */}
      {isModalOpen && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Return Details - {selectedReturn.invoiceNumber}</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Customer Information */}
              {selectedReturn.customerInfo && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{selectedReturn.customerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedReturn.customerInfo.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedReturn.customerInfo.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Returned Items</h3>
                <div className="space-y-4">
                  {selectedReturn.returnedItems.map((returnedItem) => (
                    <div key={returnedItem._id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {returnedItem.item.productName}
                          {returnedItem.item.variationDetails && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({returnedItem.item.variationDetails.combinationName})
                            </span>
                          )}
                        </p>
                        <span className="text-sm font-medium text-red-600">
                          LKR {returnedItem.item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">SKU:</span> {returnedItem.item.sku}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {returnedItem.item.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Unit Price:</span> LKR {returnedItem.item.unitPrice.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Return Date:</span> {new Date(returnedItem.returnDate).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Reason:</span>
                        <p className="text-sm text-gray-600 mt-1">{returnedItem.returnReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Financial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="font-medium">LKR {selectedReturn.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Discount</p>
                    <p className="font-medium">
                      {selectedReturn.discountType === 'percentage'
                        ? `${selectedReturn.discount}%`
                        : `LKR ${selectedReturn.discount.toFixed(2)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="font-medium">LKR {selectedReturn.tax.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-medium">LKR {selectedReturn.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loyalty Points Used</p>
                    <p className="font-medium">{selectedReturn.loyaltyPointsUsed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loyalty Points Earned</p>
                    <p className="font-medium">{selectedReturn.loyaltyPointsEarned}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
                {selectedReturn.payments.map((payment) => (
                  <div key={payment._id} className="mb-2">
                    <p className="text-sm text-gray-600">Method: {payment.method}</p>
                    <p className="font-medium">Amount: LKR {payment.amount.toFixed(2)}</p>
                    {payment.reference && <p className="text-sm text-gray-600">Reference: {payment.reference}</p>}
                  </div>
                ))}
              </div>

              {/* Other Details */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Other Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{selectedReturn.status.charAt(0).toUpperCase() + selectedReturn.status.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cashier</p>
                    <p className="font-medium">{selectedReturn.cashierName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium">{new Date(selectedReturn.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Updated At</p>
                    <p className="font-medium">{new Date(selectedReturn.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsList;