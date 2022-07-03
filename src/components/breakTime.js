import React, { Component } from "react";
import { Form, Button, Col, Row, InputGroup } from "react-bootstrap";
import * as TopCustomerInfoJs from "../components/topCustomerInfoJs.js";
import $ from "jquery";
import axios from "axios";
import * as utils from "./utils/publicUtils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUndo,
  faLevelUpAlt,
} from "@fortawesome/free-solid-svg-icons";
import store from "./redux/store";
import MyToast from "./myToast";
import ErrorsMessageToast from "./errorsMessageToast";
import "../asserts/css/style.css";
import "react-datepicker/dist/react-datepicker.css";
import { notification, message, DatePicker, TimePicker } from "antd";
import moment from "moment";
import EventEmitter from "./utils/EventEmitter";
moment.locale("ja");
axios.defaults.withCredentials = true;

/**
 * 勤務->勤務登録->休憩時間 の画面
 * 20201019 謝
 */
class BreakTime extends Component {
  constructor() {
    super();
    this.state = {
      breakTimeFlag: "0", // 0 无休息时间，1 已承认  1 有休息时间
      minDate: moment().subtract("1", "month").format("YYYYMM"),
      nowDate: moment().format("YYYYMM"),
      isMobileDevice: store.getState().isMobileDevice,
      actionType: "", //処理区分
      breakTimeDate: new Date(),
      breakTimeDayHourStart: [], //　　お昼時から
      breakTimeDayMinuteStart: [], //　　お昼分から
      breakTimeDayHourEnd: [], //　　お昼時まで
      breakTimeDayMinuteEnd: [], //　　お昼分まで
      breakTimeNightHourStart: [], //　　お昼時から
      breakTimeNightMinuteStart: [], //　　お昼分から
      breakTimeNightHourEnd: [], //　　お昼時まで
      breakTimeNightMinuteEnd: [], //　　お昼分まで
      serverIP: store.getState().dropDown[store.getState().dropDown.length - 1], //劉林涛　テスト
    };

    for (var i = 0; i < 24; i++) {
      this.state.breakTimeDayHourStart[i] = i.toString();
      this.state.breakTimeDayHourEnd[i] = i.toString();
    }
    for (var j = 0; j < 24; j++) {
      this.state.breakTimeNightHourStart[j] = j.toString();
      this.state.breakTimeNightHourEnd[j] = j.toString();
    }
    for (var k = 0; k < 60; k += 15) {
      this.state.breakTimeDayMinuteStart[k] = k.toString();
      this.state.breakTimeDayMinuteEnd[k] = k.toString();
      this.state.breakTimeNightMinuteStart[k] = k.toString();
      this.state.breakTimeNightMinuteEnd[k] = k.toString();
    }
  }
  /**
   * 画面の初期化
   */
  componentDidMount() {
    const { location } = this.props;
    this.setState(
      {
        backPage: location.state?.backPage,
        sendValue: location.state?.sendValue,
        flag: location.state?.sendValue?.flag,
      },
      () => {
        this.getDutyInfo();
      }
    );
  }
  calculateTime = () => {
    var breakTimeDayHourStart = Number($("#breakTimeDayHourStart").val());
    var breakTimeDayHourEnd = Number($("#breakTimeDayHourEnd").val());
    var breakTimeDayMinuteStart = Number($("#breakTimeDayMinuteStart").val());
    var breakTimeDayMinuteEnd = Number($("#breakTimeDayMinuteEnd ").val());
    var breakTimeNightHourStart = Number($("#breakTimeNightHourStart").val());
    var breakTimeNightHourEnd = Number($("#breakTimeNightHourEnd").val());
    var breakTimeNightMinuteStart = Number(
      $("#breakTimeNightMinuteStart").val()
    );
    var breakTimeNightMinuteEnd = Number($("#breakTimeNightMinuteEnd ").val());

    var breakTimeDaybreakTimeHour =
      breakTimeDayHourEnd * 60 +
      breakTimeDayMinuteEnd -
      breakTimeDayHourStart * 60 -
      breakTimeDayMinuteStart;
    var breakTimeNightbreakTimeHour =
      breakTimeNightHourEnd * 60 +
      breakTimeNightMinuteEnd -
      breakTimeNightHourStart * 60 -
      breakTimeNightMinuteStart;

    $("#breakTimeDaybreakTimeHour").val(breakTimeDaybreakTimeHour / 60);
    $("#breakTimeNightbreakTimeHour").val(breakTimeNightbreakTimeHour / 60);
    $("#breakTimeSumHour").val(
      Number($("#breakTimeDaybreakTimeHour").val()) +
        Number($("#breakTimeNightbreakTimeHour").val())
    );

    this.setState({
      breakTimeDaybreakTimeHour: Number(breakTimeDaybreakTimeHour) / 60,
      breakTimeNightbreakTimeHour: Number(breakTimeNightbreakTimeHour) / 60,
      breakTimeSumHour:
        Number($("#breakTimeDaybreakTimeHour").val()) +
        Number($("#breakTimeNightbreakTimeHour").val()),
    });
  };

