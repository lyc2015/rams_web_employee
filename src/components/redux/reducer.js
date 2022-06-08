import defaultState from "./state";
import { updateDropDown, fetchDropDown } from "./dropDown";
import { fetchInitEmployee } from "./init";

export default (state = defaultState, action) => {
  if (!state) {
    return {
      count: 0,
    };
  }
  switch (action.type) {
    // reduxの更新（dropNameは更新の部分）
    case "UPDATE_STATE":
      state = updateDropDown(state, action.dropName);
      return state;
    case "FETCH_STATE":
      let dropDown = fetchDropDown(state);
      state.dropDown = dropDown;
      return state;
    case "UPDATE_INIT_EMPLOYEE":
      state.initEmployee = action.data;
      return state;
    default:
      return state;
  }
};
