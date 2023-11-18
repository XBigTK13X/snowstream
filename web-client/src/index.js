import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "./index.css";
import AppRoutes from "./routes";

const theme = createTheme({
  /* Put your mantine theme override here */
  /* https://mantine.dev */
  /* https://ui.mantine.dev */
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <AppRoutes />
    </MantineProvider>
  </React.StrictMode>
);
