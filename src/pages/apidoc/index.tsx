import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

import oas from "@/../swagger/oas.json";

const Apidoc = () => {
  return <SwaggerUI spec={oas} />;
};

export default Apidoc;
