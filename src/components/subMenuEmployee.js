import React, { Component } from "react";
import {
  Row,
  Col,
  ListGroup,
  Accordion,
  Button,
  Navbar,
  Container,
} from "react-bootstrap";
import title from "../asserts/images/LYCmark.png";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PasswordSetEmployee from "./passwordSetEmployee";
import WorkRepot from "./workRepot";
import DataShareEmployee from "./dataShareEmployee";
import WorkTimeSearch from "./workTimeSearch";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import {
  faHistory,
  faFile,
  faUser,
  faFileExcel,
  faFileWord,
  faSearch,
  faSave,
  faThList,
  faCaretSquareLeft,
  faCogs,
  faAddressCard,
  faFolderOpen,
  faFileContract,
  faFileAlt,
  faMoneyCheckAlt,
  faUserEdit,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import "../asserts/css/subMenu.css";
import DutyRegistration from "./dutyRegistration";
import dutyManagement from "./dutyManagement";
import CostRegistration from "./costRegistration";
import Resume from "./resume";
import store from "./redux/store";
import BreakTime from "./breakTime";
import ReactTooltip from "react-tooltip";
import { message, Dropdown, Menu, Space } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import EventEmitter from "./utils/EventEmitter";

axios.defaults.withCredentials = true;

//お客様情報画面の追加パラメータ
var customerInfoPath = {
  pathname: "/subMenuEmployee/customerInfo",
  state: { actionType: "insert" },
};
const menuStyle = {
  borderBottom: "0.1px solid #167887",
  backgroundColor: "#17a2b8",
};
const menuStyleHover = {
  borderBottom: "0.1px solid #167887",
  backgroundColor: "#188596",
};

const subMenu = {
  borderBottom: "0.1px solid #4a4a4a",
  backgroundColor: "#ffffff",
};
const subMenuHover = {
  borderBottom: "0.1px solid #4a4a4a",
  backgroundColor: "#4a4a4a",
};
/**
 * サブメニュー画面（社員用）
 */
class SubMenu extends Component {
  state = {
    isMobileDevice: store.getState().isMobileDevice,
    nowDate: "", //今の期日
    hover: "",
    className: "",
    year: new Date().getFullYear(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
    dutyRegistrationFlag: false,
    serverIP: store.getState().dropDown[store.getState().dropDown.length - 1], //劉林涛　テスト
  };

  async componentWillMount() {
    await axios
      .post(this.state.serverIP + "subMenuEmployee/init")
      .then((resultMap) => {
        if (resultMap.data !== null && resultMap.data !== "") {
          this.props.updateInitEmployee(resultMap.data);
          document.getElementById("kanriSha").innerHTML =
            "社員" + "：" + resultMap.data["employeeName"];
        } else {
          this.props.history.push("/");
        }
      });
  }
  /**
   * 画面の初期化
   */
  componentDidMount() {
    EventEmitter.on("updateWorkRepot", () => {
      this.getDutyRegistrationFlag();
    });
    this.getDutyRegistrationFlag();

    var dateNow = new Date();
    let month = dateNow.getMonth() + 1;
    let day = dateNow.getDate();
    this.setState({
      nowDate:
        dateNow.getFullYear() +
        "年" +
        (month < 10 ? "0" + month : month) +
        "月" +
        (day < 10 ? "0" + day : day) +
        "日",
      hover: "",
      click: "",
      className: "",
    });
  }
  componentWillUnmount() {
    EventEmitter.remove("updateWorkRepot");
  }

  getDutyRegistrationFlag = () => {
    let postData = {
      yearMonth: this.state.year + this.state.month,
    };
    axios
      .post(this.state.serverIP + "dutyRegistration/selectWorkRepot", postData)
      .then((response) => response.data)
      .then((data) => {
        this.setState({
          dutyRegistrationFlag: data,
        });
      });
    axios
      .post(this.state.serverIP + "dutyRegistration/getDutyInfo", postData)
      .then((resultMap) => {
        if (resultMap.data.breakTime === null) {
          this.setState({
            breakTimeFlag: true,
          });
        }
      });
  };

  logout = () => {
    axios
      .post(this.state.serverIP + "subMenuEmployee/logout")
      .then((resultMap) => {
        message.success("ログアウト成功");
        this.props.updateInitEmployee({});
      });
  };
  shuseiTo = (path) => {
    this.props.history.push(path);
  };
  toggleHover = (num) => {
    this.setState({
      hover: num,
    });
  };
  click = (name) => {
    this.setState({
      click: name,
    });
  };

  test = () => {
    if (this.state.dutyRegistrationFlag) {
      message.error(
        "作業報告書データすでに存在しています、クリアしてください。"
      );
    } else {
      var sendValue = {
        flag: this.state.breakTimeFlag,
      };
      if (this.state.breakTimeFlag) {
        message.info("休憩時間を登録してください。");
        this.shuseiTo({
          pathname: "/subMenuEmployee/breakTime",
          state: {
            backPage: "",
            sendValue: sendValue,
          },
        });
      } else {
        this.shuseiTo({
          pathname: "/subMenuEmployee/dutyRegistration",
          state: { actionType: "insert" },
        });
      }
    }
  };

  checkSession = () => {
    axios
      .post(this.state.serverIP + "subMenu/checkSession")
      .then((resultMap) => {
        if (resultMap.data === null || resultMap.data === "") {
          alert(
            "セッションの有効期限が切れています。再度ログインを行なってください。"
          );
          this.props.history.push("/loginEmployee");
        }
      });
  };

  setClassName = (className) => {
    this.setState({
      className: className,
    });
  };

  changePage = (name) => {
    switch (name) {
      case "勤務登録":
        this.setClassName("勤務登録");
        this.shuseiTo({ pathname: "/subMenuEmployee/workRepot" });
        break;
      case "ファイル管理":
        this.setClassName("ファイル管理");
        this.shuseiTo({ pathname: "/subMenuEmployee/dataShareEmployee" });
        break;
      case "ほかの設定":
        this.setClassName("ほかの設定");
        this.shuseiTo({ pathname: "/subMenuEmployee/passwordSetEmployee" });
        break;
      default:
        break;
    }
  };

  renderTop = () => {
    const { isMobileDevice } = this.state;

    return (
      <div>
        <div className="df justify-between align-center">
          <Navbar className="p0" inline="true">
            <img
              className={"titleImg " + (isMobileDevice ? "w40" : "")}
              alt="title"
              src={title}
            />
            <span className={"loginMark " + (isMobileDevice ? "fz30" : "")}>
              LYC株式会社
            </span>
          </Navbar>
          {isMobileDevice ? this.renderMobileNav() : null}
        </div>
        <div className="df justify-end">
          <div
            className={"loginPeople df mr5 " + (isMobileDevice ? " fz12" : "")}
          >
            {this.state.nowDate}{" "}
            <FontAwesomeIcon className="fa-fw" size="lg" icon={faUser} />
            <div id="kanriSha"></div>
          </div>
          <Link
            as="button"
            className={"loginPeople " + (isMobileDevice ? "fz12" : "")}
            to="/"
            id="logout"
            onClick={this.logout}
          >
            <FontAwesomeIcon
              className="fa-fw"
              size="lg"
              icon={faCaretSquareLeft}
            />
            sign out
          </Link>
        </div>
      </div>
    );
  };

  renderPCmenu = () => {
    const { isMobileDevice } = this.state;
    return (
      <Row /*onClick={() => this.checkSession()}*/>
        <Col sm={2}>
          <br />
          <Row>
            <Container>
              <h1 className="title-font">勤務管理</h1>
              <br />
            </Container>
          </Row>
          <Row>
            <Col className={isMobileDevice ? "mb20 pl0 pr0" : ""}>
              <ListGroup>
                <Accordion className="menuCol">
                  <ListGroup.Item
                    style={
                      this.state.hover.search("勤務登録") !== -1
                        ? menuStyleHover
                        : menuStyle
                    }
                    block="true"
                    data-place="right"
                    data-type="info"
                    data-tip=""
                    data-for="勤務登録"
                    data-class="my-tabcolor"
                    data-effect="solid"
                    onMouseEnter={this.toggleHover.bind(this, "勤務登録")}
                    onMouseLeave={this.toggleHover.bind(this, "")}
                    // data-event="click focus"
                  >
                    <Accordion.Toggle
                      as={Button}
                      variant="link"
                      eventKey="0"
                      onClick={this.changePage.bind(this, "勤務登録")}
                    >
                      <font
                        className={
                          this.state.hover.search("勤務登録") !== -1 ||
                          this.state.className.search("勤務登録") !== -1 ||
                          this.props.location.pathname === "/subMenuEmployee"
                            ? "linkFont-click"
                            : "linkFont"
                        }
                      >
                        <FontAwesomeIcon
                          className="fa-fw"
                          size="lg"
                          icon={faAddressCard}
                        />{" "}
                        勤務登録
                      </font>
                    </Accordion.Toggle>
                    <ReactTooltip
                      id="勤務登録"
                      delayUpdate={1000}
                      getContent={() => {
                        return (
                          <div
                            onClick={this.setClassName.bind(this, "勤務登録")}
                          >
                            <ListGroup>
                              <Accordion className="menuCol">
                                <ListGroup.Item
                                  style={
                                    this.state.hover.search("1") !== -1
                                      ? subMenuHover
                                      : subMenu
                                  }
                                  onMouseEnter={this.toggleHover.bind(
                                    this,
                                    "勤務登録-1"
                                  )}
                                  onMouseLeave={this.toggleHover.bind(
                                    this,
                                    "勤務登録"
                                  )}
                                  onClick={this.shuseiTo.bind(this, {
                                    pathname: "/subMenuEmployee/workRepot",
                                  })}
                                  block="true"
                                >
                                  <div>
                                    <Link
                                      className={
                                        this.state.hover.search("1") !== -1
                                          ? "my-tabcolor-font-hover"
                                          : "my-tabcolor-font"
                                      }
                                      to={{
                                        pathname: "/subMenuEmployee/workRepot",
                                        state: { actionType: "insert" },
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        className="fa-fw"
                                        size="lg"
                                        icon={faFileExcel}
                                      />{" "}
                                      作業報告書
                                    </Link>
                                  </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                  style={
                                    this.state.hover.search("2") !== -1
                                      ? subMenuHover
                                      : subMenu
                                  }
                                  onMouseEnter={this.toggleHover.bind(
                                    this,
                                    "勤務登録-2"
                                  )}
                                  onMouseLeave={this.toggleHover.bind(
                                    this,
                                    "勤務登録"
                                  )}
                                  onClick={() => this.test()}
                                  block="true"
                                >
                                  <div>
                                    <Link
                                      className={
                                        this.state.hover.search("2") !== -1
                                          ? "my-tabcolor-font-hover"
                                          : "my-tabcolor-font"
                                      }
                                      to={{
                                        pathname: "",
                                        state: { actionType: "insert" },
                                      }}
                                      // disabled
                                    >
                                      <FontAwesomeIcon
                                        className="fa-fw"
                                        size="lg"
                                        icon={faUserEdit}
                                      />{" "}
                                      勤務時間入力
                                    </Link>
                                  </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                  style={
                                    this.state.hover.search("4") !== -1
                                      ? subMenuHover
                                      : subMenu
                                  }
                                  onMouseEnter={this.toggleHover.bind(
                                    this,
                                    "勤務登録-4"
                                  )}
                                  onMouseLeave={this.toggleHover.bind(
                                    this,
                                    "勤務登録"
                                  )}
                                  onClick={this.shuseiTo.bind(this, {
                                    pathname: "/subMenuEmployee/workTimeSearch",
                                  })}
                                  block="true"
                                >
                                  <div>
                                    <Link
                                      className={
                                        this.state.hover.search("4") !== -1
                                          ? "my-tabcolor-font-hover"
                                          : "my-tabcolor-font"
                                      }
                                      to={{
                                        pathname:
                                          "/subMenuEmployee/workTimeSearch",
                                        state: { actionType: "insert" },
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        className="fa-fw"
                                        size="lg"
                                        icon={faFileAlt}
                                      />{" "}
                                      作業時間検索
                                    </Link>
                                  </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                  style={
                                    this.state.hover.search("3") !== -1
                                      ? subMenuHover
                                      : subMenu
                                  }
                                  onMouseEnter={this.toggleHover.bind(
                                    this,
                                    "勤務登録-3"
                                  )}
                                  onMouseLeave={this.toggleHover.bind(
                                    this,
                                    "勤務登録"
                                  )}
                                  onClick={this.shuseiTo.bind(this, {
                                    pathname:
                                      "/subMenuEmployee/costRegistration",
                                  })}
                                  block="true"
                                >
                                  <div>
                                    <Link
                                      className={
                                        this.state.hover.search("3") !== -1
                                          ? "my-tabcolor-font-hover"
                                          : "my-tabcolor-font"
                                      }
                                      to={{
                                        pathname:
                                          "/subMenuEmployee/costRegistration",
                                        state: { actionType: "insert" },
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        className="fa-fw"
                                        size="lg"
                                        icon={faMoneyCheckAlt}
                                      />{" "}
                                      費用登録
                                    </Link>
                                  </div>
                                </ListGroup.Item>
                              </Accordion>
                            </ListGroup>
                          </div>
                        );
                      }}
                    />
                  </ListGroup.Item>

                  <ListGroup.Item
                    style={
                      this.state.hover.search("ファイル管理") !== -1
                        ? menuStyleHover
                        : menuStyle
                    }
                    block="true"
                    data-place="right"
                    data-type="info"
                    data-tip=""
                    data-for="ファイル管理"
                    data-class="my-tabcolor"
                    data-effect="solid"
                    onMouseEnter={this.toggleHover.bind(this, "ファイル管理")}
                    onMouseLeave={this.toggleHover.bind(this, "")}
                  >
                    <Accordion.Toggle
                      as={Button}
                      variant="link"
                      eventKey="1"
                      onClick={this.changePage.bind(this, "ファイル管理")}
                    >
                      <font
                        className={
                          this.state.hover.search("ファイル管理") !== -1 ||
                          this.state.className.search("ファイル管理") !== -1
                            ? "linkFont-click"
                            : "linkFont"
                        }
                      >
                        <FontAwesomeIcon
                          className="fa-fw"
                          size="lg"
                          icon={faFolderOpen}
                        />{" "}
                        ファイル管理
                      </font>
                    </Accordion.Toggle>
                    <ReactTooltip
                      id="ファイル管理"
                      delayUpdate={1000}
                      getContent={() => {
                        return (
                          <div
                            onClick={this.setClassName.bind(
                              this,
                              "ファイル管理"
                            )}
                          >
                            <ListGroup>
                              <Accordion className="menuCol">
                                <ListGroup.Item
                                  style={
                                    this.state.hover.search("1") !== -1
                                      ? subMenuHover
                                      : subMenu
                                  }
                                  onMouseEnter={this.toggleHover.bind(
                                    this,
                                    "ファイル管理-1"
                                  )}
                                  onMouseLeave={this.toggleHover.bind(
                                    this,
                                    "ファイル管理"
                                  )}
                                  onClick={this.shuseiTo.bind(this, {
                                    pathname:
                                      "/subMenuEmployee/dataShareEmployee",
                                  })}
                                  block="true"
                                >
                                  <div>
                                    <Link
                                      className={
                                        this.state.hover.search("1") !== -1
                                          ? "my-tabcolor-font-hover"
                                          : "my-tabcolor-font"
                                      }
                                      to={{
                                        pathname:
                                          "/subMenuEmployee/dataShareEmployee",
                                        state: { actionType: "insert" },
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        className="fa-fw"
                                        size="lg"
                                        icon={faFileContract}
                                      />{" "}
                                      ファイル共有
                                    </Link>
                                  </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                  style={
                                    this.state.hover.search("2") !== -1
                                      ? subMenuHover
                                      : subMenu
                                  }
                                  onMouseEnter={this.toggleHover.bind(
                                    this,
                                    "ファイル管理-2"
                                  )}
                                  onMouseLeave={this.toggleHover.bind(
                                    this,
                                    "ファイル管理"
                                  )}
                                  onClick={this.shuseiTo.bind(this, {
                                    pathname: "/subMenuEmployee/resume",
                                  })}
                                  block="true"
                                >
                                  <div>
                                    <Link
                                      className={
                                        this.state.hover.search("2") !== -1
                                          ? "my-tabcolor-font-hover"
                                          : "my-tabcolor-font"
                                      }
                                      to={{
                                        pathname: "/subMenuEmployee/resume",
                                        state: { actionType: "insert" },
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        className="fa-fw"
                                        size="lg"
                                        icon={faFileWord}
                                      />{" "}
                                      履歴書
                                    </Link>
                                  </div>
                                </ListGroup.Item>
                              </Accordion>
                            </ListGroup>
                          </div>
                        );
                      }}
                    />
                  </ListGroup.Item>

                  <ListGroup.Item
                    style={
                      this.state.hover.search("ほかの設定") !== -1
                        ? menuStyleHover
                        : menuStyle
                    }
                    block="true"
                    data-place="right"
                    data-type="info"
                    data-tip=""
                    data-for="ほかの設定"
                    data-class="my-tabcolor"
                    data-effect="solid"
                    onMouseEnter={this.toggleHover.bind(this, "ほかの設定")}
                    onMouseLeave={this.toggleHover.bind(this, "")}
                  >
                    <Accordion.Toggle
                      as={Button}
                      variant="link"
                      eventKey="2"
                      onClick={this.changePage.bind(this, "ほかの設定")}
                    >
                      <font
                        className={
                          this.state.hover.search("ほかの設定") !== -1 ||
                          this.state.className.search("ほかの設定") !== -1
                            ? "linkFont-click"
                            : "linkFont"
                        }
                      >
                        <FontAwesomeIcon
                          className="fa-fw"
                          size="lg"
                          icon={faCogs}
                        />{" "}
                        ほかの設定
                      </font>
                    </Accordion.Toggle>
                    <ReactTooltip
                      id="ほかの設定"
                      delayUpdate={1000}
                      getContent={() => {
                        return (
                          <div
                            onClick={this.setClassName.bind(this, "ほかの設定")}
                          >
                            <ListGroup>
                              <Accordion className="menuCol">
                                <ListGroup.Item
                                  style={
                                    this.state.hover.search("1") !== -1
                                      ? subMenuHover
                                      : subMenu
                                  }
                                  onMouseEnter={this.toggleHover.bind(
                                    this,
                                    "ほかの設定-1"
                                  )}
                                  onMouseLeave={this.toggleHover.bind(
                                    this,
                                    "ほかの設定"
                                  )}
                                  onClick={this.shuseiTo.bind(this, {
                                    pathname:
                                      "/subMenuEmployee/passwordSetEmployee",
                                  })}
                                  block="true"
                                >
                                  <div>
                                    <Link
                                      className={
                                        this.state.hover.search("1") !== -1
                                          ? "my-tabcolor-font-hover"
                                          : "my-tabcolor-font"
                                      }
                                      to={{
                                        pathname:
                                          "/subMenuEmployee/passwordSetEmployee",
                                        state: { actionType: "insert" },
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        className="fa-fw"
                                        size="lg"
                                        icon={faHistory}
                                      />{" "}
                                      PWリセット
                                    </Link>
                                  </div>
                                </ListGroup.Item>
                              </Accordion>
                            </ListGroup>
                          </div>
                        );
                      }}
                    />
                  </ListGroup.Item>
                </Accordion>
              </ListGroup>
            </Col>
          </Row>
        </Col>
        <Col sm={9} id="page">
          {this.renderRoute()}
        </Col>
      </Row>
    );
  };

  renderRoute = () => {
    return (
      <div key={this.props.location.key}>
        <br />
        <Router>
          <Route
            exact
            path={`${this.props.match.url}/`}
            component={WorkRepot}
          />
          <Route
            exact
            path={`${this.props.match.url}/passwordSetEmployee`}
            component={PasswordSetEmployee}
          />
          <Route
            exact
            path={`${this.props.match.url}/dutyRegistration`}
            component={DutyRegistration}
          />
          <Route
            exact
            path={`${this.props.match.url}/costRegistration`}
            component={CostRegistration}
          />
          <Route
            exact
            path={`${this.props.match.url}/breakTime`}
            component={BreakTime}
          />
          <Route
            exact
            path={`${this.props.match.url}/workRepot`}
            component={WorkRepot}
          />
          <Route
            exact
            path={`${this.props.match.url}/resume`}
            component={Resume}
          />
          <Route
            exact
            path={`${this.props.match.url}/workTimeSearch`}
            component={WorkTimeSearch}
          />
          <Route
            exact
            path={`${this.props.match.url}/dataShareEmployee`}
            component={DataShareEmployee}
          />
        </Router>
      </div>
    );
  };
  renderMobileMenu = () => {
    return (
      <Menu
        items={[
          {
            label: (
              <Link
                to={{
                  pathname: "/subMenuEmployee/workRepot",
                  state: { actionType: "insert" },
                }}
              >
                <FontAwesomeIcon
                  className="fa-fw"
                  size="lg"
                  icon={faFileExcel}
                />{" "}
                作業報告書
              </Link>
            ),

            key: "0",
          },
          {
            label: (
              <div onClick={() => this.test()}>
                <FontAwesomeIcon
                  className="fa-fw"
                  size="lg"
                  icon={faUserEdit}
                />{" "}
                勤務時間入力
              </div>
            ),
            key: "1",
          },
          {
            label: (
              <Link
                to={{
                  pathname: "/subMenuEmployee/workTimeSearch",
                  state: { actionType: "insert" },
                }}
              >
                <FontAwesomeIcon className="fa-fw" size="lg" icon={faFileAlt} />{" "}
                作業時間検索
              </Link>
            ),
            key: "2",
          },
          {
            label: (
              <Link
                to={{
                  pathname: "/subMenuEmployee/costRegistration",
                  state: { actionType: "insert" },
                }}
              >
                <FontAwesomeIcon
                  className="fa-fw"
                  size="lg"
                  icon={faMoneyCheckAlt}
                />{" "}
                費用登録
              </Link>
            ),
            key: "3",
          },
        ]}
      />
    );
  };

  renderMobileNav = () => {
    return (
      <div>
        <Dropdown
          arrow={{
            pointAtCenter: true,
          }}
          overlay={this.renderMobileMenu()}
          trigger={["click"]}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <MenuOutlined className="fz24" />
            </Space>
          </a>
        </Dropdown>
      </div>
    );
  };

  // position: -webkit-sticky;
  // position: sticky;
  // top: 0;

  render() {
    const { isMobileDevice } = this.state;

    return (
      <div className={isMobileDevice ? "" : "mainBodyMinWidth"}>
        <div className="mainBody"></div>
        {/* TOP */}
        <Row className="myCss employeeNavBar">
          <Col sm={11}>{this.renderTop()}</Col>
          <Col sm={1}></Col>
        </Row>
        {isMobileDevice ? null : this.renderPCmenu()}
        {isMobileDevice ? <Col id="page">{this.renderRoute()}</Col> : null}
        <br />
      </div>
    );
  }
}

export default connect(
  (state) => {
    return {
      state,
    };
  },
  (dispatch) => {
    return {
      updateInitEmployee: (data) => {
        dispatch({ type: "UPDATE_INIT_EMPLOYEE", data });
      },
    };
  }
)(SubMenu);
