import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  returnAcceptAction,
  refundOrderAction,
  rejectOrderAction,
  getReturnAcceptOrdersAction,
  getRefundOrderAction,
} from "../../actions/sellerAction";
import { toast } from "react-toastify";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";

function ReturnsRefunds() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("returns"); // default
  const [orders, setOrders] = useState([]);
  const { isLoading } = useSelector(state => state.user);
  useEffect(() => {
    const fetchData = async () => {
      if (tab === "returns") {
        const { data } = await dispatch(getReturnAcceptOrdersAction());
        setOrders(data || []);
      } else {
        const { data } = await dispatch(getRefundOrderAction());
        setOrders(data || []);
      }
    };
    fetchData();
  }, [tab, dispatch]);

  if(isLoading){
    return <Loader/>
  }

  const handleAccept = async(orderId) => {
    let res;
    if (tab === "returns") {
      res = await dispatch(returnAcceptAction(orderId));
    } else {
      res = await dispatch(refundOrderAction(orderId));
    }
    if(res.success){
        if (tab === "returns") {
          toast.success("Return Request is Accepted!..");
          setOrders(prev =>
            prev.map(o =>
              o._id === orderId ? { ...o, orderStatus: "ReturnAccepted" } : o
            )
          );
        } else {
          toast.success("Order Money Refunded");
          setOrders(prev =>
            prev.map(o =>
              o._id === orderId ? { ...o, orderStatus: "Refunded" } : o
            )
          );
        }
      }else{
        toast.error(res.error)
    }
  };

   const handleReject = async(orderId) => {
    const res = await dispatch(rejectOrderAction(orderId));
    if (res.success) {
      toast.info("Request Rejected");
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, orderStatus: "Rejected" } : o
        )
      );
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Box sx={{ 
      bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h6" 
            fontWeight="700" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '1.7rem', sm: '2.4rem', md: '2.9rem' },
              background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              textShadow: '0 3px 6px rgba(0,0,0,0.7)',
              letterSpacing: '-0.02em'
            }}
          >
            Returns & Refunds
          </Typography>
          <Typography 
            variant="p" 
            fontWeight="250" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' },
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}
          >
            Streamline your customer service with efficient return and refund management
          </Typography>
        </Box>

        {/* Enhanced Toggle Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 5 
          }}
        >
          <Paper 
            elevation={8} 
            sx={{ 
              borderRadius: 8, 
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={(e, val) => val && setTab(val)}
              sx={{
                '& .MuiToggleButton-root': {
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  border: 'none',
                  borderRadius: 0,
                  minWidth: { xs: '140px', sm: '160px' },
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                    }
                  },
                  '&:not(.Mui-selected)': {
                    bgcolor: 'transparent',
                    color: '#666',
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="returns" startIcon={<AssignmentReturnIcon />}>
                Returns
              </ToggleButton>
              <ToggleButton value="refunds" startIcon={<AccountBalanceWalletIcon />}>
                Refunds
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Box>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Paper 
            elevation={6} 
            sx={{ 
              p: { xs: 4, sm: 8 }, 
              textAlign: 'center',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              border: '2px dashed rgba(102, 126, 234, 0.3)'
            }}
          >
            <Box sx={{ mb: 4 }}>
              {tab === "returns" ? (
                <AssignmentReturnIcon sx={{ fontSize: 80, color: '#667eea', opacity: 0.7 }} />
              ) : (
                <AccountBalanceWalletIcon sx={{ fontSize: 80, color: '#667eea', opacity: 0.7 }} />
              )}
            </Box>
            <Typography 
              variant="h5" 
              fontWeight="700"
              sx={{ 
                fontSize: { xs: '1.3rem', sm: '1.5rem' },
                color: '#333',
                mb: 2
              }}
            >
              No {tab === "returns" ? "Returns" : "Refunds"} found
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.95rem', sm: '1rem' },
                maxWidth: '400px',
                mx: 'auto'
              }}
            >
              {tab === "returns" 
                ? "All return requests have been processed. Great job keeping up with customer service!"
                : "No pending refund requests at the moment. Your customers are satisfied!"
              }
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card
                  elevation={8}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      '&::before': {
                        opacity: 1
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      opacity: 0.7,
                      transition: 'opacity 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                    {/* Full Width Layout */}
                    <Box sx={{ width: '100%' }}>
                      
                      {/* Header Section - Product Info */}
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 3, sm: 4 },
                        mb: 4,
                        alignItems: { xs: 'center', sm: 'flex-start' }
                      }}>
                        {/* Product Image */}
                        <Box sx={{ 
                          flexShrink: 0,
                          position: 'relative'
                        }}>
                          <Box
                            sx={{
                              width: { xs: 140, sm: 160, md: 180 },
                              height: { xs: 140, sm: 160, md: 180 },
                              borderRadius: 3,
                              overflow: 'hidden',
                              border: '3px solid #f0f0f0',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              position: 'relative'
                            }}
                          >
                            <img
                              src={order.productDetails?.product?.images?.[0] || "/no-img.png"}
                              alt={order.productDetails?.product?.title || "Product"}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                              }}
                            />
                            <Box sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              Qty: {order.productDetails?.quantity}
                            </Box>
                          </Box>
                        </Box>

                        {/* Product Details */}
                        <Box sx={{ 
                          flex: 1, 
                          textAlign: { xs: 'center', sm: 'left' },
                          width: '100%'
                        }}>
                          <Typography 
                            variant="h5" 
                            fontWeight="800"
                            sx={{ 
                              mb: 2,
                              fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.7rem' },
                              lineHeight: 1.2,
                              color: '#1a1a1a',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            {order.productDetails?.product?.title}
                          </Typography>

                          {/* Price Tag */}
                          <Box sx={{ mb: 3 }}>
                            <Chip
                              label={`₹${order.productDetails?.totalPrice}`}
                              sx={{
                                bgcolor: '#667eea',
                                color: 'white',
                                fontWeight: 800,
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                px: 2,
                                py: 1,
                                height: 'auto',
                                '& .MuiChip-label': {
                                  py: 1
                                }
                              }}
                            />
                          </Box>

                          {/* Info Chips */}
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1.5, 
                            mb: 3,
                            flexWrap: 'wrap',
                            justifyContent: { xs: 'center', sm: 'flex-start' }
                          }}>
                            <Chip
                              icon={<PersonIcon sx={{ fontSize: 18 }} />}
                              label={order.user?.name}
                              size="medium"
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600,
                                borderColor: '#667eea',
                                color: '#667eea',
                                '& .MuiChip-label': {
                                  fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                },
                                '&:hover': {
                                  bgcolor: 'rgba(102, 126, 234, 0.1)'
                                }
                              }}
                            />
                            <Chip
                              icon={<ShoppingBagIcon sx={{ fontSize: 18 }} />}
                              label={`#${order._id.slice(-8)}`}
                              size="medium"
                              variant="outlined"
                              sx={{ 
                                fontWeight: 600,
                                borderColor: '#764ba2',
                                color: '#764ba2',
                                '& .MuiChip-label': {
                                  fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                },
                                '&:hover': {
                                  bgcolor: 'rgba(118, 75, 162, 0.1)'
                                }
                              }}
                            />
                          </Box>

                          {/* Status Chip */}
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              label={order.orderStatus}
                              color={
                                order.orderStatus === 'ReturnRequest' ? 'warning' :
                                order.orderStatus === 'ReturnAccepted' ? 'info' :
                                order.orderStatus === 'Refunded' ? 'success' :
                                'default'
                              }
                              sx={{ 
                                fontWeight: 700,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                px: 2,
                                py: 1,
                                height: 'auto',
                                '& .MuiChip-label': {
                                  py: 0.5
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      <Divider sx={{ 
                        my: 4, 
                        borderColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 1
                      }} />

                      {/* Full Width Bottom Section */}
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 4, md: 6 },
                        alignItems: { xs: 'stretch', md: 'flex-start' }
                      }}>
                        
                        {/* Shipping Address Section */}
                        <Box sx={{ 
                          flex: 1,
                          minWidth: 0
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 2,
                            gap: 1
                          }}>
                            <LocationOnIcon sx={{ color: '#667eea', fontSize: 24 }} />
                            <Typography 
                              variant="h6" 
                              fontWeight="700"
                              sx={{ 
                                color: '#333',
                                fontSize: { xs: '1.1rem', sm: '1.2rem' }
                              }}
                            >
                              Shipping Address
                            </Typography>
                          </Box>
                          
                          <Paper 
                            elevation={2}
                            sx={{ 
                              p: 3,
                              bgcolor: 'rgba(102, 126, 234, 0.05)',
                              borderRadius: 3,
                              border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}
                          >
                            <Typography 
                              variant="body1" 
                              fontWeight="600"
                              sx={{ 
                                mb: 1,
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                color: '#333'
                              }}
                            >
                              {order.address?.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                lineHeight: 1.6,
                                color: '#555',
                                mb: 2
                              }}
                            >
                              {order.address?.address}<br/>
                              {order.address?.locality}<br/>
                              {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon sx={{ fontSize: 18, color: '#667eea' }} />
                              <Typography 
                                variant="body2" 
                                fontWeight="600"
                                sx={{ 
                                  fontSize: { xs: '0.9rem', sm: '1rem' },
                                  color: '#667eea'
                                }}
                              >
                                {order.address?.phone}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>

                        {/* Action Buttons Section */}
                        {order.orderStatus === "ReturnRequest" || order.orderStatus === "ReturnPickedUp" ? (
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2.5,
                          alignItems: 'stretch',
                          minWidth: { xs: '100%', md: '280px' }
                        }}>
                          <Typography 
                            variant="h6" 
                            fontWeight="700"
                            sx={{ 
                              textAlign: { xs: 'center', md: 'left' },
                              color: '#333',
                              fontSize: { xs: '1.1rem', sm: '1.2rem' },
                              mb: 1
                            }}
                          >
                            Actions Required
                          </Typography>

                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleAccept(order._id)}
                            sx={{ 
                              textTransform: "none", 
                              borderRadius: 3,
                              py: { xs: 1.5, sm: 2 },
                              fontWeight: 700,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              background: 'linear-gradient(45deg, #4caf50, #45a049)',
                              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #45a049, #3d8b40)',
                                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            ✓ {tab === "returns" ? "Accept Return" : "Process Refund"}
                          </Button>

                          <Button
                            variant="outlined"
                            size="large"
                            color="error"
                            onClick={() => handleReject(order._id)}
                            sx={{ 
                              textTransform: "none", 
                              borderRadius: 3,
                              py: { xs: 1.5, sm: 2 },
                              fontWeight: 700,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              borderWidth: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderWidth: 2,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.3)'
                              }
                            }}
                          >
                            ✕ Reject Request
                          </Button>
                        </Box>
                        ) : null}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default ReturnsRefunds;