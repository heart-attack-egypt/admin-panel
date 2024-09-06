import * as React from 'react'
import { Box, Link, BottomNavigation, Typography } from '@mui/material'
import useStyles from './styles'

export default function AuthFooter(props) {
  const classes = useStyles()

  return (
    <Box
      className={classes.footer}
      sx={{
        bgcolor: 'transparent'
      }}>
      <BottomNavigation
        sx={{
          bgcolor: 'transparent'
        }}
        showLabels>
        <Typography className={classes.text}>©2024</Typography>

        <Link
          className={classes.link}
          href="https://multivendor.enatega.com/"
          target="_blank"
          underline="none">
          HeartAttack Multivendor
        </Link>
        <Link
          className={classes.link}
          href="https://www.facebook.com/HeartAttackEg/"
          target="_blank"
          underline="none">
          About Us
        </Link>

      </BottomNavigation>
    </Box>
  )
}
