import SwaggerUI from "swagger-ui";
import "swagger-ui/dist/swagger-ui.css";

const spec = require("./oas.json");

const ui = SwaggerUI({
  spec,
  dom_id: "#swagger",
});

ui.initOAuth({
  appName: "Togo ID API Swagger",
  // See https://demo.identityserver.io/ for configuration details.
  clientId: "implicit",
});
