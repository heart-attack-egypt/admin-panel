import React, { useState } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import { withTranslation } from "react-i18next";
import { validateFunc } from "../../constraints/constraints";
import { updateOrderStatus, getConfiguration } from "../../apollo";
import Loader from "react-loader-spinner";
import {
  Box,
  Divider,
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

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: "auto" }}>
      <Card
        sx={{
          boxShadow: 3,
          borderRadius: 3,

          overflow: "hidden",
          backgroundColor: "#2e2e2e", // Dark background for contrast
        }}
      >
        <CardContent>
          {/* Order Header */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#ffcc00", // Gold-like color for restaurant vibe
                borderBottom: `2px solid #ff5733`, // Vibrant red-orange for accents
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
                color: "#ffcc00", // Gold color for section headers
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
                  backgroundColor: "#3e3e3e", // Dark gray background for item sections
                  color: "#ffffff", // White text for visibility
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item lg={1}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        color: "#ffcc00", // Gold for quantity
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
                        color: "#ff5733", // Red-orange for prices
                      }}
                    >
                      {data.configuration.currencySymbol}{" "}
                      {(item.variation.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                {item.specialInstructions.length > 0 && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#ffc107", // Bright yellow for special instructions
                      mt: 1,
                    }}
                  >
                    {t("SpecialInstructions")}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Payment Method Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: "bold",
                color: "#ffcc00", // Gold color for section headers
              }}
            >
              {t("PaymentMethod")}
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#3e3e3e", // Dark gray for payment section
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item lg={6} sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: "#ffcc00", // Gold for payment method text
                    }}
                  >
                    {order.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item lg={6}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      color: "#ff5733", // Red-orange for payment amount
                    }}
                  >
                    {data.configuration.currencySymbol}{" "}
                    {order.paidAmount ? order.paidAmount.toFixed(2) : 0}
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
                backgroundColor: "#2e2e2e", // Dark background for action section
              }}
            >
              {loading && (
                <Loader
                  className="text-center"
                  type="TailSpin"
                  color="#ff5733" // Vibrant color for loading spinner
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
                  backgroundColor: "#4caf50", // Green for accept button
                  "&:hover": { backgroundColor: "#388e3c" },
                  color: "#ffffff", // White text for contrast
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
                  backgroundColor: "#f44336", // Red for cancel button
                  "&:hover": { backgroundColor: "#d32f2f" },
                  color: "#ffffff", // White text for contrast
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
                  borderColor: reasonError ? "error.main" : "#ffc107", // Bright yellow border on input
                  px: 1,
                  backgroundColor: "#424242", // Darker gray for input field
                  color: "#ffffff", // White text
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
                backgroundColor: "#4caf50", // Green for success alert
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
                backgroundColor: "#f44336", // Red for error alert
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
