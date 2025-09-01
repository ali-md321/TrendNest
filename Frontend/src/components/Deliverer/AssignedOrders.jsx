import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDeliverOrdersAction, markOrderDeliveredAction } from "../../actions/delivererAction";
import { Button } from "@mui/material";

export default function AssignedOrders() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetch() {
      const res = await dispatch(getDeliverOrdersAction());
      console.log("To Deliver",res);
      setOrders(Array.isArray(res?.data) ? res.data : []);
    }
    fetch();
  }, [dispatch]);

  const handleDeliverNow = async (orderId) => {
    await dispatch(markOrderDeliveredAction(orderId));
    const res = await dispatch(getDeliverOrdersAction());
    setOrders(Array.isArray(res?.data) ? res.data : []);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  const now = new Date();

  const toBeDelivered = orders.filter(order => order.orderStatus?.toLowerCase() !== "delivered");
  const deliveredRecently = orders.filter(order => {
    if (order.orderStatus?.toLowerCase() === "delivered" && order.deliveredAt) {
      const diffDays = (now - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
      return diffDays <= 2;
    }
    return false;
  });

  const renderProductInfo = (order) => {
    const pd = order.productDetails;
    const image = pd?.product?.images?.[0] || pd?.deletedProductSnapshot?.images?.[0] || "";
    return (
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {image ? (
            <img 
              src={image} 
              alt="Product" 
              className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-lg border border-gray-100 bg-gray-50" 
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 mb-2">
            {pd?.product?.title || "Deleted Product"}
          </h4>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0">
            <span className="text-lg font-bold text-gray-900">₹{pd?.totalPrice}</span>
            <span className="text-sm text-gray-500">Quantity: {pd?.quantity}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAddress = (address) => (
    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
      <div className="flex items-start space-x-2 mb-2">
        <span className="text-green-700 mt-0.5">📍</span>
        <div>
          <p className="text-sm font-semibold text-green-800">Delivery Address</p>
        </div>
      </div>
      <div className="text-sm text-green-700 space-y-1 ml-6">
        <p className="font-semibold">{address?.name}</p>
        <p className="text-green-600">{address?.phone}</p>
        <div className="text-green-700 leading-relaxed">
          <p>{address?.address}</p>
          <p>{address?.city}, {address?.state} - {address?.pincode}</p>
        </div>
      </div>
    </div>
  );

  const OrderCard = ({ order, showDeliverButton = false, isDelivered = false }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Mobile Layout (< md screens) */}
      <div className="p-6 md:hidden">
        {/* Product Info */}
        <div className="mb-4">
          {renderProductInfo(order)}
        </div>

        {/* Customer Info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-blue-700">👤</span>
            <p className="text-sm font-semibold text-blue-800">Customer Details</p>
          </div>
          <div className="text-sm text-blue-700 ml-6">
            <p className="font-semibold">{order.user?.name}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-purple-700">💳</span>
            <p className="text-sm font-semibold text-purple-800">Payment Details</p>
          </div>
          <div className="text-sm text-purple-700 ml-6 space-y-1">
            <p>Method: <span className="font-medium">{order.paymentMethod}</span></p>
            <p>Status: <span className="font-medium">{order.paymentStatus}</span></p>
            <p>Order Status: <span className="font-medium">{order.orderStatus}</span></p>
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          {renderAddress(order.address)}
        </div>

        {/* Delivered Info */}
        {isDelivered && order.deliveredAt && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-emerald-700">✅</span>
              <p className="text-sm font-semibold text-emerald-800">Delivery Completed</p>
            </div>
            <p className="text-sm text-emerald-700 ml-6">
              {new Date(order.deliveredAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Action Button */}
        {showDeliverButton && (
          <button
            onClick={() => handleDeliverNow(order._id)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>🚚</span>
            <span>Mark as Delivered</span>
          </button>
        )}
      </div>

      {/* Desktop Layout (≥ md screens) */}
      <div className="hidden md:block p-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Product Info - 5 columns */}
          <div className="col-span-5">
            {renderProductInfo(order)}
          </div>

          {/* Customer & Payment Info - 3 columns */}
          <div className="col-span-3 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-700">👤</span>
                <p className="text-sm font-semibold text-blue-800">Customer</p>
              </div>
              <p className="text-sm font-medium text-blue-900 ml-6">{order.user?.name}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
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

          {/* Address & Action - 4 columns */}
          <div className="col-span-4 space-y-4">
            {renderAddress(order.address)}
            
            {/* Delivered Info */}
            {isDelivered && order.deliveredAt && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-emerald-700">✅</span>
                  <p className="text-sm font-semibold text-emerald-800">Delivered</p>
                </div>
                <p className="text-sm text-emerald-700 ml-6">
                  {new Date(order.deliveredAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Action Button */}
            {showDeliverButton && (
              <button
                onClick={() => handleDeliverNow(order._id)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>🚚</span>
                <span>Mark as Delivered</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ icon, title, count, gradientColors }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradientColors} shadow-lg`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{count} orders assigned</p>
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
      <h4 className="text-xl font-semibold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-600">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <span className="text-3xl">🚚</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assigned Orders</h1>
              <p className="text-gray-600 mt-1">Manage and track your delivery assignments</p>
            </div>
          </div>
        </div>

        {/* Orders to be Delivered */}
        <section>
          <SectionHeader 
            icon="🚚"
            title="Pending Deliveries" 
            count={toBeDelivered.length}
            gradientColors="from-orange-500 to-red-500"
          />
          
          {toBeDelivered.length === 0 ? (
            <EmptyState 
              title="No pending deliveries"
              message="All assigned orders have been delivered. Check back later for new assignments."
              icon="✅"
            />
          ) : (
            <div className="space-y-4">
              {toBeDelivered.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  showDeliverButton={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recently Delivered Orders */}
        <section>
          <SectionHeader 
            icon="🎉"
            title="Recently Delivered" 
            count={deliveredRecently.length}
            gradientColors="from-green-500 to-emerald-500"
          />
          
          {deliveredRecently.length === 0 ? (
            <EmptyState 
              title="No recent deliveries"
              message="Orders delivered in the last 2 days will appear here."
              icon="📦"
            />
          ) : (
            <div className="space-y-4">
              {deliveredRecently.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  isDelivered={true}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}