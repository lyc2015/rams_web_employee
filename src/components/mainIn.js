import React, { Component } from "react";
import { BrowserRouter as Router, Route, withRouter } from "react-router-dom";
import Gate from "./gate";
import LoginEmployee from "./loginEmployee";
import SubMenuEmployee from "./subMenuEmployee";
import axios from "axios";
axios.defaults.withCredentials = true;
/**
 * 主画面
 */
class mainIn extends Component {
  render() {
    return (
      <Router>
        <>
          <Route exact path="/" component={LoginEmployee} />
          <Route path="/loginEmployee" component={LoginEmployee} />
          <Route path="/subMenuEmployee" component={SubMenuEmployee} />
        </>
      </Router>
    );
  }
}

export default withRouter(mainIn);
