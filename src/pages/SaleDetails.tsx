import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { 
  ArrowLeft, 
  Receipt, 
  User, 
  Calendar,
  DollarSign,
  Package,
  Printer
} from 'lucide-react';
import api from '../config/api';
import { generateReceiptHTML } from "../utils/receipt";

interface SaleDetails {
  _id: string;
  invoiceNumber: string;
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    discountType: 'fixed' | 'percentage';
    totalPrice: number;
    variationDetails?: {
      combinationName: string;
    };
  }>;
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
  }>;
  status: string;
  cashierName: string;
  notes?: string;
  createdAt: string;
}

const SaleDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useNotification();
  const [sale, setSale] = useState<SaleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadSaleDetails();
    }
    loadStoreSettings();
  }, [id]);

  const loadSaleDetails = async () => {
    try {
      const response = await api.get(`/api/sales/${id}`);
      setSale(response.data.sale);
    } catch (err) {
      error('Failed to load sale details');
      navigate('/sales');
    } finally {
      setLoading(false);
    }
  };

  const loadStoreSettings = async () => {
    try {
      const response = await api.get("/api/settings/");
      setStoreSettings(response.data.settings);
    } catch (err) {
      // Optionally handle error
    }
  };

  const printReceipt = () => {
    if (!sale) return;
    const receiptHTML = generateReceiptHTML(sale, storeSettings);
    // Save current body
    const originalBody = document.body.innerHTML;
    // Replace body with receipt
    document.body.innerHTML = receiptHTML;
    // Wait for logo image to load before printing
    const logoUrl = storeSettings && storeSettings.logo ? storeSettings.logo : null;
    const afterPrint = () => {
      document.body.innerHTML = originalBody;
      window.removeEventListener('afterprint', afterPrint);
    };
    window.addEventListener('afterprint', afterPrint);
    if (logoUrl) {
      // Wait for logo to load before printing
      const img = document.querySelector('img.logo') as HTMLImageElement | null;
      if (img) {
        img.onload = () => {
          window.print();
        };
        img.onerror = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sale not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/sales')}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Sales
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sale Details</h1>
            <p className="text-gray-600">{sale.invoiceNumber}</p>
          </div>
        </div>
        <button
          onClick={printReceipt}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Printer className="w-5 h-5 mr-2" />
          Print Receipt
        </button>
      </div>

      {/* Sale Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Sale Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sale Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Invoice Number</label>
                <p className="text-sm text-gray-900">{sale.invoiceNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                  sale.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Date & Time</label>
                <p className="text-sm text-gray-900">{new Date(sale.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Cashier</label>
                <p className="text-sm text-gray-900">{sale.cashierName}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {sale.customerInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{sale.customerInfo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm text-gray-900">{sale.customerInfo.phone}</p>
                </div>
                {sale.customerInfo.email && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{sale.customerInfo.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.items.map((item, index) => (
                    <tr key={index} className={item.quantity < 0 ? 'bg-orange-50' : ''}>
                      <td className="px-4 py-2">
                        <div>
                          <div className="flex items-center gap-2">
                            {item.quantity < 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-200 text-orange-800">
                                RETURN
                              </span>
                            )}
                            <p className={`text-sm font-medium ${item.quantity < 0 ? 'text-orange-900' : 'text-gray-900'}`}>
                              {item.productName}
                              {item.variationDetails && item.variationDetails.combinationName
                                ? ` - ${item.variationDetails.combinationName}`
                                : ""}
                            </p>
                          </div>
                          <p className={`text-sm mt-1 ${item.quantity < 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                            SKU: {item.sku}
                          </p>
                        </div>
                      </td>
                      <td className={`px-4 py-2 text-sm font-medium ${item.quantity < 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {item.quantity}
                      </td>
                      <td className={`px-4 py-2 text-sm ${item.quantity < 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        LKR {item.unitPrice.toFixed(2)}
                      </td>
                      <td className={`px-4 py-2 text-sm ${item.quantity < 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {item.discount > 0 ? (
                          item.discountType === 'percentage' 
                            ? `${item.discount}%` 
                            : `LKR ${item.discount}`
                        ) : '-'}
                      </td>
                      <td className={`px-4 py-2 text-sm font-medium ${item.quantity < 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        LKR {item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary & Payment */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">LKR {sale.subtotal.toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-LKR {sale.discount.toFixed(2)}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">LKR {sale.tax.toFixed(2)}</span>
                </div>
              )}
              {sale.loyaltyPointsUsed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Loyalty Points:</span>
                  <span className="font-medium text-red-600">-LKR {sale.loyaltyPointsUsed.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>LKR {sale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
            <div className="space-y-3">
              {sale.payments.map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{payment.method}:</span>
                  <span className="font-medium">LKR {payment.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loyalty Points */}
          {sale.loyaltyPointsEarned > 0 && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Loyalty Points</h2>
              <p className="text-blue-800">Earned: {sale.loyaltyPointsEarned} points</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;