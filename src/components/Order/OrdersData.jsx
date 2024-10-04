/* eslint-disable react/display-name */
import React, { useEffect, useState, useRef } from "react";
import { withTranslation } from "react-i18next";
import { transformToNewline } from "../../utils/stringManipulations";
import DataTable from "react-data-table-component";
import orderBy from "lodash/orderBy";
import CustomLoader from "../Loader/CustomLoader";
import { subscribePlaceOrder, orderCount } from "../../apollo";
import { useQuery, gql } from "@apollo/client";
import SearchBar from "../TableHeader/SearchBar";
import { customStyles } from "../../utils/tableCustomStyles";
import TableHeader from "../TableHeader";
import { Button, useTheme } from "@mui/material";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { FormatReceipt } from "./format";
import Order from "./Order";

const ORDERCOUNT = gql`
  ${orderCount}
`;
const ORDER_PLACED = gql`
  ${subscribePlaceOrder}
`;

const OrdersData = (props) => {
  const theme = useTheme();
  const { t } = props;
  const { selected, updateSelected } = props;
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Call the setSearchQuery passed from the parent component
    if (value.length >= 3 || value.length === 0) {
      props.setSearchQuery(value); // Trigger search query when length is greater than 2
      props.page(1);
    }
  };

  const getItems = (items) => {
    return items
      .map(
        (item) =>
          `${item.quantity}x${item.title}${
            item.variation.title ? `(${item.variation.title})` : ""
          }`
      )
      .join("\n");
  };
  const restaurantId = localStorage.getItem("restaurantId");

  const { data, loading: loadingQuery } = useQuery(ORDERCOUNT, {
    variables: { restaurant: restaurantId },
  });

  const handlePerRowsChange = (perPage, page) => {
    props.page(page);
    props.rows(perPage);
  };

  const handlePageChange = async (page) => {
    props.page(page);
  };

  const columns = [
    {
      name: t("OrderID"),
      sortable: true,
      selector: "orderId",
    },
    {
      name: t("Items"),
      cell: (row) => <>{getItems(row.items)}</>,
    },
    {
      name: t("Payment"),
      selector: "paymentMethod",
      sortable: true,
    },
    {
      name: t("Status"),
      selector: "orderStatus",
      sortable: true,
    },
    {
      name: t("Datetime"),
      cell: (row) => (
        <>{new Date(row.createdAt).toLocaleString().replace(/ /g, "\n")}</>
      ),
    },
    {
      name: t("Address"),
      cell: (row) => (
        <>{transformToNewline(row.deliveryAddress.deliveryAddress, 3)}</>
      ),
    },
    {
      name: t("name"),
      cell: (row) => <>{transformToNewline(row.user?.name ?? "", 3)}</>,
    },
    {
      name: t("phone"),
      cell: (row) => <>{transformToNewline(row.user?.phone ?? "", 3)}</>,
    },
    {
      name: t("print order"),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,

      cell: (row) => {
        if (!row) return;
        const componentRef = useRef();
        const handlePrint = useReactToPrint({
          content: () => componentRef.current,
        });

        return (
          <>
            <Button
              style={{ color: "#000" }}
              size="small"
              variant="outlined"
              onClick={handlePrint}
            >
              <strong>print order</strong>
            </Button>

            <div style={{ display: "none" }}>
              <FormatReceipt ref={componentRef} row={row} />
            </div>
          </>
        );
      },
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) =>
        row.orderStatus !== "DELIVERED" && row.orderStatus !== "CANCELLED",
      style: {
        backgroundColor: theme.palette.warning.lightest,
      },
    },
  ];
  useEffect(() => {
    const unsubscribe = props.subscribeToMore({
      document: ORDER_PLACED,
      variables: { id: restaurantId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newOrder = subscriptionData.data.subscribePlaceOrder.order;

        if (subscriptionData.data.subscribePlaceOrder.origin === "new") {
          // If it's a new order, prepend it to the list immutably
          return {
            ...prev, // Spread prev to maintain other parts of the state
            ordersByRestId: [newOrder, ...prev.ordersByRestId],
          };
        } else {
          // If it's an update to an existing order, find and update it immutably
          const orderIndex = prev.ordersByRestId.findIndex(
            (o) => o._id === newOrder._id
          );

          // If the order is found, update it
          if (orderIndex > -1) {
            const updatedOrders = [
              ...prev.ordersByRestId.slice(0, orderIndex),
              newOrder,
              ...prev.ordersByRestId.slice(orderIndex + 1),
            ];

            return {
              ...prev, // Spread prev to maintain other parts of the state
              ordersByRestId: updatedOrders,
            };
          }

          // If the order is not found, return the previous state
          return prev;
        }
      },
      onError: (error) => {
        console.error("Subscription error:", error);
      },
    });

    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, [restaurantId, props]);
  useEffect(() => {
    if (selected) {
      const order = props.orders.find((o) => o._id === selected._id);
      updateSelected(order);
    }
  }, [props.orders]);

  return (
    <>
      <DataTable
        title={<TableHeader title={t("Orders")} />}
        columns={columns}
        data={props.orders || []}
        onRowClicked={props.toggleModal}
        progressPending={props.loading || loadingQuery}
        pointerOnHover
        progressComponent={<CustomLoader />}
        subHeader
        subHeaderComponent={
          <SearchBar value={searchQuery} onChange={onChangeSearch} />
        }
        pagination
        paginationServer
        paginationTotalRows={data && data.orderCount}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
        selectableRows
        paginationIconLastPage=""
        paginationIconFirstPage=""
      />
    </>
  );
};
export default withTranslation()(OrdersData);
