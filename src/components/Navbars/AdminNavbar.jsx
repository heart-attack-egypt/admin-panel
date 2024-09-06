import React, { useState } from 'react'
import { withTranslation } from 'react-i18next'
import ResetPassword from '../ResetPassword/ResetPassword'
import { useApolloClient } from '@apollo/client'
import {
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Typography,
  AppBar,
  Box,
  Toolbar,
  Divider,
  FormControl,
  Select,
  useTheme
} from '@mui/material'

function AdminNavbar(props) {
  const theme = useTheme()
  const client = useApolloClient()
  const [modal, setModal] = useState(false)
  const [language, setLanguage] = useState(
    localStorage.getItem('enatega-language') || 'en'
  )
  const [anchorEl, setAnchorEl] = useState(null) // Define anchorEl state

  const { t, i18n } = props

  const toggleModal = () => {
    setModal(prev => !prev)
  }

  const handleMenu = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChangeLanguage = event => {
    const newLanguage = event.target.value
    setLanguage(newLanguage)
    localStorage.setItem('enatega-language', newLanguage)
    i18n.changeLanguage(newLanguage)
    handleClose()
  }

  const vendor = localStorage.getItem('user-enatega')
    ? JSON.parse(localStorage.getItem('user-enatega')).userType === 'VENDOR'
    : false

  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'block' },
        flexGrow: 1,
        boxShadow: 0
      }}>
      <AppBar position="static" sx={{ bgcolor: 'transparent', boxShadow: 0 }}>
        <Toolbar>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{ flexGrow: 1, color: 'common.black', fontWeight: 'bold' }}>
            {props.match.path === '/restaurant' ? '' : t(props.brandText)}
          </Typography>

          <div>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: 'white',
                paddingRight: '10px',
                borderRadius: '40px',
                height: 40,
                width: 90
              }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="black"
                  className="size-6"
                  style={{ height: '30px' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </IconButton>
              <Typography
                mt={1}
                sx={{ fontWeight: 'bold' }}
                color="common.black">
                User
              </Typography>
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              <MenuItem>
                <FormControl>
                  <Select
                    value={language}
                    onChange={handleChangeLanguage}
                    style={{ color: theme.palette.common.black }}>
                    <MenuItem
                      sx={{ color: theme.palette.common.black }}
                      value="en">
                      English
                    </MenuItem>
                    <MenuItem
                      sx={{ color: theme.palette.common.black }}
                      value="ar">
                      Arabic
                    </MenuItem>
                    <MenuItem
                      sx={{ color: theme.palette.common.black }}
                      value="de">
                      Deutsche
                    </MenuItem>
                    <MenuItem
                      sx={{ color: theme.palette.common.black }}
                      value="zh">
                      中文
                    </MenuItem>
                    <MenuItem
                      sx={{ color: theme.palette.common.black }}
                      value="km">
                      ភាសាខ្មែរ
                    </MenuItem>
                    <MenuItem
                      sx={{ color: theme.palette.common.black }}
                      value="fr">
                      français
                    </MenuItem>
                  </Select>
                </FormControl>
              </MenuItem>
              <MenuItem
                sx={{ color: theme.palette.common.black }}
                onClick={handleClose}>
                {t('Welcome')}
              </MenuItem>
              <Divider />
              {vendor ? (
                <MenuItem
                  sx={{ color: theme.palette.common.black }}
                  onClick={e => {
                    e.preventDefault()
                    toggleModal()
                  }}>
                  {t('ResetPassword')}
                </MenuItem>
              ) : null}
              <MenuItem
                sx={{ color: theme.palette.common.black }}
                onClick={e => {
                  e.preventDefault()
                  localStorage.removeItem('user-enatega')
                  localStorage.removeItem('restaurant_id')
                  client.clearStore()
                  props.history.push('/auth/login')
                }}>
                {t('Logout')}
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Modal
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        open={modal}
        onClose={() => {
          toggleModal()
        }}>
        <ResetPassword />
      </Modal>
    </Box>
  )
}

export default withTranslation()(AdminNavbar)
