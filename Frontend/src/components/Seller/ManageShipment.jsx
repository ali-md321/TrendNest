import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getShipmentAction, rejectOrderAction, updateShipmentStatusAction } from "../../actions/sellerAction";
import { LocalShipping, CheckCircle, DoneAll } from "@mui/icons-material";
import Loader from "../Layouts/Loader";

function ManageShipment() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    async function fetch() {
      const res = await dispatch(getShipmentAction());
      console.log("Ship",res);
      setShipments(res?.data || []); 
    }
    fetch();
  }, [dispatch]);

  const handleShipNow = async(orderId) => {
    await dispatch(updateShipmentStatusAction(orderId, "Shipped"));
    const res = await dispatch(getShipmentAction());
    setShipments(Array.isArray(res?.data) ? res.data : []);
  };

  const handleRejectOrder = async(orderId) => {
    await dispatch(rejectOrderAction(orderId));
    const res = await dispatch(getShipmentAction());
    setShipments(Array.isArray(res?.data) ? res.data : []);
  };

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const toBeShipped = shipments?.filter((o) => o.orderStatus === "Placed") || [];
  const shippedOrders = shipments?.filter((o) => o.orderStatus === "Shipped") || [];
  const deliveredRecently =
    shipments?.filter(
      (o) =>
        o.orderStatus === "Delivered" &&
        new Date(o.deliveredAt) >= twoDaysAgo
    ) || [];

  const OrderCard = ({ order, actionButton }) => (
    <div
      key={order._id}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Mobile Layout (< md screens) */}
      <div className="p-6 md:hidden">
        <div className="flex space-x-4 mb-4">
          <div className="flex-shrink-0">
            <img
              src={order.productDetails.product?.images?.[0] || "/placeholder.png"}
              alt={order.productDetails.product?.title}
              className="w-20 h-20 object-contain rounded-lg border border-gray-100 bg-gray-50"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
              {order.productDetails.product?.title}
            </h3>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                Qty: <span className="font-medium">{order.productDetails.quantity}</span>
              </p>
              <p className="text-lg font-bold text-gray-900">
                ₹{order.productDetails.totalPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 font-semibold mb-1">👤 Customer Details</p>
          <p className="text-sm font-medium text-blue-800">{order.user.name}</p>
        </div>

        {/* Payment Info */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-purple-700">💳</span>
            <p className="text-sm font-semibold text-purple-800">Payment</p>
          </div>
          <div className="text-sm text-purple-700 ml-6 space-y-1">
            <p>{order.paymentMethod}</p>
            <p>({order.paymentStatus})</p>
            <p className="font-medium">{order.orderStatus}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700 font-semibold mb-1">
            📍 {order.orderStatus === "Placed" ? "Ship To:" : order.orderStatus === "shipped" ? "Shipped To:" : "Delivered To:"}
          </p>
          <div className="text-sm text-green-800 space-y-1">
            <p className="font-semibold">{order.address.name}</p>
            <p className="text-xs">{order.address.phone}</p>
            <p className="text-xs leading-relaxed">
              {order.address.address}<br />
              {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {actionButton && (
          <div className="pt-4 border-t border-gray-100">
            {actionButton}
          </div>
        )}
      </div>

      {/* Desktop Layout (≥ md screens) */}
      <div className="hidden md:block p-6">
        <div className="flex items-start space-x-6">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              src={order.productDetails.product?.images?.[0] || "/placeholder.png"}
              alt={order.productDetails.product?.title}
              className="w-32 h-32 object-contain rounded-xl border border-gray-100 bg-gray-50"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3">
              {order.productDetails.product?.title}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Quantity:</span>
                  <span className="text-sm font-semibold text-gray-900">{order.productDetails.quantity}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Total:</span>
                  <span className="text-xl font-bold text-gray-900">₹{order.productDetails.totalPrice}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-semibold mb-1">👤 Customer</p>
                  <p className="text-sm font-medium text-blue-800">{order.user.name}</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-purple-700">💳</span>
                    <p className="text-sm font-semibold text-purple-800">Payment</p>
                  </div>
                  <div className="text-sm text-purple-700 ml-6 space-y-1">
                    <p>{order.paymentMethod}</p>
                    <p>({order.paymentStatus})</p>
                    <p className="font-medium">{order.orderStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="w-64 flex-shrink-0">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-700 font-bold mb-2">
                📍 {order.orderStatus === "Placed" ? "Ship To:" : order.orderStatus === "shipped" ? "Shipped To:" : "Delivered To:"}
              </p>
              <div className="text-sm text-green-800 space-y-1">
                <p className="font-semibold">{order.address.name}</p>
                <p className="text-xs text-green-600">{order.address.phone}</p>
                <div className="text-xs text-green-700 leading-relaxed mt-2">
                  <p>{order.address.address}</p>
                  <p>{order.address.city}, {order.address.state}</p>
                  <p className="font-medium">{order.address.pincode}</p>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            {actionButton && (
              <div className="mt-4">
                {actionButton}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, count, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="text-white" fontSize="medium" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{count} orders</p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {count} {count === 1 ? 'order' : 'orders'}
          </span>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ title, message, icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <span>🚚</span>
            <span>Shipment Management</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your orders and track shipments</p>
        </div>

        {/* Orders to be Shipped */}
        <section>
          <SectionHeader 
            icon={LocalShipping} 
            title="Orders to be Shipped" 
            count={toBeShipped.length}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          
          {toBeShipped.length === 0 ? (
            <EmptyState 
              title="No pending shipments"
              message="All orders have been processed and shipped."
              icon="✅"
            />
          ) : (
            <div className="space-y-4">
              {toBeShipped.map((order) => (
                <OrderCard
  key={order._id}
  order={order}
  actionButton={
    <div className="flex flex-col md:flex-row gap-3">
      <button
        onClick={() => handleShipNow(order._id)}
        className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
      >
        <LocalShipping fontSize="small" />
        <span>Ship Now</span>
      </button>

      <button
        onClick={() => handleRejectOrder(order._id)}
        className="w-full md:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
      >
        ❌
        <span>Reject Order</span>
      </button>
    </div>
  }
/>

              ))}
            </div>
          )}
        </section>

        {/* Shipped Orders */}
        <section>
          <SectionHeader 
            icon={CheckCircle} 
            title="Shipped Orders" 
            count={shippedOrders.length}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          
          {shippedOrders.length === 0 ? (
            <EmptyState 
              title="No shipped orders"
              message="Orders will appear here once they are shipped."
              icon="📦"
            />
          ) : (
            <div className="space-y-4">
              {shippedOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </section>

        {/* Recently Delivered */}
        <section>
          <SectionHeader 
            icon={DoneAll} 
            title="Delivered in Last 2 Days" 
            count={deliveredRecently.length}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
          
          {deliveredRecently.length === 0 ? (
            <EmptyState 
              title="No recent deliveries"
              message="Recently delivered orders will appear here."
              icon="🎉"
            />
          ) : (
            <div className="space-y-4">
              {deliveredRecently.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ManageShipment;