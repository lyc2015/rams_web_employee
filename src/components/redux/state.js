import { fetchDropDown } from "./dropDown";
import { isMobileDevice } from "./init";

export default {
  dropDown: fetchDropDown(),
  initEmployee: {},
  isMobileDevice: isMobileDevice(),
};
