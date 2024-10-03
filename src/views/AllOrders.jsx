import React, { useState } from "react";
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import OrderComponent from "../components/Order/Order";
import OrdersData from "../components/Order/OrdersData";
import Header from "../components/Headers/Header";
import { useQuery, gql } from "@apollo/client";
import { getOrders } from "../apollo";
import useGlobalStyles from "../utils/globalStyles";
import { Container, Modal } from "@mui/material";
import AllOrdersData from "../components/Order/AllOrdersData";
const GET_ORDERS = gql`
  ${getOrders}
`;

const Orders = () => {
  const [detailsModal, setDetailModal] = useState(false);
  const [order, setOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_ORDERS,
    {
      variables: {
        page: searchQuery ? 0 : page - 1,
        search: searchQuery, // Pass the search query to the query variables
      },
    }
  );

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
        <AllOrdersData
          orders={data && data.allOrders}
          toggleModal={toggleModal}
          loading={loadingQuery}
          selected={order}
          updateSelected={setOrder}
          page={setPage}
          rows={setRowsPerPage}
          setSearchQuery={setSearchQuery} // Pass the search function to AllOrdersData
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