  beferBreakTimeRegister = () => {
    if (Number($("#breakTimeDaybreakTimeHour").val()) <= 0) {
      message.info("昼休憩時間を0時間以上入力してください。");
      return;
    }
    if (Number($("#breakTimeNightbreakTimeHour").val()) < 0) {
      message.info("夜休憩時間を0時間以上入力してください。");
      return;
    }

    if (!this.state.flag) {
      var a = window.confirm(
        "休憩時間更新すると、作業時間再計算します、よろしいでしょうか？"
      );
      if (a) {
        this.breakTimeRegister();
      } else {
        return;
      }
    } else {
      this.breakTimeRegister();
    }
  };

  /**-
   * 登録ボタン
   */
  breakTimeRegister = () => {
    var breakTimeInfo = {};
    var actionType = this.state.actionType;
    breakTimeInfo["employeeNo"] = $("#employeeNo").val();
    breakTimeInfo["breakTimeIsConst"] = $("#isConst").val();
    breakTimeInfo["breakTimeYearMonth"] = utils.formateDate(
      this.state.breakTimeDate,
      false
    );
    breakTimeInfo["breakTimeDayStart"] =
      $("#breakTimeDayHourStart").val().padStart(2, "0") +
      $("#breakTimeDayMinuteStart").val().padEnd(2, "0");
    breakTimeInfo["breakTimeDayEnd"] =
      $("#breakTimeDayHourEnd").val().padStart(2, "0") +
      $("#breakTimeDayMinuteEnd").val().padEnd(2, "0");
    breakTimeInfo["breakTimeNightStart"] =
      $("#breakTimeNightHourStart").val().padStart(2, "0") +
      $("#breakTimeNightMinuteStart").val().padEnd(2, "0");
    breakTimeInfo["breakTimeNightEnd"] =
      $("#breakTimeNightHourEnd").val().padStart(2, "0") +
      $("#breakTimeNightMinuteEnd").val().padEnd(2, "0");
    breakTimeInfo["breakTimeDaybreakTimeHour"] = $(
      "#breakTimeDaybreakTimeHour"
    ).val();
    breakTimeInfo["breakTimeNightbreakTimeHour"] = $(
      "#breakTimeNightbreakTimeHour"
    ).val();
    breakTimeInfo["breakTimeSumHour"] = $("#breakTimeSumHour").val();
    breakTimeInfo["updateUser"] = sessionStorage.getItem("employeeNo");
    console.log(breakTimeInfo);
    actionType = "insert";
    if (actionType === "insert") {
      breakTimeInfo["actionType"] = "insert";
      axios
        .post(
          this.state.serverIP + "dutyRegistration/breakTimeInsert",
          breakTimeInfo
        )
        .then((resultMap) => {
          if (resultMap.data) {
            message.success("更新成功");
          } else {
            message.error("更新失敗");
          }
          // setTimeout(() => window.location.reload(), 1000);
          EventEmitter.emit("updateWorkRepot");
        })
        .catch(function () {
          notification.error({
            message: "サーバーエラー",
            description: "更新错误，请检查程序",
            placement: "topLeft",
          });
        });
    }
  };
  isConst() {
    var isConst = $("#isConst").val();
    var isDisable = false;
    if (isConst === 0) {
      isDisable = true;
    } else if (isConst === 1) {
      isDisable = false;
    }
    $("#breakTimeDate").prop("disabled", isDisable);
    $("#breakTimeDayHourStart").prop("disabled", isDisable);
    $("#breakTimeDayMinuteStart").prop("disabled", isDisable);
    $("#breakTimeDayHourEnd").prop("disabled", isDisable);
    $("#breakTimeDayMinuteEnd").prop("disabled", isDisable);
    $("#breakTimeNightHourStart").prop("disabled", isDisable);
    $("#breakTimeNightMinuteStart").prop("disabled", isDisable);
    $("#breakTimeNightHourEnd").prop("disabled", isDisable);
    $("#breakTimeNightMinuteEnd").prop("disabled", isDisable);
    $("#toroku").prop("disabled", isDisable);
  }

