// src/components/Checkout/PaymentResult.jsx
import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { axiosInstance as axios } from '../../utils/axiosInstance';
import { useDispatch } from 'react-redux';
import { placeOrderAction } from '../../actions/orderAction';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const PaymentResult = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Checking payment status...');

  useEffect(() => {
    const finish = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const clientSecret = params.get('payment_intent_client_secret');
        const paymentIntentId = params.get('payment_intent') || null;

        if (!clientSecret && !paymentIntentId) {
          setStatus('No payment info returned.');
          return;
        }

        // If we have clientSecret, we can retrieve PI via Stripe JS
        let pi;
        if (clientSecret) {
          const stripe = await stripePromise;
          const resp = await stripe.retrievePaymentIntent(clientSecret);
          pi = resp?.paymentIntent;
        } else if (paymentIntentId) {
          // fallback: ask your backend to retrieve PI (server side)
          const resp = await axios.get(`/api/stripe/retrieve-payment-intent/${paymentIntentId}`);
          pi = resp.data?.paymentIntent;
        }

        if (!pi) {
          setStatus('Unable to load payment intent data.');
          return;
        }

        if (pi.status === 'succeeded') {
          setStatus('Payment succeeded — creating order...');

          // Read pending info from localStorage
          const pendingRaw = localStorage.getItem('pendingOrder');
          const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
          const orderProductRaw = localStorage.getItem('orderProduct');
          const orderProduct = orderProductRaw ? JSON.parse(orderProductRaw) : null;
          const savedAddress = JSON.parse(localStorage.getItem('pendingAddress') || 'null');

          if (!pending || !orderProduct) {
            setStatus('Missing pending order info. Please contact support.');
            return;
          }

          // Build payload consistent with backend placeOrderController
          const payload = {
            productId: orderProduct._id,
            quantity: pending.quantity || 1,
            address: savedAddress || {},
            paymentMethod: 'ONLINE',
            paymentResult: {
              paymentIntentId: pi.id,
              method: pi.payment_method_types?.[0] || 'card'
            }
          };

          const res = await dispatch(placeOrderAction(payload));
          if (res && res.success) {
            localStorage.removeItem('pendingOrder');
            localStorage.removeItem('orderProduct');
            localStorage.removeItem('pendingAddress');
            setStatus('Order placed! Redirecting to orders...');
            setTimeout(() => navigate('/order/success'), 1500);
          } else {
            setStatus('Payment succeeded but placing order failed: ' + (res?.message || 'unknown error'));
          }
        } else {
          setStatus('Payment status: ' + pi.status);
        }
      } catch (err) {
        console.error(err);
        setStatus('Error while finalizing payment: ' + (err.message || 'unknown'));
      }
    };

    finish();
  }, [dispatch, navigate]);

  return (
    <div className="p-8">
      <h2 className="text-lg font-semibold">Payment result</h2>
      <p className="mt-4">{status}</p>
    </div>
  );
};

export default PaymentResult;
