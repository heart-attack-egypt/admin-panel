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
    tipping,
    paidAmount,
    orderAmount,
    currencySymbol,
    items,
    orderId,
    instructions,
    restaurant,
  } = order;
 
  // Calculate subtotal (total cost of items)
  const subtotal = items.reduce((acc, item) => {
    return acc + item.variation.price * item.quantity;
  }, 0);

  // Delivery charges (fees)
  const deliveryCharges = order.deliveryCharges ? order.deliveryCharges : 0;

  // Tips
  const tips = tipping;

  // Calculate the total (subtotal + fees + tips)
  const total = subtotal + deliveryCharges + tips + tax;

  // Discount amount (if any)
  const discountAmount = total - orderAmount; // Calculate discount
  const discount = discountAmount > 0; // Check if there is a discount

  // Amount to pay
  const amountToPay = discount ? orderAmount : total;

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
    <Box sx={{ padding: 2, backgroundColor: "#f4f4f4" }}>
      <Paper elevation={3} sx={{ padding: 2 }}>
        {/* Company Info */}
        <Typography
          fontSize={6}
          sx={{ color: "#333", textAlign: "right", marginBottom: 2 }}
        >
          {`${restaurant.name} Branch`}
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: "#333", textAlign: "center", marginBottom: 2 }}
        >
          Heart Attack Receipt
        </Typography>
        <Typography variant="h5" style={{ color: "#000" }}>
          order id : {orderId}
        </Typography>

        {/* Contact Info */}
        <Box sx={{ marginBottom: 1 }}>
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
        {/* Instructions */}
        {instructions && (
          <Box sx={{ marginBottom: 1 }}>
            <Typography variant="h6" sx={{ color: "#555" }}>
              Special Instructions
            </Typography>
            <Typography variant="body1" sx={{ color: "#333", marginTop: 1 }}>
              {instructions}
            </Typography>
          </Box>
        )}
        <Divider sx={{ marginY: 2 }} />

        {/* Order Items Table */}
        <TableContainer component={Paper} sx={{ marginY: 1 }}>
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

        <Divider sx={{ marginY: 1 }} />

        {/* Summary */}
        <Grid container spacing={2} justifyContent="flex-end">
          {/* Subtotal */}
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Subtotal:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {subtotal.toFixed(2)}
            </Typography>
          </Grid>

          {/* Delivery Charges (Fees) */}
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

          {/* Tips */}
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Tip:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {tips.toFixed(2)}
            </Typography>
          </Grid>

          {/* Tax */}
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

          {/* Total */}
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Total (Subtotal + Fees + Tips):
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {total.toFixed(2)}
            </Typography>
          </Grid>

          {/* Discount (if applicable) */}
          {discount && (
            <>
              <Grid item xs={6}>
                <Typography variant="body1" sx={{ color: "#333" }}>
                  Discount:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="body1"
                  sx={{ color: "#333" }}
                  align="right"
                >
                  -{currencySymbol}
                  {discountAmount.toFixed(2)}
                </Typography>
              </Grid>
            </>
          )}

          {/* Amount to Pay */}
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Amount to Pay:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {amountToPay.toFixed(2)}
            </Typography>
          </Grid>

          {/* Paid Amount */}
          {/*  <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }}>
              Paid Amount:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" sx={{ color: "#333" }} align="right">
              {currencySymbol}
              {paidAmount.toFixed(2)}
            </Typography>
          </Grid> */}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Receipt;
