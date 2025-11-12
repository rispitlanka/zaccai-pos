import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import ProductVariations from './pages/ProductVariations';
import Customers from './pages/Customers';
import CustomerForm from './pages/CustomerForm';
import POS from './pages/POS';
import Sales from './pages/Sales';
import SaleDetails from './pages/SaleDetails';
import Returns from './pages/Returns';
import Expenses from './pages/Expenses';
import ExpenseForm from './pages/ExpenseForm';
import ExpenseCategories from './pages/ExpenseCategories';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Staff from './pages/Staff';
import Layout from './components/Layout';
import Purchases from './pages/Purchases';
import ReturnsList from './pages/ReturnsList';
import './index.css';

// Component to redirect cashiers to POS
const CashierRedirect: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user?.role === 'cashier') {
    return <Navigate to="/pos" replace />;
  }
  
  return children;
};

// Component for root redirect based on role
const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role === 'cashier') {
    return <Navigate to="/pos" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes> 
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <RootRedirect />
                  </ProtectedRoute>
                } />
                
                <Route path="/*" element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={
                          <CashierRedirect>
                            <Dashboard />
                          </CashierRedirect>
                        } />
                        <Route path="/pos" element={<POS />} />
                        <Route path="/products" element={
                          <CashierRedirect>
                            <Products />
                          </CashierRedirect>
                        } />
                        <Route path="/products/new" element={
                          <CashierRedirect>
                            <ProductForm />
                          </CashierRedirect>
                        } />
                        <Route path="/products/edit/:id" element={
                          <CashierRedirect>
                            <ProductForm />
                          </CashierRedirect>
                        } />
                        <Route path="/categories" element={
                          <CashierRedirect>
                            <Categories />
                          </CashierRedirect>
                        } />
                        <Route path="/product-variations" element={
                          <CashierRedirect>
                            <ProductVariations />
                          </CashierRedirect>
                        } />
                        <Route path="/customers" element={
                          <CashierRedirect>
                            <Customers />
                          </CashierRedirect>
                        } />
                        <Route path="/customers/new" element={
                          <CashierRedirect>
                            <CustomerForm />
                          </CashierRedirect>
                        } />
                        <Route path="/customers/edit/:id" element={
                          <CashierRedirect>
                            <CustomerForm />
                          </CashierRedirect>
                        } />
                        <Route path="/customers/:id/purchases" element={
                          <CashierRedirect>
                            <Purchases />
                          </CashierRedirect>
                        } />
                        <Route path="/sales" element={
                          <CashierRedirect>
                            <Sales />
                          </CashierRedirect>
                        } />
                        <Route path="/sales/:id" element={
                          <CashierRedirect>
                            <SaleDetails />
                          </CashierRedirect>
                        } />
                        <Route path="/returns" element={
                          <CashierRedirect>
                            <Returns />
                          </CashierRedirect>
                        } />
                        <Route path="/returns-list" element={
                          <CashierRedirect>
                            <ReturnsList />
                          </CashierRedirect>
                        } />
                        <Route path="/expenses" element={
                          <CashierRedirect>
                            <Expenses />
                          </CashierRedirect>
                        } />
                        <Route path="/expenses/new" element={
                          <CashierRedirect>
                            <ExpenseForm />
                          </CashierRedirect>
                        } />
                        <Route path="/expenses/edit/:id" element={
                          <CashierRedirect>
                            <ExpenseForm />
                          </CashierRedirect>
                        } />
                        <Route path="/expense-categories" element={
                          <CashierRedirect>
                            <ExpenseCategories />
                          </CashierRedirect>
                        } />
                        <Route path="/reports" element={
                          <CashierRedirect>
                            <Reports />
                          </CashierRedirect>
                        } />
                        <Route path="/settings" element={
                          <CashierRedirect>
                            <Settings />
                          </CashierRedirect>
                        } />
                        <Route path="/staff" element={
                          <CashierRedirect>
                            <Staff />
                          </CashierRedirect>
                        } />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;