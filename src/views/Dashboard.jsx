import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  ChefHat, 
  TrendingUp, 
  Clock,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

import {
  Box,
  Typography,
  Input,
  Button,
  Container,
  Grid,
  useTheme
} from '@mui/material'
import Header from '../components/Headers/Header'
import { useQuery, gql } from '@apollo/client'
import {
  getDashboardTotal,
  getDashboardSales,
  getDashboardOrders,
  getOrdersByDateRange
} from '../apollo'

import useStyles from '../components/Option/styles'
import useGlobalStyles from '../utils/globalStyles'
import { withTranslation } from 'react-i18next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  return <span className="animate-count-up">{prefix}{count.toLocaleString()}{suffix}</span>
}

// Enhanced Stats Card Component
const EnhancedStatsCard = ({ title, value, change, icon: Icon, delay = 0, color = "orange", prefix = '', suffix = '' }) => {
  const getGradientClass = () => {
    switch(color) {
      case "green": return "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)"
      case "yellow": return "linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)"
      case "blue": return "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)"
      default: return "linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)"
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="stats-card enhanced-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="stats-label">{title}</div>
          <div className="stats-value">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </div>
          <div className={`stats-change ${change >= 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            {Math.abs(change)}% from last month
          </div>
        </div>
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: getGradientClass(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  )
}

// Enhanced Order Item Component
const EnhancedOrderItem = ({ order, delay = 0 }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return 'success'
      case 'PENDING': return 'warning'
      case 'CANCELLED': return 'error'
      default: return 'primary'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid var(--gray-200)',
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--gray-50)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--primary-orange) 0%, #FF8A65 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: '14px'
        }}>
          #{order.orderId}
        </div>
        <div>
          <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{order.user?.name || 'Unknown'}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>{order.restaurant?.name || 'Unknown Restaurant'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span className={`status-badge ${getStatusColor(order.orderStatus)}`}>
          {order.orderStatus}
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>${order.orderAmount?.toFixed(2) || '0.00'}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {new Date(order.createdAt).toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn-primary" style={{ padding: '4px', fontSize: '12px' }}>
            <Eye size={14} />
          </button>
          <button className="btn-secondary" style={{ padding: '4px', fontSize: '12px' }}>
            <Edit size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const GET_DASHBOARD_TOTAL = gql`
  ${getDashboardTotal}
`
const GET_DASHBOARD_SALES = gql`
  ${getDashboardSales}
`
const GET_DASHBOARD_ORDERS = gql`
  ${getDashboardOrders}
`
const GET_ORDERS = gql`
  ${getOrdersByDateRange}
`

function Dashboard(props) {
  const theme = useTheme()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const [startingDate, setStartingDate] = useState('')
  const [endingDate, setEndingDate] = useState('')

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_DASHBOARD_TOTAL
  )
  const { data: dataOrders, loading: loadingOrders } = useQuery(GET_ORDERS, {
    variables: {
      starting_date: startingDate || null,
      ending_date: endingDate || null
    },
    fetchPolicy: 'cache-and-network'
  })
  const { data: dataSales, loading: loadingSales } = useQuery(
    GET_DASHBOARD_SALES,
    {
      variables: {
        starting_date: startingDate || null,
        ending_date: endingDate || null
      },
      fetchPolicy: 'cache-and-network'
    }
  )
  const { data: dataOrdersStats, loading: loadingOrdersStats } = useQuery(
    GET_DASHBOARD_ORDERS,
    {
      variables: {
        starting_date: startingDate || null,
        ending_date: endingDate || null
      },
      fetchPolicy: 'cache-and-network'
    }
  )

  const statsData = [
    {
      title: "Total Orders",
      value: data?.getDashboardTotal?.totalOrders || 0,
      change: 12,
      icon: ShoppingBag,
      color: "orange"
    },
    {
      title: "Total Revenue",
      value: data?.getDashboardTotal?.totalSales || 0,
      change: 8,
      icon: DollarSign,
      color: "green",
      prefix: "$"
    },
    {
      title: "Active Restaurants",
      value: data?.getDashboardTotal?.totalRestaurants || 0,
      change: 5,
      icon: ChefHat,
      color: "yellow"
    },
    {
      title: "Total Users",
      value: data?.getDashboardTotal?.totalUsers || 0,
      change: 15,
      icon: Users,
      color: "blue"
    }
  ]

  // Chart data
  const salesChartData = {
    labels: dataSales?.getDashboardSales?.orders?.map(order => 
      new Date(order.day).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Sales',
        data: dataSales?.getDashboardSales?.orders?.map(order => order.amount) || [],
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const ordersChartData = {
    labels: dataOrdersStats?.getDashboardOrders?.orders?.map(order => 
      new Date(order.day).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Orders',
        data: dataOrdersStats?.getDashboardOrders?.orders?.map(order => order.count) || [],
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        borderWidth: 1
      }
    ]
  }

  const orderStatusData = {
    labels: ['Delivered', 'Pending', 'Cancelled', 'In Progress'],
    datasets: [
      {
        data: [65, 20, 10, 5],
        backgroundColor: ['#4CAF50', '#FFC107', '#EF4444', '#FF6B35'],
        borderWidth: 0
      }
    ]
  }

  return (
    <Container className={globalClasses.flex} fluid>
      <Header />
      
      {/* Enhanced Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="stats-grid"
        style={{ marginTop: '24px', marginBottom: '32px' }}
      >
        {statsData.map((stat, index) => (
          <EnhancedStatsCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Charts Section */}
      <Grid container spacing={3} style={{ marginBottom: '32px' }}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="chart-container"
          >
            <div className="chart-title">Sales Trend</div>
            {!loadingSales && (
              <Line 
                data={salesChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0,0,0,0.1)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            )}
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="chart-container"
          >
            <div className="chart-title">Order Status</div>
            <Doughnut 
              data={orderStatusData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="enhanced-table"
      >
        <div className="table-header">
          <div className="table-title">Recent Orders</div>
          <button className="btn-primary">View All</button>
        </div>
        <div>
          {!loadingOrders && dataOrders?.getOrdersByDateRange?.orders?.slice(0, 5).map((order, index) => (
            <EnhancedOrderItem 
              key={order._id} 
              order={order} 
              delay={0.8 + index * 0.1} 
            />
          ))}
        </div>
      </motion.div>
    </Container>
  )
}

export default withTranslation()(Dashboard)

