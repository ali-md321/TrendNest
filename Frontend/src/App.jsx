import './App.css';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

import Navbar from './components/Bars/Navbar';
import Footer from './components/Bars/Footer';
import Login from './components/AuthComponents/Login';
import Signup from './components/AuthComponents/Signup';
import Home from './components/Home';
import Loader from './components/Layouts/Loader';
import ProductView from './components/productComponents/ProductView';
import CategoryView from './components/productComponents/CategoryView';
import OrderConfirm from './components/orderComponents/OrderConfirm';
import AddReviewRating from './components/productComponents/AddReviewRating';
import NotFound from './components/Layouts/NotFound';

import ProfileWrapper from './components/Profile/ProfileWrapper';
import ProfileInfo from './components/Profile/ProfileInfo';
import ManageAddresses from './components/Profile/ManageAddresses';
import ShowOrders from './components/Profile/ShowOrders';
import MyWishlist from './components/Profile/MyWishlist';
import CartItems from './components/Profile/CartItems';
import MyReviewRating from './components/Profile/MyReviewRating';

import SellerDashboard from './components/Seller/SellerDashboard';
import SellerProfile from './components/Seller/SellerProfile';
import SellerReviews from './components/Seller/SellerReviews';
import AddProduct from './components/Seller/AddProduct';
import SellerSidebar from './components/Seller/SellerSidebar';
import SellerProducts from './components/Seller/SellerProducts';
import ShowSellerProduct from './components/Seller/ShowSellerProduct';

import { loadUserAction } from './actions/userAction';

import DelivererLayout from './components/Deliverer/DelivererLayout';
import DelivererDashboard from './components/Deliverer/DelivererDashboard';
import AssignedOrders from './components/Deliverer/AssignedOrders';
import ReturnPickups from './components/Deliverer/ReturnPickups';
import DelivererProfile from './components/Deliverer/DelivererProfile';
import OrderSuccess from './components/orderComponents/OrderSuccess';
import ManageShipment from './components/Seller/ManageShipment';
import ShowOrderDetails from './components/Profile/ShowOrderDetails';
import CODSummary from './components/Deliverer/CODSummary';
import ReturnsRefunds from './components/Seller/ReturnsRefunds';
import ChatWithAI from './components/ChatWithAI';
import { connectSocket } from './realtime/socketFrontend';
import { notificationReceived } from './actions/notificationAction';
import HeadsUpNotification from './realtime/HeadsUpNotification';
import NotificationsPage from './components/Profile/NotificationsPage';
import { axiosInstance as axios } from './utils/axiosInstance';

function App() {
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    let socketInstance;
    (async () => {
      const socket = await connectSocket();
      socketInstance = socket;

      socket.on("notification:new", (data) => {
        dispatch(notificationReceived(data));
        window.dispatchEvent(new CustomEvent("trendnest:heads-up", { detail: data }));
      });
    })();

    return () => {
      if (socketInstance) {
        socketInstance.off("notification:new");
      }
    };
  }, [user, dispatch]);


useEffect(() => {
  async function subscribeUser() {
    try {
      // fetch public key from backend via axiosInstance
      const { data } = await axios.get("/api/push/public-key");
      const VAPID_PUBLIC_KEY = data.key;
      if (!VAPID_PUBLIC_KEY) {
        console.warn('No VAPID public key from server');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }

      // Register SW at root scope
      const reg = await navigator.serviceWorker.register('/sw.js');
      // wait until the service worker is active
      await navigator.serviceWorker.ready;

      // check existing subscription
      let subscription = await reg.pushManager.getSubscription();
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // send subscription object to backend
      await axios.post('/api/push/subscribe', { subscription }, { withCredentials: true });

      console.log('Subscription saved');

    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  }

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    // register and subscribe only when user is logged in
    if (user) {
      subscribeUser();
    }
  }
}, [user]);


  useEffect(() => {
    dispatch(loadUserAction());
  }, [dispatch]);

  const role = user?.role;
  const isCustomer = role === 'Customer';
  const isGuest = !isAuthenticated;

  const showNavbarFooter = !isLoading && (isGuest || isCustomer) && location.pathname !== "/chat";
  
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbarFooter && <Navbar />}
      <HeadsUpNotification />
      {isLoading ? (
        <Loader />
      ) : (
        <main className="flex-grow">
          <Routes>
            {/* Public routes (Guest & Customer only) */}
            {(isGuest || isCustomer) && (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductView />} />
                <Route path="/products/:category" element={<CategoryView />} />
              </>
            )}

            {/* Redirect logged-in users away from login/signup */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/profile" /> : <Login />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/profile" /> : <Signup />} />
            <Route path="/chat" element={<ChatWithAI />} />
            {/* Customer-specific routes */}
            {isCustomer && (
              <>
                <Route path="/product/:productId/order" element={<OrderConfirm />} />
                <Route path="/order/:orderId/review" element={<AddReviewRating />} />
                <Route path="/order-details/:orderId" element={<ShowOrderDetails />} />
                <Route path="/order/success" element={<OrderSuccess />} />
                <Route path="/order/:orderId/review/:reviewId" element={<AddReviewRating />} />
                <Route path="/profile" element={<ProfileWrapper />}>
                  <Route index element={<ProfileInfo />} />
                  <Route path="orders" element={<ShowOrders />} />
                  <Route path="addresses" element={<ManageAddresses />} />
                  <Route path="wishlist" element={<MyWishlist />} />
                  <Route path="cart" element={<CartItems />} />
                  <Route path="reviews" element={<MyReviewRating />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </>
            )}

            {/* Redirect profile routes to login if not logged in */}
            {!isAuthenticated && location.pathname.startsWith('/profile') && (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}

            {/* Seller-specific routes */}
            {role === 'Seller' && (
              <Route path="/" element={<SellerSidebar />}>
                <Route index element={<SellerDashboard />} />
                <Route path='/product/:productId' element={<ShowSellerProduct />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="edit-product/:productId" element={<AddProduct />} />
                <Route path="profile" element={<SellerProfile />} />
                <Route path="shipment" element={<ManageShipment />} />
                <Route path="returns-refunds" element={<ReturnsRefunds />} />
                <Route path="notifications" element={<NotificationsPage /> } />
                <Route path="address" element={<ManageAddresses />} />
                <Route path="reviews" element={<SellerReviews />} />
                <Route path="products" element={<SellerProducts />} />
              </Route>
            )}

            {role === "Deliverer" && (
              <Route path="/" element={<DelivererLayout />}>
                <Route index element={<DelivererDashboard />} />
                <Route path="/orders/assigned" element={<AssignedOrders />} />
                <Route path="cod-summary" element={<CODSummary /> } />
                <Route path="return-pickups" element={<ReturnPickups />} />
                <Route path="notifications" element={<NotificationsPage /> } />
                <Route path="profile" element={<DelivererProfile />} />
              </Route>
            )}
            {/* 404 Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}

      {showNavbarFooter && <Footer />}
      <ToastContainer position="bottom-center" autoClose={3000} newestOnTop theme="colored"/>
    </div>
  );
}

export default App;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}