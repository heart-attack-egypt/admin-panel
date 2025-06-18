import React, { useRef, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
// core components
import AdminNavbar from '../components/Navbars/AdminNavbar'
import AdminFooter from '../components/Footers/AdminFooter'
import Sidebar from '../components/Sidebar/Sidebar'
import routes from '../routes'
import { Box } from '@mui/material'

function Admin(props) {
  var divRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.scrollingElement.scrollTop = 0
    divRef.current.scrollTop = 0
  }, [])

  const getRoutes = routes => {
    return routes.map((prop, key) => {
      if (prop.layout === '/admin') {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        )
      } else {
        return null
      }
    })
  }
  
  const getBrandText = path => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props.location.pathname.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name
      }
    }
    return 'Dashboard'
  }

  return (
    <Box className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)', minHeight: '100vh' }}>
      {/* Enhanced Sidebar with Animation */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '280px',
              height: '100vh',
              background: 'linear-gradient(180deg, var(--primary-orange) 0%, #FF8A65 100%)',
              color: 'white',
              zIndex: 1000,
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            {/* Enhanced Sidebar Header */}
            <div style={{
              padding: 'var(--spacing-xl)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🍽️
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>FoodMaster</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Pro Admin</div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: window.innerWidth < 768 ? 'block' : 'none'
          }}
        />
      )}

      {/* Enhanced Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray-200)',
          padding: 'var(--spacing-lg) var(--spacing-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'linear-gradient(135deg, var(--primary-orange) 0%, #FF8A65 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500
            }}
          >
            ☰
          </button>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--gray-800)',
            margin: 0
          }}>
            {getBrandText(props.location.pathname)}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <input
              type="text"
              placeholder="Search orders, restaurants..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid var(--gray-300)',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-400)',
              fontSize: '16px'
            }}>
              🔍
            </span>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, var(--primary-orange) 0%, #FF8A65 100%)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            position: 'relative',
            fontSize: '16px'
          }}>
            🔔
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#EF4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>3</span>
          </button>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-orange) 0%, #FF8A65 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '16px'
          }}>
            👤
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Box
        ref={divRef}
        sx={{
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          padding: '24px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdminNavbar
            {...props}
            brandText={getBrandText(props.location.pathname)}
          />
          <Switch>{getRoutes(routes)}</Switch>
          <AdminFooter />
        </motion.div>
      </Box>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-orange) 0%, #FF8A65 100%)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 1000,
          animation: 'float 3s ease-in-out infinite'
        }}
      >
        +
      </motion.button>
    </Box>
  )
}

export default Admin

