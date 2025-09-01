import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import Loader from '../Layouts/Loader';
import { getAllOrdersAction } from '../../actions/orderAction';

const ShowOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const {isLoading,orders} = useSelector(state => state.orders);
  const filteredOrders = searchTerm.trim()
    ? orders.filter(order =>
        order.productDetails?.product?.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : orders;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });

  useEffect(() => {
    const fetch = async() => {
      await dispatch(getAllOrdersAction());
    }
    fetch();
  },[dispatch])  

  if(isLoading){
    return <Loader/>
  }

  return (
    <>    
    { !orders.length == 0 ?
    <div className="max-w-6xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">My Orders ({orders.length})</h1>

      <input
        type="text"
        placeholder="Search orders..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-6 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="space-y-4">
        {filteredOrders.map(order => {
          const product = order.productDetails?.product || {};

          return (
            <Link to={`/order-details/${order._id}`} >
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Left: Image and Product Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <img
                          src={product?.images?.[0] || '/fallback-image.png'}
                          alt={product?.title || 'Product'}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight mb-2">
                          {product?.title || 'Unknown Product'}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Qty: {order.productDetails?.quantity || 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price and Status */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                      {/* Price */}
                      <div className="text-xl font-bold text-gray-900">
                        ₹{order.productDetails?.totalPrice}
                      </div>

                      {/* Status and Actions */}
                      {(order.orderStatus === 'Delivered' || order.orderStatus === 'Refunded') ? (
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-green-600 font-medium mb-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>
                                {order.orderStatus} on {formatDate(order.deliveredAt || order.updatedAt)}
                              </span>
                            </div>
                            {['Delivered',"Refunded"].includes(order.orderStatus) && (
                              <p className="text-sm text-gray-500">Your item has been {order.orderStatus}</p>
                            )}
                            {!order.review && ['Delivered',"ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(order.orderStatus) && (
                                <button
                                  onClick={() => navigate(`/order/${order._id}/review`)}
                                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 text-sm font-medium transition-colors duration-200"
                                >
                                  <StarIcon fontSize="small" />
                                  <span>Rate & Review Product</span>
                                </button>
                              )}
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className={`flex items-center gap-2 ${["Cancelled","Rejected"].includes(order.orderStatus)  ?  "text-red-700" :  "text-orange-300"} font-medium mb-1`}>
                              <span className={`w-2 h-2 ${["Cancelled","Rejected"].includes(order.orderStatus)  ?  "bg-red-700" :  "bg-orange-300"} rounded-full`}></span>
                              <span>
                                {order.orderStatus} on {formatDate(order.updatedAt)}
                              </span>
                            </div>
                            {!order.review && ['Delivered',"ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(order.orderStatus) && (
                                <button
                                  onClick={() => navigate(`/order/${order._id}/review`)}
                                  className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 text-sm font-medium transition-colors duration-200"
                                >
                                  <StarIcon fontSize="small" />
                                  <span>Rate & Review Product</span>
                                </button>
                              )}
                          </div>
                        )}

                        
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
    : <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    }
    </>
  );
};

export default ShowOrders;