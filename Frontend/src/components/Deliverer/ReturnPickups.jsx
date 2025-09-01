import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { getreturnPickupOrdersAction, returnPickupAction } from "../../actions/delivererAction";
import { toast } from "react-toastify";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

export default function ReturnPickups() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const { data } = await dispatch(getreturnPickupOrdersAction());
        setOrders(data || []);
      } catch (err) {
        console.error("Failed to fetch return pickups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, [dispatch]);

  const handlePickup = async (orderId) => {
    try {
      const res = await dispatch(returnPickupAction(orderId));
      if(res.success){
        toast.success("Return picked Up!...");
        setOrders(prev =>
          prev.map(o =>
            o._id === orderId ? { ...o, orderStatus: "ReturnPickedUp" } : o
          )
        )
      }
      else throw Error(res.error);
    } catch (err) {
      toast.error("Pickup failed:", err);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{
          background: '#ffffff'
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: { xs: '#667eea', md: 'white' },
            mb: 2
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: { xs: '#667eea', md: 'white' },
            fontWeight: 600
          }}
        >
          Loading return pickups...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      background: '#ffffff',
      minHeight: '100vh',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 2,
            mb: 2
          }}>
            <LocalShippingIcon sx={{ 
              fontSize: { xs: 40, sm: 50 }, 
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))'
            }} />
            <Typography 
              variant="h3" 
              fontWeight="900" 
              sx={{ 
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                textShadow: '0 3px 6px rgba(0,0,0,0.7)',
                letterSpacing: '-0.02em'
              }}
            >
              Return Pickups
            </Typography>
          </Box>
          <Typography 
            variant="p" 
              fontWeight="300" 
              sx={{ 
                fontSize: { xs: '0.8rem', sm: '1.2rem', md: '1.5rem' },
                letterSpacing: '-0.02em'
            }}
          >
            Efficiently manage and process customer return pickups
          </Typography>
        </Box>

        {/* Content Section */}
        {orders.length === 0 ? (
          <Paper 
            elevation={8} 
            sx={{ 
              p: { xs: 4, sm: 6, md: 8 }, 
              textAlign: 'center',
              borderRadius: 4,
              background: { 
                xs: '#ffffff',
                md: 'rgba(255,255,255,0.95)'
              },
              backdropFilter: { xs: 'none', md: 'blur(10px)' },
              border: '2px dashed rgba(102, 126, 234, 0.3)',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            <Box sx={{ mb: 4 }}>
              <LocalShippingIcon sx={{ 
                fontSize: 80, 
                color: '#667eea', 
                opacity: 0.7,
                mb: 2
              }} />
            </Box>
            <Typography 
              variant="h4" 
              fontWeight="700"
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                color: '#333',
                mb: 2
              }}
            >
              All Clear! 🎉
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                maxWidth: '400px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              No return pickups are pending at the moment. Great job staying on top of deliveries!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card
                  elevation={10}
                  sx={{
                    borderRadius: { xs: 2, md: 4 },
                    overflow: 'hidden',
                    background: { 
                      xs: '#ffffff',
                      md: 'rgba(255,255,255,0.98)'
                    },
                    backdropFilter: { xs: 'none', md: 'blur(15px)' },
                    border: { 
                      xs: '1px solid #e0e0e0',
                      md: '1px solid rgba(255,255,255,0.2)'
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    '&:hover': {
                      transform: { xs: 'none', md: 'translateY(-6px)' },
                      boxShadow: { 
                        xs: '0 4px 12px rgba(0,0,0,0.1)',
                        md: '0 25px 50px rgba(0,0,0,0.2)'
                      },
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
                      opacity: 0.8,
                      transition: 'opacity 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 5 } }}>
                    
                    {/* Main Content Layout */}
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 2.5, sm: 3, md: 4 },
                      alignItems: { xs: 'center', sm: 'flex-start' },
                      width: '100%'
                    }}>
                      
                      {/* Product Image Section */}
                      <Box sx={{ 
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        <Box
                          sx={{
                            width: { xs: 120, sm: 140, md: 180 },
                            height: { xs: 120, sm: 140, md: 180 },
                            borderRadius: { xs: 2, md: 3 },
                            overflow: 'hidden',
                            border: '2px solid #f0f0f0',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                            position: 'relative',
                            background: '#f8f9fa'
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
                            top: 6,
                            right: 6,
                            bgcolor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            px: 1.2,
                            py: 0.4,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            Qty: {order.productDetails?.quantity}
                          </Box>
                        </Box>
                      </Box>

                      {/* Product Details Section */}
                      <Box sx={{ 
                        flex: 1, 
                        width: '100%',
                        textAlign: { xs: 'center', sm: 'left' }
                      }}>
                        
                        {/* Product Title */}
                        <Typography 
                          variant="h5" 
                          fontWeight="800"
                          sx={{ 
                            mb: 1.5,
                            fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.7rem' },
                            lineHeight: 1.2,
                            color: '#1a1a1a',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {order.productDetails?.product?.title}
                        </Typography>

                        {/* Customer & Order Info */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: { xs: 1, md: 1.5 }, 
                          mb: 2,
                          flexWrap: 'wrap',
                          justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}>
                          <Chip
                            icon={<PersonIcon sx={{ fontSize: 16 }} />}
                            label={order.user?.name}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              borderColor: '#667eea',
                              color: '#667eea',
                              fontSize: { xs: '0.8rem', sm: '0.85rem' },
                              '&:hover': {
                                bgcolor: 'rgba(102, 126, 234, 0.1)'
                              }
                            }}
                          />
                          <Chip
                            icon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
                            label={`#${order._id.slice(-8)}`}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              borderColor: '#764ba2',
                              color: '#764ba2',
                              fontSize: { xs: '0.8rem', sm: '0.85rem' },
                              '&:hover': {
                                bgcolor: 'rgba(118, 75, 162, 0.1)'
                              }
                            }}
                          />
                        </Box>

                        {/* Price Information */}
                        <Box sx={{ mb: 2 }}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: { xs: 1.5, md: 2 },
                              bgcolor: 'rgba(102, 126, 234, 0.08)',
                              borderRadius: 2,
                              border: '1px solid rgba(102, 126, 234, 0.2)',
                              display: 'inline-block',
                              minWidth: { xs: '180px', sm: '220px' }
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                color: '#555',
                                mb: 0.5
                              }}
                            >
                              Price: ₹{order.productDetails?.totalPrice} × {order.productDetails?.quantity}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight="800"
                              sx={{ 
                                color: '#667eea',
                                fontSize: { xs: '1.1rem', sm: '1.2rem' }
                              }}
                            >
                              Total: ₹{order.productDetails?.totalPrice}
                            </Typography>
                          </Paper>
                        </Box>

                        {/* Return Reason */}
                        {order.returnReason && (
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              icon={<AssignmentReturnIcon sx={{ fontSize: 16 }} />}
                              label={`Reason: ${order.returnReason}`}
                              color="warning"
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                px: 0.5,
                                height: 'auto',
                                '& .MuiChip-label': {
                                  py: 0.8
                                }
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ 
                      my: { xs: 3, md: 4 }, 
                      borderColor: 'rgba(102, 126, 234, 0.2)',
                      borderWidth: 1
                    }} />

                    {/* Full Width Bottom Section */}
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: { xs: 'column', lg: 'row' },
                      gap: { xs: 3, lg: 5 },
                      alignItems: { xs: 'stretch', lg: 'flex-start' },
                      width: '100%'
                    }}>
                      
                      {/* Address Section */}
                      <Box sx={{ 
                        flex: 1,
                        minWidth: 0
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1.5,
                          gap: 1,
                          justifyContent: { xs: 'center', lg: 'flex-start' }
                        }}>
                          <LocationOnIcon sx={{ color: '#667eea', fontSize: 22 }} />
                          <Typography 
                            variant="h6" 
                            fontWeight="700"
                            sx={{ 
                              color: '#333',
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            Pickup Address
                          </Typography>
                        </Box>
                        
                        <Paper 
                          elevation={2}
                          sx={{ 
                            p: { xs: 2.5, md: 3 },
                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(102, 126, 234, 0.15)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '3px',
                              height: '100%',
                              background: 'linear-gradient(180deg, #667eea, #764ba2)'
                            }
                          }}
                        >
                          <Typography 
                            variant="body1" 
                            fontWeight="700"
                            sx={{ 
                              mb: 1,
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              color: '#333'
                            }}
                          >
                            {order.address?.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              lineHeight: 1.6,
                              color: '#555',
                              mb: 1.5,
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {order.address?.address}{"\n"}
                            {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            justifyContent: { xs: 'center', lg: 'flex-start' }
                          }}>
                            <PhoneIcon sx={{ fontSize: 16, color: '#667eea' }} />
                            <Typography 
                              variant="body2" 
                              fontWeight="600"
                              sx={{ 
                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                color: '#667eea'
                              }}
                            >
                              {order.address?.phone}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>

                      {/* Action Section */}
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        alignItems: 'stretch',
                        minWidth: { xs: '100%', lg: '280px' }
                      }}>
                        
                        {/* Status Card */}
                        <Paper
                          elevation={2}
                          sx={{
                            p: { xs: 2, md: 2.5 },
                            bgcolor: 'rgba(118, 75, 162, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(118, 75, 162, 0.15)',
                            textAlign: 'center'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            fontWeight="600"
                            sx={{ 
                              color: '#764ba2',
                              mb: 1.2,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' }
                            }}
                          >
                            Current Status
                          </Typography>
                          <Chip
                            label={order.orderStatus}
                            color="info"
                            size="small"
                            sx={{ 
                              fontWeight: 700,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              px: 1.5,
                              height: 'auto',
                              '& .MuiChip-label': {
                                py: 0.8
                              }
                            }}
                          />
                        </Paper>

                        {/* Pickup Action Button */}
                        {order.orderStatus === "ReturnAccepted" && (
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => handlePickup(order._id)}
                          startIcon={<LocalShippingIcon />}
                          sx={{ 
                            textTransform: "none", 
                            borderRadius: 2,
                            py: { xs: 1.5, sm: 2 },
                            fontWeight: 700,
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            background: 'linear-gradient(45deg, #4caf50, #45a049)',
                            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #45a049, #3d8b40)',
                              boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
                              transform: { xs: 'none', md: 'translateY(-2px)' }
                            }
                          }}
                        >
                          🚚 Pick Up Order
                        </Button>
                        )}
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