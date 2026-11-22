export interface WhatsAppOrderAlertParams {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  size: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  city: string;
  state: string;
}

/**
 * Sends a WhatsApp notification to the store owner via WhatsApp Business Cloud API
 */
export async function sendOwnerWhatsAppNotification(
  params: WhatsAppOrderAlertParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ownerNumber = process.env.OWNER_WHATSAPP_NUMBER;

  if (!token || !phoneNumberId || !ownerNumber) {
    console.log(
      '[WhatsApp] Credentials not configured. Simulated notification for order:',
      params.orderNumber
    );
    return {
      success: true,
      messageId: `simulated_${Date.now()}`,
    };
  }

  const messageText = `🚨 *NEW STONCROPS ORDER RECEIVED* 🚨

*Order ID:* #${params.orderNumber}
*Customer:* ${params.customerName}
*Phone:* ${params.customerPhone}
*Destination:* ${params.city}, ${params.state}

*Product:* ${params.productName}
*Size:* ${params.size}
*Quantity:* ${params.quantity}
*Total Paid:* ₹${params.totalAmount.toLocaleString('en-IN')}
*Payment Status:* ${params.paymentStatus.toUpperCase()}

⚡ Log in to admin.stoncrops.com to view order details and prepare dispatch.`;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: ownerNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: messageText,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('[WhatsApp Cloud API Error]', err);
      return {
        success: false,
        error: err.error?.message || 'Failed to dispatch WhatsApp message',
      };
    }

    const resData = await response.json();
    return {
      success: true,
      messageId: resData.messages?.[0]?.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[WhatsApp Exception]', message);
    return { success: false, error: message };
  }
}
