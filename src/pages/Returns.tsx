import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Search, 
  RotateCcw,
  Receipt,
  Package,
  DollarSign,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import api from '../config/api';

interface Sale {
  _id: string;
  invoiceNumber: string;
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  items: Array<{
    _id: string;
    product: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variationCombinationId?: string;
    variationDetails?: {
      combinationName: string;
      combinationId: string;
      sku: string;
      stock: number;
      isActive: boolean;
      variations: any;
      variationTypes: any[];
    };
  }>;
  total: number;
  createdAt: string;
  returnedItems?: Array<{
    item: {
      product: string;
      productName: string;
      quantity: number;
      totalPrice: number;
    };
    returnDate: string;
    returnReason: string;
  }>;
}

const Returns: React.FC = () => {
  const { success, error } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [reloadReturnsList, setReloadReturnsList] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) {
      error('Please enter an invoice number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/sales?search=${searchTerm}&limit=1`);
      const sales = response.data.sales;
      
      if (sales.length === 0) {
        error('Sale not found');
        return;
      }

      const sale = sales[0];
      setSelectedSale(sale);
      
      // Initialize return items with available quantities
      const availableItems = sale.items.map((item: any) => {
        const alreadyReturned = sale.returnedItems?.reduce((total: number, returned: any) => {
          // Check if it's the same product and variation combination
          const isSameProduct = returned.item.product === item.product;
          const isSameVariation = !returned.item.variationCombinationId && !item.variationCombinationId || 
                                 returned.item.variationCombinationId === item.variationCombinationId;
          return isSameProduct && isSameVariation ? total + returned.item.quantity : total;
        }, 0) || 0;
        
        return {
          ...item,
          availableQuantity: item.quantity - alreadyReturned,
          returnQuantity: 0,
          returnReason: ''
        };
      }).filter((item: any) => item.availableQuantity > 0);
      
      setReturnItems(availableItems);
    } catch (err: any) {
      error('Failed to find sale', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnQuantityChange = (itemId: string, quantity: number) => {
    setReturnItems(prev =>
      prev.map(item =>
        item._id === itemId 
          ? { ...item, returnQuantity: Math.min(Math.max(0, quantity), item.availableQuantity) } 
          : item
      )
    );
  };

  const handleItemReasonChange = (itemId: string, reason: string) => {
    setReturnItems(prev =>
      prev.map(item =>
        item._id === itemId ? { ...item, returnReason: reason } : item
      )
    );
  };

  const processReturn = async () => {
    const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0);
    
    if (itemsToReturn.length === 0) {
      error('Please select items to return');
      return;
    }

    if (!returnReason) {
      error('Please provide a return reason');
      return;
    }

    setLoading(true);
    try {
      const returnData = {
        saleId: selectedSale!._id,
        items: itemsToReturn.map(item => ({
          productId: item.product,
          variationCombinationId: item.variationCombinationId || null,
          quantity: item.returnQuantity,
          reason: item.returnReason || returnReason
        })),
        returnReason,
        refundMethod
      };

      await api.post('/api/returns', returnData);
      success('Return processed successfully');
      
      // Reset form
      setSelectedSale(null);
      setReturnItems([]);
      setReturnReason('');
      setRefundMethod('cash');
      setSearchTerm('');
      setReloadReturnsList(r => !r);
    } catch (err: any) {
      error('Failed to process return', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateRefundAmount = () => {
    return returnItems.reduce((total, item) => {
      const refundPerUnit = item.totalPrice / item.quantity;
      return total + (refundPerUnit * item.returnQuantity);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns & Refunds</h1>
        <p className="text-gray-600 mt-1">Process product returns and issue refunds</p>
      </div>

      {/* Search Sale */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Sale</h2>
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Sale Details */}
      {selectedSale && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Receipt className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Sale Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Invoice Number</label>
              <p className="text-sm text-gray-900">{selectedSale.invoiceNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Customer</label>
              <p className="text-sm text-gray-900">{selectedSale.customerInfo?.name || 'Walk-in Customer'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date</label>
              <p className="text-sm text-gray-900">{new Date(selectedSale.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Total Amount</label>
              <p className="text-sm text-gray-900">LKR {selectedSale.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Already Returned Items */}
          {selectedSale.returnedItems && selectedSale.returnedItems.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="text-sm font-medium text-yellow-800">Previously Returned Items</h3>
              </div>
              <div className="space-y-1">
                {selectedSale.returnedItems.map((returned, index) => (
                  <p key={index} className="text-sm text-yellow-700">
                    {returned.item.productName} - Qty: {returned.item.quantity} - 
                    LKR {returned.item.totalPrice.toFixed(2)} - 
                    {new Date(returned.returnDate).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Items for Return */}
          {returnItems.length > 0 ? (
            <>
              <h3 className="text-md font-semibold text-gray-900 mb-4">Select Items to Return</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Return Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Refund Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {returnItems.map((item) => (
                      <tr key={item._id}>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.productName}
                                {item.variationDetails && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({item.variationDetails.combinationName})
                                  </span>
                                )}
                              </span>
                              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.availableQuantity}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            max={item.availableQuantity}
                            value={item.returnQuantity}
                            onChange={(e) => handleReturnQuantityChange(item._id, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">LKR {item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          LKR {((item.totalPrice / item.quantity) * item.returnQuantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.returnReason}
                            onChange={(e) => handleItemReasonChange(item._id, e.target.value)}
                            placeholder="Item reason"
                            className="w-32 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Return Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    General Return Reason *
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reason for return..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Method *
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card Refund</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Total Return Amount */}
              <div className="p-4 bg-green-50 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Refund Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    LKR {calculateRefundAmount().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setSelectedSale(null);
                    setReturnItems([]);
                    setReturnReason('');
                    setRefundMethod('cash');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processReturn}
                  disabled={loading || calculateRefundAmount() === 0}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Process Return'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">All items from this sale have already been returned.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Returns;