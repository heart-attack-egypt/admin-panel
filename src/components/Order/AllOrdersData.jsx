/* eslint-disable react/display-name */
import React, { useEffect, useRef, useState } from "react";
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
import { Button, Select, useTheme } from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { FormatReceipt } from "./format";

const ORDERCOUNT = gql`
  ${orderCount}
`;
const AllOrdersData = (props) => {
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

  const { data, loading: loadingQuery } = useQuery(ORDERCOUNT, {
    variables: { search: searchQuery },
  });
  console.log("conets :", data);
  const propExists = (obj, path) => {
    return path.split(".").reduce((obj, prop) => {
      return obj && obj[prop] ? obj[prop] : "";
    }, obj);
  };

  const customSort = (rows, field, direction) => {
    const handleField = (row) => {
      if (field && isNaN(propExists(row, field))) {
        return propExists(row, field).toLowerCase();
      }

      return row[field];
    };

    return orderBy(rows, handleField, direction);
  };

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
      name: t("Restaurant"),
      cell: (row) => <>{transformToNewline(row.restaurant?.name ?? "", 3)}</>,
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
        data={props.orders}
        onRowClicked={props.toggleModal}
        progressPending={props.loading || loadingQuery}
        pointerOnHover
        progressComponent={<CustomLoader />}
        sortFunction={customSort}
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
export default withTranslation()(AllOrdersData);