  back = () => {
    let backPage = this.state.backPage;
    if (backPage !== null && backPage !== undefined && backPage !== "") {
      var path = {};
      path = {
        pathname: "/subMenuEmployee/" + backPage,
        state: { sendValue: this.state.sendValue },
      };
      return this.props.history.push(path);
    }
  };

  changeToDutyRegistration = () => {
    if (this.state.breakTimeFlag === "1") {
      message.info("承認済みでした、修正できないです");
      return;
    } else if (this.state.breakTimeFlag === "0") {
      message.info("休憩時間を登録してください。");
    } else {
      var path = {};
      let breakTimeDateMonth = String(this.state.breakTimeDate.getMonth() + 1);
      path = {
        pathname: "/subMenuEmployee/dutyRegistration",
        state: {
          sendValue: this.state.sendValue,
          year: this.state.breakTimeDate.getFullYear(),
          month:
            breakTimeDateMonth < 10
              ? "0" + breakTimeDateMonth
              : breakTimeDateMonth,
          yearMonth: moment(this.state.breakTimeDate).toDate(),
        },
      };
      return this.props.history.push(path);
    }
  };

  setBreakTime = (date) => {
    date = date.toDate();
    this.setState({ breakTimeDate: date });

    let tempDate = moment(date).format("YYYYMM");
    const { nowDate } = this.state;
    console.log(tempDate <= nowDate, tempDate < this.state.minDate);

    if (tempDate <= nowDate) {
      // 是否可以删除？
      var breakTimeInfo = {};
      breakTimeInfo["employeeNo"] = $("#employeeNo").val();
      breakTimeInfo["breakTimeYearMonth"] = tempDate;
      this.getDutyInfo(tempDate);
    } else {
      $("#breakTimeDayHourStart").val(0);
      $("#breakTimeDayMinuteStart").val(0);
      $("#breakTimeDayHourEnd").val(0);
      $("#breakTimeDayMinuteEnd").val(0);
      $("#breakTimeNightHourStart").val(0);
      $("#breakTimeNightMinuteStart").val(0);
      $("#breakTimeNightHourEnd").val(0);
      $("#breakTimeNightMinuteEnd").val(0);
      this.setState({
        breakTimeDaybreakTimeHour: 0,
        breakTimeNightbreakTimeHour: 0,
        breakTimeSumHour: 0,
        disabledFlag: true,
        dateDisabledFlag: true,
      });
    }
  };

