import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";

// Forward ref to the component
export const FormatReceipt = React.forwardRef(({ row }, ref) => {
  return (
    <div ref={ref}>
      <Receipt order={row}></Receipt>
    </div>
  );
});

const Receipt = ({ order }) => {
  const address =
    order.shippingMethod === "PICKUP"
      ? "PICKUP"
      : `${order.deliveryAddress.label}, ${order.deliveryAddress.details}, ${order.deliveryAddress.deliveryAddress}`;

  const {
    taxationAmount: tax,
    tipping: tip,
    paidAmount,
    orderAmount,
    deliveryCharges,
    currencySymbol,
    items,
  } = order;
  let email, phone;
  if (order.user) {
    ({ email, phone } = order.user);
  }

  const renderItems = () => {
    return items.map((item, index) => (
      <TableRow key={index}>
        <TableCell>
          <Typography style={{ color: "#000" }} variant="body2">
            {item.title}
            {item.variation?.title ? `: ${item.variation.title}` : ""}
            {item.addons?.map((addon, addonIndex) => (
              <Box key={addonIndex}>
                {addon.title}:{" "}
                {addon.options.map((option) => option.title).join(", ")}
              </Box>
            ))}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography style={{ color: "#000" }} variant="body2">
            {item.quantity}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography style={{ color: "#000" }} variant="body2">
            {currencySymbol}
            {(
              item.variation.price +
              item.addons
                .map((addon) =>
                  addon.options.reduce((prev, curr) => prev + curr.price, 0)
                )
                .reduce((prev, curr) => prev + curr, 0)
            ).toFixed(2)}
          </Typography>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ padding: 4 }} style={{ backgroundColor: "#fff" }}>
      >
      <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
        {/* Company Info */}
        <Typography variant="h4" style={{ color: "#000" }}>
          Heart Attack
        </Typography>

        {/* Contact Info */}
        <Box sx={{ marginY: 2 }}>
          <Typography variant="h6" style={{ color: "#000" }}>
            Contact Info
          </Typography>
          <Typography style={{ color: "#000" }} variant="body1">
            Address: {address}
            <br />
            Email: {email}
            <br />
            Phone: {phone}
          </Typography>
        </Box>

        {/* Order Items Table */}
        <TableContainer component={Paper} sx={{ marginY: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography style={{ color: "#000" }} variant="h6">
                    Item
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography style={{ color: "#000" }} variant="h6">
                    Qty
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography style={{ color: "#000" }} variant="h6">
                    Sub Total
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderItems()}</TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1">
              Tax:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1" align="right">
              {currencySymbol}
              {tax.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1">
              Tip:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1" align="right">
              {currencySymbol}
              {tip.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1">
              Delivery Charges:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1" align="right">
              {currencySymbol}
              {deliveryCharges.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1">
              Total Amount:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1" align="right">
              {currencySymbol}
              {orderAmount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "#000" }} variant="body1">
              Paid Amount:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">
              {currencySymbol}
              {paidAmount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Receipt;
