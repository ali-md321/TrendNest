import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { getDelivererMetricesAction } from "../../actions/delivererAction";

function CODSummary() {
  const dispatch = useDispatch();
  const [codSummary, setCodSummary] = useState({
    pendingAmount: 0,
    collectedToday: 0,
    history: [],
  });

  const { pendingAmount, collectedToday, history } = codSummary;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await dispatch(getDelivererMetricesAction());
        setCodSummary(res.codSummary);
      } catch (error) {
        console.error("Error fetching COD summary:", error);
      }
    };
    fetchAnalytics();
  }, [dispatch]);

  const chartData = history?.map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    amount: h.amount,
  }));

  return (
    <Box 
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}
    >

      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box 
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 60, md: 80 },
              height: { xs: 60, md: 80 },
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
              mb: 2,
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)'
            }}
          >
            <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
              💰
            </Typography>
          </Box>
          <Typography 
            variant="h3" 
            sx={{
              fontWeight: 800,
              color: '#333',
              mb: 1,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            COD Summary
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666',
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            Track your cash collections and pending amounts
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 5 }}>
          {/* Pending Amount */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <Box sx={{ textAlign: 'center', p: 2 }}>
                {/* Card accent */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: 'linear-gradient(90deg, #ff6b6b, #ee5a52)'
                  }}
                />
                
                <Box 
                  sx={{
                    width: { xs: 50, md: 60 },
                    height: { xs: 50, md: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #ffebee, #ffcdd2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    ⏳
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#666',
                    mb: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  Pending Amount
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: '#d32f2f',
                    fontWeight: 800,
                    fontSize: { xs: '2rem', md: '3rem' },
                    textShadow: '0 2px 4px rgba(211, 47, 47, 0.2)'
                  }}
                >
                  ₹{pendingAmount?.toLocaleString('en-IN') || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Collected Today */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <Box sx={{ textAlign: 'center', p: 2 }}>
                {/* Card accent */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: 'linear-gradient(90deg, #4caf50, #388e3c)'
                  }}
                />
                
                <Box 
                  sx={{
                    width: { xs: 50, md: 60 },
                    height: { xs: 50, md: 60 },
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #e8f5e8, #c8e6c9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    ✅
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#666',
                    mb: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  Collected Today
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: '#388e3c',
                    fontWeight: 800,
                    fontSize: { xs: '2rem', md: '3rem' },
                    textShadow: '0 2px 4px rgba(56, 142, 60, 0.2)'
                  }}
                >
                  ₹{collectedToday?.toLocaleString('en-IN') || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Divider 
          sx={{ 
            my: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            height: 1
          }} 
        />

        {/* Chart Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box 
              sx={{
                width: { xs: 40, md: 50 },
                height: { xs: 40, md: 50 },
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2, #1565c0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)'
              }}
            >
              <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                📊
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: '#333',
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                Last 15 Days COD Collection
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666',
                  fontSize: { xs: '0.8rem', md: '0.9rem' }
                }}
              >
                Track your daily collection trends
              </Typography>
            </Box>
          </Box>

          <Box 
            sx={{
              background: 'linear-gradient(135deg, #f8f9ff, #f0f4ff)',
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              border: '1px solid rgba(25, 118, 210, 0.1)'
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1976d2" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#1565c0" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(25, 118, 210, 0.1)"
                  strokeWidth={1}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                  fontWeight="500"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  fontWeight="500"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value?.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(10px)'
                  }}
                  labelStyle={{ color: '#333', fontWeight: '600' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.8 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#666',
              fontSize: { xs: '0.75rem', md: '0.85rem' }
            }}
          >
            Last updated: {new Date().toLocaleString('en-IN')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default CODSummary;