  getDutyInfo = async (tempDate = this.state.nowDate) => {
    try {
      let resultMap = await axios.post(
        this.state.serverIP + "dutyRegistration/getDutyInfo",
        {
          yearMonth: tempDate,
        }
      );
      console.log(
        resultMap.data.approvalStatus === "1" || tempDate < this.state.minDate,
        'resultMap.data.approvalStatus === "1" || tempDate < this.state'
      );
      this.setState({
        breakTimeUser: resultMap.data.employeeName,
      });
      $("#employeeNo").val(resultMap.data.employeeNo);
      if (resultMap.data.breakTime !== null) {
        $("#breakTimeDayHourStart").val(
          Number(
            resultMap.data.breakTime.lunchBreakStartTime
              .toString()
              .substring(0, 2)
          )
        );
        $("#breakTimeDayMinuteStart").val(
          Number(
            resultMap.data.breakTime.lunchBreakStartTime.toString().substring(2)
          )
        );
        $("#breakTimeDayHourEnd").val(
          Number(
            resultMap.data.breakTime.lunchBreakFinshTime
              .toString()
              .substring(0, 2)
          )
        );
        $("#breakTimeDayMinuteEnd").val(
          Number(
            resultMap.data.breakTime.lunchBreakFinshTime.toString().substring(2)
          )
        );
        $("#breakTimeNightHourStart").val(
          Number(
            resultMap.data.breakTime.nightBreakStartTime
              .toString()
              .substring(0, 2)
          )
        );
        $("#breakTimeNightMinuteStart").val(
          Number(
            resultMap.data.breakTime.nightBreakStartTime.toString().substring(2)
          )
        );
        $("#breakTimeNightHourEnd").val(
          Number(
            resultMap.data.breakTime.nightBreakfinshTime
              .toString()
              .substring(0, 2)
          )
        );
        $("#breakTimeNightMinuteEnd").val(
          Number(
            resultMap.data.breakTime.nightBreakfinshTime.toString().substring(2)
          )
        );
        this.setState({
          breakTimeDaybreakTimeHour: resultMap.data.breakTime.lunchBreakTime,
          breakTimeNightbreakTimeHour: resultMap.data.breakTime.nightBreakTime,
          breakTimeSumHour: resultMap.data.breakTime.totalBreakTime,
        });
      } else {
        message.info("データ存在していません");
        $("#breakTimeDayHourStart").val(0);
        $("#breakTimeDayMinuteStart").val(0);
        $("#breakTimeDayHourEnd").val(0);
        $("#breakTimeDayMinuteEnd").val(0);
        $("#breakTimeNightHourStart").val(0);
        $("#breakTimeNightMinuteStart").val(0);
        $("#breakTimeNightHourEnd").val(0);
        $("#breakTimeNightMinuteEnd").val(0);
        this.setState({
          breakTimeDaybreakTimeHour: 0,
          breakTimeNightbreakTimeHour: 0,
          breakTimeSumHour: 0,
        });
      }

      this.setState({
        dateDisabledFlag:
          resultMap.data.approvalStatus === "1" ||
          tempDate < this.state.minDate,
        disabledFlag:
          resultMap.data.approvalStatus === "1" ||
          tempDate < this.state.minDate,

        breakTimeFlag:
          resultMap.data.approvalStatus === "1"
            ? "1"
            : resultMap.data.breakTime === null
            ? "0"
            : "2",
      });
    } catch (error) {
      console.error(error);
      notification.error({
        message: "サーバーエラー",
        description: "error",
        placement: "topLeft",
      });
    }
  };

