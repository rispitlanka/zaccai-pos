// Shared receipt generator for POS and SaleDetails
export function generateReceiptHTML(sale: any, storeSettings?: any) {
  // fallback/defaults
  const settings = storeSettings || {};
  const storeName = settings.storeName || "MY STORE";
  const address = settings.storeAddress || {};
  const storePhone = settings.storePhone || "";
  const storeEmail = settings.storeEmail || "";
  const currency = settings.currency || "LKR";
  const logo = settings.logo;
  const receiptSettings = settings.receiptSettings || {};
  const header = receiptSettings.header || "";
  const footer = receiptSettings.footer || "";
  const showLogo = receiptSettings.showLogo !== false;
  const paperSize = receiptSettings.paperSize || "58mm";

  // Calculate total paid and change
  const totalPaid =
    sale.payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) ||
    0;
  const change = totalPaid > sale.total ? totalPaid - sale.total : 0;

  return `
    <html>
      <head>
        <title>Receipt - ${sale.invoiceNumber}</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
          .receipt { max-width: ${
            paperSize === "58mm" ? "220px" : "300px"
          }; margin: 0 auto; }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
          img.logo { max-width: 120px; max-height: 60px; display: block; margin: 0 auto 5px auto; }
        </style>
      </head>
      <body>
        <div class="receipt">
          ${
            showLogo && logo
              ? `<div class="center"><img src="${logo}" alt="Store Logo" class="logo" /></div>`
              : ""
          }
          <div class="center bold">
            <h2>${storeName}</h2>
            <p>
              ${address.street || ""}<br>
              ${address.city || ""}${
    address.city && address.state ? ", " : ""
  }${address.state || ""} ${address.zipCode || ""}<br>
              ${storePhone ? `Phone: ${storePhone}<br>` : ""}
              ${storeEmail ? `Email: ${storeEmail}` : ""}
            </p>
          </div>
          ${header ? `<div class="center">${header}</div>` : ""}
          <div class="line"></div>
          <p><strong>Invoice:</strong> ${sale.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(
            sale.createdAt
          ).toLocaleString()}</p>
          <p><strong>Cashier:</strong> ${sale.cashierName}</p>
          ${
            sale.customerInfo
              ? `<p><strong>Customer:</strong> ${sale.customerInfo.name}</p>`
              : ""
          }
          <div class="line"></div>
          <table>
            ${sale.items
              .map(
                (item: any) => `
              <tr>
                <td>${item.productName}${item.variationDetails && item.variationDetails.combinationName ? ' - ' + item.variationDetails.combinationName : ''}</td>
                <td class="right">${item.quantity} x ${item.unitPrice.toFixed(
                  2
                )}</td>
              </tr>
              ${
                item.discount > 0
                  ? `
                <tr>
                  <td colspan="2" style="font-size: 10px; color: #666;">
                    Discount: ${
                      item.discountType === "percentage"
                        ? item.discount + "%"
                        : currency + " " + item.discount
                    }
                  </td>
                </tr>
              `
                  : ""
              }
              <tr>
                <td colspan="2" class="right bold">${currency} ${item.totalPrice.toFixed(
                  2
                )}</td>
              </tr>
            `
              )
              .join("")}
          </table>
          <div class="line"></div>
          <table>
            <tr>
              <td>Subtotal:</td>
              <td class="right">${currency} ${sale.subtotal.toFixed(2)}</td>
            </tr>
            ${
              sale.discount > 0
                ? `
              <tr>
                <td>Discount:</td>
                <td class="right">-${currency} ${sale.discount.toFixed(2)}</td>
              </tr>
            `
                : ""
            }
            ${
              sale.loyaltyPointsUsed > 0
                ? `
              <tr>
                <td>Loyalty Points:</td>
                <td class="right">-${currency} ${sale.loyaltyPointsUsed.toFixed(
                    2
                  )}</td>
              </tr>
            `
                : ""
            }
            <tr class="bold">
              <td>Total:</td>
              <td class="right">${currency} ${sale.total.toFixed(2)}</td>
            </tr>
          </table>
          <div class="line"></div>
          ${sale.payments
            ?.map(
              (payment: any) => `
            <p><strong>${payment.method.toUpperCase()}:</strong> ${currency} ${payment.amount.toFixed(
                2
              )}</p>
          `
            )
            .join("")}
          ${
            change > 0
              ? `
            <div class="line"></div>
            <p class="bold">Change: <span style="float:right">${currency} ${change.toFixed(
                  2
                )}</span></p>
          `
              : ""
          }
          <div class="line"></div>
          <div class="center">
            ${
              footer
                ? `<p>${footer}</p>`
                : "<p>Thank you for your purchase!</p>"
            }
            <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                      Powered by <a href="https://www.rispit.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>Rispit❤️</a><br />
                      
                      <a href="tel:+94775527937" style={{ color: '#666', textDecoration: 'underline' }}>https://www.rispit.com/</a>
                    </div>
            <p>Visit us again soon!</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
