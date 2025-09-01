// src/components/Checkout/PaymentForm.jsx
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { axiosInstance as axios } from '../../utils/axiosInstance';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // confirmPayment with no forced redirect. If redirect is required for the payment method,
      // Stripe will redirect; otherwise we'll receive a paymentIntent object here.
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // optional fallback if redirect happens; we also support client-side finalize
          return_url: window.location.origin + '/order-success'
        },
        redirect: 'if_required',
      });

      if (error) {
        // display error
        setErrorMsg(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent) {
        // If Stripe returned a paymentIntent immediately (no redirect), check status:
        if (paymentIntent.status === 'succeeded') {
          // tell parent to finalize the order (parent will call your backend to place order)
          onPaymentSuccess({
            paymentIntentId: paymentIntent.id,
            paymentMethodType: paymentIntent.payment_method_types?.[0] || 'card',
          });
        } else {
          // other statuses (requires_action, processing) — handle as needed
          setErrorMsg(`Payment status: ${paymentIntent.status}`);
        }
      }

      // If redirect occurred, this code won't run (browser will redirect).
    } catch (err) {
      console.error('confirmPayment error', err);
      setErrorMsg(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMsg && <div className="text-red-500">{errorMsg}</div>}
      <div>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isProcessing ? 'Processing…' : 'Pay now'}
        </button>
      </div>
    </form>
  );
}

export default function PaymentForm({ amount = 0, onPaymentSuccess = () => {}, pendingOrder = {}, metadata = {} }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const createIntent = async () => {
      try {
        const meta = { ...(metadata || {}) };
        meta.productId = pendingOrder.productId || '';
        meta.qty = pendingOrder.quantity || 1;

        const { data } = await axios.post('/api/stripe/create-payment-intent', {
          amount,
          currency: 'inr',
          metadata: meta,
        });

        if (!mounted) return;

        if (data && (data.clientSecret || data.client_secret)) {
          setClientSecret(data.clientSecret || data.client_secret);
        } else {
          setError('Failed to create payment session');
        }
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Failed to create payment session');
      }
    };

    if (amount > 0) createIntent();

    // store pendingOrder for fallback redirect flow
    localStorage.setItem('pendingOrder', JSON.stringify({ ...pendingOrder, amountPaise: amount }));

    return () => { mounted = false; };
    // IMPORTANT: only depend on `amount` to avoid re-creating PI frequently which causes flicker
  }, [amount]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!clientSecret) return <div>Loading payment form…</div>;

  // Render Elements only after clientSecret is available
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
}
