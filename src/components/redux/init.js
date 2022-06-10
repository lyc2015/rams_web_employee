import defaultState from "./state";
import axios from "axios";
const $ = require("jquery");
axios.defaults.withCredentials = true;

export async function fetchInitEmployee(state = defaultState, action) {
  // var res = [];
  // var serverIP = "http://127.0.0.1:8080/";
  // await axios
  //   .post(this.state.serverIP + "subMenuEmployee/init")
  //   .then((resultMap) => {
  //     if (resultMap.data !== null && resultMap.data !== "") {
  //     } else {
  //       this.props.history.push("/");
  //     }
  //   });
}
export function isMobileDevice(state = defaultState, action) {
  var sUserAgent = navigator.userAgent;
  let isMobileDevice =
    sUserAgent.indexOf("Android") > -1 ||
    sUserAgent.indexOf("iPhone") > -1 ||
    sUserAgent.indexOf("iPad") > -1 ||
    sUserAgent.indexOf("iPod") > -1 ||
    sUserAgent.indexOf("Symbian") > -1;
  return isMobileDevice;
}
