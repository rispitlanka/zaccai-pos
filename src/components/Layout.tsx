import React, { useState, ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Grid,
  Users, 
  Receipt, 
  RotateCcw,
  PieChart,
  Settings,
  UserCheck,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Tag,
  TrendingDown
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        // handle error if needed
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'POS', href: '/pos', icon: ShoppingCart },
    {
      name: 'Product Management',
      icon: Package,
      subItems: [
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Categories', href: '/categories', icon: Grid },
        { name: 'Product Variations', href: '/product-variations', icon: Tag },
      ],
    },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Sales', href: '/sales', icon: Receipt },
    {
      name: 'Returns',
      icon: RotateCcw,
      subItems: [
        { name: 'Returns', href: '/returns', icon: RotateCcw },
        { name: 'Returns History', href: '/returns-list', icon: Receipt },
      ],
    },
    {
      name: 'Expense Management',
      icon: DollarSign,
      subItems: [
        { name: 'Expenses', href: '/expenses', icon: DollarSign },
        { name: 'Expense Categories', href: '/expense-categories', icon: TrendingDown },
      ],
    },
    { name: 'Reports', href: '/reports', icon: PieChart },
    { name: 'Staff', href: '/staff', icon: UserCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const cashierNavigation = [
    { name: 'POS', href: '/pos', icon: ShoppingCart },
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : cashierNavigation;
  const isPosRoute = location.pathname === '/pos';
  const isCashier = user?.role === 'cashier';

  const renderNavItem = (item: any, isSubItem = false) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    const className = `flex items-center px-${isSubItem ? '8' : '4'} lg:px-${isSubItem ? '8' : '6'} py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

    return item.href ? (
      <Link
        key={item.name}
        to={item.href}
        className={className}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className={`w-5 h-5 mr-3 ${isSubItem ? 'ml-4' : ''}`} />
        {item.name}
      </Link>
    ) : (
      <button
        key={item.name}
        onClick={() => {
          setOpenSection(openSection === item.name ? null : item.name);
        }}
        className={`flex items-center px-4 lg:px-6 py-3 text-sm font-medium transition-colors w-full text-left ${
          item.subItems.some((sub: any) => sub.href === location.pathname) || openSection === item.name
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {item.name}
        {openSection === item.name ? (
          <ChevronDown className="w-4 h-4 ml-auto" />
        ) : (
          <ChevronRight className="w-4 h-4 ml-auto" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar - Hidden for cashiers */}
      {!isCashier && (sidebarOpen || !isPosRoute) && (
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              {settings?.logo ? (
                <img src={settings.logo} alt="Store Logo" className="h-10 object-contain" />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">POS System</h1>
              )}
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="mt-8">
              {navigation.map((item) => (
                <div key={item.name}>
                  {renderNavItem(item)}
                  {'subItems' in item && item.subItems && (
                    <div className="ml-4">
                      {openSection === item.name && (
                        item.subItems.map((subItem: any) => renderNavItem(subItem, true))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar - Hidden for cashiers */}
      {!isCashier && (!isPosRoute || sidebarOpen) && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-white shadow-lg">
            <div className="flex items-center px-6 py-4 border-b">
              {settings?.logo ? (
                <img src={settings.logo} alt="Store Logo" className="h-10 object-contain" />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">POS System</h1>
              )}
            </div>
            <nav className="flex-grow mt-8">
              {navigation.map((item) => (
                <div key={item.name}>
                  {renderNavItem(item)}
                  {'subItems' in item && item.subItems && (
                    <div className="ml-4">
                      {openSection === item.name && (
                        item.subItems.map((subItem: any) => renderNavItem(subItem, true))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={isCashier ? '' : (isPosRoute && !sidebarOpen ? '' : 'lg:pl-64')}>
        {/* Top header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                {!isCashier && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                )}
                {isCashier ? (
                  <div className="flex items-center">
                    {settings?.logo ? (
                      <img src={settings.logo} alt="Store Logo" className="h-8 object-contain mr-3" />
                    ) : (
                      <h2 className="text-lg font-semibold text-gray-900">POS System</h2>
                    )}
                  </div>
                ) : (
                  <h2 className="text-lg font-semibold text-gray-900 ml-2 lg:ml-0">
                    {navigation
                      .flatMap(item => ('subItems' in item && item.subItems) ? [item, ...item.subItems] : item)
                      .find(item => 'href' in item && item.href === location.pathname)?.name || 'Dashboard'}
                  </h2>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.fullName}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      {/* Global Footer */}
      <footer className="w-full text-center py-3 text-xs text-gray-500 bg-transparent">
        System Developed by Rispit (PVT) LTD. Made in Jaffna with <span style={{color:'#e25555'}}>❤️</span>
      </footer>
    </div>
  );
};

export default Layout;