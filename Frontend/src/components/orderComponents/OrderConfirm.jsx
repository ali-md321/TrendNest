// src/components/Checkout/OrderConfirm.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DeliveryAddressSection from './DeliveryAddressSection';
import Loader from '../Layouts/Loader';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm'; // Stripe PaymentElement wrapper
import PriceDetails from './PriceDetails';
import { placeOrderAction } from '../../actions/orderAction';
import { toast } from 'react-toastify';
import { axiosInstance as axios } from '../../utils/axiosInstance';

const Stepper = ({ step }) => {
  const steps = ['LOGIN', 'ORDER', 'ADDRESS', 'PAYMENT'];
  return (
    <div className="flex items-center justify-center gap-2 md:gap-6 mb-8 px-4">
      {steps.map((label, idx) => {
        const s = idx + 1;
        const status = s < step ? 'done' : s === step ? 'active' : 'upcoming';
        return (
          <div key={label} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold text-sm md:text-base transition-all duration-300 ${
                status === 'done' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105' 
                  : status === 'active' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200 transform scale-105' 
                  : 'bg-gray-200 text-gray-600 border-2 border-gray-300'
              }`}>
                {status === 'done' ? '✓' : s}
              </div>
              <div className={`text-xs md:text-sm mt-2 font-medium transition-colors duration-300 ${
                status === 'done' || status === 'active' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {label}
              </div>
            </div>
            {idx !== steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 transition-colors duration-300 ${
                s < step ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

function OrderConfirm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user = {} } = useSelector(state => state.user);

  const [orderProduct, setOrderProduct] = useState(() => {
    const saved = localStorage.getItem("orderProduct");
    return saved ? JSON.parse(saved) : null;
  });

  // steps
  const [step, setStep] = useState(2);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  // paymentMethod: 'COD' | 'WALLET' | 'CARD' | 'UPI'
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [quantity, setQuantity] = useState(1);
  const [useHybrid, setUseHybrid] = useState(false); // wallet + online
  const [walletDeduct, setWalletDeduct] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/product/${orderProduct?._id || ''}/order`);
    }
    if (!orderProduct) {
      toast.error('No product found for order. Please use "Buy Now".');
      navigate('/');
    }
    if (user?.addresses?.length > 0) {
      setSelectedAddressId(user.addresses[0]._id);
    }
  }, [isAuthenticated, user, orderProduct, navigate]);

  if (isLoading) return <Loader />;

  const computeTotals = () => {
    if (!orderProduct) return { total: 0, paise: 0 };
    const price = orderProduct.price * quantity;
    const discount = orderProduct.discountedPrice * quantity;
    const delivery = discount > 500 ? 0 : 40;
    const total = discount + delivery;
    return { total, paise: Math.round(total * 100) };
  };

  const { total, paise } = computeTotals();

  const moveNext = () => setStep(prev => Math.min(prev + 1, 4));
  const movePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const preparePendingInfo = () => {
    const selectedAddress = user.addresses.find(a => a._id === selectedAddressId) || null;
    localStorage.setItem('pendingAddress', JSON.stringify(selectedAddress));
    localStorage.setItem('pendingOrder', JSON.stringify({ productId: orderProduct?._id, quantity, amountPaise: paise }));
  };

  // COD
  const handlePlaceOrderCOD = async () => {
    const selectedAddress = user.addresses.find(addr => addr._id === selectedAddressId);
    if (!selectedAddress || !orderProduct) {
      console.log(selectedAddress,"---",orderProduct)
      toast.error('Missing product or address info');
      return;
    }
    const payload = {
      productId: orderProduct._id,
      quantity,
      address: selectedAddress,
      paymentMethod: 'COD',
      paymentResult: null
    };
    const res = await dispatch(placeOrderAction(orderProduct._id, payload));
    if (res && res.success) {
      localStorage.removeItem("orderProduct");
      navigate('/order/success');
    } else {
      toast.error('Order placement failed');
    }
  };

  // Wallet only
  const handlePlaceOrderWalletOnly = async () => {
    const selectedAddress = user.addresses.find(addr => addr._id === selectedAddressId);
    if (!selectedAddress || !orderProduct) {
      console.log(selectedAddress,"---",orderProduct)
      toast.error('Missing product or address info');
      return;
    }
    const payload = {
      productId: orderProduct._id,
      quantity,
      address: selectedAddress,
      paymentMethod: 'WALLET',
      paymentResult: { walletDeducted: total }
    };
    const res = await dispatch(placeOrderAction(orderProduct._id, payload));
    if (res && res.success) {
      localStorage.removeItem("orderProduct");
      navigate('/order/success');
    } else {
      toast.error('Wallet payment failed: ' + (res.message || 'unknown'));
    }
  };

  // Stripe success callback (used by PaymentForm)
  const onStripePaymentSuccess = async (paymentResult, extra = {}) => {
  const selectedAddress = user.addresses.find(addr => addr._id === selectedAddressId);
  if (!selectedAddress || !orderProduct) {
    toast.error('Missing product or address info before finalizing payment');
    return;
  }
  const payload = {
    productId: orderProduct._id,
    quantity,
    address: selectedAddress,
    paymentMethod: extra.walletDeduct && extra.walletDeduct > 0 ? 'WALLET+CARD' : 'CARD',
    paymentResult: {
      paymentIntentId: paymentResult.paymentIntentId,
      method: paymentResult.paymentMethodType,
      walletDeducted: extra.walletDeduct || 0
    }
  };

  const res = await dispatch(placeOrderAction(orderProduct._id, payload));
  if (res && res.success) {
    localStorage.removeItem("orderProduct");
    localStorage.removeItem("pendingOrder");
    localStorage.removeItem("pendingAddress");
    navigate('/order/success'); // or navigate('/profile/orders') after showing order-placed page
  } else {
    toast.error('Order placement after payment failed: ' + (res.message || 'unknown'));
  }
};

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPay = async () => {
    const selectedAddress = user.addresses.find(addr => addr._id === selectedAddressId);
    if (!selectedAddress || !orderProduct) {
      toast.error('Missing product or address info');
      return;
    }

    // persist pending info so redirect flows can resume
    preparePendingInfo();

    try {
      await loadRazorpayScript();

      // create order on backend — include metadata with qty and productId
      const { data } = await axios.post('/api/razorpay/create-order', {
        amount: paise, // paise
        currency: 'INR',
        metadata: { productId: orderProduct._id, qty: quantity }
      });

      if (!data || !data.order || !data.order.id) {
        toast.error('Unable to create Razorpay order');
        return;
      }

      const order = data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'TrendNest (Demo)',
        description: `Order for ${orderProduct?.title || 'product'}`,
        order_id: order.id,
        // <-- restrict to UPI only:
        method: {
          upi: true,
          card: false,
          netbanking: true,
          wallet: false,
          emi: false,
          paylater: false,
        },
        prefill: {
          name: user.name || 'Demo User',
          email: user.email || 'demo@example.com',
          contact: user.phone || ''
        },
        notes: {
          // optional additional notes
          demo: 'razorpay upi demo'
        },
        theme: { color: '#3399cc' },
        handler: async function (response) {
          // After Razorpay success, send captured info to your backend to finalize order
          try {
            const payload = {
              productId: orderProduct._id,
              quantity,
              address: selectedAddress,
              paymentMethod: 'UPI',
              paymentResult: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            };

            const res = await dispatch(placeOrderAction(orderProduct._id, payload));
            if (res && res.success) {
              localStorage.removeItem('orderProduct');
              localStorage.removeItem('pendingOrder');
              localStorage.removeItem('pendingAddress');
              navigate('/order/success'); // show order-placed page
            } else {
              toast.error('Order placement after UPI failed: ' + (res.message || 'unknown'));
            }
          } catch (err) {
            console.error('Finalizing order error', err);
            toast.error('Finalizing order failed');
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (resp) {
        console.error('razorpay failed', resp);
        toast.error('Payment failed (Razorpay) — see console for details');
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Razorpay order creation failed');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <Stepper step={step} />

            {/* Step 2 - Order Summary */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                  <h2 className="font-bold text-xl text-white flex items-center gap-3">
                    <span className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    ORDER SUMMARY
                  </h2>
                </div>
                <div className="p-6">
                  <OrderSummary product={orderProduct} quantity={quantity} setQuantity={setQuantity} />
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button 
                      onClick={() => navigate(-1)} 
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={moveNext} 
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                      Next: Address →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Delivery Address */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                  <h2 className="font-bold text-xl text-white flex items-center gap-3">
                    <span className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    DELIVERY ADDRESS
                  </h2>
                </div>
                <div className="p-6">
                  <DeliveryAddressSection selected={selectedAddressId} onSelect={setSelectedAddressId} />
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button 
                      onClick={movePrev} 
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={moveNext} 
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                      Next: Payment →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 - Payment Options */}
            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                  <h2 className="font-bold text-xl text-white flex items-center gap-3">
                    <span className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    PAYMENT OPTIONS
                  </h2>
                </div>
                
                <div className="p-6">
                  {/* Payment Method Selection */}
                  <div className="grid gap-4 mb-8">
                    <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200 group">
                      <input 
                        type="radio" 
                        name="pay" 
                        value="COD" 
                        checked={paymentMethod === 'COD'} 
                        onChange={() => { setPaymentMethod('COD'); setUseHybrid(false); }}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          💵
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                          <p className="text-sm text-gray-500">Pay when your order arrives</p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200 group">
                      <input 
                        type="radio" 
                        name="pay" 
                        value="WALLET" 
                        checked={paymentMethod === 'WALLET'} 
                        onChange={() => { setPaymentMethod('WALLET'); setUseHybrid(false); }}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          👛
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">TrendNest Wallet</span>
                          <p className="text-sm text-gray-500">
                            {typeof user.walletBalance !== 'undefined' ? `Balance: ₹${user.walletBalance}` : 'Quick & secure payment'}
                          </p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200 group">
                      <input 
                        type="radio" 
                        name="pay" 
                        value="CARD" 
                        checked={paymentMethod === 'CARD'} 
                        onChange={() => { setPaymentMethod('CARD'); setUseHybrid(false); }}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          💳
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Card / Card Wallet (Stripe)</span>
                          <p className="text-sm text-gray-500">Credit, debit cards & digital wallets</p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all duration-200 group">
                      <input 
                        type="radio" 
                        name="pay" 
                        value="UPI" 
                        checked={paymentMethod === 'UPI'} 
                        onChange={() => { setPaymentMethod('UPI'); setUseHybrid(false); }}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          📱
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">UPI (Razorpay)</span>
                          <p className="text-sm text-gray-500">Pay using any UPI app</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Payment Method Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    {/* COD */}
                    {paymentMethod === 'COD' && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            💵
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">Cash on Delivery</h3>
                            <p className="text-sm text-gray-600">You will pay when your order is delivered</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={movePrev} 
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
                          >
                            ← Back
                          </button>
                          <button 
                            onClick={handlePlaceOrderCOD} 
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                          >
                            🛒 Place Order (COD)
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Wallet */}
                    {paymentMethod === 'WALLET' && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            👛
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">TrendNest Wallet</h3>
                            <p className="text-sm text-gray-600">Use your wallet balance for instant payment</p>
                          </div>
                        </div>
                        
                        {typeof user.walletBalance === 'undefined' ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">⚠️ Wallet info not available. Please refresh your profile.</p>
                          </div>
                        ) : user.walletBalance >= total ? (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={movePrev} 
                              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
                            >
                              ← Back
                            </button>
                            <button 
                              onClick={handlePlaceOrderWalletOnly} 
                              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                              💳 Pay ₹{total} with Wallet
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                              <p className="text-sm text-yellow-800">
                                ⚠️ Insufficient wallet balance (₹{user.walletBalance}). 
                                You can use wallet partially and pay remaining online.
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button 
                                onClick={() => { setUseHybrid(true); setWalletDeduct(user.walletBalance); setPaymentMethod('WALLET'); }} 
                                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
                              >
                                Use Wallet ₹{user.walletBalance} + Pay Remaining Online
                              </button>
                              <button 
                                onClick={() => { setPaymentMethod('CARD'); setUseHybrid(false); }} 
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                              >
                                Pay Full Online (Card)
                              </button>
                            </div>
                          </div>
                        )}

                        {/* hybrid for wallet */}
                        {useHybrid && (
                          <div className="mt-6 bg-white rounded-lg p-4 border">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                +
                              </div>
                              <p className="font-medium">
                                Wallet: ₹{walletDeduct} + Online: ₹{(total - walletDeduct).toFixed(2)}
                              </p>
                            </div>
                            <PaymentForm
                              amount={Math.round((total - walletDeduct) * 100)}
                              onPaymentSuccess={(paymentResult) => onStripePaymentSuccess(paymentResult, { walletDeduct })}
                              pendingOrder={{ productId: orderProduct?._id, quantity }}
                              metadata={{ walletDeduct }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stripe card */}
                    {paymentMethod === 'CARD' && !useHybrid && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            💳
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">Card Payment</h3>
                            <p className="text-sm text-gray-600">
                              Pay securely with Stripe (card) 
                              <span className="inline-block ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Demo mode — no real charges
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border mb-4">
                          <PaymentForm
                            amount={paise}
                            onPaymentSuccess={(paymentResult) => onStripePaymentSuccess(paymentResult)}
                            pendingOrder={{ productId: orderProduct?._id, quantity }}
                          />
                        </div>
                        <button 
                          onClick={movePrev} 
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
                        >
                          ← Back
                        </button>
                      </div>
                    )}

                    {/* UPI Razorpay */}
                    {paymentMethod === 'UPI' && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            📱
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">UPI Payment</h3>
                            <p className="text-sm text-gray-600">
                              Pay using UPI via Razorpay 
                              <span className="inline-block ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                Demo mode — no real charges
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button 
                            onClick={movePrev} 
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
                          >
                            ← Back
                          </button>
                          <button 
                            onClick={handleRazorpayPay} 
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                          >
                            📱 Pay with UPI (Razorpay)
                          </button>
                        </div> 
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Details Sidebar */}
          <div className="w-full lg:w-96 lg:sticky lg:top-6 lg:h-fit">
            <PriceDetails product={orderProduct} quantity={quantity} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirm;