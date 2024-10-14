import React, { useState, useRef, useCallback } from "react";
import { useMutation, gql } from "@apollo/client";
import { validateFunc } from "../../constraints/constraints";
import { withTranslation } from "react-i18next";
import { GoogleMap, Polygon } from "@react-google-maps/api";
import useStyles from "./styles";
import useGlobalStyles from "../../utils/globalStyles";
import { Box, Typography, Input, Button, Alert, Grid } from "@mui/material";

// core components
import { createZone, editZone, getZones } from "../../apollo";
import { transformPath, transformPolygon } from "../../utils/coordinates";
import ConfigurableValues from "../../config/constants";

const CREATE_ZONE = gql`
  ${createZone}
`;
const EDIT_ZONE = gql`
  ${editZone}
`;
const GET_ZONE = gql`
  ${getZones}
`;

const Zone = (props) => {
  const [path, setPath] = useState(
    props.zone ? transformPolygon(props.zone.location.coordinates[0]) : []
  );
  const { PAID_VERSION } = ConfigurableValues();
  const [mutation] = useState(props.zone ? EDIT_ZONE : CREATE_ZONE);
  const [title, setTitle] = useState(props.zone ? props.zone.title : "");
  const [description, setDescription] = useState(
    props.zone ? props.zone.description : ""
  );
  const listenersRef = useRef([]);
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState("");
  const [fileError, setFileError] = useState("");
  const [titleError, setTitleError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);

  const onCompleted = (data) => {
    if (!props.zone) clearFields();
    const message = props.zone
      ? t("ZoneUpdatedSuccessfully")
      : t("ZoneAddedSuccessfully");
    setErrors("");
    setSuccess(message);
    setTimeout(hideAlert, 3000);
  };

  const onError = (error) => {
    setErrors(error.message);
    setSuccess("");
    setTimeout(hideAlert, 3000);
  };

  const [mutate] = useMutation(mutation, {
    refetchQueries: [{ query: GET_ZONE }],
    onError,
    onCompleted,
  });

  const [center, setCenter] = useState(
    props.zone
      ? setInitialCenter(props.zone.location.coordinates[0])
      : { lat: 33.684422, lng: 73.047882 }
  );

  const polygonRef = useRef();

  const onClick = (e) => {
    setPath([...path, { lat: e.latLng.lat(), lng: e.latLng.lng() }]);
  };

  // Call setPath with new edited path
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map((latLng) => {
          return { lat: latLng.lat(), lng: latLng.lng() };
        });
      setPath(nextPath);
    }
  }, [setPath]);

  const onLoadPolygon = useCallback(
    (polygon) => {
      polygonRef.current = polygon;
      const path = polygon.getPath();
      listenersRef.current.push(
        path.addListener("set_at", onEdit),
        path.addListener("insert_at", onEdit),
        path.addListener("remove_at", onEdit)
      );
    },
    [onEdit]
  );

  const onUnmount = useCallback(() => {
    listenersRef.current.forEach((lis) => lis.remove());
    polygonRef.current = null;
  }, []);

  function setInitialCenter(coordinates) {
    return { lat: coordinates[0][1], lng: coordinates[0][0] };
  }

  const onSubmitValidation = () => {
    setErrors("");
    const titleErrors = !validateFunc({ title: title }, "title");
    const descriptionErrors = !validateFunc(
      { description: description },
      "description"
    );
    let zoneErrors = true;
    if (path.length < 3) {
      zoneErrors = false;
      setErrors(t("SetZoneOnMap"));
      return false;
    }

    setTitleError(titleErrors);
    setDescriptionError(descriptionErrors);
    return titleErrors && descriptionErrors && zoneErrors;
  };

  const clearFields = () => {
    setTitle("");
    setDescription("");
    setTitleError(null);
    setDescriptionError(null);
    setPath([]);
  };

  const hideAlert = () => {
    setErrors("");
    setSuccess("");
  };

  // Handle File Upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        parseKML(text);
      };
      reader.readAsText(file);
    } else {
      setFileError("Please upload a valid KML file.");
    }
  };

  // Parse KML File and Set Path
  const parseKML = (kmlText) => {
    try {
      const parser = new DOMParser();
      const kml = parser.parseFromString(kmlText, "text/xml");
      const coordinatesElements = kml.getElementsByTagName("coordinates");

      const extractedPath = [];
      for (let i = 0; i < coordinatesElements.length; i++) {
        const coordsArray = coordinatesElements[i].textContent
          .trim()
          .split(/\s+/); // Handle spaces
        coordsArray.forEach((coordString) => {
          const coords = coordString.split(",");
          extractedPath.push({
            lat: parseFloat(coords[1]), // Latitude
            lng: parseFloat(coords[0]), // Longitude
          });
        });
      }

      setPath(extractedPath); // Set the path immediately to be shown on the map
      setCenter({ lat: extractedPath[0].lat, lng: extractedPath[0].lng }); // Adjust the map center to the uploaded KML file path
      setSuccess("KML file uploaded and displayed successfully.");
    } catch (error) {
      setFileError("Error parsing KML file.");
      console.error(error);
    }
  };

  const { t } = props;

  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box
          item
          className={props.zone ? classes.headingBlack : classes.heading}
        >
          <Typography
            variant="h6"
            className={props.zone ? classes.textWhite : classes.text}
          >
            {props.zone ? t("EditZone") : t("AddZone")}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography className={classes.labelText}>
                  {t("Title")}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-title"
                  placeholder={t("Title")}
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                  }}
                  disableUnderline
                  className={[
                    globalClasses.input,
                    titleError === false
                      ? globalClasses.inputError
                      : titleError === true
                      ? globalClasses.inputSuccess
                      : "",
                  ]}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography className={classes.labelText}>
                  {t("Description")}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-description"
                  placeholder={t("Description")}
                  type="text"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                  }}
                  disableUnderline
                  className={[
                    globalClasses.input,
                    descriptionError === false
                      ? globalClasses.inputError
                      : descriptionError === true
                      ? globalClasses.inputSuccess
                      : "",
                  ]}
                />
              </Box>
            </Grid>
          </Grid>

          {/* File Upload Input for KML */}

          <Box mt={2} className={globalClasses.flexRow}>
            <GoogleMap
              mapContainerStyle={{
                height: "500px",
                width: "100%",
              }}
              id="example-map"
              zoom={14}
              center={center}
              onClick={onClick}
            >
              <Polygon
                editable
                draggable
                path={path}
                onMouseUp={onEdit}
                onDragEnd={onEdit}
                onLoad={onLoadPolygon}
                onUnmount={onUnmount}
              />
            </GoogleMap>
          </Box>

          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            mt={2}
            gap={2} // Adds spacing between the buttons
            width="100%"
          >
            <Input
              type="file"
              accept=".kml"
              onChange={handleFileUpload}
              style={{
                display: "none",
              }}
              id="upload-kml"
            />
            <label htmlFor="upload-kml" style={{ width: "50%" }}>
              <Button
                variant="contained"
                component="span"
                style={{
                  backgroundColor: "#007BFF",
                  color: "#fff",
                  padding: "10px 20px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "8px",
                  width: "100%", // Ensures button takes full width of the container
                  boxShadow: "0px 4px 6px rgba(0, 123, 255, 0.3)",
                }}
              >
                {t("Upload KML File")}
              </Button>
            </label>

            <Button
              variant="contained"
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                padding: "10px 20px",
                textTransform: "none",
                fontSize: "16px",
                borderRadius: "8px",
                width: "50%", // Ensures button takes full width of the container
                boxShadow: "0px 4px 6px rgba(40, 167, 69, 0.3)",
              }}
              disabled={!PAID_VERSION}
              onClick={async (e) => {
                e.preventDefault();
                if (onSubmitValidation()) {
                  mutate({
                    variables: {
                      zone: {
                        _id: props.zone ? props.zone._id : "",
                        title,
                        description,
                        coordinates: transformPath(path),
                      },
                    },
                  });
                  setTimeout(() => {
                    props.onClose(); // Close the modal
                  }, 4000);
                }
              }}
            >
              {props.zone ? t("Update") : t("Save")}
            </Button>
          </Box>
        </form>

        <Box mt={2}>
          {success && (
            <Alert
              className={globalClasses.alertSuccess}
              variant="filled"
              severity="success"
            >
              {success}
            </Alert>
          )}
          {errors && (
            <Alert
              className={globalClasses.alertError}
              variant="filled"
              severity="error"
            >
              {errors}
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default withTranslation()(Zone);
