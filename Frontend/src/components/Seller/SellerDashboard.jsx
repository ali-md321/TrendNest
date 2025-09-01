import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSellerMetricesAction } from "../../actions/sellerAction";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  BarElement
} from "chart.js";
import {
  Language,
  Instagram,
  Facebook,
  Twitter,
  LinkedIn,
  ShoppingBag,
  Assessment,
  Star,
  TrendingUp
} from "@mui/icons-material";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  BarElement
);

function SellerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const [analytics, setAnalytics] = useState({
    productWeekly: [],
    reviewWeekly: [],
    labels: []
  });

  useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const {data : res} = await dispatch(getSellerMetricesAction());
      
      // Assuming res contains productActivity & reviewActivity directly from DB
      const productWeeks = res?.productActivity || [];
      const reviewWeeks = res?.reviewActivity || [];
      console.log("productWeeks",productWeeks);
      // Ensure both arrays cover the last 7 weeks (fill with zeros if missing)
      const allWeeks = Array.from(
        new Set([
          ...productWeeks.map(p => p.week),
          ...reviewWeeks.map(r => r.week)
        ])
      ).sort((a, b) => new Date(a.split(' - ')[0]) - new Date(b.split(' - ')[0]));

      const productWeekly = allWeeks.map(
        w => productWeeks.find(p => p.week === w)?.count || 0
      );
      const reviewWeekly = allWeeks.map(
        w => reviewWeeks.find(r => r.week === w)?.count || 0
      );

      setAnalytics({
        labels: allWeeks,
        productWeekly,
        reviewWeekly
      });
    } catch (err) {
      console.error('Analytics fetch error', err);
    }
  };

  fetchAnalytics();
}, [dispatch]);


  const social = user?.socialHandles || {};
  const socials = [
    {
      icon: <Language className="text-blue-600" />,
      label: 'Website',
      value: social.website,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      icon: <Instagram className="text-pink-600" />,
      label: 'Instagram',
      value: social.instagram,
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      icon: <Facebook className="text-blue-700" />,
      label: 'Facebook',
      value: social.facebook,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      icon: <Twitter className="text-sky-500" />,
      label: 'Twitter',
      value: social.twitter,
      color: 'bg-sky-50 hover:bg-sky-100 border-sky-200'
    },
    {
      icon: <LinkedIn className="text-blue-800" />,
      label: 'LinkedIn',
      value: social.linkedin,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
  ].filter(s => s.value);

  // Rating pie chart data
  const userRating = user?.avgRating || 0;
  const ratingPieData = {
    labels: ['Rating', 'Remaining'],
    datasets: [{
      data: [userRating, 5 - userRating],
      backgroundColor: [
        userRating >= 4 ? '#10B981' : userRating >= 3 ? '#F59E0B' : '#EF4444',
        '#F3F4F6'
      ],
      borderWidth: 0,
      cutout: '70%'
    }]
  };

  const ratingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Here's what's happening with your business today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Products Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-600/30 rounded-bl-full transform scale-75 group-hover:scale-100 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-sm">
                  <ShoppingBag className="text-blue-600 w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex items-center space-x-1 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <TrendingUp className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-medium">Active</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Products</h4>
                <div className="flex items-end space-x-2">
                  <p className="text-3xl xl:text-4xl font-bold text-gray-900 leading-none">{user?.addedProducts?.length || 0}</p>
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-2 transform group-hover:w-12 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Number of Orders Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-600/30 rounded-bl-full transform scale-75 group-hover:scale-100 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-sm">
                  <Assessment className="text-purple-600 w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex items-center space-x-1 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <TrendingUp className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-medium">Growing</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Number of Orders</h4>
                <div className="flex items-end space-x-2">
                  <p className="text-3xl xl:text-4xl font-bold text-gray-900 leading-none">{user?.NoOfOrders || 0}</p>
                  <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mb-2 transform group-hover:w-12 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-emerald-600/30 rounded-bl-full transform scale-75 group-hover:scale-100 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300 shadow-sm">
                  <Assessment className="text-emerald-600 w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex items-center space-x-1 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <TrendingUp className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-medium">Excellent</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Reviews</h4>
                <div className="flex items-end space-x-2">
                  <p className="text-3xl xl:text-4xl font-bold text-gray-900 leading-none">{user?.totalReviews || 0}</p>
                  <div className="w-8 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full mb-2 transform group-hover:w-12 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Rating Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-yellow-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-transparent to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/30 rounded-bl-full transform scale-75 group-hover:scale-100 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="w-16 h-16 relative">
                    <Doughnut data={ratingPieData} options={ratingOptions} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="text-yellow-500 w-6 h-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300 mb-2">
                    <TrendingUp className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-medium">Top Rated</span>
                  </div>
                  <p className="text-3xl xl:text-4xl font-bold text-gray-900 leading-none">{userRating?.toFixed(1) || '0.0'}</p>
                  <p className="text-sm text-gray-500 mt-1">out of 5.0</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Average Rating</h4>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 transform group-hover:scale-110 transition-all duration-300 ${
                        star <= Math.floor(userRating || 0) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      style={{ transitionDelay: `${star * 50}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {socials.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
              Social Presence
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {socials.map((s, idx) => (
                <a
                  key={idx}
                  href={s.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${s.color}`}
                >
                  <div className="mb-2 sm:mb-3">
                    {s.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Products Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 col-span-1 lg:col-span-3">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <div className="w-1 h-4 sm:h-5 bg-blue-500 rounded-full mr-3"></div>
              Products Added
            </h4>
            <div className="h-[400px]">
              <Line
                key={`product-chart-${(analytics.productWeekly || []).join('-')}`}
                data={{
                  labels: analytics.labels || [],
                  datasets: [{
                    label: 'Products',
                    data: analytics.productWeekly || [],
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true,title: {display: true,text: 'No. of Products Added',font: { size: 14, weight: 'bold' }}, grid: { color: '#F3F4F6' }, ticks: { font: { size: 12 },stepSize: 0.5 },suggestedMax: 5 },
                    x: { title: {display: true,text: 'Last 7 Weeks',font: { size: 14, weight: 'bold' }},grid: { display: false }, ticks: { font: { size: 12 } } }
                  }
                }}
              />
            </div>
          </div>

          {/* Reviews Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 col-span-1 lg:col-span-3">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <div className="w-1 h-4 sm:h-5 bg-purple-500 rounded-full mr-3"></div>
              Reviews Timeline
            </h4>
            <div className="h-[400px]">
              <Line
                key={`review-chart-${(analytics.reviewWeekly || []).join('-')}`}
                data={{
                  labels: analytics.labels || [],
                  datasets: [{
                    label: 'Reviews',
                    data: analytics.reviewWeekly || [],
                    borderColor: 'rgba(168, 85, 247, 1)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true,title: {display: true,text: 'No. of Reviews Added',font: { size: 14, weight: 'bold' }}, grid: { color: '#F3F4F6' }, ticks: { font: { size: 12 },stepSize: 0.5 },suggestedMax: 5 },
                    x: { title: {display: true,text: 'Last 7 weeks',font: { size: 14, weight: 'bold' }},grid: { display: false }, ticks: { font: { size: 12 } } }
                  }
                }}
              />
            </div>
          </div>

        </div>

        {/* Rating Details */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg text-white p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Your Rating Performance</h3>
              <p className="text-blue-100 text-sm sm:text-base">Keep up the excellent work! Your customers love your products.</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    star <= Math.floor(userRating || 0) ? 'text-yellow-300' : 'text-blue-300'
                  }`}
                />
              ))}
              <span className="text-xl sm:text-2xl font-bold ml-2 sm:ml-4">{userRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;