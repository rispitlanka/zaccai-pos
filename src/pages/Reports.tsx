import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  X,
} from "lucide-react";
import api from "../config/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState("7");
  const [reportType, setReportType] = useState("sales");

  // Daily Sales Report modal state
  const [showDailySalesModal, setShowDailySalesModal] = useState(false);
  const [dailySalesLoading, setDailySalesLoading] = useState(false);
  const [dailySalesError, setDailySalesError] = useState<string | null>(null);
  const [dailySales, setDailySales] = useState<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
  } | null>(null);

  // Inventory Report modal state
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventorySummary, setInventorySummary] = useState<{
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  } | null>(null);
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);

  // Customer Report modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSummary, setCustomerSummary] = useState<{
    totalCustomers: number;
    totalLoyaltyPoints: number;
    totalPurchaseValue: number;
    averagePurchaseValue: number;
  } | null>(null);
  const [customerList, setCustomerList] = useState<any[]>([]);

  // Expense Report modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [expenseSummary, setExpenseSummary] = useState<{
    totalExpenses: number;
    totalCount: number;
    averageExpense: number;
  } | null>(null);
  const [expenseCategoryBreakdown, setExpenseCategoryBreakdown] = useState<any[]>([]);
  const [expenseList, setExpenseList] = useState<any[]>([]);

  // Staff Commission Report modal state
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionError, setCommissionError] = useState<string | null>(null);
  const [commissionData, setCommissionData] = useState<{
    summary: any[];
    sales: any[];
  } | null>(null);
  const [commissionMonth, setCommissionMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [commissionEnabled, setCommissionEnabled] = useState(false);

  // Mock data - in real app, this would come from API
  const salesData = [
    { name: "Mon", sales: 12000, orders: 8 },
    { name: "Tue", sales: 19000, orders: 12 },
    { name: "Wed", sales: 8000, orders: 5 },
    { name: "Thu", sales: 16000, orders: 10 },
    { name: "Fri", sales: 22000, orders: 15 },
    { name: "Sat", sales: 28000, orders: 18 },
    { name: "Sun", sales: 20000, orders: 13 },
  ];

  const productData = [
    { name: "Laptops", value: 35, color: "#3B82F6" },
    { name: "Phones", value: 25, color: "#10B981" },
    { name: "Accessories", value: 20, color: "#F59E0B" },
    { name: "Tablets", value: 15, color: "#EF4444" },
    { name: "Others", value: 5, color: "#8B5CF6" },
  ];

  const topProducts = [
    { name: "MacBook Pro", sales: 45, revenue: 135000 },
    { name: "iPhone 14", sales: 32, revenue: 96000 },
    { name: "AirPods Pro", sales: 28, revenue: 42000 },
    { name: "iPad Air", sales: 22, revenue: 66000 },
    { name: "Apple Watch", sales: 18, revenue: 54000 },
  ];

  const expenseData = [
    { category: "Rent", amount: 25000 },
    { category: "Utilities", amount: 8000 },
    { category: "Supplies", amount: 12000 },
    { category: "Marketing", amount: 15000 },
    { category: "Other", amount: 5000 },
  ];

  const fetchDailySalesReport = async () => {
    setShowDailySalesModal(true);
    setDailySalesLoading(true);
    setDailySalesError(null);
    setDailySales(null);
    try {
      const res = await api.get("/api/reports/sales");
      if (res.data && res.data.success && res.data.summary) {
        setDailySales({
          totalSales: res.data.summary.totalRevenue,
          totalOrders: res.data.summary.totalOrders,
          averageOrderValue: res.data.summary.averageOrderValue,
        });
      } else {
        setDailySalesError("No data available");
      }
    } catch (err: any) {
      setDailySalesError("Failed to fetch daily sales report");
    } finally {
      setDailySalesLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    setShowInventoryModal(true);
    setInventoryLoading(true);
    setInventoryError(null);
    setInventorySummary(null);
    setInventoryProducts([]);
    try {
      const res = await api.get("/api/reports/inventory");
      if (
        res.data &&
        res.data.success &&
        res.data.summary &&
        res.data.products
      ) {
        setInventorySummary({
          totalProducts: res.data.summary.totalProducts,
          totalValue: res.data.summary.totalValue,
          lowStockItems: res.data.summary.lowStockItems,
          outOfStockItems: res.data.summary.outOfStockItems,
        });
        setInventoryProducts(res.data.products);
      } else {
        setInventoryError("No data available");
      }
    } catch (err: any) {
      setInventoryError("Failed to fetch inventory report");
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchCustomerReport = async () => {
    setShowCustomerModal(true);
    setCustomerLoading(true);
    setCustomerError(null);
    setCustomerSummary(null);
    setCustomerList([]);
    try {
      const res = await api.get("/api/reports/customers");
      if (
        res.data &&
        res.data.success &&
        res.data.summary &&
        res.data.customers
      ) {
        setCustomerSummary({
          totalCustomers: res.data.summary.totalCustomers,
          totalLoyaltyPoints: res.data.summary.totalLoyaltyPoints,
          totalPurchaseValue: res.data.summary.totalPurchaseValue,
          averagePurchaseValue: res.data.summary.averagePurchaseValue,
        });
        setCustomerList(res.data.customers);
      } else {
        setCustomerError("No data available");
      }
    } catch (err: any) {
      setCustomerError("Failed to fetch customer report");
    } finally {
      setCustomerLoading(false);
    }
  };

  const fetchExpenseReport = async () => {
    setShowExpenseModal(true);
    setExpenseLoading(true);
    setExpenseError(null);
    setExpenseSummary(null);
    setExpenseCategoryBreakdown([]);
    setExpenseList([]);
    try {
      const res = await api.get("/api/reports/expenses");
      if (
        res.data &&
        res.data.success &&
        res.data.summary &&
        res.data.expenses &&
        res.data.categoryBreakdown
      ) {
        setExpenseSummary({
          totalExpenses: res.data.summary.totalExpenses,
          totalCount: res.data.summary.totalCount,
          averageExpense: res.data.summary.averageExpense,
        });
        setExpenseCategoryBreakdown(res.data.categoryBreakdown);
        setExpenseList(res.data.expenses);
      } else {
        setExpenseError("No data available");
      }
    } catch (err: any) {
      setExpenseError("Failed to fetch expense report");
    } finally {
      setExpenseLoading(false);
    }
  };

  // Check if commission is enabled
  React.useEffect(() => {
    const checkCommissionEnabled = async () => {
      try {
        const res = await api.get("/api/settings/");
        setCommissionEnabled(res.data.settings?.commission?.enabled || false);
      } catch (err) {
        console.error("Failed to load settings");
      }
    };
    checkCommissionEnabled();
  }, []);

  const fetchCommissionReport = async () => {
    setShowCommissionModal(true);
    setCommissionLoading(true);
    setCommissionError(null);
    setCommissionData(null);
    try {
      const res = await api.get(`/api/reports/staffCommissions?month=${commissionMonth}`);
      if (res.data && res.data.success) {
        setCommissionData({
          summary: res.data.summary || [],
          sales: res.data.sales || [],
        });
      } else {
        setCommissionError("No data available");
      }
    } catch (err: any) {
      setCommissionError("Failed to fetch commission report");
    } finally {
      setCommissionLoading(false);
    }
  };

  const downloadCommissionCSV = async () => {
    try {
      const res = await api.get(`/api/reports/staffCommissions?month=${commissionMonth}&format=csv`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commission-report-${commissionMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV');
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
    color,
  }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  changeType === "increase" ? "text-green-500" : "text-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Utility: CSV export
  const exportToCSV = (filename: string, rows: any[], headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => headers.map(h => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Utility: PDF export (using autotable)
  const exportToPDF = (filename: string, title: string, headers: string[], rows: any[]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 10, 15);
    autoTable(doc, {
      head: [headers],
      body: rows.map(row => headers.map(h => String(row[h] ?? ""))),
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }, // blue header
      margin: { left: 10, right: 10 },
      tableWidth: 'auto',
    });
    doc.save(filename);
  };

  // Inventory Export Handlers
  const handleInventoryCSV = () => {
    if (!inventoryProducts.length) return;
    exportToCSV(
      "inventory_report.csv",
      inventoryProducts,
      ["name", "sku", "stock", "minStock", "category", "unit"]
    );
  };

  const handleInventoryPDF = () => {
    if (!inventoryProducts.length) return;
    exportToPDF(
      "inventory_report.pdf",
      "Inventory Report",
      ["Product", "SKU", "Stock", "Min Stock", "Category", "Unit"],
      inventoryProducts.map(p => ({
        Product: p.name,
        SKU: p.sku,
        Stock: p.stock,
        "Min Stock": p.minStock,
        Category: p.category,
        Unit: p.unit
      }))
    );
  };

  // Customer Export Handlers
  const handleCustomerCSV = () => {
    if (!customerList.length) return;
    exportToCSV(
      "customer_report.csv",
      customerList,
      ["name", "email", "phone", "loyaltyPoints", "totalPurchases", "lastPurchaseDate"]
    );
  };

  const handleCustomerPDF = () => {
    if (!customerList.length) return;
    exportToPDF(
      "customer_report.pdf",
      "Customer Report",
      ["Name", "Email", "Phone", "Loyalty Points", "Total Purchases", "Last Purchase"],
      customerList.map(c => ({
        Name: c.name,
        Email: c.email,
        Phone: c.phone,
        "Loyalty Points": c.loyaltyPoints,
        "Total Purchases": c.totalPurchases,
        "Last Purchase": c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString() : "-"
      }))
    );
  };

  // Expense Export Handlers
  const handleExpenseCSV = () => {
    if (!expenseList.length) return;
    exportToCSV(
      "expense_report.csv",
      expenseList,
      ["date", "category", "description", "amount", "paymentMethod", "reference", "addedByName", "notes"]
    );
  };

  const handleExpensePDF = () => {
    if (!expenseList.length) return;
    exportToPDF(
      "expense_report.pdf",
      "Expense Report",
      ["Date", "Category", "Description", "Amount", "Payment", "Reference", "Added By", "Notes"],
      expenseList.map(e => ({
        Date: e.date ? new Date(e.date).toLocaleDateString() : "-",
        Category: e.category,
        Description: e.description,
        Amount: e.amount,
        Payment: e.paymentMethod,
        Reference: e.reference || "-",
        "Added By": e.addedByName || "-",
        Notes: e.notes || "-"
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive business insights and analytics
          </p>
        </div>
        {/* <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div> */}
      </div>

      {/* Key Metrics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value="LKR 125,420"
          icon={DollarSign}
          change={12.5}
          changeType="increase"
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value="81"
          icon={Package}
          change={8.2}
          changeType="increase"
          color="bg-blue-500"
        />
        <StatCard
          title="New Customers"
          value="24"
          icon={Users}
          change={15.3}
          changeType="increase"
          color="bg-purple-500"
        />
        <StatCard
          title="Average Order"
          value="LKR 1,549"
          icon={TrendingUp}
          change={-2.1}
          changeType="decrease"
          color="bg-orange-500"
        />
      </div> */}

      {/* Charts Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        {/* Sales Trend */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="sales">Sales Amount</option>
              <option value="orders">Order Count</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={reportType === "sales" ? "sales" : "orders"}
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div> */}

        {/* Product Categories */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div> */}
      {/* </div> */}

      {/* Tables Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        {/* Top Products */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Selling Products
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.sales} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        LKR {product.revenue.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Expenses Breakdown */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Expense Breakdown
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expenseData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="amount" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      {/* </div> */}

      {/* Additional Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            onClick={fetchDailySalesReport}
          >
            <div className="flex items-center mb-2">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium">Daily Sales Report</span>
            </div>
            <p className="text-sm text-gray-600">
              Detailed breakdown of today's sales
            </p>
          </button>

          <button
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            onClick={fetchInventoryReport}
          >
            <div className="flex items-center mb-2">
              <Package className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium">Inventory Report</span>
            </div>
            <p className="text-sm text-gray-600">
              Stock levels and low inventory alerts
            </p>
          </button>

          <button
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            onClick={fetchCustomerReport}
          >
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-medium">Customer Report</span>
            </div>
            <p className="text-sm text-gray-600">
              Customer analytics and loyalty insights
            </p>
          </button>
          <button
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            onClick={fetchExpenseReport}
          >
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium">Expense Report</span>
            </div>
            <p className="text-sm text-gray-600">
              Overview of expenses and financial outflows
            </p>
          </button>

          {commissionEnabled && (
            <button
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              onClick={fetchCommissionReport}
            >
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium">Staff Commission Report</span>
              </div>
              <p className="text-sm text-gray-600">
                Track staff commissions and performance
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Daily Sales Report Modal */}
      {showDailySalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowDailySalesModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Daily Sales Report
            </h2>
            {dailySalesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : dailySalesError ? (
              <div className="text-center text-red-600 py-8">
                {dailySalesError}
              </div>
            ) : dailySales ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Sales:</span>
                  <span className="font-bold text-green-700">
                    LKR {dailySales.totalSales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Orders:</span>
                  <span className="font-bold">{dailySales.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Average Order Value:</span>
                  <span className="font-bold">
                    LKR {dailySales.averageOrderValue.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Report Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowInventoryModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Inventory Report
            </h2>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleInventoryCSV}>Download CSV</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleInventoryPDF}>Download PDF</button>
            </div>
            {inventoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : inventoryError ? (
              <div className="text-center text-red-600 py-8">
                {inventoryError}
              </div>
            ) : inventorySummary ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Total Products</div>
                    <div className="font-bold text-lg">
                      {inventorySummary.totalProducts}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Total Value</div>
                    <div className="font-bold text-lg">
                      LKR {inventorySummary.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Low Stock Items</div>
                    <div className="font-bold text-lg text-orange-600">
                      {inventorySummary.lowStockItems}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Out of Stock</div>
                    <div className="font-bold text-lg text-red-600">
                      {inventorySummary.outOfStockItems}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Product
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          SKU
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Stock
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Min Stock
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Category
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Unit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inventoryProducts.map((product) => (
                        <tr
                          key={product._id}
                          className={
                            product.stock <= product.minStock
                              ? "bg-orange-50"
                              : ""
                          }
                        >
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-3 py-2">{product.sku}</td>
                          <td className="px-3 py-2">{product.stock}</td>
                          <td className="px-3 py-2">{product.minStock}</td>
                          <td className="px-3 py-2">{product.category}</td>
                          <td className="px-3 py-2">{product.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Report Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCustomerModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Report
            </h2>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleCustomerCSV}>Download CSV</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleCustomerPDF}>Download PDF</button>
            </div>
            {customerLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : customerError ? (
              <div className="text-center text-red-600 py-8">
                {customerError}
              </div>
            ) : customerSummary ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Total Customers</div>
                    <div className="font-bold text-lg">
                      {customerSummary.totalCustomers}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">
                      Total Loyalty Points
                    </div>
                    <div className="font-bold text-lg">
                      {customerSummary.totalLoyaltyPoints}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">
                      Total Purchase Value
                    </div>
                    <div className="font-bold text-lg">
                      LKR {customerSummary.totalPurchaseValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">
                      Avg. Purchase Value
                    </div>
                    <div className="font-bold text-lg">
                      LKR{" "}
                      {customerSummary.averagePurchaseValue.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Phone
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Loyalty Points
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Total Purchases
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                          Last Purchase
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customerList.map((customer) => (
                        <tr key={customer._id}>
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-3 py-2">{customer.email || "-"}</td>
                          <td className="px-3 py-2">{customer.phone}</td>
                          <td className="px-3 py-2">
                            {customer.loyaltyPoints}
                          </td>
                          <td className="px-3 py-2">
                            {customer.totalPurchases}
                          </td>
                          <td className="px-3 py-2">
                            {customer.lastPurchaseDate
                              ? new Date(
                                  customer.lastPurchaseDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Report Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowExpenseModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Report</h2>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleExpenseCSV}>Download CSV</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleExpensePDF}>Download PDF</button>
            </div>
            {expenseLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : expenseError ? (
              <div className="text-center text-red-600 py-8">{expenseError}</div>
            ) : expenseSummary ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Total Expenses</div>
                    <div className="font-bold text-lg">LKR {expenseSummary.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Expense Count</div>
                    <div className="font-bold text-lg">{expenseSummary.totalCount}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Average Expense</div>
                    <div className="font-bold text-lg">LKR {expenseSummary.averageExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Category Breakdown</h4>
                  <table className="w-full text-sm mb-2">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Category</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Total Amount</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Count</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenseCategoryBreakdown.map((cat) => (
                        <tr key={cat._id}>
                          <td className="px-3 py-2 font-medium text-gray-900">{cat._id}</td>
                          <td className="px-3 py-2">LKR {cat.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2">{cat.count}</td>
                          <td className="px-3 py-2">LKR {cat.averageAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="overflow-x-auto max-h-64">
                  <h4 className="font-semibold text-gray-800 mb-2">Expense Details</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Category</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Amount</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Payment</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Reference</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Added By</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenseList.map((exp) => (
                        <tr key={exp._id}>
                          <td className="px-3 py-2">{exp.date ? new Date(exp.date).toLocaleDateString() : '-'}</td>
                          <td className="px-3 py-2">{exp.category}</td>
                          <td className="px-3 py-2">{exp.description}</td>
                          <td className="px-3 py-2">LKR {exp.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2">{exp.paymentMethod}</td>
                          <td className="px-3 py-2">{exp.reference || '-'}</td>
                          <td className="px-3 py-2">{exp.addedByName || '-'}</td>
                          <td className="px-3 py-2">{exp.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">No data available</div>
            )}
          </div>
        </div>
      )}

      {/* Staff Commission Report Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCommissionModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Commission Report</h2>
            
            {/* Month Selector */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Month:</label>
                <input
                  type="month"
                  value={commissionMonth}
                  onChange={(e) => setCommissionMonth(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded"
                />
                <button
                  onClick={fetchCommissionReport}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Load
                </button>
              </div>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                onClick={downloadCommissionCSV}
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>

            {commissionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : commissionError ? (
              <div className="text-center text-red-600 py-8">{commissionError}</div>
            ) : commissionData ? (
              <>
                {/* Summary Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Staff Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Staff Member</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Username</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">Total Commission</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">Sales Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {commissionData.summary.map((staff: any) => (
                          <tr key={staff.cashierId}>
                            <td className="px-3 py-2 font-medium text-gray-900">{staff.fullName}</td>
                            <td className="px-3 py-2 text-gray-600">@{staff.username}</td>
                            <td className="px-3 py-2 text-right font-semibold text-green-600">
                              LKR {staff.commissionTotal.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">{staff.salesCount}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-bold">
                        <tr>
                          <td colSpan={2} className="px-3 py-2 text-right">Total:</td>
                          <td className="px-3 py-2 text-right text-green-700">
                            LKR {commissionData.summary.reduce((sum, s) => sum + s.commissionTotal, 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {commissionData.summary.reduce((sum, s) => sum + s.salesCount, 0)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Sales Details Section */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Sale Details</h3>
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Invoice</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Cashier</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">Total</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {commissionData.sales.map((sale: any) => (
                          <tr key={sale.invoiceNumber}>
                            <td className="px-3 py-2 font-medium text-gray-900">{sale.invoiceNumber}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {new Date(sale.createdAt).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-gray-600">{sale.cashierName}</td>
                            <td className="px-3 py-2 text-right">LKR {sale.total.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-green-600">
                              LKR {sale.commissionAmount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">No data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
