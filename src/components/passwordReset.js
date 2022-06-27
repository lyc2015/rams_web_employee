import React, { Component } from "react";
import { faSave, faUndo, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Form, Col, InputGroup, Button } from "react-bootstrap";
import axios from "axios";
import $ from "jquery";
import store from "./redux/store";
import { message, notification } from "antd";
axios.defaults.withCredentials = true;
/**
 * パスワードリセット画面（パスワード忘れ用）
 */
class passwordReset extends Component {
  state = {
    serverIP: store.getState().dropDown[store.getState().dropDown.length - 1], //劉林涛　テスト
  };

  constructor(props) {
    super(props);
  }
  componentWillMount() {
    const query = this.props.location.search;
    var passwordResetId = query.substring(4);
    var pswMod = {};
    pswMod["passwordResetId"] = passwordResetId;
    axios
      .post(this.state.serverIP + "passwordReset/init", pswMod)
      .then((resultMap) => {});
  }
  passwordReset = () => {
    const query = this.props.location.search;
    var passwordResetId = query.substring(4);
    var pswMod = {};
    pswMod["passwordResetId"] = passwordResetId;
    pswMod["password"] = $("#newPassword").val();
    if ($("#newPassword").val() === $("#passwordCheck").val()) {
      axios
        .post(this.state.serverIP + "passwordReset/passwordReset", pswMod)
        .then((resultMap) => {
          if (resultMap.data === 0) {
            message.success("パスワードリセット成功しました");
            this.props.history.push("/");
          } else if (resultMap.data === 1) {
            notification.error({
              message: "エラー",
              description: "パスワードリセット失敗しました",
              placement: "topLeft",
            });
          } else if (resultMap.data === 2) {
            notification.error({
              message: "エラー",
              description: "パスワードリセットIDが失効しました",
              placement: "topLeft",
            });
          }
        });
    } else if (
      $("#newPassword").val() === null ||
      $("#newPassword").val() === "" ||
      $("#passwordCheck").val() === null ||
      $("#passwordCheck").val() === ""
    ) {
      message.error("パスワードとパスワード確認を入力してください");
    } else if ($("#newPassword").val() !== $("#passwordCheck").val()) {
      message.error("パスワードとパスワード確認が間違いため");
    }
  };
  render() {
    return (
      <div>
        <div className="mainBody"></div>
        <br />
        <Row inline="true">
          <Col className="text-center">
            <h2>パースワードリセット</h2>
          </Col>
        </Row>
        <br />
        <Form id="passwordSetForm" className="passwordForm">
          <Row>
            <Col sm={2}></Col>
            <Col sm={8}>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text id="nineKanji">
                    パスワード設定{"\u00A0"}
                    {"\u00A0"}
                    {"\u00A0"}
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  type="password"
                  id="newPassword"
                  name="newPassword"
                />
              </InputGroup>
            </Col>
            <font color="red">★</font>
          </Row>
          <Row>
            <Col sm={2}></Col>
            <Col sm={8}>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text id="nineKanji">
                    パスワード再確認
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  type="password"
                  id="passwordCheck"
                  a
                  name="passwordCheck"
                />
              </InputGroup>
            </Col>
            <font>
              {"\u00A0"}
              {"\u00A0"}
              {"\u00A0"}
            </font>
          </Row>
          <Row>
            <Col sm={4}></Col>
            <Col sm={4} className="text-center">
              <Button
                block
                size="sm"
                variant="info"
                onClick={this.passwordReset}
                id="toroku"
                type="button"
              >
                <FontAwesomeIcon icon={faEdit} />
                パスワードリセット
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
export default passwordReset;
