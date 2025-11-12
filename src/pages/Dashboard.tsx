import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Banknote,
  Building2,
  TrendingDown,
  RotateCcw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  today: {
    totalSales: number;
    totalOrders: number;
    expenses: number;
    returns: number;
    cashInRegister: number;
  };
  month: {
    totalSales: number;
    totalOrders: number;
  };
  products: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  customers: {
    totalCustomers: number;
    totalLoyaltyPoints: number;
  };
  paymentMethods: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    today: {
      totalSales: 0,
      totalOrders: 0,
      expenses: 0,
      returns: 0,
      cashInRegister: 0
    },
    month: {
      totalSales: 0,
      totalOrders: 0
    },
    products: {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    },
    customers: {
      totalCustomers: 0,
      totalLoyaltyPoints: 0
    },
    paymentMethods: []
  });

  const [topProducts, setTopProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [salesData] = useState([
    { name: 'Mon', sales: 1200, orders: 8 },
    { name: 'Tue', sales: 1900, orders: 12 },
    { name: 'Wed', sales: 800, orders: 5 },
    { name: 'Thu', sales: 1600, orders: 10 },
    { name: 'Fri', sales: 2200, orders: 15 },
    { name: 'Sat', sales: 2800, orders: 18 },
    { name: 'Sun', sales: 2000, orders: 13 }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/api/reports/dashboard');
      setStats(response.data.stats);
      setTopProducts(response.data.topProducts);
      setRecentSales(response.data.recentSales);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-5 h-5 text-white" />;
      case 'card':
        return <CreditCard className="w-5 h-5 text-white" />;
      case 'bank_transfer':
        return <Building2 className="w-5 h-5 text-white" />;
      default:
        return <DollarSign className="w-5 h-5 text-white" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-500';
      case 'card':
        return 'bg-blue-500';
      case 'bank_transfer':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, color, subtitle }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6">
          <div className="h-6 w-1/3 bg-blue-400 rounded mb-2" />
          <div className="h-4 w-1/4 bg-blue-300 rounded" />
        </div>
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-1/3 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-1/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        {/* Payment Methods Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-5 w-1/4 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-6 w-1/3 bg-gray-300 rounded" />
                  <div className="h-4 w-1/4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Monthly Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-1/3 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-1/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="h-5 w-1/3 bg-gray-200 rounded" />
              </div>
              <div className="p-6 space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 w-full bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Quick Actions Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-5 w-1/4 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back 👋, {user?.fullName}!</h1>
            <p className="text-blue-100 mt-1">Here's what's happening with your store today.</p>
          </div>
          <div className="flex items-center space-x-2 text-blue-100">
            <Calendar className="w-5 h-5" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Today's Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <StatCard
          title="Today's Sales"
          value={`LKR ${stats.today.totalSales.toLocaleString()}`}
          subtitle={`${stats.today.totalOrders} orders`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Today's Expenses"
          value={`LKR ${stats.today.expenses.toLocaleString()}`}
          icon={TrendingDown}
          color="bg-red-500"
        />
        <StatCard
          title="Returns Today"
          value={`LKR ${stats.today.returns.toLocaleString()}`}
          icon={RotateCcw}
          color="bg-orange-500"
        />
        <StatCard
          title="Cash in Register"
          value={`LKR ${stats.today.cashInRegister.toLocaleString()}`}
          icon={Banknote}
          color="bg-emerald-500"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.products.lowStockProducts}
          subtitle={`${stats.products.outOfStockProducts} out of stock`}
          icon={Package}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Profit Today"
          value={`LKR ${(stats.today.totalSales - stats.today.expenses).toLocaleString()}`}
          subtitle="(Sales - Expenses)"
          icon={DollarSign}
          color="bg-blue-600"
        />
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.paymentMethods.map((payment) => (
            <div key={payment._id} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className={`p-3 rounded-full ${getPaymentMethodColor(payment._id)} mr-4`}>
                {getPaymentMethodIcon(payment._id)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">{payment._id.replace('_', ' ')}</p>
                <p className="text-lg font-bold text-gray-900">LKR {payment.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{payment.count} transactions</p>
              </div>
            </div>
          ))}
          {stats.paymentMethods.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No payments recorded today
            </div>
          )}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="This Month's Sales"
          value={`LKR ${stats.month.totalSales.toLocaleString()}`}
          subtitle={`${stats.month.totalOrders} orders`}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Products"
          value={stats.products.totalProducts.toLocaleString()}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Customers"
          value={stats.customers.totalCustomers.toLocaleString()}
          subtitle={`${stats.customers.totalLoyaltyPoints} loyalty points`}
          icon={Users}
          color="bg-indigo-500"
        />
      </div>

      {/* Charts Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        {/* Sales Chart */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div> */}

        {/* Orders Chart */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div> */}
      {/* </div> */}

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products (This Month)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.length > 0 ? (
                  topProducts.map((product: any, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.totalQuantity} units</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">LKR {product.totalRevenue.toLocaleString()}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSales.length > 0 ? (
                  recentSales.map((sale: any) => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.customerInfo?.name || 'Walk-in'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">LKR {sale.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(sale.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No recent sales
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            onClick={() => navigate('/pos')}
          >
            <ShoppingCart className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">New Sale</span>
          </button>
          <button
            className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            onClick={() => navigate('/products/new')}
          >
            <Package className="w-6 h-6 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-900">Add Product</span>
          </button>
          <button
            className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            onClick={() => navigate('/customers/new')}
          >
            <Users className="w-6 h-6 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Add Customer</span>
          </button>
          <button
            className="flex items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            onClick={() => navigate('/reports')}
          >
            <TrendingUp className="w-6 h-6 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-900">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;