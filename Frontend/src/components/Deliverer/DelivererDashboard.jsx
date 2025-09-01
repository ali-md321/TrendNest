import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { getDelivererMetricesAction } from "../../actions/delivererAction";

const DelivererDashboard = () => {
  const dispatch = useDispatch();
  const [analytics, setAnalytics] = useState({
    performance: { weeklyDeliveries: [], weeklyPickups: [] }
  });

  const performanceCards = [
    {
      label: "Total Deliveries",
      value: analytics.performance.totalDeliveries || 0,
      icon: "📦",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600"
    },
    {
      label: "On-Time %",
      value:
        (
          ((analytics.performance.onTimeDeliveries || 0) /
            (analytics.performance.totalDeliveries || 1)) *
          100
        ).toFixed(1) + "%",
      icon: "⏰",
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600"
    },
    {
      label: "Failed Deliveries",
      value: analytics.performance.failedDeliveries || 0,
      icon: "❌",
      color: "from-red-500 to-red-600",
      textColor: "text-red-600"
    },
    {
      label: "Avg Delivery Time",
      value: (analytics.performance.averageDeliveryTime || 0) + " min",
      icon: "⏱️",
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600"
    },
    {
      label: "Rating",
      value: (analytics.performance.avgRating || 0).toFixed(1) + " ★",
      icon: "⭐",
      color: "from-amber-500 to-amber-600",
      textColor: "text-amber-600"
    },
    {
      label: "Completion Rate",
      value: (analytics.performance.completionRate || 0).toFixed(1) + "%",
      icon: "✅",
      color: "from-teal-500 to-teal-600",
      textColor: "text-teal-600"
    }
  ];


  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await dispatch(getDelivererMetricesAction());

        const formatted = {
          ...res.data,
          performance: {
            ...res.data.performance,
            weeklyDeliveries: (res.data.performance.weeklyDeliveries || []).length > 0 
              ? res.data.performance.weeklyDeliveries.map(d => ({
                  week: d.week,
                  deliveries: d.count
                })) 
              : [],
            weeklyPickups: (res.data.performance.weeklyPickups || []).length > 0
              ? res.data.performance.weeklyPickups.map(d => ({
                  week: d.week,
                  pickups: d.count
                }))
              : []
          }
        };

        setAnalytics(formatted);
      } catch (err) {
        console.error("Analytics fetch error", err);
        // Set default data on error
        setAnalytics({
          performance: {
            weeklyDeliveries: [],
            weeklyPickups: []
          }
        });
      }
    };
    fetchAnalytics();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <span className="text-white text-4xl">🚚</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Deliverer Dashboard
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Track your delivery performance and analytics in real-time with comprehensive insights
          </p>
        </div>

        {/* Performance Section */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 md:p-10">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
              <span className="text-white text-3xl">📊</span>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Performance Metrics
              </h2>
              <p className="text-gray-600 text-lg">Your delivery performance at a glance</p>
            </div>
          </div>
          
          {/* Performance Cards - 1 per row on mobile, 2 per row on medium+, 3 per row on large+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {performanceCards.map((card, idx) => (
              <div
                key={idx}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/50 hover:border-white/50"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}></div>
                <div className="relative flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    {card.icon}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{card.label}</div>
                  <div className={`text-3xl font-bold ${card.textColor} group-hover:scale-110 transition-transform duration-300`}>
                    {card.value}
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${card.color} rounded-b-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section - Single Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Weekly Deliveries Graph */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 md:p-10">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white text-2xl">📈</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Weekly Deliveries
                </h2>
                <p className="text-gray-600 text-sm md:text-base">Delivery trends over time</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics.performance.weeklyDeliveries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" strokeWidth={1} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280" 
                    fontSize={12} 
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12} 
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                    scale="linear"
                    domain={[0, 'dataMax + 1']}
                    tickCount={6}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: '600' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: '500' }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="deliveries" 
                    stroke="url(#blueGradient)"
                    strokeWidth={4}
                    name="Deliveries" 
                    dot={{ fill: '#3b82f6', strokeWidth: 3, r: 7, stroke: '#ffffff' }}
                    activeDot={{ r: 10, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 3 }}
                  />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Pickups Graph */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6 md:p-10">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Weekly Pickups
                </h2>
                <p className="text-gray-600 text-sm md:text-base">Pickup activity trends</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl p-6 border border-emerald-100/50">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics.performance.weeklyPickups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" strokeWidth={1} />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280" 
                    fontSize={12} 
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12} 
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                    scale="linear"
                    domain={[0, 'dataMax + 1']}
                    tickCount={6}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: '600' }}
                    itemStyle={{ color: '#10b981', fontWeight: '500' }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pickups" 
                    stroke="url(#greenGradient)"
                    strokeWidth={4}
                    name="Pickups" 
                    dot={{ fill: '#10b981', strokeWidth: 3, r: 7, stroke: '#ffffff' }}
                    activeDot={{ r: 10, fill: '#047857', stroke: '#ffffff', strokeWidth: 3 }}
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Dashboard updates in real-time • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DelivererDashboard;