  render() {
    const { actionType, isMobileDevice } = this.state;
    console.log({ state: this.state }, "render");

    return (
      <div className={isMobileDevice ? "clear-grid-padding" : ""}>
        <div style={{ display: this.state.myToastShow ? "block" : "none" }}>
          <MyToast
            myToastShow={this.state.myToastShow}
            message={this.state.message}
            type={"success"}
          />
        </div>
        <div
          style={{ display: this.state.errorsMessageShow ? "block" : "none" }}
        >
          <ErrorsMessageToast
            errorsMessageShow={this.state.errorsMessageShow}
            message={this.state.message}
            type={"danger"}
          />
        </div>
        <div>
          <Row inline="true">
            <Col className="text-center">
              <h2>現場休憩時間入力</h2>
            </Col>
          </Row>
          <br />
          <Form id="topCustomerInfoForm">
            <Row inline="true" className="justify-content-md-center" hidden>
              <Col xs lg="2" className="text-center">
                <InputGroup size="sm" className="mb-3">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="sixKanji">
                      休憩時間固定
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    id="isConst"
                    name="isConst"
                    as="select"
                    onChange={this.isConst}
                    style={{ width: "5rem" }}
                  >
                    <option value="1">はい</option>
                    <option value="0">いいえ</option>
                  </Form.Control>
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={0} sm={2}></Col>
              <Col xs={6} sm={2}>
                <InputGroup size="sm" className="mb-3">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="niKanjiFor150">氏名</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    readOnly
                    id="breakTimeUser"
                    value={this.state.breakTimeUser}
                    name="breakTimeUser"
                  />
                </InputGroup>
              </Col>
              <Col xs={6} sm={3}>
                <InputGroup size="sm" className="mb-3 flexWrapNoWrap">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="niKanjiFor150">年月</InputGroup.Text>
                  </InputGroup.Prepend>
                  <InputGroup.Append>
                    <DatePicker
                      allowClear={false}
                      suffixIcon={false}
                      placeholder="年月"
                      value={
                        this.state.breakTimeDate
                          ? moment(this.state.breakTimeDate)
                          : ""
                      }
                      onChange={this.setBreakTime}
                      format="YYYY/MM"
                      picker="month"
                      locale="ja"
                      className={"bg-datePicker w100p "}
                      size="small"
                    />
                  </InputGroup.Append>
                </InputGroup>
              </Col>
              <Col>
                <div>
                  <font
                    style={{
                      color: "grey",
                      fontSize: "14px",
                      // marginLeft: "-50px",
                    }}
                  >
                    現場の固定休憩を時間入力してください{" "}
                  </font>
                  <Button
                    size="sm"
                    variant="info"
                    type="button"
                    onClick={this.changeToDutyRegistration}
                    disabled={
                      moment(this.state.breakTimeDate).format("YYYYMM") <
                      this.state.minDate
                    }
                  >
                    勤務時間入力
                  </Button>
                </div>
              </Col>
            </Row>
            {isMobileDevice ? (
              <Row>
                <Col>
                  <InputGroup size="sm" className="mb0 mt3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="niKanjiFor150">お昼</InputGroup.Text>
                    </InputGroup.Prepend>
                  </InputGroup>
                </Col>
              </Row>
            ) : null}
            <Row>
              <Col xs={0} sm={2}></Col>
              <Col xs={12} sm={8}>
                {/* <TimePicker
                  id="breakTimeDayHourStart"
                  name="breakTimeDayHourStart"
                  disabled={this.state.dateDisabledFlag}
                  minuteStep={15}
                  showSecond={false}
                />{" "}
                ～{" "}
                <TimePicker
                  id="breakTimeDayHourEnd"
                  name="breakTimeDayHourEnd"
                  disabled={this.state.dateDisabledFlag}
                  minuteStep={15}
                  showSecond={false}
                /> */}
                <InputGroup size="sm" className="mb-3">
                  {isMobileDevice ? null : (
                    <InputGroup.Prepend>
                      <InputGroup.Text id="niKanjiFor150">お昼</InputGroup.Text>
                    </InputGroup.Prepend>
                  )}
                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeDayHourStart"
                    name="breakTimeDayHourStart"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeDayHourStart.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">時</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeDayMinuteStart"
                    name="breakTimeDayMinuteStart"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeDayMinuteStart.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">分</InputGroup.Text>
                  </InputGroup.Prepend>
                  <font
                    style={{
                      marginLeft: "10px",
                      marginRight: "10px",
                      marginTop: "5px",
                    }}
                  >
                    ～
                  </font>
                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeDayHourEnd"
                    name="breakTimeDayHourEnd"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeDayHourEnd.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">時</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeDayMinuteEnd"
                    name="breakTimeDayMinuteEnd"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeDayMinuteEnd.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">分</InputGroup.Text>
                  </InputGroup.Prepend>
                </InputGroup>
              </Col>
              <Col sm={2}></Col>
            </Row>
            {isMobileDevice ? (
              <Row>
                <Col>
                  <InputGroup size="sm" className="mb0 mt3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="niKanjiFor150">夜　</InputGroup.Text>
                    </InputGroup.Prepend>
                  </InputGroup>
                </Col>
              </Row>
            ) : null}
            <Row>
              <Col sm={2}></Col>
              <Col xs={12} sm={8}>
                <InputGroup size="sm" className="mb-3 ">
                  {isMobileDevice ? null : (
                    <InputGroup.Prepend>
                      <InputGroup.Text id="niKanjiFor150">夜　</InputGroup.Text>
                    </InputGroup.Prepend>
                  )}

                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeNightHourStart"
                    name="breakTimeNightHourStart"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeNightHourStart.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">時</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeNightMinuteStart"
                    name="breakTimeNightMinuteStart"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeNightMinuteStart.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">分</InputGroup.Text>
                  </InputGroup.Prepend>
                  <font
                    style={{
                      marginLeft: "10px",
                      marginRight: "10px",
                      marginTop: "5px",
                    }}
                  >
                    ～
                  </font>
                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeNightHourEnd"
                    name="breakTimeNightHourEnd"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeNightHourEnd.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">時</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    className={isMobileDevice ? "pl0" : ""}
                    id="breakTimeNightMinuteEnd"
                    name="breakTimeNightMinuteEnd"
                    as="select"
                    onChange={this.calculateTime}
                    disabled={this.state.dateDisabledFlag}
                  >
                    {this.state.breakTimeNightMinuteEnd.map((data) => (
                      <option value={data}>{data}</option>
                    ))}
                  </Form.Control>
                  <InputGroup.Prepend>
                    <InputGroup.Text id="ichiKanjiFor150">分</InputGroup.Text>
                  </InputGroup.Prepend>
                </InputGroup>
              </Col>
              <Col sm={2}></Col>
            </Row>
            <Row>
              <Col sm={2}></Col>

              <Col xs={6} sm={3}>
                <InputGroup size="sm" className="mb-3 flexWrapNoWrap">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="fiveKanji">昼休憩時間</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    readOnly
                    id="breakTimeDaybreakTimeHour"
                    value={this.state.breakTimeDaybreakTimeHour}
                    name="breakTimeDaybreakTimeHour"
                  />
                </InputGroup>
              </Col>

              <Col xs={6} sm={3}>
                <InputGroup size="sm" className="mb-3 flexWrapNoWrap">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="fiveKanji">夜休憩時間</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    readOnly
                    id="breakTimeNightbreakTimeHour"
                    value={this.state.breakTimeNightbreakTimeHour}
                    name="breakTimeNightbreakTimeHour"
                  />
                </InputGroup>
              </Col>

              <Col xs={6} sm={3}>
                <InputGroup size="sm" className="mb-3 flexWrapNoWrap">
                  <InputGroup.Prepend>
                    <InputGroup.Text id="inputGroup-sizing-sm">
                      合計
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    readOnly
                    id="breakTimeSumHour"
                    value={this.state.breakTimeSumHour}
                    name="breakTimeSumHour"
                  />
                </InputGroup>
              </Col>

              <Col sm={2}></Col>
            </Row>
            <Row>
              <Col sm={4}></Col>
              <Col sm={4} className="text-center">
                <div>
                  <Button
                    size="sm"
                    className="btn btn-info btn-sm"
                    onClick={this.beferBreakTimeRegister}
                    disabled={this.state.disabledFlag}
                    variant="info"
                    id="toroku"
                    type="button"
                  >
                    <FontAwesomeIcon icon={faSave} /> 登録
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    size="sm"
                    className="btn btn-info btn-sm"
                    onClick={TopCustomerInfoJs.reset}
                    disabled={this.state.disabledFlag}
                  >
                    <FontAwesomeIcon icon={faUndo} /> リセット
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    size="sm"
                    variant="info"
                    type="button"
                    onClick={this.back}
                    hidden={this.state.backPage === ""}
                  >
                    <FontAwesomeIcon icon={faLevelUpAlt} /> 戻る
                  </Button>
                </div>
              </Col>
            </Row>
            <br />
          </Form>
          <input type="hidden" id="actionType" name="actionType" />
          <input type="hidden" id="employeeNo" name="employeeNo" />
        </div>
      </div>
    );
  }
}

export default BreakTime;
