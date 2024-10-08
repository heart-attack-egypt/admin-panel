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
import { Button, Chip, Select, useTheme } from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { FormatReceipt } from "./format";
import PrintIcon from "@mui/icons-material/Print";

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

  const { data, loading: loadingQuery } = useQuery(ORDERCOUNT, {
    variables: { search: searchQuery },
  });

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
  const renderStatusLabel = (status) => {
    let backgroundColor = "#E0E0E0"; // Default Light Gray
    let titleColor = "#000"; // Default Black for title text

    switch (status) {
      case "PENDING":
        backgroundColor = "#FFCC80"; // Light Orange for Processing
        titleColor = "#5C4033"; // Dark Brown for comfortable contrast
        break;
      case "ACCEPTED":
        backgroundColor = "#64B5F6"; // Light Blue for Waiting
        titleColor = "#0D47A1"; // Dark Blue for comfortable contrast
        break;
      case "DELIVERED":
        backgroundColor = "#81C784"; // Soft Green for Delivered
        titleColor = "#1B5E20"; // Dark Green for comfortable contrast
        break;
      case "CANCELLED":
        backgroundColor = "#f54d4d"; // Red for Cancelled
        titleColor = "#FFFFFF"; // White for comfortable contrast
        break;
      default:
        backgroundColor = "#E0E0E0"; // Default Light Gray
        titleColor = "#000"; // Black for text
    }

    return (
      <Chip
        label={status}
        style={{
          backgroundColor: backgroundColor,
          color: titleColor,
          fontWeight: "bold",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
        }}
      />
    );
  };

  const handlePageChange = async (page) => {
    props.page(page);
  };

  const columns = [
    {
      name: t("OrderID"),
      sortable: true,
      style: { fontWeight: "bold" },
      selector: "orderId",
      center: true, // Center column content
    },
    {
      name: t("Items"),
      cell: (row) => <>{getItems(row.items)}</>,
      center: true,
    },
    {
      name: t("Payment"),
      selector: "paymentMethod",
      sortable: true,
      center: true,
    },
    {
      name: t("Status"),
      cell: (row) => renderStatusLabel(row.orderStatus),

      center: true,
    },
    {
      name: t("Datetime"),
      cell: (row) => <>{new Date(row.createdAt).toLocaleString()}</>,
      center: true,
    },
    {
      name: t("Address"),
      cell: (row) => (
        <>{transformToNewline(row.deliveryAddress.deliveryAddress, 3)}</>
      ),
      center: true,
    },
    {
      name: t("Name"),
      cell: (row) => <>{transformToNewline(row.user?.name ?? "", 3)}</>,
      center: true,
    },
    {
      name: t("Phone"),
      cell: (row) => <>{transformToNewline(row.user?.phone ?? "", 3)}</>,
      center: true,
    },
    {
      name: t("printOrder"),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      cell: (row) => {
        const componentRef = useRef();
        const handlePrint = useReactToPrint({
          content: () => componentRef.current,
        });

        return (
          <>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handlePrint}
              startIcon={<PrintIcon />}
            >
              Print
            </Button>

            <div style={{ display: "none" }}>
              <FormatReceipt ref={componentRef} row={row} />
            </div>
          </>
        );
      },
      center: true,
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => row.orderStatus === "DELIVERED",
      style: {
        backgroundColor: "#E8F5E9", // Very light green for delivered
      },
    },
    {
      when: (row) => row.orderStatus === "PENDING",
      style: {
        backgroundColor: "#FFF3E0", // Very light orange for processing
      },
    },
    {
      when: (row) => row.orderStatus === "ACCEPTED",
      style: {
        backgroundColor: "#E3F2FD", // Very light blue for waiting
      },
    },
    {
      when: (row) => row.orderStatus === "CANCELLED",
      style: {
        backgroundColor: "#f8dfdf", // Very light gray for cancelled
      },
    },
  ];
  const customTableStyles = {
    headCells: {
      style: {
        fontSize: "16px",
        fontWeight: "bold",

        justifyContent: "center", // Center align header content
        textAlign: "center",
        backgroundColor: theme.palette.background.default,
        padding: "10px",
      },
    },
    cells: {
      style: {
        justifyContent: "center", // Center align cell content
        textAlign: "center",

        padding: "8px",
      },
    },
  };
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
        customStyles={customTableStyles}
        selectableRows
        paginationIconLastPage=""
        paginationIconFirstPage=""
      />
    </>
  );
};
export default withTranslation()(AllOrdersData);
