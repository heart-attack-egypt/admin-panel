import React, { useState } from "react";
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import OrderComponent from "../components/Order/Order";
import OrdersData from "../components/Order/OrdersData";
import Header from "../components/Headers/Header";
import { useQuery, gql } from "@apollo/client";
import { getOrders, getOrdersByRestaurant } from "../apollo";
import useGlobalStyles from "../utils/globalStyles";
import { Container, Modal } from "@mui/material";

const GET_ORDERS = gql`
  ${getOrdersByRestaurant}
`;
const GET_ALL_ORDERS = gql`
  ${getOrders}
`;

const Orders = () => {
  const [detailsModal, setDetailModal] = useState(false);
  const [order, setOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  const location = useLocation();

  // Determine the value of isAll based on the current URL
  const isAll = location.pathname.includes("/all-orders");

  // Log to see if isAll is set correctly
  console.log(isAll);
  const {
    data,
    error: errorQuery,
    loading: loadingQuery,
    subscribeToMore,
  } = useQuery(isAll ? GET_ALL_ORDERS : GET_ORDERS, {
    variables: {
      restaurant: isAll ? undefined : restaurantId,
      page: page - 1,
      rows: rowsPerPage,
      search: isAll ? undefined : search,
    },
  });
  const toggleModal = (order) => {
    setOrder(order);
    setDetailModal(!detailsModal);
  };

  const globalClasses = useGlobalStyles();
  return (
    <>
      <Header />
      {/* Page content */}
      <OrderComponent order={order} />
      <Container className={globalClasses.flex} fluid>
        {errorQuery && (
          <tr>
            <td>{`${"Error"} ${errorQuery.message}`}</td>
          </tr>
        )}
        <OrdersData
          orders={data && (data.ordersByRestId || data.allOrders)}
          toggleModal={toggleModal}
          subscribeToMore={subscribeToMore}
          loading={loadingQuery}
          selected={order}
          updateSelected={setOrder}
          page={setPage}
          rows={setRowsPerPage}
        />
        <Modal
          style={{
            width: "75%",
            marginLeft: "13%",
            overflowY: "auto",
          }}
          open={detailsModal}
          onClose={() => {
            toggleModal(null);
          }}
        >
          <OrderComponent order={order} />
        </Modal>
      </Container>
    </>
  );
};
export default withTranslation()(Orders);
