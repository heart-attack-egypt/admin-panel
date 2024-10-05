import React, { useState } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import { withTranslation } from "react-i18next";
import { validateFunc } from "../../constraints/constraints";
import { updateOrderStatus, getConfiguration } from "../../apollo";
import Loader from "react-loader-spinner";
import {
  Box,
  Grid,
  Typography,
  Alert,
  Input,
  Button,
  useTheme,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import useStyles from "./styles";
import useGlobalStyles from "../../utils/globalStyles";

const UPDATE_STATUS = gql`
  ${updateOrderStatus}
`;

const GET_CONFIGURATION = gql`
  ${getConfiguration}
`;

function Order(props) {
  const theme = useTheme();
  const { order, t } = props;
  const [reason, reasonSetter] = useState("");
  const [reasonError, reasonErrorSetter] = useState(null);
  const [error, errorSetter] = useState("");
  const [success, successSetter] = useState("");

  const onCompleted = ({ updateOrderStatus }) => {
    if (updateOrderStatus) {
      successSetter(t("OrderStatusUpdated"));
    }
    setTimeout(onDismiss, 5000);
  };

  const onError = (error) => {
    errorSetter(error.message);
    setTimeout(onDismiss, 5000);
  };

  const { data } = useQuery(GET_CONFIGURATION);
  const [mutate, { loading }] = useMutation(UPDATE_STATUS, {
    onError,
    onCompleted,
  });

  const validateReason = () => {
    const reasonError = !validateFunc({ reason }, "reason");
    reasonErrorSetter(reasonError);
    return reasonError;
  };

  const onDismiss = () => {
    errorSetter("");
    successSetter("");
  };

  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  if (!props.order) return null;

  const total = order.items.reduce((acc, item) => {
    return acc + item.variation.price * item.quantity;
  }, 0); // Calculate total price of order items

  const deliveryCharges = order.deliveryCharges ? order.deliveryCharges : 0;
  const grandTotal = total + deliveryCharges; // Calculate grand total of order items

  const discountAmount = grandTotal - order.orderAmount; // Calculate discount
  const discount = discountAmount > 0; // Check if there is a discount
  const amountToPay = order.orderAmount; // Amount user will pay
  const tips = order.tipping;

  return (
    <Box
      sx={{
        p: 0,
        maxWidth: 800,
        left: 0,
        right: 0,
        margin: "auto",
        position: "absolute",
        top: "50%",
        left: "30%",
        transform: "translate(-10%, -50%)",
      }}
    >
      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#2e2e2e",
        }}
      >
        <CardContent>
          {/* Order Header */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#ffcc00",
                borderBottom: `2px solid #ff5733`,
                pb: 1,
              }}
            >
              {t("Order")} #{order.orderId}
            </Typography>
          </Box>

          {/* Items Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "#ffcc00",
              }}
            >
              {t("Items")}
            </Typography>
            {order.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#3e3e3e",
                  color: "#ffffff",
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item lg={1}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        color: "#ffcc00",
                      }}
                    >
                      {item.quantity}
                    </Typography>
                  </Grid>
                  <Grid item lg={7}>
                    <Typography variant="body1">
                      {`${item.title}${
                        item.variation.title ? ` (${item.variation.title})` : ""
                      }`}
                    </Typography>
                  </Grid>
                  <Grid item lg={2}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        color: "#ff5733",
                      }}
                    >
                      {data.configuration.currencySymbol}{" "}
                      {(item.variation.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>

          {/* Total, Discount, Delivery Fee, and Amount to Pay Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "#ffcc00",
              }}
            >
              {t("Order Summary")}
            </Typography>
            <Box sx={{ p: 2, backgroundColor: "#3e3e3e", borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item lg={6}>
                  <Typography variant="body1" sx={{ color: "#ffffff" }}>
                    {t("Total Order")}
                  </Typography>
                </Grid>
                <Grid item lg={6}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: "#ff5733",
                    }}
                  >
                    {data.configuration.currencySymbol} {total.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item lg={6}>
                  <Typography variant="body1" sx={{ color: "#ffffff" }}>
                    {t("Delivery Fee")}
                  </Typography>
                </Grid>
                <Grid item lg={6}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: "#ff5733",
                    }}
                  >
                    {data.configuration.currencySymbol}{" "}
                    {deliveryCharges.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item lg={6}>
                  <Typography variant="body1" sx={{ color: "#ffffff" }}>
                    {t("Tip")}
                  </Typography>
                </Grid>
                <Grid item lg={6}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: "#ff5733",
                    }}
                  >
                    {data.configuration.currencySymbol} {tips.toFixed(2)}
                  </Typography>
                </Grid>

                {discount && (
                  <>
                    <Grid item lg={6}>
                      <Typography variant="body1" sx={{ color: "#ffffff" }}>
                        {t("Discount")}
                      </Typography>
                    </Grid>
                    <Grid item lg={6}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                          color: "#ff5733",
                        }}
                      >
                        -{data.configuration.currencySymbol}{" "}
                        {discountAmount.toFixed(2)}
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid item lg={6}>
                  <Typography variant="body1" sx={{ color: "#ffffff" }}>
                    {t("Amount to Pay")}
                  </Typography>
                </Grid>
                <Grid item lg={6}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: "#ffcc00",
                    }}
                  >
                    {data.configuration.currencySymbol} {amountToPay.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>

        {/* Action Buttons */}
        {order.orderStatus !== "CANCELLED" &&
          order.orderStatus !== "DELIVERED" && (
            <CardActions
              sx={{
                justifyContent: "space-between",
                p: 3,
                backgroundColor: "#2e2e2e",
              }}
            >
              {loading && (
                <Loader
                  className="text-center"
                  type="TailSpin"
                  color="#ff5733"
                  height={40}
                  width={40}
                  visible={loading}
                />
              )}
              <Button
                startIcon={<CheckCircle />}
                disabled={order.orderStatus !== "PENDING"}
                onClick={() =>
                  mutate({
                    variables: {
                      id: order._id,
                      status: "ACCEPTED",
                      reason: "",
                    },
                  })
                }
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#388e3c" },
                  color: "#ffffff",
                }}
              >
                {order.status === true ? t("Accepted") : t("Accept")}
              </Button>
              <Button
                startIcon={<Cancel />}
                disabled={order.orderStatus === "CANCELLED"}
                onClick={() => {
                  if (validateReason()) {
                    mutate({
                      variables: { id: order._id, status: "CANCELLED", reason },
                    });
                  }
                }}
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  backgroundColor: "#f44336",
                  "&:hover": { backgroundColor: "#d32f2f" },
                  color: "#ffffff",
                }}
              >
                {order.status === false ? t("Cancelled") : t("Cancel")}
              </Button>
              <Input
                name="reason"
                id="input-reason"
                placeholder={t("PHReasonIfRejected")}
                type="text"
                disableUnderline
                value={reason}
                onChange={(event) => reasonSetter(event.target.value)}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  borderColor: reasonError ? "error.main" : "#ffc107",
                  px: 1,
                  backgroundColor: "#424242",
                  color: "#ffffff",
                  border: "1px solid",
                }}
              />
            </CardActions>
          )}

        {/* Alerts */}
        <Box mt={2}>
          {success && (
            <Alert
              variant="filled"
              severity="success"
              sx={{
                borderRadius: 2,
                backgroundColor: "#4caf50",
                color: "#ffffff",
              }}
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert
              variant="filled"
              severity="error"
              sx={{
                borderRadius: 2,
                backgroundColor: "#f44336",
                color: "#ffffff",
              }}
            >
              {error}
            </Alert>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default withTranslation()(Order);
