import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetailsAction, rateDeliveryAction, returnRequestAction, cancelOrderAction } from "../../actions/orderAction";
import { Box, Typography, Divider, Button, Rating, Chip, Paper, Card, CardContent } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import Loader from "../Layouts/Loader";
import ChatIcon from "@mui/icons-material/Chat";
import ReplayIcon from "@mui/icons-material/Replay";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {toast} from "react-toastify";

const ShowOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState({});
  const [tempDeliveryRating, setTempDeliveryRating] = useState(0);
  const { isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    const fetch = async () => {
      const res = await dispatch(getOrderDetailsAction(orderId));
      setOrder(res.orderDetails);
    };
    fetch();
  }, [dispatch, orderId]);

  useEffect(() => {
    if (["ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded", "Cancelled"].includes(order?.orderStatus)) {
      const refetch = async () => {
        const res = await dispatch(getOrderDetailsAction(orderId));
        setOrder(res.orderDetails);
      };
      refetch();
    }
  }, [dispatch, orderId, order?.orderStatus]);

  if (isLoading || !order) {
    return <Loader />;
  }

  const {
    productDetails,
    address,
    paymentMethod,
    paymentStatus,
    orderStatus,
    orderedAt,
    shippedAt,
    deliveredAt,
    returnRequestAt,
    returnAcceptedAt,
    returnPickedUpAt,
    refundedAt,
    cancelledAt,
    expectedDelivery,
    review,
    deliveryRating
  } = order;

  const product =
    productDetails?.product || productDetails?.deletedProductSnapshot;
  
  const POST_DELIVERY_STATUSES = ["Delivered", "ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"];
  const canRate = POST_DELIVERY_STATUSES.includes(orderStatus);
  const canReturn = orderStatus == "Delivered";
  let timeline = [];

  // Helper to safely assign date
  const safeDate = (dateStr) => {
    if (dateStr) return dateStr;
    return deliveredAt// fallback = today
  };

  // Always starts with Placed
  timeline.push({
    label: "Order Placed",
    date: safeDate(orderedAt),
    active: true,
    completed: true
  });

  // Confirmed
  if (["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(orderStatus)) {
    timeline.push({
      label: "Confirmed",
      date: safeDate(orderedAt),
      active: true,
      completed: true
    });
  }

  // Shipped
  if (["Shipped", "Out for Delivery", "Delivered", "Cancelled", "ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(orderStatus)) {
    timeline.push({
      label: "Shipped",
      date: safeDate(shippedAt),
      active: true,
      completed: orderStatus !== "Shipped"
    });
  }

  // Out for Delivery (only when status is OFD or after Shipped with expectedDelivery)
  if (["Placed", "Confirmed", "Shipped","Out for Delivery"].includes(orderStatus)) {
    timeline.push({
      label: "Out for Delivery",
      date: safeDate(expectedDelivery),
      active: true,
      completed: !["Placed", "Confirmed", "Shipped","Out for Delivery"].includes(orderStatus)
    });
  }

  // Delivered
  if(["Delivered", "ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(orderStatus)) {
    timeline.push({
      label: "Delivered",
      date: safeDate(deliveredAt),
      active: true,
      completed: POST_DELIVERY_STATUSES.includes(orderStatus)
    });
  }

  // Cancelled
  if (orderStatus === "Cancelled") {
    timeline.push({
      label: "Cancelled",
      date: safeDate(cancelledAt),
      active: true,
      completed: true
    });
  }

  // Return flow
  if (["ReturnRequest", "ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(orderStatus)) {
    timeline.push({
      label: "Return Requested",
      date: safeDate(returnRequestAt),
      active: true,
      completed: orderStatus !== "ReturnRequest"
    });
  }
  if (["ReturnAccepted", "ReturnPickedUp", "Refunded"].includes(orderStatus)) {
    timeline.push({
      label: "Return Accepted",
      date: safeDate(returnAcceptedAt),
      active: true,
      completed: orderStatus !== "ReturnAccepted"
    });
  }
  if (["ReturnPickedUp", "Refunded"].includes(orderStatus)) {
    timeline.push({
      label: "Return Picked Up",
      date: safeDate(returnPickedUpAt),
      active: true,
      completed: orderStatus !== "ReturnPickedUp"
    });
  }
  if (orderStatus === "Refunded") {
    timeline.push({
      label: "Refunded",
      date: safeDate(refundedAt),
      active: true,
      completed: true
    });
  }

  // Rejected
  if (orderStatus === "Rejected") {
    timeline.push({
      label: "Rejected",
      date: safeDate(cancelledAt),
      active: true,
      completed: true
    });
  }

  const handleDeliveryRatingSubmit = async () => {
    if (!deliveryRating && tempDeliveryRating) {
      await dispatch(rateDeliveryAction(order._id, tempDeliveryRating));
      setOrder((prev) => ({ ...prev, deliveryRating: tempDeliveryRating }));
      setTempDeliveryRating(0);
    }
  };

  const handleCancelOrder = async () => {
    const res = await dispatch(cancelOrderAction(orderId));
    if (res.success) {
      toast.success("Order cancelled successfully!");
      const updated = await dispatch(getOrderDetailsAction(orderId));
      setOrder(updated.orderDetails);
    } else {
      toast.error(res.error || "Failed to cancel order.");
    }
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleReturn = async() => {
    const res = await dispatch(returnRequestAction(orderId));
    if(res.success){
      toast.success("Return Requested!..");
    }else{
      toast.error(res.error);
    }
  }

  return (
    <Box 
      sx={{ 
        maxWidth: '1200px', 
        mx: 'auto', 
        p: { xs: 1, sm: 2, md: 3 }, 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 2, md: 3 },
        bgcolor: '#f8f9fa',
        minHeight: '100vh'
      }}
    >
      {/* Left Side - Main Content */}
      <Box 
        sx={{ 
          flex: { lg: 2 }
        }}
      >
        {/* Product Details Card */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: { xs: 2, md: 3 }, 
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 } }}>
              {/* Product Image */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexShrink: 0 
              }}>
                <Box
                  sx={{
                    width: { xs: 120, sm: 150 },
                    height: { xs: 120, sm: 150 },
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <img
                    src={product?.images?.[0] || "/placeholder.png"}
                    alt={product?.title || "Product"}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              </Box>

              {/* Product Info */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography 
                  variant="h6" 
                  fontWeight="700" 
                  sx={{ 
                    mb: 1.5,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    lineHeight: 1.3
                  }}
                >
                  {product?.title}
                </Typography>
                
                <Box sx={{ mb: 1.5 }}>
                  <Chip 
                    label={`Size: ${product?.size || 'L'}`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
                  />
                  <Chip 
                    label={`Color: ${product?.color || 'Multicolor'}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Sold by: <strong>{product?.brand || 'FORCAS APPARELS'}</strong>
                </Typography>
                
                <Typography 
                  variant="h4" 
                  fontWeight="800" 
                  sx={{ 
                    color: '#1976d2', 
                    mb: 3,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  ₹{productDetails?.totalPrice}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  {["Placed", "Confirmed", "Shipped", "Out for Delivery"].includes(orderStatus) && (
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                      onClick={handleCancelOrder}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {canReturn && (
                    <Button
                      variant="outlined"
                      startIcon={<ReplayIcon />}
                      color="error"
                      sx={{ textTransform: 'none', borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                      onClick={handleReturn}
                    >
                      Return Request
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<img src="/chat_with_us.webp" alt='Chat_Icon' className="w-9 h-9 invert-20 sepia saturate-500 hue-rotate-190"/>}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      color: "black",         // text color
                      borderColor: "black",   // border color
                    }}
                    onClick={() => navigate("/chat")}
                  >
                    Chat with us
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Order Timeline Card */}
        <Card 
          elevation={2} 
          sx={{ 
            mb: { xs: 2, md: 3 }, 
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Order Status
            </Typography>
            
            <Box sx={{ position: 'relative' }}>
              {timeline.map((step, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, position: 'relative' }}>
                  {/* Timeline Line */}
                  {index < timeline.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '11px',
                        top: '24px',
                        width: '2px',
                        height: '40px',
                        bgcolor: step.completed ? '#4caf50' : '#ffeb3b',
                        zIndex: 0
                      }}
                    />
                  )}
                  
                  {/* Status Icon */}
                  <Box sx={{ zIndex: 1, mr: 3 }}>
                    {step.completed ? (
                      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                    ) : step.active ? (
                      <RadioButtonUncheckedIcon sx={{ color: '#ffeb3b', fontSize: 24 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ color: '#e0e0e0', fontSize: 24 }} />
                    )}
                  </Box>

                  {/* Status Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body1" 
                      fontWeight="600"
                      sx={{ 
                        color: step.completed ? '#4caf50' : step.active ? '#ff9800' : '#9e9e9e',
                        mb: 0.5,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {step.label}
                    </Typography>
                    {step.date && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        {formatFullDate(step.date)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Return Policy */}
            {deliveredAt && (
              <Box sx={{ 
                mt: 3, 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: '#fff3e0', 
                borderRadius: 2,
                border: '1px solid #ffcc02'
              }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Return policy ends on {new Date(new Date(deliveredAt).getTime() + 8 * 24 * 60 * 60 * 1000).toDateString()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Reviews and Ratings Card */}
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
        {canRate && (
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Rate your experience
            </Typography>

            {/* Product Review Section */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight="600" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Product Review
              </Typography>
              
              {review ? (
                <Box sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Rating
                      value={review.rating}
                      precision={1}
                      icon={<StarIcon fontSize="inherit" />}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      ({review.rating}/5)
                    </Typography>
                  </Box>
                  
                  {review.title && (
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="600" 
                      sx={{ 
                        mb: 1,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {review.title}
                    </Typography>
                  )}
                  
                  {review.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        lineHeight: 1.5,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                    >
                      {review.description}
                    </Typography>
                  )}
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600
                    }}
                    onClick={() => navigate(`/order/${orderId}/review/${review._id}`)}
                  >
                    Edit Review
                  </Button>
                </Box>
              ) : (
                <Box sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  border: '2px dashed #e0e0e0', 
                  borderRadius: 2,
                  textAlign: 'center'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body1">Good</Typography>
                    <Rating
                      value={0}
                      precision={1}
                      icon={<StarIcon fontSize="inherit" />}
                      readOnly
                      size="small"
                    />
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                      px: 3
                    }}
                    onClick={() => navigate(`/order/${orderId}/review`)}
                  >
                    Write a Review
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Delivery Rating Section */}
            <Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="600" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Rate Delivery Experience
              </Typography>
              
              {deliveryRating ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: { xs: 2, sm: 3 }, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 2,
                  border: '1px solid #e9ecef'
                }}>
                  <Rating
                    value={deliveryRating}
                    precision={1}
                    icon={<StarIcon fontSize="inherit" />}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                    ({deliveryRating}/5)
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  border: '2px dashed #e0e0e0', 
                  borderRadius: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                  }}>
                    <Rating
                      value={tempDeliveryRating}
                      precision={1}
                      icon={<StarIcon fontSize="inherit" />}
                      onChange={(e, newValue) => setTempDeliveryRating(newValue)}
                      size="small"
                    />
                    {tempDeliveryRating > 0 && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 2,
                          fontWeight: 600,
                          px: 3
                        }}
                        onClick={handleDeliveryRatingSubmit}
                      >
                        Submit
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        )}
        </Card>
      </Box>

      {/* Right Side - Details */}
      <Box 
        sx={{ 
          flex: { lg: 1 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, md: 3 }
        }}
      >
        {/* Delivery Details */}
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Delivery Details
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: '#1976d2', mt: 0.5, mr: 1.5 }} />
                <Box>
                  <Typography 
                    variant="body2" 
                    fontWeight="600" 
                    sx={{ 
                      mb: 0.5,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Other
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.4,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    {address?.locality || 'Boys hostel-1 IIIT-RK Valley, vempalli'}, {address?.city || 'Y'}...
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: 20, color: '#1976d2', mr: 1.5 }} />
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {address?.name || 'Mohammad Ali'} • {address?.phone || '7670964792'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Price Details */}
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Price Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  List price
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textDecoration: 'line-through', 
                    color: 'text.secondary',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  ₹1,499
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Selling price
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  ₹{productDetails?.totalPrice}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Promotion discount
                </Typography>
                <Typography 
                  variant="body2" 
                  color="success.main"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  -₹18
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Platform fee
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  ₹5
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                bgcolor: '#e3f2fd',
                borderRadius: 2
              }}>
                <Typography 
                  variant="body1" 
                  fontWeight="700"
                  sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                >
                  Total Amount
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="700" 
                  color="primary"
                  sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
                >
                  ₹{productDetails?.totalPrice}
                </Typography>
              </Box>

              <Box sx={{ 
                mt: 2, 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: '#f5f5f5', 
                borderRadius: 2 
              }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  • UPI: ₹{productDetails?.totalPrice}.0
                </Typography>
              </Box>
            </Box>

            {/* Payment Details */}
            <Divider sx={{ my: 3 }} />
            <Typography 
              variant="subtitle2" 
              fontWeight="600" 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Payment Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Method: <strong>{paymentMethod}</strong>
              </Typography>
              <Chip 
                label={paymentStatus} 
                size="small" 
                color={paymentStatus === 'Paid' ? 'success' : 'warning'}
                sx={{ 
                  alignSelf: 'flex-start',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ShowOrderDetails;