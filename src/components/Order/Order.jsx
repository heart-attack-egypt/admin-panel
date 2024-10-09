import React, { useState } from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";

import { withTranslation } from "react-i18next";
import { validateFunc } from "../../constraints/constraints";
import {
  updateOrderStatus,
  getConfiguration,
  CHANGE_RESTAURANT,
  SEARCH_RESTAURANTS,
} from "../../apollo";
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
  let { order, t } = props;
  const [reason, reasonSetter] = useState("");
  const [reasonError, reasonErrorSetter] = useState(null);
  const [error, errorSetter] = useState("");
  const [success, successSetter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(
    props?.order?.orderStatus
  ); // Local state to track the selected status
  const [newRestaurantId, setNewRestaurantId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const { data: filteredRestaurants } = useQuery(SEARCH_RESTAURANTS, {
    variables: { search: searchTerm },
    skip: searchTerm.length < 3, // Skip query if searchTerm is empty
  });

  const [changeRestaurant, { loading: changingRestaurant }] = useMutation(
    CHANGE_RESTAURANT,
    {
      onCompleted: (data) => {
        // Update orders list after changing restaurant
        order = data.changeRestaurant;
        successSetter("restaurant changed");
        setTimeout(() => onDismiss(), 1000);
      },
      onError: (error) => {
        console.error("Failed to change restaurant:", error);
        errorSetter("Failed to change restaurant");
        setTimeout(() => onDismiss(), 1000);
      },
    }
  );

  const handleRestaurantChange = () => {
    changeRestaurant({
      variables: {
        orderId: props.order?._id,
        newRestaurantId,
        oldRestaurantId: props.order?.restaurant._id,
      },
    });
  };

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
  const vendor = localStorage.getItem("user-enatega")
    ? JSON.parse(localStorage.getItem("user-enatega")).userType === "VENDOR"
    : false;

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

  // Calculate order summary values
  const subtotal = order?.items.reduce((acc, item) => {
    return acc + item.variation.price * item.quantity;
  }, 0); // Subtotal

  const deliveryCharges = order.deliveryCharges ? order.deliveryCharges : 0; // Delivery fee
  const tips = order.tipping; // Tips
  const tax = order.taxationAmount; // Tax amount

  // Calculate the total (subtotal + fees + tips + tax)
  const total = subtotal + deliveryCharges + tips + tax;

  // Calculate discount
  const discountAmount = total - order.orderAmount;
  const discount = discountAmount > 0;

  // Amount to pay
  const amountToPay = discount ? order.orderAmount : total;

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
          <Box
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#ffcc00",
                borderBottom: "2px solid #ff5733",
                pb: 1,
              }}
            >
              {t("Order")} #{order.orderId}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#ffcc00",
                borderBottom: "2px solid #ff5733",
                pb: 1,
              }}
            >
              {order.restaurant.name.replace("Heart Attack", "")} branch
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
            {order.instructions && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: "bold",
                      color: "#ffcc00",
                    }}
                  >
                    {t("Note")}
                  </Typography>
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#3e3e3e",
                      color: "#ffffff",
                    }}
                  >
                    <Grid lg={7}>
                      <Typography variant="body1">
                        {`comment : ${order.instructions}`}
                      </Typography>
                    </Grid>
                  </Box>
                </Box>
              </>
            )}
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
                    {t("Payment Method")}
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
                    {order.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item lg={6}>
                  <Typography variant="body1" sx={{ color: "#ffffff" }}>
                    {t("Subtotal")}
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
                    {data.configuration.currencySymbol} {subtotal.toFixed(2)}
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

                <Grid item lg={6}>
                  <Typography variant="body1" sx={{ color: "#ffffff" }}>
                    {t("Tax")}
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
                    {data.configuration.currencySymbol} {tax.toFixed(2)}
                  </Typography>
                </Grid>

                <Grid item lg={6}>
                  <Typography variant="body1" sx={{ color: "#ffffff" }}>
                    {t("Total (Subtotal + Fees + Tips)")}
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
                    {data.configuration.currencySymbol} {total.toFixed(2)}
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
        <CardActions
          sx={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            backgroundColor: "#2e2e2e",
          }}
        >
          {/* Restaurant Selection Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "#2e2e2e",
              marginRight: "16px",
              width: "100%",
            }}
          >
            <Typography sx={{ mb: 2, color: "#ffffff" }}>
              {t("Restaurant:")} {order.restaurant.name}
            </Typography>

            {/* Search Input for Restaurant */}
            <TextField
              placeholder={t("Search restaurant...")}
              variant="outlined"
              value={searchTerm}
              onChange={(e) => {
                console.log("here");
                const value = e.target.value;
                setSearchTerm(value);
                if (value.length >= 3) setIsOpen(true);
                else setIsOpen(false);
              }}
              style={{
                marginBottom: "10px",
                width: "100%",
                backgroundColor: "#424242",
                color: "#ffffff",
              }}
              InputProps={{
                style: { color: "#ffffff" },
              }}
            />

            {/* Select Dropdown */}
            <Select
              open={isOpen && !!filteredRestaurants?.searchRestaurants.length}
              value={newRestaurantId || order.restaurant._id}
              onChange={(e) => {
                setIsOpen(false);
                setNewRestaurantId(e.target.value);
              }}
              onClick={(e) => setIsOpen(!isOpen)}
              style={{
                marginLeft: "10px",
                width: "100%",
                backgroundColor: "#424242",
                color: "#ffffff",
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: "#424242",
                    color: "#ffffff",
                  },
                },
              }}
            >
              {/* Disabled option showing current restaurant */}
              <MenuItem disabled value={order.restaurant._id}>
                {order.restaurant.name}
              </MenuItem>

              {/* Search results */}
              {filteredRestaurants?.searchRestaurants
                .filter((rest) => rest._id !== order.restaurant._id)
                .map((restaurant) => (
                  <MenuItem key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </MenuItem>
                ))}
            </Select>

            {/* Change Button */}
            <Button
              sx={{
                m: 3,
                p: 2,
                borderRadius: 3,
                boxShadow: 2,
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#388e3c" },
                color: "#ffffff",
                width: "100%",
              }}
              onClick={() => handleRestaurantChange(newRestaurantId)}
              disabled={
                changingRestaurant || newRestaurantId == order.restaurant._id
              }
            >
              {t("Change")}
            </Button>
          </div>

          {/* Order Status Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "#2e2e2e",
              width: "100%",
            }}
          >
            {/* Order Status Dropdown */}
            <Typography sx={{ mb: 2, color: "#ffffff" }}>
              {t("status:")} {order.orderStatus}
            </Typography>

            <FormControl
              sx={{
                minWidth: 200,
                backgroundColor: "#424242",
                borderRadius: 2,
                borderColor: "#ffc107",
                mb: 2,
                width: "100%",
              }}
            >
              <InputLabel sx={{ color: "#ffffff" }}>
                {t("Order Status")}
              </InputLabel>
              <Select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                sx={{
                  color: "#ffffff",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffc107",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffeb3b",
                  },
                }}
              >
                <MenuItem value="PENDING">{t("Pending")}</MenuItem>
                <MenuItem value="ACCEPTED">{t("Accepted")}</MenuItem>
                <MenuItem value="DELIVERED">{t("Delivered")}</MenuItem>
                {!vendor && (
                  <MenuItem value="CANCELLED">{t("Cancelled")}</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Reason Input for Cancelled Status */}
            {selectedStatus === "CANCELLED" && (
              <TextField
                id="input-reason"
                placeholder={t("PHReasonIfRejected")}
                value={reason}
                onChange={(event) => reasonSetter(event.target.value)}
                variant="outlined"
                fullWidth
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  backgroundColor: "#424242",
                  color: "#ffffff",
                  border: "1px solid",
                  borderColor: reasonError ? "error.main" : "#ffc107",
                }}
              />
            )}

            {/* Apply Button */}
            <Button
              startIcon={<CheckCircle />}
              onClick={() => {
                if (selectedStatus === "CANCELLED" && !validateReason()) {
                  return; // Validate reason for cancellation
                }
                mutate({
                  variables: {
                    id: order._id,
                    status: selectedStatus,
                    reason: selectedStatus === "CANCELLED" ? reason : "",
                  },
                });
              }}
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#388e3c" },
                color: "#ffffff",
                width: "100%",
              }}
              disabled={selectedStatus === props?.order?.orderStatus}
            >
              {t("Apply")}
            </Button>
          </div>

          {(loading || changingRestaurant) && (
            <Loader
              className="text-center"
              type="TailSpin"
              color="#ff5733"
              height={40}
              width={40}
              visible={loading}
            />
          )}
        </CardActions>

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
