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
  Divider,
} from "@mui/material";

// Forward ref to the component
export const FormatReceipt = React.forwardRef(({ row }, ref) => {
  return (
    <div ref={ref}>
      <Receipt order={row} />
    </div>
  );
});

const Receipt = ({ order }) => {
  const address =
    order.shippingMethod === "PICKUP"
      ? "PICKUP"
      : `${order.deliveryAddress.label}, ${order.deliveryAddress.deliveryAddress}`;

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
          <Typography variant="body2" sx={{ color: "black" }}>
            {item.title}
            {item.variation?.title ? `: ${item.variation.title}` : ""}
            {item.addons?.map((addon, addonIndex) => (
              <Box key={addonIndex} sx={{ paddingLeft: 1 }}>
                {addon.title}:{" "}
                {addon.options.map((option) => option.title).join(", ")}
              </Box>
            ))}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ color: "black" }}>
            {item.quantity}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" sx={{ color: "black" }}>
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
    <Box sx={{ padding: 4, backgroundColor: "#f4f4f4" }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        {/* Company Info */}
        <Typography
          variant="h4"
          sx={{ color: "#333", textAlign: "center", marginBottom: 2 }}
        >
          Heart Attack
        </Typography>

        {/* Contact Info */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="h6" sx={{ color: "#555" }}>
            Contact Info
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", marginTop: 1 }}>
            Address: {address}
            <br />
            Email: {email}
            <br />
            Phone: {phone}
          </Typography>
        </Box>

        <Divider sx={{ marginY: 2 }} />

        {/* Order Items Table */}
        <TableContainer component={Paper} sx={{ marginY: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="h6" sx={{ color: "#333" }}>
                    Item
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" sx={{ color: "#333" }}>
                    Qty
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" sx={{ color: "#333" }}>
                    Sub Total
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderItems()}</TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ marginY: 2 }} />

        {/* Summary */}
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Tax:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {tax.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Tip:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {tip.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Delivery Charges:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {deliveryCharges.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Total Amount:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {orderAmount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Paid Amount:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
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
