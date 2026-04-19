// src/utils/notifications.js

/**
 * Send a notification via WhatsApp and/or Email
 * @param {Object} options - Notification options
 * @param {string} options.to - Recipient identifier (phone for WhatsApp, email for email)
 * @param {string} options.type - 'whatsapp', 'email', or 'both'
 * @param {string} options.subject - Email subject (ignored for WhatsApp)
 * @param {string} options.message - Message body
 * @param {Object} options.data - Additional data for templates
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendNotification({ to, type, subject, message, data = {} }) {
  const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL;   // Optional
  const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;       // Required for email

  const results = { whatsapp: false, email: false };
  const errors = [];

  // ----- WhatsApp (configurable) -----
  if ((type === 'whatsapp' || type === 'both') && WHATSAPP_API_URL) {
    try {
      const response = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message, ...data }),
      });
      if (!response.ok) throw new Error(`WhatsApp API error: ${response.status}`);
      results.whatsapp = true;
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
      errors.push(error.message);
    }
  } else if (type === 'whatsapp' || type === 'both') {
    console.warn('WhatsApp API URL not configured – skipping WhatsApp notification');
  }

  // ----- Email via Resend -----
  if ((type === 'email' || type === 'both') && RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'BrainCity <poojakhatri519@gmail.com>',
          to: [to],
          subject: subject,
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
          ...data,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Resend API error: ${response.status}`);
      }
      results.email = true;
    } catch (error) {
      console.error('Email notification failed:', error);
      errors.push(error.message);
    }
  } else if (type === 'email' || type === 'both') {
    console.warn('Resend API key not configured – skipping email notification');
  }

  // Development fallback: log when no APIs are configured
  if (!WHATSAPP_API_URL && !RESEND_API_KEY) {
    console.log('📢 Notification (mock):', { to, type, subject, message, data });
    results.whatsapp = type === 'whatsapp' || type === 'both';
    results.email = type === 'email' || type === 'both';
  }

  const success = errors.length === 0;
  return { success, results, error: errors.join('; ') || undefined };
}

/**
 * Predefined notification templates for common events
 */
export const NotificationTemplates = {
  profileUpdated: (studentName) => ({
    subject: 'Profile Updated',
    message: `👤 ${studentName}'s profile has been updated successfully.\n\nYou can review the changes in the student dashboard.`,
  }),
  worksheetCompleted: (studentName, score, total, stars) => ({
    subject: 'Worksheet Completed',
    message: `📝 ${studentName} has completed a worksheet!\n\nScore: ${score}/${total}\nStars earned: ${'⭐'.repeat(stars)}\n\nGreat job! Keep practicing.`,
  }),
  feePaymentRecorded: (studentName, amount, status) => ({
    subject: 'Fee Payment Update',
    message: `💰 Fee payment recorded for ${studentName}.\n\nAmount: ₹${amount}\nStatus: ${status}\n\nThank you for your payment.`,
  }),
  feePaymentReminder: (studentName, pendingAmount) => ({
    subject: 'Fee Payment Reminder',
    message: `⏰ Friendly reminder: ${studentName} has pending fees of ₹${pendingAmount}.\n\nPlease make the payment at your earliest convenience.`,
  }),
};