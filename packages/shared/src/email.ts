export interface SendCustomerConfirmationParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  productName: string;
  size: string;
  quantity: number;
  totalAmount: number;
  shippingAddress: {
    houseBuilding: string;
    streetAddress: string;
    areaLocality: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface SendOwnerAlertParams {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  productName: string;
  size: string;
  quantity: number;
  totalAmount: number;
}

export async function sendCustomerOrderConfirmation(
  params: SendCustomerConfirmationParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'STONCROPS <orders@stoncrops.com>';

  if (!apiKey) {
    // Manual email dispatch mode as requested by store owner
    return { success: true, id: `manual_dispatch_${Date.now()}` };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Confirmation - STONCROPS</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c0c0c; color: #f5f5f7; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #141416; border: 1px solid #26262a; border-radius: 12px; padding: 36px; }
          .brand { font-size: 24px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff; text-align: center; margin-bottom: 24px; }
          .tagline { color: #8a8a93; font-size: 13px; text-transform: uppercase; letter-spacing: 0.2em; text-align: center; margin-bottom: 32px; }
          .card { background-color: #1a1a1e; border: 1px solid #2a2a30; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
          .price { font-size: 28px; font-weight: 700; color: #ffffff; }
          .footer { font-size: 12px; color: #6e6e73; text-align: center; margin-top: 36px; }
          .badge { display: inline-block; padding: 4px 10px; background-color: #722F37; color: #fff; font-size: 11px; font-weight: 600; border-radius: 4px; letter-spacing: 0.05em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">STONCROPS</div>
          <div class="tagline">Embroidered Edition</div>
          
          <h2 style="color: #fff; margin-bottom: 8px;">Order Confirmed: #${params.orderNumber}</h2>
          <p style="color: #a1a1aa; line-height: 1.6;">
            Hello ${params.customerName},<br />
            Thank you for purchasing from STONCROPS. Your order is officially confirmed and being prepared for dispatch.
          </p>

          <div class="card">
            <h3 style="margin-top: 0; color: #fff; font-size: 16px;">Garment Summary</h3>
            <p style="margin: 4px 0; color: #e4e4e7;"><strong>${params.productName}</strong></p>
            <p style="margin: 4px 0; color: #a1a1aa;">Size: <span class="badge">${params.size}</span> &nbsp;|&nbsp; Quantity: ${params.quantity}</p>
            <p style="margin: 12px 0 4px 0; color: #a1a1aa;">Shipping: <strong style="color: #4ade80;">FREE (Across India)</strong></p>
            <div style="border-top: 1px solid #2a2a30; margin-top: 16px; padding-top: 16px; display: flex; justify-content: space-between; align-items: baseline;">
              <span style="color: #a1a1aa;">Amount Paid:</span>
              <span class="price">₹${params.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="card">
            <h3 style="margin-top: 0; color: #fff; font-size: 16px;">Delivery Address</h3>
            <p style="color: #d4d4d8; line-height: 1.5; margin: 0;">
              ${params.shippingAddress.houseBuilding}, ${params.shippingAddress.streetAddress}<br />
              ${params.shippingAddress.areaLocality}<br />
              ${params.shippingAddress.city}, ${params.shippingAddress.state} — ${params.shippingAddress.pincode}
            </p>
          </div>

          <div style="background-color: #1a1617; border-left: 3px solid #722F37; padding: 14px 18px; border-radius: 4px; margin-top: 24px;">
            <p style="margin: 0; font-size: 13px; color: #d4a373;">
              <strong>Wash & Care Notice:</strong> Always detach the metal chain accessory before washing. Machine wash cold inside-out on a gentle cycle to preserve custom floral embroidery.
            </p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} STONCROPS. All rights reserved.<br />
            For order support or queries, reply to this email.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.toEmail,
        subject: `STONCROPS Order Confirmation #${params.orderNumber}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[Resend Error]', err);
      return { success: false, error: err.message || 'Email dispatch failed' };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Customer Email Exception]', message);
    return { success: false, error: message };
  }
}

export async function sendOwnerOrderAlert(
  params: SendOwnerAlertParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  const fromEmail = process.env.EMAIL_FROM || 'STONCROPS System <orders@stoncrops.com>';

  if (!apiKey || !ownerEmail) {
    // Manual email dispatch mode
    return { success: true, id: `manual_owner_dispatch_${Date.now()}` };
  }

  const html = `
    <h2>🚨 New STONCROPS Order #${params.orderNumber}</h2>
    <p>A new order was placed and verified via Razorpay.</p>
    <ul>
      <li><strong>Customer:</strong> ${params.customerName} (${params.customerPhone}, ${params.customerEmail})</li>
      <li><strong>Item:</strong> ${params.productName}</li>
      <li><strong>Size:</strong> ${params.size}</li>
      <li><strong>Quantity:</strong> ${params.quantity}</li>
      <li><strong>Total Paid:</strong> ₹${params.totalAmount.toLocaleString('en-IN')}</li>
    </ul>
    <p><a href="https://admin.stoncrops.com" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Go to Admin Dashboard</a></p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ownerEmail,
        subject: `[NEW ORDER] #${params.orderNumber} - ₹${params.totalAmount} (${params.size})`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.message || 'Owner email alert failed' };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Owner Email Alert Exception]', message);
    return { success: false, error: message };
  }
}
