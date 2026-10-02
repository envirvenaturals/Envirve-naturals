import { Order } from '../types';

export function createEmailRaw({
  to,
  from,
  subject,
  htmlBody,
}: {
  to: string;
  from?: string;
  subject: string;
  htmlBody: string;
}): string {
  const headers = [
    `To: ${to}`,
    ...(from ? [`From: ${from}`] : []),
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
  ];

  const email = `${headers.join('\r\n')}\r\n\r\n${htmlBody}`;

  // URL-safe base64 encoding for Gmail API
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function formatOrderEmailHtml(order: Order, storeName = 'Envirve Naturals'): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #ECE7DA;">
        <td style="padding: 12px 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #1B3218;">
          <strong>${item.productName}</strong>
          ${item.volumeSize ? `<br/><span style="font-size: 12px; color: #6E7D6C;">Size: ${item.volumeSize}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; font-family: monospace; font-size: 14px; text-align: center; color: #2D5A27;">
          x${item.quantity}
        </td>
        <td style="padding: 12px 8px; font-family: monospace; font-size: 14px; text-align: right; color: #1B3218;">
          Rs. ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order #${order.orderNumber} - ${storeName}</title>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #F5F3EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #232822;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E5DFD1; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
    
    <!-- Header Banner -->
    <div style="background-color: #1C3619; color: #FFFFFF; padding: 28px 24px; text-align: center;">
      <span style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #9FD996; font-weight: 600; display: block; margin-bottom: 6px;">New Customer Order</span>
      <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0 0 6px 0; font-weight: normal; letter-spacing: 0.08em; color: #FAF8F5;">
        ${storeName}
      </h1>
      <p style="font-family: Georgia, serif; font-style: italic; font-size: 13px; color: #D5E5D1; margin: 0;">
        nature . care . you .
      </p>
    </div>

    <!-- Order Summary Alert -->
    <div style="background-color: #EDF6EB; border-bottom: 1px solid #DFEBDC; padding: 16px 24px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #1E3F1A; font-weight: 500;">
        An order was just placed on your store! Total amount: <strong style="font-family: monospace; font-size: 16px; color: #1C3619;">Rs. ${order.total.toLocaleString()}</strong>
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 24px;">
      
      <!-- Order ID & Date -->
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #2D5A27; padding-bottom: 12px; margin-bottom: 20px;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #728070; display: block;">Order Reference</span>
          <span style="font-size: 18px; font-weight: bold; font-family: monospace; color: #1B3218;">#${order.orderNumber}</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #728070; display: block;">Date Placed</span>
          <span style="font-size: 13px; color: #3A4737;">${order.date}</span>
        </div>
      </div>

      <!-- Customer Details Card -->
      <div style="background-color: #FAF9F5; border: 1px solid #ECE7DA; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <h3 style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #2D5A27; margin: 0 0 14px 0; font-weight: 700;">
          Customer & Delivery Information
        </h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #6D7B6B; width: 130px; font-weight: 500;">Customer Name:</td>
            <td style="padding: 5px 0; font-weight: 600; color: #1B3218;">${order.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6D7B6B; font-weight: 500;">Phone Number:</td>
            <td style="padding: 5px 0; font-weight: 600;">
              <a href="tel:${order.customerPhone}" style="color: #2D5A27; text-decoration: none;">${order.customerPhone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6D7B6B; font-weight: 500;">Email:</td>
            <td style="padding: 5px 0; color: #1B3218;">
              ${order.customerEmail ? `<a href="mailto:${order.customerEmail}" style="color: #2D5A27; text-decoration: none;">${order.customerEmail}</a>` : '<span style="color: #929E8F; font-style: italic;">Not provided</span>'}
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6D7B6B; font-weight: 500;">Delivery Address:</td>
            <td style="padding: 5px 0; color: #1B3218; line-height: 1.45;">
              ${order.shippingAddress}, <strong>${order.city}</strong>${order.postalCode ? ' - ' + order.postalCode : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #6D7B6B; font-weight: 500;">Payment Method:</td>
            <td style="padding: 5px 0; color: #1B3218; font-weight: 600;">
              ${order.paymentMethod} <span style="font-size: 11px; font-weight: normal; background-color: #E2ECE0; color: #2D5A27; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">${order.paymentStatus}</span>
            </td>
          </tr>
          ${order.transactionRef ? `
          <tr>
            <td style="padding: 5px 0; color: #6D7B6B; font-weight: 500;">JazzCash TID / Ref:</td>
            <td style="padding: 5px 0; font-family: monospace; font-weight: bold; color: #D92525; background-color: #FFF2F2; padding: 4px 8px; border-radius: 4px; display: inline-block;">
              ${order.transactionRef}
            </td>
          </tr>` : ''}
          ${order.notes ? `
          <tr>
            <td style="padding: 5px 0; color: #6D7B6B; font-weight: 500; vertical-align: top;">Delivery Instructions:</td>
            <td style="padding: 5px 0; font-style: italic; color: #394736; background-color: #F3EFE6; padding: 6px 10px; border-radius: 6px;">
              "${order.notes}"
            </td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Items Ordered Table -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #2D5A27; margin: 0 0 12px 0; font-weight: 700;">
          Items Ordered (${order.items.reduce((s, i) => s + i.quantity, 0)} Units)
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #E8E2D5; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #728070;">
              <th style="padding: 8px 8px 8px 0;">Item Description</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px 0 8px 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px 8px 4px 0; font-size: 13px; text-align: right; color: #6E7D6C;">Subtotal:</td>
              <td style="padding: 10px 0 4px 8px; font-family: monospace; font-size: 13px; text-align: right; color: #1B3218;">Rs. ${order.subtotal.toLocaleString()}</td>
            </tr>
            ${order.discountAmount ? `
            <tr>
              <td colspan="2" style="padding: 4px 8px 4px 0; font-size: 13px; text-align: right; color: #2D5A27;">Coupon Discount:</td>
              <td style="padding: 4px 0 4px 8px; font-family: monospace; font-size: 13px; text-align: right; color: #2D5A27;">-Rs. ${order.discountAmount.toLocaleString()}</td>
            </tr>` : ''}
            <tr>
              <td colspan="2" style="padding: 4px 8px 4px 0; font-size: 13px; text-align: right; color: #6E7D6C;">Shipping Fee:</td>
              <td style="padding: 4px 0 4px 8px; font-family: monospace; font-size: 13px; text-align: right; color: #1B3218;">Rs. ${order.deliveryFee.toLocaleString()}</td>
            </tr>
            <tr style="border-top: 2px solid #2D5A27;">
              <td colspan="2" style="padding: 12px 8px 0 0; font-size: 15px; font-weight: bold; text-align: right; color: #1B3218;">Grand Total:</td>
              <td style="padding: 12px 0 0 8px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: right; color: #2D5A27;">Rs. ${order.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Action Box -->
      <div style="background-color: #FAF9F5; border-radius: 12px; padding: 16px; text-align: center; border: 1px dashed #D5CFBF;">
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #52604F;">
          You can process, pack, and generate tracking for this order in your Envirve Naturals Admin Dashboard.
        </p>
        <span style="display: inline-block; font-size: 11px; font-family: monospace; background-color: #2D5A27; color: #FFFFFF; padding: 6px 14px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">
          Status: ${order.status.toUpperCase()}
        </span>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #F8F6F0; border-top: 1px solid #ECE7DA; padding: 18px 24px; text-align: center; font-size: 11px; color: #879484; line-height: 1.5;">
      <p style="margin: 0 0 4px 0;">This email was sent by you to yourself via Google Workspace Gmail API integration.</p>
      <p style="margin: 0;">Envirve Naturals · Pure Botanical Care · nature.care.you.</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

export async function sendOrderEmailViaGmail({
  accessToken,
  recipientEmail,
  order,
  storeName = 'Envirve Naturals',
}: {
  accessToken: string;
  recipientEmail: string;
  order: Order;
  storeName?: string;
}): Promise<{ id: string; threadId: string }> {
  const htmlBody = formatOrderEmailHtml(order, storeName);
  const subject = `🌿 New Order #${order.orderNumber} - ${order.customerName} (Rs. ${order.total.toLocaleString()})`;

  const raw = createEmailRaw({
    to: recipientEmail,
    subject,
    htmlBody,
  });

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      `Failed to send email via Gmail API (${response.status}: ${response.statusText})`;
    throw new Error(message);
  }

  return await response.json();
}
