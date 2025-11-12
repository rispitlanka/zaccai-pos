import React, { useState, useRef, useEffect } from "react";
import { useNotification } from "../contexts/NotificationContext";
import {
  Store,
  Receipt,
  Star,
  Save,
  Upload,
  Eye,
  Download,
  Printer,
  User,
} from "lucide-react";
import api from "../config/api";

const Settings: React.FC = () => {
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    storePhone: "",
    storeEmail: "",
    currency: "LKR",
    logo: "",
    overrideOutOfStock: false,
    enablePOSReturns: false,
  });

  const [receiptSettings, setReceiptSettings] = useState({
    headerText: "",
    footerText: "",
    showLogo: true,
    showStoreInfo: true,
    showCustomerInfo: true,
    showItemDetails: true,
    showTaxBreakdown: true,
    paperSize: "58mm",
    fontSize: "small",
    alignment: "center",
    borderStyle: "dashed",
    includeBarcode: false,
    includeQRCode: true,
    customCSS: "",
  });

  const [loyaltySettings, setLoyaltySettings] = useState({
    pointsPerUnit: 1,
    unitAmount: 100,
    redemptionRate: 1,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlert: true,
    dailyReports: false,
  });

  const [commissionSettings, setCommissionSettings] = useState({
    enabled: false,
    type: "percentage", // "percentage" or "fixed"
    value: 0,
  });

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileEdit, setProfileEdit] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);

  useEffect(() => {
    // Fetch settings from backend
    const fetchSettings = async () => {
      try {
        const res = await api.get("/api/settings/");
        if (res.data && res.data.settings) {
          const s = res.data.settings;
          setStoreSettings({
            storeName: s.storeName || "",
            storeAddress: s.storeAddress || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            storePhone: s.storePhone || "",
            storeEmail: s.storeEmail || "",
            currency: s.currency || "LKR",
            logo: s.logo || "",
            overrideOutOfStock: s.overrideOutOfStock || false,
            enablePOSReturns: s.enablePOSReturns || false,
          });
          setReceiptSettings((prev) => ({
            ...prev,
            ...s.receiptSettings,
            headerText: s.receiptSettings?.header || "",
            footerText: s.receiptSettings?.footer || "",
            paperSize: s.receiptSettings?.paperSize || "58mm",
            showLogo:
              s.receiptSettings?.showLogo !== undefined
                ? s.receiptSettings.showLogo
                : true,
          }));
          setLoyaltySettings(
            s.loyaltySettings || {
              pointsPerUnit: 1,
              unitAmount: 100,
              redemptionRate: 1,
            }
          );
          setNotificationSettings(
            s.notifications || { lowStockAlert: true, dailyReports: false }
          );
          setCommissionSettings(
            s.commission || { enabled: false, type: "percentage", value: 0 }
          );
        }
      } catch (err) {
        error("Failed to load settings");
      }
    };
    fetchSettings();
  }, [error]);

  useEffect(() => {
    if (activeTab === "profile") {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get("/api/auth/profile");
      if (res.data && res.data.user) {
        setProfile(res.data.user);
        setProfileEdit({
          fullName: res.data.user.fullName || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
        });
      }
    } catch (err) {
      error("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileEdit({ ...profileEdit, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    setProfileUpdateLoading(true);
    try {
      const res = await api.put("/api/auth/profile", profileEdit);
      if (res.data && res.data.user) {
        setProfile(res.data.user);
        setProfileEditMode(false);
        success("Profile updated successfully");
      }
    } catch (err) {
      error("Failed to update profile");
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      error("Please fill all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error("New passwords do not match");
      return;
    }
    setPasswordUpdateLoading(true);
    try {
      await api.patch("/api/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      success("Password updated successfully");
    } catch (err) {
      error("Failed to update password");
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  // Sample receipt data for preview
  const sampleReceiptData = {
    invoiceNumber: "INV-20241201-0001",
    date: new Date().toLocaleString(),
    cashier: "John Doe",
    customer: {
      name: "Jane Smith",
      phone: "+94 77 123 4567",
      email: "jane.smith@email.com",
    },
    items: [
      {
        name: 'MacBook Pro 14"',
        sku: "MBP-14-001",
        quantity: 1,
        unitPrice: 450000,
        totalPrice: 450000,
        discount: 0,
        discountType: "fixed",
      },
      {
        name: "Wireless Mouse",
        sku: "WM-001",
        quantity: 2,
        unitPrice: 2500,
        totalPrice: 5000,
        discount: 0,
        discountType: "fixed",
      },
      {
        name: "USB-C Cable",
        sku: "USB-C-001",
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1350,
        discount: 150,
        discountType: "fixed",
      },
    ],
    subtotal: 456500,
    discount: 150,
    tax: 45635,
    total: 501985,
    payments: [{ method: "Cash", amount: 502000 }],
    change: 15,
    loyaltyPointsEarned: 5019,
    loyaltyPointsUsed: 0,
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Prepare payload for backend
      const payload = {
        storeName: storeSettings.storeName,
        storeAddress: storeSettings.storeAddress,
        storePhone: storeSettings.storePhone,
        storeEmail: storeSettings.storeEmail,
        currency: storeSettings.currency,
        logo: storeSettings.logo,
        loyaltySettings: loyaltySettings,
        receiptSettings: {
          header: receiptSettings.headerText,
          footer: receiptSettings.footerText,
          showLogo: receiptSettings.showLogo,
          paperSize: receiptSettings.paperSize,
        },
        notifications: notificationSettings,
        overrideOutOfStock: storeSettings.overrideOutOfStock,
        enablePOSReturns: storeSettings.enablePOSReturns,
        commission: commissionSettings,
      };
      await api.put("/api/settings/", payload);
      success("Settings saved successfully");
    } catch (err) {
      error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        error("File size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        error("Please select a valid image file");
        return;
      }
      const formData = new FormData();
      formData.append("logo", file);
      try {
        setLoading(true);
        const res = await api.post("/api/settings/logo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data && res.data.logoUrl) {
          setStoreSettings((prev) => ({ ...prev, logo: res.data.logoUrl }));
          success("Logo uploaded successfully");
        } else {
          // fallback: try to use returned logo field
          setStoreSettings((prev) => ({ ...prev, logo: res.data.logo || "" }));
          success("Logo uploaded successfully");
        }
      } catch (err) {
        error("Failed to upload logo");
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadReceiptPreview = () => {
    const receiptContent = generateReceiptHTML();
    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipt-preview.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReceiptPreview = () => {
    const receiptContent = generateReceiptHTML();
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(receiptContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  const generateReceiptHTML = () => {
    const { items, subtotal, discount, tax, total, payments, change } =
      sampleReceiptData;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt Preview</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: ${
                receiptSettings.fontSize === "small"
                  ? "12px"
                  : receiptSettings.fontSize === "medium"
                  ? "14px"
                  : "16px"
              }; 
              margin: 0; 
              padding: 20px; 
              background: #f5f5f5;
            }
            .receipt { 
              max-width: ${
                receiptSettings.paperSize === "58mm" ? "220px" : "300px"
              }; 
              margin: 0 auto; 
              background: white;
              padding: 15px;
              border: 1px solid #ddd;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .center { text-align: center; }
            .left { text-align: left; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .line { 
              border-bottom: 1px ${receiptSettings.borderStyle} #000; 
              margin: 8px 0; 
            }
            .logo { 
              max-width: 120px; 
              max-height: 60px; 
              margin: 0 auto 10px; 
              display: block;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            td { 
              padding: 2px 0; 
              vertical-align: top;
            }
            .item-row td {
              border-bottom: 1px dotted #ccc;
              padding: 4px 0;
            }
            .total-row {
              border-top: 2px solid #000;
              font-weight: bold;
            }
            .header-text {
              background: #f8f9fa;
              padding: 8px;
              margin: 10px 0;
              border-radius: 4px;
              font-style: italic;
              white-space: pre-line;
            }
            .footer-text {
              background: #f8f9fa;
              padding: 8px;
              margin: 10px 0;
              border-radius: 4px;
              font-style: italic;
              white-space: pre-line;
            }
            .qr-code {
              width: 80px;
              height: 80px;
              background: #f0f0f0;
              border: 1px solid #ddd;
              margin: 10px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #666;
            }
            .barcode {
              width: 150px;
              height: 30px;
              background: repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px);
              margin: 10px auto;
            }
            ${receiptSettings.customCSS}
          </style>
        </head>
        <body>
          <div class="receipt">
            ${
              receiptSettings.showLogo && storeSettings.logo
                ? `
              <div class="center">
                <img src="${storeSettings.logo}" alt="Store Logo" class="logo" />
              </div>
            `
                : ""
            }
            
            ${
              receiptSettings.showStoreInfo
                ? `
              <div style={{ textAlign: ${receiptSettings.alignment} as 'left' | 'center' | 'right', marginBottom: '10px' }}>
                <div class="bold" style="font-size: 16px;">${storeSettings.storeName}</div>
                <div>${storeSettings.storeAddress.street}</div>
                <div>${storeSettings.storeAddress.city}, ${storeSettings.storeAddress.state} ${storeSettings.storeAddress.zipCode}</div>
                <div>${storeSettings.storeAddress.country}</div>
                <div>Phone: ${storeSettings.storePhone}</div>
                <div>Email: ${storeSettings.storeEmail}</div>
              </div>
            `
                : ""
            }
            
            ${
              receiptSettings.headerText
                ? `
              <div class="header-text ${receiptSettings.alignment}">
                ${receiptSettings.headerText}
              </div>
            `
                : ""
            }
            
            <div class="line"></div>
            
            <div class="center">
              <div class="bold">SALES RECEIPT</div>
            </div>
            
            <table>
              <tr>
                <td><strong>Invoice:</strong></td>
                <td class="right">${sampleReceiptData.invoiceNumber}</td>
              </tr>
              <tr>
                <td><strong>Date:</strong></td>
                <td class="right">${sampleReceiptData.date}</td>
              </tr>
              <tr>
                <td><strong>Cashier:</strong></td>
                <td class="right">${sampleReceiptData.cashier}</td>
              </tr>
              ${
                receiptSettings.showCustomerInfo && sampleReceiptData.customer
                  ? `
                <tr>
                  <td><strong>Customer:</strong></td>
                  <td class="right">${sampleReceiptData.customer.name}</td>
                </tr>
                <tr>
                  <td><strong>Phone:</strong></td>
                  <td class="right">${sampleReceiptData.customer.phone}</td>
                </tr>
                ${
                  sampleReceiptData.customer.email
                    ? `
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td class="right">${sampleReceiptData.customer.email}</td>
                  </tr>
                `
                    : ""
                }
              `
                  : ""
              }
            </table>
            
            <div class="line"></div>
            
            ${
              receiptSettings.showItemDetails
                ? `
              <table>
                <tr class="bold">
                  <td>Item</td>
                  <td class="center">Qty</td>
                  <td class="right">Amount</td>
                </tr>
                ${items
                  .map(
                    (item) => `
                  <tr class="item-row">
                    <td>
                      <div class="bold">${item.name}</div>
                      <div style="font-size: 10px; color: #666;">SKU: ${
                        item.sku
                      }</div>
                    </td>
                    <td class="center">${item.quantity}</td>
                    <td class="right">${
                      storeSettings.currency
                    } ${item.totalPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="font-size: 10px; color: #666;">
                      ${item.quantity} x ${
                      storeSettings.currency
                    } ${item.unitPrice.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  ${
                    item.discount && item.discount > 0
                      ? `
                    <tr>
                      <td colspan="2" style="font-size: 10px; color: #666;">
                        Discount: ${
                          item.discountType === "percentage"
                            ? item.discount + "%"
                            : storeSettings.currency +
                              " " +
                              item.discount.toFixed(2)
                        }
                      </td>
                      <td class="right" style="font-size: 10px; color: #666;">
                        -${storeSettings.currency} ${item.discount.toFixed(2)}
                      </td>
                    </tr>
                  `
                      : ""
                  }
                `
                  )
                  .join("")}
              </table>
            `
                : ""
            }
            
            <div class="line"></div>
            
            <table>
              <tr>
                <td>Subtotal:</td>
                <td class="right">${storeSettings.currency} ${subtotal.toFixed(
      2
    )}</td>
              </tr>
              ${
                discount > 0
                  ? `
                <tr>
                  <td>Discount:</td>
                  <td class="right">-${
                    storeSettings.currency
                  } ${discount.toFixed(2)}</td>
                </tr>
              `
                  : ""
              }
              ${
                receiptSettings.showTaxBreakdown && tax > 0
                  ? `
                <tr>
                  <td>Tax (${storeSettings.currency} ${tax.toFixed(2)}</td>
                  <td class="right">${storeSettings.currency} ${tax.toFixed(
                      2
                    )}</td>
                </tr>
              `
                  : ""
              }
              ${
                sampleReceiptData.loyaltyPointsUsed > 0
                  ? `
                <tr>
                  <td>Loyalty Points Used:</td>
                  <td class="right">-${
                    storeSettings.currency
                  } ${sampleReceiptData.loyaltyPointsUsed.toFixed(2)}</td>
                </tr>
              `
                  : ""
              }
              <tr class="total-row">
                <td class="bold">TOTAL:</td>
                <td class="right bold">${
                  storeSettings.currency
                } ${total.toFixed(2)}</td>
              </tr>
            </table>
            
            <div class="line"></div>
            
            <table>
              ${payments
                .map(
                  (payment) => `
                <tr>
                  <td>${payment.method.toUpperCase()}:</td>
                  <td class="right">${
                    storeSettings.currency
                  } ${payment.amount.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
              ${
                change > 0
                  ? `
                <tr>
                  <td>CHANGE:</td>
                  <td class="right">${storeSettings.currency} ${change.toFixed(
                      2
                    )}</td>
                </tr>
              `
                  : ""
              }
            </table>
            
            ${
              sampleReceiptData.loyaltyPointsEarned > 0
                ? `
              <div class="line"></div>
              <div class="center">
                <div class="bold">🌟 Loyalty Points Earned: ${sampleReceiptData.loyaltyPointsEarned} 🌟</div>
                <div style="font-size: 10px; color: #666;">Thank you for being a valued customer!</div>
              </div>
            `
                : ""
            }
            
            ${
              receiptSettings.includeQRCode
                ? `
              <div class="center">
                <div class="qr-code">QR CODE</div>
                <div style="font-size: 10px; color: #666;">Scan for digital receipt</div>
              </div>
            `
                : ""
            }
            
            ${
              receiptSettings.includeBarcode
                ? `
              <div class="center">
                <div class="barcode"></div>
                <div style="font-size: 10px; color: #666;">${sampleReceiptData.invoiceNumber}</div>
              </div>
            `
                : ""
            }
            
            ${
              receiptSettings.footerText
                ? `
              <div class="footer-text ${receiptSettings.alignment}">
                ${receiptSettings.footerText}
              </div>
            `
                : ""
            }
            
            <div portrayals="line"></div>
            <div class="center" style="font-size: 10px; color: #666;">
              Powered by POS System • ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const tabs = [
    { id: "store", name: "Store Info", icon: Store },
    { id: "receipt", name: "Receipt", icon: Receipt },
    { id: "loyalty", name: "Loyalty", icon: Star },
    ...(commissionSettings.enabled ? [{ id: "commission", name: "Staff Commission", icon: Star }] : []),
    // { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: "profile", name: "Profile", icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure your store settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Store Information */}
          {activeTab === "store" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Store Information
              </h3>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Logo
                </label>
                <div className="space-y-4">
                  {storeSettings.logo && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={storeSettings.logo}
                        alt="Store Logo"
                        className="h-16 w-auto border border-gray-200 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Current logo</p>
                        <button
                          onClick={() =>
                            setStoreSettings((prev) => ({ ...prev, logo: "" }))
                          }
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove logo
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        storeName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={storeSettings.storePhone}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        storePhone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        storeEmail: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={storeSettings.currency}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LKR">Sri Lankan Rupee (LKR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Address
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={storeSettings.storeAddress.street}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          storeAddress: {
                            ...prev.storeAddress,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={storeSettings.storeAddress.city}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          storeAddress: {
                            ...prev.storeAddress,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="State/Province"
                      value={storeSettings.storeAddress.state}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          storeAddress: {
                            ...prev.storeAddress,
                            state: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={storeSettings.storeAddress.zipCode}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          storeAddress: {
                            ...prev.storeAddress,
                            zipCode: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Override Out of Stock Toggle - moved here */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Override Out of Stock
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storeSettings.overrideOutOfStock}
                      onChange={e => setStoreSettings(prev => ({ ...prev, overrideOutOfStock: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Enable POS Returns Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    POS System Return
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={storeSettings.enablePOSReturns}
                      onChange={e => setStoreSettings(prev => ({ ...prev, enablePOSReturns: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable return and exchange mode in POS system
                  </p>
                </div>

                {/* Enable Staff Commission Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Commission
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commissionSettings.enabled}
                      onChange={e => setCommissionSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable staff commission tracking
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Settings */}
          {activeTab === "receipt" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Settings Panel */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Receipt Customization
                </h3>

                {/* Header Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Text
                  </label>
                  <textarea
                    value={receiptSettings.headerText}
                    onChange={(e) =>
                      setReceiptSettings((prev) => ({
                        ...prev,
                        headerText: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Welcome message or promotional text"
                  />
                </div>

                {/* Footer Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Text
                  </label>
                  <textarea
                    value={receiptSettings.footerText}
                    onChange={(e) =>
                      setReceiptSettings((prev) => ({
                        ...prev,
                        footerText: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Thank you message, contact info, return policy, etc."
                  />
                </div>

                {/* Layout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Size
                    </label>
                    <select
                      value={receiptSettings.paperSize}
                      onChange={(e) =>
                        setReceiptSettings((prev) => ({
                          ...prev,
                          paperSize: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="58mm">58mm (Small)</option>
                      <option value="80mm">80mm (Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select
                      value={receiptSettings.fontSize}
                      onChange={(e) =>
                        setReceiptSettings((prev) => ({
                          ...prev,
                          fontSize: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Alignment
                    </label>
                    <select
                      value={receiptSettings.alignment}
                      onChange={(e) =>
                        setReceiptSettings((prev) => ({
                          ...prev,
                          alignment: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Style
                    </label>
                    <select
                      value={receiptSettings.borderStyle}
                      onChange={(e) =>
                        setReceiptSettings((prev) => ({
                          ...prev,
                          borderStyle: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                </div>

                {/* Display Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Display Options
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: "showLogo", label: "Show logo on receipt" },
                      { key: "showStoreInfo", label: "Show store information" },
                      {
                        key: "showCustomerInfo",
                        label: "Show customer information",
                      },
                      {
                        key: "showItemDetails",
                        label: "Show detailed item information",
                      },
                      { key: "showTaxBreakdown", label: "Show tax breakdown" },
                      { key: "includeBarcode", label: "Include barcode" },
                      { key: "includeQRCode", label: "Include QR code" },
                    ].map((option) => (
                      <label key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            receiptSettings[
                              option.key as keyof typeof receiptSettings
                            ] as boolean
                          }
                          onChange={(e) =>
                            setReceiptSettings((prev) => ({
                              ...prev,
                              [option.key]: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom CSS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom CSS (Advanced)
                  </label>
                  <textarea
                    value={receiptSettings.customCSS}
                    onChange={(e) =>
                      setReceiptSettings((prev) => ({
                        ...prev,
                        customCSS: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder=".receipt { background: #fff; }
.total-row { color: #000; }"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add custom CSS to further customize your receipt appearance
                  </p>
                </div>
              </div>

              {/* Live Preview Panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Live Preview
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadReceiptPreview}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={printReceiptPreview}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Print
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[600px] border">
                  <div
                    className="bg-white shadow-lg mx-auto border"
                    style={{
                      width:
                        receiptSettings.paperSize === "58mm"
                          ? "220px"
                          : "300px",
                      fontFamily: "Courier New, monospace",
                      fontSize:
                        receiptSettings.fontSize === "small"
                          ? "12px"
                          : receiptSettings.fontSize === "medium"
                          ? "14px"
                          : "16px",
                      padding: "15px",
                    }}
                  >
                    {/* Logo */}
                    {receiptSettings.showLogo && storeSettings.logo && (
                      <div
                        style={{ textAlign: "center", marginBottom: "10px" }}
                      >
                        <img
                          src={storeSettings.logo}
                          alt="Store Logo"
                          style={{
                            maxWidth: "120px",
                            maxHeight: "60px",
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
                      </div>
                    )}

                    {/* Store Info */}
                    {receiptSettings.showStoreInfo && (
                      <div
                        style={{
                          textAlign: receiptSettings.alignment as
                            | "left"
                            | "center"
                            | "right",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                          {storeSettings.storeName}
                        </div>
                        <div>{storeSettings.storeAddress.street}</div>
                        <div>
                          {storeSettings.storeAddress.city},{" "}
                          {storeSettings.storeAddress.state}{" "}
                          {storeSettings.storeAddress.zipCode}
                        </div>
                        <div>{storeSettings.storeAddress.country}</div>
                        <div>Phone: {storeSettings.storePhone}</div>
                        <div>Email: {storeSettings.storeEmail}</div>
                      </div>
                    )}

                    {/* Header Text */}
                    {receiptSettings.headerText && (
                      <div
                        style={{
                          background: "#f8f9fa",
                          padding: "8px",
                          margin: "10px 0",
                          borderRadius: "4px",
                          fontStyle: "italic",
                          textAlign: receiptSettings.alignment as
                            | "left"
                            | "center"
                            | "right",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {receiptSettings.headerText}
                      </div>
                    )}

                    {/* Divider */}
                    <div
                      style={{
                        borderBottom: `1px ${receiptSettings.borderStyle} #000`,
                        margin: "8px 0",
                      }}
                    ></div>

                    {/* Receipt Title */}
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        marginBottom: "10px",
                      }}
                    >
                      SALES RECEIPT
                    </div>

                    {/* Receipt Info */}
                    <div style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          <strong>Invoice:</strong>
                        </span>
                        <span>{sampleReceiptData.invoiceNumber}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          <strong>Date:</strong>
                        </span>
                        <span>{sampleReceiptData.date}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          <strong>Cashier:</strong>
                        </span>
                        <span>{sampleReceiptData.cashier}</span>
                      </div>
                      {receiptSettings.showCustomerInfo &&
                        sampleReceiptData.customer && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>
                                <strong>Customer:</strong>
                              </span>
                              <span>{sampleReceiptData.customer.name}</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>
                                <strong>Phone:</strong>
                              </span>
                              <span>{sampleReceiptData.customer.phone}</span>
                            </div>
                          </>
                        )}
                    </div>

                    {/* Divider */}
                    <div
                      style={{
                        borderBottom: `1px ${receiptSettings.borderStyle} #000`,
                        margin: "8px 0",
                      }}
                    ></div>

                    {/* Items */}
                    {receiptSettings.showItemDetails && (
                      <div style={{ marginBottom: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            fontWeight: "bold",
                            borderBottom: "1px dotted #ccc",
                            paddingBottom: "4px",
                          }}
                        >
                          <span style={{ flex: 1 }}>Item</span>
                          <span style={{ width: "30px", textAlign: "center" }}>
                            Qty
                          </span>
                          <span style={{ width: "80px", textAlign: "right" }}>
                            Amount
                          </span>
                        </div>
                        {sampleReceiptData.items.map((item, index) => (
                          <div key={index}>
                            <div
                              style={{
                                display: "flex",
                                borderBottom: "1px dotted #ccc",
                                padding: "4px 0",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "bold" }}>
                                  {item.name}
                                </div>
                                <div
                                  style={{ fontSize: "10px", color: "#666" }}
                                >
                                  SKU: {item.sku}
                                </div>
                              </div>
                              <span
                                style={{ width: "30px", textAlign: "center" }}
                              >
                                {item.quantity}
                              </span>
                              <span
                                style={{ width: "80px", textAlign: "right" }}
                              >
                                {storeSettings.currency}{" "}
                                {item.totalPrice.toFixed(2)}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#666",
                                marginLeft: "0",
                              }}
                            >
                              {item.quantity} x {storeSettings.currency}{" "}
                              {item.unitPrice.toFixed(2)}
                            </div>
                            {item.discount > 0 && (
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "#666",
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>
                                  Discount:{" "}
                                  {item.discountType === "percentage"
                                    ? item.discount + "%"
                                    : storeSettings.currency +
                                      " " +
                                      item.discount.toFixed(2)}
                                </span>
                                <span>
                                  -{storeSettings.currency}{" "}
                                  {item.discount.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Divider */}
                    <div
                      style={{
                        borderBottom: `1px ${receiptSettings.borderStyle} #000`,
                        margin: "8px 0",
                      }}
                    ></div>

                    {/* Totals */}
                    <div style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Subtotal:</span>
                        <span>
                          {storeSettings.currency}{" "}
                          {sampleReceiptData.subtotal.toFixed(2)}
                        </span>
                      </div>
                      {sampleReceiptData.discount > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Discount:</span>
                          <span>
                            -{storeSettings.currency}{" "}
                            {sampleReceiptData.discount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {receiptSettings.showTaxBreakdown &&
                        sampleReceiptData.tax > 0 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Tax:</span>
                            <span>
                              {storeSettings.currency}{" "}
                              {sampleReceiptData.tax.toFixed(2)}
                            </span>
                          </div>
                        )}
                      {sampleReceiptData.loyaltyPointsUsed > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Loyalty Points Used:</span>
                          <span>
                            -{storeSettings.currency}{" "}
                            {sampleReceiptData.loyaltyPointsUsed.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: "bold",
                          borderTop: "2px solid #000",
                          paddingTop: "4px",
                          marginTop: "4px",
                        }}
                      >
                        <span>TOTAL:</span>
                        <span>
                          {storeSettings.currency}{" "}
                          {sampleReceiptData.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div
                      style={{
                        borderBottom: `1px ${receiptSettings.borderStyle} #000`,
                        margin: "8px 0",
                      }}
                    ></div>

                    {/* Payment */}
                    <div style={{ marginBottom: "10px" }}>
                      {sampleReceiptData.payments.map((payment, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{payment.method.toUpperCase()}:</span>
                          <span>
                            {storeSettings.currency} {payment.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {sampleReceiptData.change > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>CHANGE:</span>
                          <span>
                            {storeSettings.currency}{" "}
                            {sampleReceiptData.change.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Loyalty Points */}
                    {sampleReceiptData.loyaltyPointsEarned > 0 && (
                      <>
                        <div
                          style={{
                            borderBottom: `1px ${receiptSettings.borderStyle} #000`,
                            margin: "8px 0",
                          }}
                        ></div>
                        <div
                          style={{ textAlign: "center", marginBottom: "10px" }}
                        >
                          <div style={{ fontWeight: "bold" }}>
                            🌟 Loyalty Points Earned:{" "}
                            {sampleReceiptData.loyaltyPointsEarned} 🌟
                          </div>
                          <div style={{ fontSize: "10px", color: "#666" }}>
                            Thank you for being a valued customer!
                          </div>
                        </div>
                      </>
                    )}

                    {/* QR Code */}
                    {receiptSettings.includeQRCode && (
                      <div
                        style={{ textAlign: "center", marginBottom: "10px" }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            background: "#f0f0f0",
                            border: "1px solid #ddd",
                            margin: "10px auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            color: "#666",
                          }}
                        >
                          QR CODE
                        </div>
                        <div style={{ fontSize: "10px", color: "#666" }}>
                          Scan for digital receipt
                        </div>
                      </div>
                    )}

                    {/* Barcode */}
                    {receiptSettings.includeBarcode && (
                      <div
                        style={{ textAlign: "center", marginBottom: "10px" }}
                      >
                        <div
                          style={{
                            width: "150px",
                            height: "30px",
                            background:
                              "repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px)",
                            margin: "10px auto",
                          }}
                        ></div>
                        <div style={{ fontSize: "10px", color: "#666" }}>
                          {sampleReceiptData.invoiceNumber}
                        </div>
                      </div>
                    )}

                    {/* Footer Text */}
                    {receiptSettings.footerText && (
                      <div
                        style={{
                          background: "#f8f9fa",
                          padding: "8px",
                          margin: "10px 0",
                          borderRadius: "4px",
                          fontStyle: "italic",
                          textAlign: receiptSettings.alignment as
                            | "left"
                            | "center"
                            | "right",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {receiptSettings.footerText}
                      </div>
                    )}

                    {/* Final Divider */}
                    <div
                      style={{
                        borderBottom: `1px ${receiptSettings.borderStyle} #000`,
                        margin: "8px 0",
                      }}
                    ></div>

                    {/* Footer */}
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "10px",
                        color: "#666",
                      }}
                    >
                      Powered by POS System • {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Eye className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">
                        Live Preview
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This is a real-time preview of your receipt with sample
                        data. All changes are reflected instantly. Use the
                        download or print buttons to test the actual output.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loyalty Settings */}
          {activeTab === "loyalty" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Loyalty Program
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points per Unit Amount
                  </label>
                  <input
                    type="number"
                    value={loyaltySettings.pointsPerUnit}
                    onChange={(e) =>
                      setLoyaltySettings((prev) => ({
                        ...prev,
                        pointsPerUnit: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Points earned per unit amount
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Amount (LKR)
                  </label>
                  <input
                    type="number"
                    value={loyaltySettings.unitAmount}
                    onChange={(e) =>
                      setLoyaltySettings((prev) => ({
                        ...prev,
                        unitAmount: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount spent to earn points
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redemption Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={loyaltySettings.redemptionRate}
                    onChange={(e) =>
                      setLoyaltySettings((prev) => ({
                        ...prev,
                        redemptionRate: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    LKR value per point
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Example:</h4>
                <p className="text-blue-800 text-sm">
                  Customer spends LKR {loyaltySettings.unitAmount} and earns{" "}
                  {loyaltySettings.pointsPerUnit} point(s). Each point is worth
                  LKR {loyaltySettings.redemptionRate} when redeemed.
                </p>
              </div>
            </div>
          )}

          {/* Staff Commission Settings */}
          {activeTab === "commission" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Staff Commission Settings
              </h3>

              {/* Commission Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Commission Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      value="percentage"
                      checked={commissionSettings.type === "percentage"}
                      onChange={(e) =>
                        setCommissionSettings((prev) => ({
                          ...prev,
                          type: e.target.value,
                          value: 0,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Percentage (%)
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="commissionType"
                      value="fixed"
                      checked={commissionSettings.type === "fixed"}
                      onChange={(e) =>
                        setCommissionSettings((prev) => ({
                          ...prev,
                          type: e.target.value,
                          value: 0,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Fixed Amount
                    </span>
                  </label>
                </div>
              </div>

              {/* Commission Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {commissionSettings.type === "percentage"
                    ? "Commission Percentage"
                    : "Commission Amount"}
                </label>
                <div className="relative">
                  {commissionSettings.type === "fixed" && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">LKR</span>
                    </div>
                  )}
                  <input
                    type="number"
                    value={commissionSettings.value}
                    onChange={(e) => {
                      const inputValue = Number(e.target.value);
                      if (commissionSettings.type === "percentage") {
                        // Restrict percentage between 0 and 100
                        if (inputValue >= 0 && inputValue <= 100) {
                          setCommissionSettings((prev) => ({
                            ...prev,
                            value: inputValue,
                          }));
                        }
                      } else {
                        // For fixed amount, only check if positive
                        if (inputValue >= 0) {
                          setCommissionSettings((prev) => ({
                            ...prev,
                            value: inputValue,
                          }));
                        }
                      }
                    }}
                    min="0"
                    max={commissionSettings.type === "percentage" ? "100" : undefined}
                    step={commissionSettings.type === "percentage" ? "1" : "0.01"}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      commissionSettings.type === "fixed" ? "pl-12" : ""
                    }`}
                  />
                  {commissionSettings.type === "percentage" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {commissionSettings.type === "percentage"
                    ? "Enter a percentage between 0 and 100"
                    : "Enter a fixed amount in LKR"}
                </p>
              </div>

              {/* Example Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Example:</h4>
                <p className="text-blue-800 text-sm">
                  {commissionSettings.type === "percentage"
                    ? `Staff will receive ${commissionSettings.value}% commission on each sale.`
                    : `Staff will receive LKR ${commissionSettings.value.toFixed(
                        2
                      )} commission on each sale.`}
                </p>
                <p className="text-blue-700 text-xs mt-2">
                  {commissionSettings.type === "percentage"
                    ? `For a sale of LKR 10,000, commission = LKR ${(
                        10000 *
                        (commissionSettings.value / 100)
                      ).toFixed(2)}`
                    : `For any sale, commission = LKR ${commissionSettings.value.toFixed(
                        2
                      )}`}
                </p>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Low Stock Alerts
                    </h4>
                    <p className="text-sm text-gray-600">
                      Get notified when products are running low
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.lowStockAlert}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          lowStockAlert: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Daily Reports</h4>
                    <p className="text-sm text-gray-600">
                      Receive daily sales and inventory reports
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.dailyReports}
                      onChange={(e) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          dailyReports: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-lg mx-auto space-y-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                User Profile
              </h3>
              {profileLoading ? (
                <div className="space-y-6">
                  {/* Profile Section Skeleton */}
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
                      </div>
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                      </div>
                      <div>
                        <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                      </div>
                      <div>
                        <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                      </div>
                      <div>
                        <div className="h-3 w-20 bg-gray-200 rounded mb-1"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                      </div>
                      <div className="flex justify-end">
                        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                  {/* Password Update Section Skeleton */}
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-4">
                      <div>
                        <div className="h-3 w-28 bg-gray-200 rounded mb-1"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                      </div>
                      <div>
                        <div className="h-3 w-28 bg-gray-200 rounded mb-1"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                      </div>
                      <div>
                        <div className="h-3 w-28 bg-gray-200 rounded mb-1"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                      </div>
                      <div className="flex justify-end">
                        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : profile ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          {profile.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.role}
                        </div>
                      </div>
                      <button
                        onClick={() => setProfileEditMode((v) => !v)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {profileEditMode ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={profile.username}
                          disabled
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={profileEdit.fullName}
                          onChange={handleProfileEditChange}
                          disabled={!profileEditMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileEdit.email}
                          onChange={handleProfileEditChange}
                          disabled={!profileEditMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={profileEdit.phone}
                          onChange={handleProfileEditChange}
                          disabled={!profileEditMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div className="flex justify-end">
                        {profileEditMode && (
                          <button
                            onClick={handleProfileUpdate}
                            disabled={profileUpdateLoading}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {profileUpdateLoading
                              ? "Updating..."
                              : "Update Profile"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Password Update Section */}
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <h4 className="text-md font-semibold mb-4">
                      Update Password
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handlePasswordUpdate}
                          disabled={passwordUpdateLoading}
                          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {passwordUpdateLoading
                            ? "Updating..."
                            : "Update Password"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No profile data found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
