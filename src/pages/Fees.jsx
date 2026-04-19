// src/pages/Fees.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../utils/notifications';
import {
  Loader2, AlertCircle, Printer, CreditCard, IndianRupee,
  CheckCircle, Clock, XCircle, Receipt, Smartphone, Copy, ExternalLink, ChevronRight
} from 'lucide-react';

// ---------- Printable Receipt Component ----------
const PrintableReceipt = React.forwardRef((props, ref) => {
  const { studentData, fees, summary } = props;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: 'Paid', color: 'text-green-600' };
    if (status === 'partial') return { label: 'Partial', color: 'text-amber-600' };
    if (status === 'pending_approval') return { label: 'Pending Approval', color: 'text-blue-600' };
    return { label: 'Pending', color: 'text-red-600' };
  };

  return (
    <div ref={ref} className="p-6 bg-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <style>{`
        @media print {
          @page { margin: 0.3in; }
          body { margin: 0; padding: 0; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-table th, .print-table td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
          .print-table th { background-color: #f5f5f5; font-weight: bold; }
        }
      `}</style>

      <div className="border-b-2 border-[#E2592D] pb-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/braincity_logo.png" alt="BrainCity" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-black text-[#1A1A1A]">BrainCity</h1>
              <p className="text-xs text-gray-500">One Stop Math Solution</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">{studentData?.child_name || 'Student'}</p>
            <p className="text-xs">Standard: {studentData?.standard || 'N/A'}</p>
            <p className="text-xs">School: {studentData?.school_name || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Fee Receipt</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold">{formatAmount(summary.totalAmount)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Paid Amount</p>
            <p className="text-xl font-bold text-green-600">{formatAmount(summary.paidAmount)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Pending Amount</p>
            <p className="text-xl font-bold text-red-600">{formatAmount(summary.pendingAmount)}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Course</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Pending</th>
            <th>Status</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee) => {
            const status = getStatusBadge(fee.payment_status);
            return (
              <tr key={fee.id}>
                <td>{formatDate(fee.created_at)}</td>
                <td>{fee.courses?.name || 'Workshop'}{fee.fees_structure?.name && ` - ${fee.fees_structure.name}`}</td>
                <td>{formatAmount(fee.total_amount)}</td>
                <td>{formatAmount(fee.paid_amount)}</td>
                <td>{formatAmount(fee.pending_amount)}</td>
                <td className={status.color}>{status.label}</td>
                <td>{fee.payment_mode || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 text-center text-xs text-gray-400 border-t pt-2">
        BrainCity Learning Platform · {new Date().toLocaleString()}
      </div>
    </div>
  );
});

// ---------- UPI Payment Modal ----------
const UPIPaymentModal = ({ isOpen, onClose, pendingAmount, studentData, onSuccess, showToast }) => {
  const [amount, setAmount] = useState(pendingAmount || 0);
  const [customAmount, setCustomAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const YOUR_UPI_ID = 'khatrip.009@okaxis';
  const YOUR_NAME = 'BrainCity';

  const finalAmount = amount === 'custom' ? parseFloat(customAmount) : amount;
  const upiDeepLink = `upi://pay?pa=${YOUR_UPI_ID}&pn=${encodeURIComponent(YOUR_NAME)}&am=${finalAmount}&cu=INR`;

  const copyUpiId = () => {
    navigator.clipboard?.writeText(YOUR_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!transactionRef.trim()) {
      setError('Please enter the UPI transaction reference ID');
      return;
    }
    if (!finalAmount || finalAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (finalAmount > pendingAmount) {
      setError('Amount cannot exceed pending amount');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('fees')
        .insert({
          student_id: studentData.id,
          total_amount: pendingAmount,
          paid_amount: finalAmount,
          pending_amount: pendingAmount - finalAmount,
          payment_status: 'pending_approval',
          payment_mode: 'upi',
          transaction_ref: transactionRef,
        });

      if (insertError) throw insertError;

      // Notify admin
      await sendNotification({
        to: 'poojakhatri519@gmail.com',
        type: 'email',
        subject: 'New Payment Pending Approval',
        message: `Student: ${studentData.child_name}\nAmount: ₹${finalAmount}\nUPI Ref: ${transactionRef}\n\nPlease verify and update status.`,
      });

      showToast('Payment reference submitted! Awaiting admin approval.', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-[#E5E5E5]">
          <h3 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Smartphone className="text-[#E2592D]" size={22} />
            Pay via UPI
          </h3>
          <p className="text-sm text-[#555555] mt-1">
            Pending: <span className="font-bold">₹{pendingAmount?.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Amount selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Pay</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { label: 'Full', value: pendingAmount },
                { label: '₹500', value: 500 },
                { label: '₹1000', value: 1000 },
                { label: '₹2000', value: 2000 },
              ].filter(opt => opt.value > 0 && opt.value <= pendingAmount).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setAmount(opt.value); setCustomAmount(''); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    amount === opt.value
                      ? 'border-[#E2592D] bg-[#FDE3DA] text-[#E2592D]'
                      : 'border-[#E5E5E5] text-[#555555] hover:bg-gray-50'
                  }`}
                >
                  {opt.label} (₹{opt.value})
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('custom')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  amount === 'custom'
                    ? 'border-[#E2592D] bg-[#FDE3DA] text-[#E2592D]'
                    : 'border-[#E5E5E5] text-[#555555] hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
            </div>
            {amount === 'custom' && (
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-9 pr-4 py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#E2592D] focus:border-transparent"
                  min="1"
                  max={pendingAmount}
                />
              </div>
            )}
          </div>

          {/* Static QR Code from public folder */}
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <img 
              src="/upi_code.jpg" 
              alt="UPI QR Code" 
              className="w-48 h-48 mx-auto mb-3 object-contain border rounded-lg"
            />
            <div className="flex items-center justify-center gap-2 mb-2">
              <code className="bg-white px-3 py-1.5 rounded-lg border text-sm">{YOUR_UPI_ID}</code>
              <button
                onClick={copyUpiId}
                className="p-2 text-[#E2592D] hover:bg-[#FDE3DA] rounded-lg transition"
              >
                {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
              </button>
            </div>
            <a
              href={upiDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#E2592D] font-medium"
            >
              Open in UPI App <ExternalLink size={14} />
            </a>
            <p className="text-xs text-gray-500 mt-3">
              Scan QR with any UPI app (Google Pay, PhonePe, Paytm) or click above
            </p>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block text-sm font-medium mb-2">
              UPI Transaction Reference ID *
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g., 123456789012"
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#E2592D]"
            />
            <p className="text-xs text-gray-500 mt-1">
              After successful payment, enter the 12-digit UPI reference number
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-[#E5E5E5] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#E5E5E5] rounded-lg text-[#555555] font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="flex-1 px-4 py-2.5 bg-[#E2592D] text-white rounded-lg font-medium hover:bg-[#C94E26] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? <Loader2 size={18} className="animate-spin" /> : 'Submit Reference'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
const Fees = () => {
  const { userDetails, studentData } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, paidAmount: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const printRef = useRef();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    if (userDetails?.student_id || studentData?.id) {
      fetchFees();
    } else if (userDetails && !studentData) {
      setLoading(false);
      setError('No student profile linked to your account.');
    }
  }, [userDetails, studentData]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      setError(null);

      const studentId = studentData?.id || userDetails?.student_id;
      if (!studentId) throw new Error('No student ID found');

      const { data, error: fetchError } = await supabase
        .from('fees')
        .select(`
          id, total_amount, paid_amount, pending_amount, payment_status,
          payment_mode, transaction_ref, created_at,
          courses:course_id (id, name),
          fees_structure:fees_structure_id (id, name, validity_days)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setFees(data || []);

      if (data && data.length > 0) {
        const total = data.reduce((sum, f) => sum + (parseFloat(f.total_amount) || 0), 0);
        const paid = data.reduce((sum, f) => sum + (parseFloat(f.paid_amount) || 0), 0);
        const pending = data.reduce((sum, f) => sum + (parseFloat(f.pending_amount) || 0), 0);
        setSummary({ totalAmount: total, paidAmount: paid, pendingAmount: pending });
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
      setError('Failed to load fee details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const getStatusIcon = (status) => {
    if (status === 'paid') return <CheckCircle size={16} className="text-green-600" />;
    if (status === 'partial') return <Clock size={16} className="text-amber-600" />;
    if (status === 'pending_approval') return <Clock size={16} className="text-blue-600" />;
    return <XCircle size={16} className="text-red-600" />;
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    if (status === 'partial') return { label: 'Partial', color: 'bg-amber-100 text-amber-800' };
    if (status === 'pending_approval') return { label: 'Pending Approval', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Pending', color: 'bg-red-100 text-red-800' };
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `FeeReceipt_${studentData?.child_name || 'student'}_${new Date().toLocaleDateString()}`,
  });

  const handleSendReminder = async () => {
    if (!studentData) return;
    try {
      await sendNotification({
        to: studentData.email,
        type: 'email',
        subject: 'Fee Payment Reminder',
        message: `⏰ Friendly reminder: ${studentData.child_name} has pending fees of ₹${summary.pendingAmount.toLocaleString('en-IN')}.\n\nPlease make the payment at your earliest convenience.`,
      });
      showToast('Reminder sent via email!', 'success');
    } catch (err) {
      showToast('Failed to send reminder', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#E2592D]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6F2] to-white py-4 md:py-6 px-3 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* Payment Modal */}
        <UPIPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          pendingAmount={summary.pendingAmount}
          studentData={studentData}
          onSuccess={() => {
            setPaymentModalOpen(false);
            fetchFees();
          }}
          showToast={showToast}
        />

        {/* Hidden Printable */}
        <div style={{ display: 'none' }}>
          <PrintableReceipt ref={printRef} studentData={studentData} fees={fees} summary={summary} />
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A] flex items-center gap-2">
              <IndianRupee className="text-[#E2592D]" size={28} />
              Fees & Payments
            </h1>
            <div className="flex gap-2">
              {summary.pendingAmount > 0 && (
                <button
                  onClick={handleSendReminder}
                  className="px-3 md:px-4 py-2 text-sm border border-[#E2592D] text-[#E2592D] rounded-lg hover:bg-[#FDE3DA] transition"
                >
                  Send Reminder
                </button>
              )}
              {fees.length > 0 && (
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-[#555555] mt-1">View your fee details and make payments securely via UPI.</p>
        </div>

        {/* Summary Cards */}
        {fees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
            <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="text-[#E2592D]" size={20} />
                <span className="text-sm font-medium text-[#555555]">Total Amount</span>
              </div>
              <p className="text-2xl font-black text-[#1A1A1A]">{formatAmount(summary.totalAmount)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-sm font-medium text-[#555555]">Paid Amount</span>
              </div>
              <p className="text-2xl font-black text-green-600">{formatAmount(summary.paidAmount)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-5 border border-[#E5E5E5] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-red-600" size={20} />
                <span className="text-sm font-medium text-[#555555]">Pending Amount</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-red-600">{formatAmount(summary.pendingAmount)}</p>
                {summary.pendingAmount > 0 && (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-2 bg-[#E2592D] text-white rounded-lg text-sm font-medium hover:bg-[#C94E26] transition"
                  >
                    Pay Now <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fees Table */}
        {fees.length > 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[#E5E5E5]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">Pending</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#1A1A1A]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {fees.map((fee) => {
                    const status = getStatusBadge(fee.payment_status);
                    return (
                      <tr key={fee.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-[#555555]">{formatDate(fee.created_at)}</td>
                        <td className="px-4 py-3 text-sm text-[#555555]">
                          <p className="font-medium">{fee.courses?.name || 'Workshop'}</p>
                          {fee.fees_structure?.name && <p className="text-xs text-gray-500">{fee.fees_structure.name}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{formatAmount(fee.total_amount)}</td>
                        <td className="px-4 py-3 text-sm text-green-600">{formatAmount(fee.paid_amount)}</td>
                        <td className="px-4 py-3 text-sm text-red-600">{formatAmount(fee.pending_amount)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {getStatusIcon(fee.payment_status)}
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-8 md:p-12 text-center shadow-sm">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">No fee records found</h3>
            <p className="text-[#555555]">Your fee details will appear here once enrolled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fees;