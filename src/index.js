import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import React from "react";
import ReactDOM from "react-dom";

import "./asserts/css/index.css";
import "./asserts/css/antdResetCss.css";
import "antd/dist/antd.css";
import App from "./App";
import { ConfigProvider } from "antd";

import * as serviceWorker from "./serviceWorker";
import "moment/locale/ja";
import locale from "antd/lib/locale/ja_JP";

ReactDOM.render(
  <ConfigProvider locale={locale}>
    <App />
  </ConfigProvider>,
  // /*<Provider store={store}>*/ <App /> /*</Provider>*/,
  document.getElementById("root")
);

serviceWorker.unregister();
