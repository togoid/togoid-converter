import "../styles/style.scss";
import React from "react";
import { Provider } from "jotai";

const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
};

export default MyApp;
