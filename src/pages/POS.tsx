import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useNotification } from "../contexts/NotificationContext";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Scan,
  User,
  CreditCard,
  DollarSign,
  Printer,
  X,
  Edit,
  Pause,
  Play,
  Grid,
  Package,
  Phone,
  Mail,
  MapPin,
  Building2,
  Map,
  Hash,
  Globe,
  Edit3,
} from "lucide-react";
import api from "../config/api";
import { generateReceiptHTML } from "../utils/receipt";

interface Product {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stock: number;
  category: string;
  parentId?: string; // for variations
  hasVariations?: boolean;
  variationCombinations?: Array<any>;
  parentName?: string;
  variationCombinationId?: string;
  variations?: Record<string, string>;
}

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
}

const POS: React.FC = () => {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    clearCart,
    getTotal,
    getSubtotal,
    getTotalDiscount,
  } = useCart();
  const { success, error } = useNotification();

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [billDiscount, setBillDiscount] = useState(0);
  const [billDiscountType, setBillDiscountType] = useState<
    "fixed" | "percentage"
  >("fixed");
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [payments, setPayments] = useState([
    { method: "cash", amount: 0, reference: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [heldOrders, setHeldOrders] = useState<any[]>(() => {
    const stored = localStorage.getItem("heldOrders");
    return stored ? JSON.parse(stored) : [];
  });
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Sri Lanka",
    },
    notes: "",
  });
  const [addCustomerLoading, setAddCustomerLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [variationProduct, setVariationProduct] = useState<any>(null);
  const [returnMode, setReturnMode] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<string>("");

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCustomers();
    loadStoreSettings();
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      loadProducts();
    } else {
      loadProductsByCategory();
    }
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("heldOrders", JSON.stringify(heldOrders));
  }, [heldOrders]);

  const calculateFinalTotal = () => {
    const subtotal = getSubtotal();
    const itemDiscount = getTotalDiscount();
    const billDiscountAmount =
      billDiscountType === "percentage"
        ? (subtotal * billDiscount) / 100
        : billDiscount;
    const loyaltyDiscount = loyaltyPointsUsed;

    return Math.max(
      0,
      subtotal - itemDiscount - billDiscountAmount - loyaltyDiscount
    );
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await api.get("/api/products?limit=50&isActive=true");
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadProductsByCategory = async () => {
    setProductsLoading(true);
    try {
      const response = await api.get(
        `/api/products?category=${selectedCategory}&limit=50&isActive=true`
      );
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Error loading products by category:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get("/api/categories/all");
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get("/api/customers");
      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  const loadStoreSettings = async () => {
    try {
      const response = await api.get("/api/settings/");
      setStoreSettings(response.data.settings);
    } catch (err) {
      console.error("Error loading store settings:", err);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await api.get("/api/staff");
      setStaff(response.data.staff || []);
    } catch (err) {
      console.error("Error loading staff:", err);
    }
  };

  const handleAddProduct = (
    product: Product & {
      parentId?: string;
      parentName?: string;
      variationCombinationId?: string;
      variations?: Record<string, string>;
    }
  ) => {
    const item = {
      id: product._id,
      name: product.name,
      sku: product.sku,
      price: product.sellingPrice,
      stock: product.stock,
      parentId: product.parentId,
      parentName: product.parentName,
      variationCombinationId: product.variationCombinationId,
      variations: product.variations,
    } as any;
    
    if (returnMode) {
      // In return mode, check if item already exists
      const existingItem = items.find(i => i.id === product._id);
      if (existingItem) {
        // Item exists, decrease quantity (make more negative)
        updateQuantity(product._id, existingItem.quantity - 1);
      } else {
        // New item, add it then make negative
        addItem(item);
        // Use setTimeout to ensure state updates properly
        setTimeout(() => updateQuantity(product._id, -1), 10);
      }
    } else {
      // Normal mode, just add item (will increment if exists)
      addItem(item);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem({
      ...item,
      newPrice: item.price,
      newDiscount: item.discount,
      newDiscountType: item.discountType,
    });
    setShowEditItemModal(true);
  };

  const saveItemChanges = () => {
    if (editingItem) {
      updateDiscount(
        editingItem.id,
        editingItem.newDiscount,
        editingItem.newDiscountType
      );
      setShowEditItemModal(false);
      setEditingItem(null);
    }
  };

  const handleScanBarcode = async () => {
    setScanError("");
    if (!barcodeInput.trim()) {
      setScanError("Please enter a barcode.");
      return;
    }
    try {
      const response = await api.get(
        `/api/products/barcode/${barcodeInput.trim()}`
      );
      const foundProduct = response.data.product;

      // Check if barcode matches a variation's barcodeId
      if (
        foundProduct.hasVariations &&
        foundProduct.variationCombinations &&
        foundProduct.variationCombinations.length > 0
      ) {
        const matchedVariation = foundProduct.variationCombinations.find(
          (comb: any) =>
            (comb.barcodeId &&
              comb.barcodeId.toLowerCase() ===
                barcodeInput.trim().toLowerCase()) ||
            (comb.sku &&
              comb.sku.toLowerCase() === barcodeInput.trim().toLowerCase())
        );
        if (matchedVariation) {
          const allowAdd =
            storeSettings?.overrideOutOfStock || matchedVariation.stock > 0;
          if (allowAdd) {
            handleAddProduct({
              _id: matchedVariation._id,
              name: `${foundProduct.name} - ${matchedVariation.combinationName}`,
              sku: matchedVariation.sku,
              sellingPrice: matchedVariation.sellingPrice,
              stock: matchedVariation.stock,
              category: foundProduct.category,
              parentId: foundProduct._id,
              parentName: foundProduct.name,
              variationCombinationId: matchedVariation._id,
              variations: matchedVariation.variations,
            });
          } else {
            error("Product out of stock");
          }
          setShowScanModal(false);
          setBarcodeInput("");
          return; // Do not open modal if variation matched
        }
      }

      // If no variation matched, open modal for selection
      if (
        foundProduct.hasVariations &&
        foundProduct.variationCombinations &&
        foundProduct.variationCombinations.length > 0
      ) {
        setVariationProduct(foundProduct);
        setShowVariationsModal(true);
      } else {
        const allowAdd =
          storeSettings?.overrideOutOfStock || foundProduct.stock > 0;
        if (allowAdd) {
          handleAddProduct(foundProduct);
        } else {
          error("Product out of stock");
        }
        setShowScanModal(false);
        setBarcodeInput("");
      }
    } catch (err) {
      setScanError("Product not found.");
    }
  };

  const holdOrder = () => {
    if (items.length === 0) {
      error("Cart is empty");
      return;
    }

    const orderData = {
      id: Date.now().toString(),
      items: [...items],
      customer: selectedCustomer,
      billDiscount,
      billDiscountType,
      loyaltyPointsUsed,
      timestamp: new Date(),
    };

    setHeldOrders((prev) => [...prev, orderData]);
    clearCart();
    setSelectedCustomer(null);
    setBillDiscount(0);
    setLoyaltyPointsUsed(0);
    success("Order held successfully");
  };

  const resumeOrder = (order: any) => {
    clearCart();
    order.items.forEach((item: any) => {
      addItem(item);
    });
    setSelectedCustomer(order.customer);
    setBillDiscount(order.billDiscount);
    setBillDiscountType(order.billDiscountType);
    setLoyaltyPointsUsed(order.loyaltyPointsUsed);
    setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
    success("Order resumed");
  };

  const finalizeSale = async () => {
    setLoading(true);
    try {
      const totalAmount = calculateFinalTotal();
      
      // Separate returned items and sale items
      const returnedItems = items.filter(item => item.quantity < 0);
      const saleItemsOnly = items.filter(item => item.quantity > 0);
      
      // Map items for payload according to API spec
      const saleItems = items.map((item) => {
        if (item.variationCombinationId) {
          // Convert variations array to object format if needed
          let variationsObj = item.variations;
          if (Array.isArray(item.variations)) {
            variationsObj = item.variations.reduce((acc: any, v: any) => {
              acc[v.variationName] = v.selectedValue;
              return acc;
            }, {});
          }
          
          return {
            product: item.parentId || item.id,
            productName: item.parentName || item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: item.discount,
            discountType: item.discountType,
            totalPrice:
              item.price * item.quantity -
              (item.discountType === "percentage"
                ? (item.price * item.quantity * item.discount) / 100
                : item.discount * item.quantity),
            variationCombinationId: item.variationCombinationId,
            variations: variationsObj,
          };
        } else {
          return {
            product: item.id,
            productName: item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: item.discount,
            discountType: item.discountType,
            totalPrice:
              item.price * item.quantity -
              (item.discountType === "percentage"
                ? (item.price * item.quantity * item.discount) / 100
                : item.discount * item.quantity),
          };
        }
      });

      const saleData: any = {
        items: saleItems,
        customer: selectedCustomer?._id,
        customerInfo: selectedCustomer
          ? {
              name: selectedCustomer.name,
              phone: selectedCustomer.phone,
              email: selectedCustomer.email,
            }
          : undefined,
        subtotal: getSubtotal(),
        discount:
          billDiscountType === "percentage"
            ? (getSubtotal() * billDiscount) / 100
            : billDiscount,
        discountType: billDiscountType,
        loyaltyPointsUsed,
        total: totalAmount,
        payments: payments.filter((p) => p.amount > 0),
        cashier: selectedCashier || undefined,
      };
      // Remove undefined fields
      Object.keys(saleData).forEach(
        (key) => saleData[key] === undefined && delete saleData[key]
      );

      const response = await api.post("/api/sales", saleData);
      
      // If there are returned items, record them in the Returns system
      if (returnedItems.length > 0) {
        try {
          const returnItems = returnedItems.map((item) => {
            const returnItem: any = {
              product: item.variationCombinationId ? (item.parentId || item.id) : item.id,
              productName: item.parentName || item.name,
              sku: item.sku,
              quantity: Math.abs(item.quantity), // Convert to positive for return record
              unitPrice: item.price,
              totalPrice: Math.abs(item.price * item.quantity),
            };
            
            if (item.variationCombinationId) {
              returnItem.variationCombinationId = item.variationCombinationId;
              
              // Convert variations array to object format if needed
              let variationsObj = item.variations;
              if (Array.isArray(item.variations)) {
                variationsObj = item.variations.reduce((acc: any, v: any) => {
                  acc[v.variationName] = v.selectedValue;
                  return acc;
                }, {});
              }
              returnItem.variations = variationsObj;
            }
            
            return returnItem;
          });
          
          // Calculate total refund amount from returned items
          const refundAmount = returnItems.reduce((sum, item) => sum + item.totalPrice, 0);
          
          const returnData = {
            items: returnItems,
            customer: selectedCustomer?._id,
            reason: "Exchange",
            refundAmount: refundAmount,
            refundMethod: payments[0]?.method || "cash",
            relatedSale: response.data.sale._id, // Link to the exchange sale
          };
          
          await api.post("/api/returns", returnData);
        } catch (returnErr) {
          console.error("Failed to record return:", returnErr);
          // Don't fail the whole transaction if return recording fails
        }
      }
      
      success(returnedItems.length > 0 ? "Exchange completed successfully!" : "Sale completed successfully!");
      clearCart();
      setSelectedCustomer(null);
      setBillDiscount(0);
      setLoyaltyPointsUsed(0);
      setPayments([{ method: "cash", amount: 0, reference: "" }]);
      setSelectedCashier("");
      setShowPaymentModal(false);
      setReturnMode(false); // Turn off return mode after transaction
      setHeldOrders((prev) =>
        prev.filter((order) => {
          const sameCustomer =
            (!order.customer && !selectedCustomer) ||
            (order.customer &&
              selectedCustomer &&
              order.customer._id === selectedCustomer._id);
          const sameItems =
            order.items &&
            items &&
            order.items.length === items.length &&
            order.items.every((oi: any, idx: number) => {
              const ci = items[idx];
              return oi.id === ci.id && oi.quantity === ci.quantity;
            });
          return !(sameCustomer && sameItems);
        })
      );
      // Re-fetch products to update stock in UI
      await loadProducts();
      setReceiptData(response.data.sale);
      printReceiptInNewTab(response.data.sale, storeSettings);
    } catch (err: any) {
      error("Sale failed", err.response?.data?.message || "Unknown error");
    } finally {
      setLoading(false);
      setPendingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      error("Cart is empty");
      return;
    }

    // Validate cashier selection when commission is enabled
    if (storeSettings?.commission?.enabled && !selectedCashier) {
      error("Please select a cashier");
      return;
    }

    // Check if there are any negative quantity items (returns)
    const hasReturns = items.some(item => item.quantity < 0);
    const hasPositiveItems = items.some(item => item.quantity > 0);
    
    // Validate: If there are returns, must also have positive items (exchange required)
    if (hasReturns && !hasPositiveItems) {
      error("Returns must be exchanged for another product. Please add items to exchange.");
      return;
    }

    const totalAmount = calculateFinalTotal();
    const paidAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    
    // If total is negative (refund scenario) or zero
    if (totalAmount <= 0) {
      // Auto-set payment to 0 for refund scenarios
      setPayments([{ method: "cash", amount: 0, reference: "" }]);
    }
    
    if (totalAmount > 0 && paidAmount < totalAmount) {
      error("Insufficient payment amount");
      return;
    }
    if (totalAmount > 0 && paidAmount > totalAmount) {
      setBalanceAmount(paidAmount - totalAmount);
      setShowBalanceModal(true);
      setPendingPayment(true);
      return;
    }
    finalizeSale();
  };

  const addPaymentMethod = () => {
    const totalAmount = calculateFinalTotal();
    const paidAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remaining = Math.max(0, totalAmount - paidAmount);
    const allMethods = ["cash", "card", "bank_transfer"];
    const usedMethods = payments.map((p) => p.method);
    const availableMethod =
      allMethods.find((m) => !usedMethods.includes(m)) || "cash";
    setPayments((prev) => [
      ...prev,
      { method: availableMethod, amount: remaining, reference: "" },
    ]);
  };

  const removePaymentMethod = (index: number) => {
    if (payments.length > 1) {
      setPayments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, field: string, value: any) => {
    setPayments((prev) =>
      prev.map((payment, i) => {
        if (i === index) {
          if (field === "amount") {
            // Prevent negative values
            return { ...payment, amount: Math.max(0, Number(value)) };
          }
          return { ...payment, [field]: value };
        }
        return payment;
      })
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone.includes(customerSearchTerm)
  );

  // Loyalty points earned calculation
  const getLoyaltyPointsEarned = () => {
    if (!storeSettings || !storeSettings.loyaltySettings) return 0;
    const { pointsPerUnit, unitAmount } = storeSettings.loyaltySettings;
    const subtotal = getSubtotal();
    if (!pointsPerUnit || !unitAmount || unitAmount <= 0) return 0;
    return Math.floor(subtotal / unitAmount) * pointsPerUnit;
  };

  // Add this function to handle barcode search from the search bar
  const handleSearchBarEnter = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter") return;
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    // First, try to find by SKU in loaded products
    const product = products.find(
      (p) => p.sku.toLowerCase() === trimmed.toLowerCase()
    );
    if (product) {
      if (
        product.hasVariations &&
        product.variationCombinations &&
        product.variationCombinations.length > 0
      ) {
        setVariationProduct(product);
        setShowVariationsModal(true);
      } else {
        const allowAdd = storeSettings?.overrideOutOfStock || product.stock > 0;
        if (allowAdd) {
          handleAddProduct(product);
        } else {
          error("Product out of stock");
        }
      }
      setSearchTerm("");
      return;
    }

    // If not found, try barcode API
    try {
      const response = await api.get(`/api/products/barcode/${trimmed}`);
      const foundProduct = response.data.product;

      // Check if barcode matches a variation's barcodeId
      if (
        foundProduct.hasVariations &&
        foundProduct.variationCombinations &&
        foundProduct.variationCombinations.length > 0
      ) {
        const matchedVariation = foundProduct.variationCombinations.find(
          (comb: any) =>
            (comb.barcodeId &&
              comb.barcodeId.toLowerCase() === trimmed.toLowerCase()) ||
            (comb.sku && comb.sku.toLowerCase() === trimmed.toLowerCase())
        );
        if (matchedVariation) {
          const allowAdd =
            storeSettings?.overrideOutOfStock || matchedVariation.stock > 0;
          if (allowAdd) {
            handleAddProduct({
              _id: matchedVariation._id,
              name: `${foundProduct.name} - ${matchedVariation.combinationName}`,
              sku: matchedVariation.sku,
              sellingPrice: matchedVariation.sellingPrice,
              stock: matchedVariation.stock,
              category: foundProduct.category,
              parentId: foundProduct._id,
              parentName: foundProduct.name,
              variationCombinationId: matchedVariation._id,
              variations: matchedVariation.variations,
            });
          } else {
            error("Product out of stock");
          }
          setSearchTerm("");
          return; // Do not open modal if variation matched
        }
      }

      // If no variation matched, open modal for selection
      if (
        foundProduct.hasVariations &&
        foundProduct.variationCombinations &&
        foundProduct.variationCombinations.length > 0
      ) {
        setVariationProduct(foundProduct);
        setShowVariationsModal(true);
      } else {
        const allowAdd =
          storeSettings?.overrideOutOfStock || foundProduct.stock > 0;
        if (allowAdd) {
          handleAddProduct(foundProduct);
        } else {
          error("Product out of stock");
        }
        setSearchTerm("");
      }
    } catch (err) {
      error("Product not found");
    }
  };

  // Receipt overlay/component
  const printReceiptInNewTab = (sale: any, settings: any) => {
    const receiptHTML = generateReceiptHTML(sale, settings);
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    // Wait for content to load, then print and close
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
    // Fallback in case onload doesn't fire (e.g., some browsers)
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Side - Products and Categories */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchBarEnter}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* <button
              onClick={() => setShowScanModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Scan className="w-5 h-5 mr-2" />
              Scan
            </button> */}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border-b border-gray-200 p-4">
          {categoriesLoading ? (
            <div className="flex space-x-2">
              {/* Simple skeleton loader */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-8 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Grid className="w-4 h-4 inline mr-2" />
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.name
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === category.name
                        ? category.color
                        : undefined,
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productsLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="flex items-center justify-center h-16 bg-gray-100 rounded-lg mb-3">
                      <div className="w-8 h-8 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto" />
                    <div className="h-3 bg-gray-100 rounded mb-2 w-1/2 mx-auto" />
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                      <div className="h-3 w-8 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))
              : filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => {
                      if (
                        product.hasVariations &&
                        product.variationCombinations &&
                        product.variationCombinations.length > 0
                      ) {
                        setVariationProduct(product);
                        setShowVariationsModal(true);
                      } else {
                        const allowAdd =
                          storeSettings?.overrideOutOfStock ||
                          product.stock > 0;
                        if (allowAdd) {
                          handleAddProduct(product);
                        } else {
                          error("Product out of stock");
                        }
                      }
                    }}
                    className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative ${
                      product.stock <= 0 &&
                      !product.hasVariations &&
                      !storeSettings?.overrideOutOfStock
                        ? "opacity-60 pointer-events-none"
                        : "cursor-pointer"
                    }`}
                  >
                    {product.stock <= 0 && !product.hasVariations && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    )}
                    <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg mb-3">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      SKU: {product.sku}
                    </p>
                    {!product.hasVariations && (
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          LKR {product.sellingPrice}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.stock} left
                        </span>
                      </div>
                    )}
                    {product.hasVariations && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Variations
                      </span>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Right Side - Cart and Checkout */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col max-h-screen">
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-900">
              Current Order
            </h2>
            <div className="flex space-x-1">
              {heldOrders.length > 0 && (
                <button
                  className="relative p-1 text-gray-600 hover:text-gray-900"
                  onClick={() => setShowHeldOrdersModal(true)}
                  title="Show Held Orders"
                >
                  <Pause className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {heldOrders.length}
                  </span>
                </button>
              )}
              <button
                onClick={holdOrder}
                disabled={items.length === 0}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                title="Hold Order"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Return Mode Toggle - Only show if enabled in settings */}
          {storeSettings?.enablePOSReturns && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Return Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnMode}
                    onChange={(e) => setReturnMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              {returnMode && (
                <p className="text-xs text-orange-600 mt-1">
                  Click products to return/exchange
                </p>
              )}
            </div>
          )}

          {/* Customer Selection */}
          <div className="mb-2">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="w-full p-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors text-sm"
            >
              {selectedCustomer ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedCustomer.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedCustomer.phone}
                    </p>
                    <p className="text-xs text-blue-600">
                      Points: {selectedCustomer.loyaltyPoints}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  Select Customer
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className={`rounded-lg p-2 ${item.quantity < 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        {item.quantity < 0 && (
                          <span className="text-xs font-bold text-orange-600">RETURN</span>
                        )}
                        <h4 className={`font-medium text-xs line-clamp-1 ${item.quantity < 0 ? 'text-orange-900' : 'text-gray-900'}`}>
                          {item.name}
                        </h4>
                      </div>
                      <p className={`text-xs ${item.quantity < 0 ? 'text-orange-600' : 'text-gray-500'}`}>LKR {item.price}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`w-6 text-center text-sm font-medium ${item.quantity < 0 ? 'text-orange-600' : ''}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={!returnMode && item.quantity >= item.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${item.quantity < 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        LKR{" "}
                        {(
                          item.price * item.quantity -
                          (item.discountType === "percentage"
                            ? (item.price * item.quantity * item.discount) / 100
                            : item.discount * item.quantity)
                        ).toFixed(2)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-xs text-red-600">
                          -
                          {item.discountType === "percentage"
                            ? `${item.discount}%`
                            : `LKR ${item.discount}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary and Checkout */}
        <div className="border-t border-gray-200 p-3 bg-white sticky bottom-0">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                LKR {getSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Item Discount:</span>
              <span className="font-medium text-red-600">
                -LKR {getTotalDiscount().toFixed(2)}
              </span>
            </div>
            {/* Bill Discount */}
            <div className="flex items-center space-x-1">
              <select
                value={billDiscountType}
                onChange={(e) =>
                  setBillDiscountType(e.target.value as "fixed" | "percentage")
                }
                className="text-xs border border-gray-300 rounded px-1 py-1"
              >
                <option value="fixed">LKR</option>
                <option value="percentage">%</option>
              </select>
              <input
                type="number"
                value={billDiscount}
                onChange={(e) => setBillDiscount(Number(e.target.value))}
                className="text-xs border border-gray-300 rounded px-2 py-1 flex-1"
                placeholder="Bill discount"
              />
            </div>
            {selectedCustomer && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Loyalty Points Earned:</span>
                <span className="font-medium text-blue-600">
                  {getLoyaltyPointsEarned()}
                </span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Total:</span>
                <span>LKR {calculateFinalTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={items.length === 0 || getSubtotal() < 0}
            className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={getSubtotal() < 0 ? "Cannot process only returns. Please add items to exchange." : ""}
          >
            Process Payment
          </button>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Customer</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="w-full p-3 mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-semibold"
            >
              + Add New Customer
            </button>

            {/* Customer Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer._id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                    setCustomerSearchTerm("");
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.phone}</div>
                  <div className="text-sm text-blue-600">
                    Points: {customer.loyaltyPoints}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Item</h3>
              <button
                onClick={() => setShowEditItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <p className="text-sm text-gray-900">{editingItem.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (LKR)
                </label>
                <input
                  type="number"
                  value={editingItem.newPrice}
                  onChange={(e) =>
                    setEditingItem((prev: typeof editingItem) => ({
                      ...prev,
                      newPrice: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount
                </label>
                <div className="flex space-x-2">
                  <select
                    value={editingItem.newDiscountType}
                    onChange={(e) =>
                      setEditingItem((prev: typeof editingItem) => ({
                        ...prev,
                        newDiscountType: e.target.value,
                      }))
                    }
                    className="border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="fixed">LKR</option>
                    <option value="percentage">%</option>
                  </select>
                  <input
                    type="number"
                    value={editingItem.newDiscount}
                    onChange={(e) =>
                      setEditingItem((prev: typeof editingItem) => ({
                        ...prev,
                        newDiscount: Number(e.target.value),
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditItemModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveItemChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-green-400">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold px-2"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-bold text-center">
                {calculateFinalTotal() < 0 ? (
                  <span className="text-orange-600">
                    Refund: LKR {Math.abs(calculateFinalTotal()).toFixed(2)}
                  </span>
                ) : (
                  <span>Total: LKR {calculateFinalTotal().toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Cashier Selection (when commission is enabled) */}
            {storeSettings?.commission?.enabled && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Cashier <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCashier}
                  onChange={(e) => setSelectedCashier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Cashier --</option>
                  {staff
                    .filter((s) => s.isActive && (s.role === "admin" || s.role === "cashier"))
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.fullName} ({s.username})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="space-y-6">
              <h4 className="font-semibold text-lg">
                {calculateFinalTotal() < 0 ? 'Refund Method' : 'Payment Methods'}
              </h4>
              {payments.map((payment, index) => {
                // Get all selected methods except for this row
                const selectedMethods = payments
                  .map((p, i) => (i !== index ? p.method : null))
                  .filter(Boolean);
                const paymentOptions = [
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                ].filter(
                  (opt) =>
                    !selectedMethods.includes(opt.value) ||
                    payment.method === opt.value
                );
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={payment.method}
                      onChange={(e) =>
                        updatePayment(index, "method", e.target.value)
                      }
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      {paymentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      value={payment.amount}
                      onChange={(e) =>
                        updatePayment(index, "amount", e.target.value)
                      }
                      className="border border-gray-300 rounded px-3 py-2 flex-1"
                      placeholder="Amount"
                      step="0.01"
                    />
                    {payments.length > 1 && (
                      <button
                        onClick={() => removePaymentMethod(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                onClick={addPaymentMethod}
                className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-lg"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Payment Method
              </button>

              <div className="text-base text-gray-600">
                Total Paid: LKR{" "}
                {payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Complete Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl border-2 border-blue-400">
            <div className="flex flex-col items-center">
              <DollarSign className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Give Change</h3>
              <p className="text-lg mb-4">
                Balance to return:{" "}
                <span className="font-bold text-green-700">
                  LKR {balanceAmount.toFixed(2)}
                </span>
              </p>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  if (pendingPayment) finalizeSale();
                }}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Orders Modal */}
      {showHeldOrdersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-96 overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Held Orders</h3>
              <button
                onClick={() => setShowHeldOrdersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {heldOrders.length === 0 ? (
              <div className="text-center text-gray-500">No held orders</div>
            ) : (
              <div className="space-y-3">
                {heldOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.customer?.name || "Walk-in"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.length} items
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        resumeOrder(order);
                        setShowHeldOrdersModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Play className="w-4 h-4 mr-1" /> Resume
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-lg relative">
            <button
              onClick={() => {
                setShowScanModal(false);
                setBarcodeInput("");
                setScanError("");
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">Scan Barcode</h2>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Enter or scan barcode"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScanBarcode();
              }}
            />
            {scanError && (
              <div className="text-red-600 text-sm mb-2 text-center">
                {scanError}
              </div>
            )}
            <button
              onClick={handleScanBarcode}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Scan
            </button>
          </div>
        </div>
      )}

      {/* Variations Modal */}
      {showVariationsModal && variationProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-10 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-blue-400">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Select Variation</h3>
              <button
                onClick={() => setShowVariationsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold px-2"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {variationProduct.variationCombinations.map((comb: any) => (
                <div
                  key={comb._id}
                  className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow relative flex flex-col items-start ${
                    comb.stock <= 0 && !storeSettings?.overrideOutOfStock
                      ? "opacity-60 pointer-events-none"
                      : "cursor-pointer"
                  }`}
                  onClick={() => {
                    const allowAdd =
                      storeSettings?.overrideOutOfStock || comb.stock > 0;
                    if (allowAdd) {
                      handleAddProduct({
                        _id: comb._id,
                        name: `${variationProduct.name} - ${comb.combinationName}`,
                        sku: comb.sku,
                        sellingPrice: comb.sellingPrice,
                        stock: comb.stock,
                        category: variationProduct.category,
                        parentId: variationProduct._id,
                        parentName: variationProduct.name,
                        variationCombinationId: comb._id,
                        variations: comb.variations,
                      });
                      setShowVariationsModal(false);
                    } else {
                      error("Product out of stock");
                    }
                  }}
                >
                  <div className="flex items-center justify-center h-16 w-full bg-gray-50 rounded-lg mb-3">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="font-medium text-gray-900 text-base mb-1 line-clamp-2">
                    {variationProduct.name} - {comb.combinationName}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    SKU: {comb.sku}
                  </div>
                  <div className="flex justify-between items-center w-full mb-2">
                    <span className="text-lg font-bold text-green-600">
                      LKR {comb.sellingPrice}
                    </span>
                    <span className="text-xs text-gray-500">
                      {comb.stock} left
                    </span>
                  </div>
                  {comb.stock <= 0 && (
                    <div className="text-xs text-red-600 font-bold mt-2">
                      Out of Stock
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Customer</h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newCustomer.name || !newCustomer.phone) {
                  error("Please fill in required fields");
                  return;
                }
                setAddCustomerLoading(true);
                try {
                  const res = await api.post("/api/customers", newCustomer);
                  setCustomers((prev) => [...prev, res.data.customer]);
                  setSelectedCustomer(res.data.customer);
                  setShowAddCustomerModal(false);
                  setShowCustomerModal(false);
                  setNewCustomer({
                    name: "",
                    phone: "",
                    email: "",
                    address: {
                      street: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "Sri Lanka",
                    },
                    notes: "",
                  });
                  success("Customer added");
                } catch (err: any) {
                  error("Failed to add customer", err.response?.data?.message);
                } finally {
                  setAddCustomerLoading(false);
                }
              }}
              className="space-y-4"
            >
              {/* Name */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <User className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Phone */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Phone className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Email */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Street Address */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <MapPin className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={newCustomer.address.street}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value },
                    }))
                  }
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City"
                    value={newCustomer.address.city}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Map className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="State"
                    value={newCustomer.address.state}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value },
                      }))
                    }
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={newCustomer.address.zipCode}
                    onChange={(e) =>
                      setNewCustomer((prev) => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value },
                      }))
                    }
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Country */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Globe className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={newCustomer.address.country}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value },
                    }))
                  }
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Notes */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Edit3 className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCustomerLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {addCustomerLoading ? "Adding..." : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
