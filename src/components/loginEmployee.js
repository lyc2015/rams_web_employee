import React, { Component } from "react";
import "../asserts/css/login.css";
import title from "../asserts/images/LYCmark.png";
import $ from "jquery";
import axios from "axios";
import { Row, Col, Form, Button } from "react-bootstrap";
import MyToast from "./myToast";
import ErrorsMessageToast from "./errorsMessageToast";
import store from "./redux/store";
import { message, notification } from "antd";
axios.defaults.withCredentials = true;
/**
 * 社員ログイン画面
 */
class Login2 extends Component {
  state = {
    yztime: 59,
    btnDisable: false,
    time: 180,
    buttonText: "パスワード忘れたの場合",
    message: "",
    type: "",
    myToastShow: false,
    errorsMessageShow: false,
    errorsMessageValue: "",
    pic: "",
    serverIP: store.getState().dropDown[store.getState().dropDown.length - 1], //劉林涛　テスト
  };
  componentWillMount() {
    $("#sendVerificationCode").attr("disabled", true);
    $("#login").attr("disabled", true);
    axios
      .post(this.state.serverIP + "subMenu/getCompanyDate")
      .then((response) => {
        this.setState({
          companyName: response.data.companyName,
          pic: response.data.companyLogo,
        });
      })
      .catch((error) => {
        console.error("Error - " + error);
      });
    axios.post(this.state.serverIP + "login2/init").then((resultMap) => {
      if (resultMap.data) {
        this.props.history.push("/subMenuEmployee");
      }
    });
  }

  componentDidMount() {
    this.loadAccountInfo();
  }

  loadAccountInfo = () => {
    //读取Cookie
    let arr,
      reg = new RegExp("(^| )" + "accoutInfo" + "=([^;]*)(;|$)");
    let accoutInfo = "";
    if ((arr = document.cookie.match(reg))) {
      accoutInfo = unescape(arr[2]);
    } else {
      accoutInfo = null;
    }

    if (!Boolean(accoutInfo)) {
      return false;
    } else {
      let userName = "";
      let passWord = "";

      let i = new Array();
      i = accoutInfo.split("&");
      userName = i[0];
      passWord = i[1];

      $("#employeeNo").val(userName);
      $("#password").val(passWord);
      this.setState({ remberPassWord: true });
    }
  };

  /**
   * ログインボタン
   */
  login = () => {
    var loginModel = {};
    loginModel["employeeNo"] = $("#employeeNo").val();
    loginModel["password"] = $("#password").val();
    loginModel["verificationCode"] = $("#verificationCode").val();
    axios
      .post(this.state.serverIP + "login2/login", loginModel)
      .then((result) => {
        if (
          result.data.errorsMessage === null ||
          result.data.errorsMessage === undefined
        ) {
          message.success("ログイン成功");
          //ログイン成功
          if (this.state.remberPassWord) {
            let accoutInfo =
              $("#employeeNo").val() + "&" + $("#password").val();
            let Days = 3; //Cookie保存時間
            let exp = new Date();
            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
            document.cookie =
              "accoutInfo" +
              "=" +
              escape(accoutInfo) +
              ";expires=" +
              exp.toGMTString();
          } else {
            let exp = new Date();
            exp.setTime(exp.getTime() - 1);
            let accoutInfo = document.cookie;
            var cookie_pos = accoutInfo.indexOf("accoutInfo");

            if (cookie_pos != -1) {
              document.cookie =
                "accoutInfo" + "=" + " " + ";expires=" + exp.toGMTString();
            }
            $("#employeeNo").val(" ");
            $("#password").val(" ");
          }
          this.props.history.push("/subMenuEmployee");
        } else {
          //ログイン失敗
          message.error(result.data.errorsMessage);
        }
      })
      .catch(function (error) {
        notification.error({
          message: "サーバーエラー",
          description:
            "エラーが発生してしまいました、画面をリフレッシュしてください",
          placement: "topLeft",
        });
      });
  };
  render() {
    const { message, type, errorsMessageValue } = this.state;
    let timeChange;
    let ti = this.state.time;
    //关键在于用ti取代time进行计算和判断，因为time在render里不断刷新，但在方法中不会进行刷新
    const clock = () => {
      if (ti > 0) {
        //当ti>0时执行更新方法
        ti = ti - 1;
        this.setState({
          time: ti,
          buttonText: ti + "s後再発行",
        });
      } else {
        //当ti=0时执行终止循环方法
        clearInterval(timeChange);
        this.setState({
          btnDisable: false,
          time: 180,
          buttonText: "パスワード忘れたの場合",
        });
      }
    };

    const sendMail = () => {
      var loginModel = {};
      loginModel["employeeNo"] = $("#employeeNo").val();
      loginModel["serverIP"] = this.state.serverIP;
      axios
        .post(this.state.serverIP + "login2/sendMail", loginModel)
        .then((result) => {
          if (
            result.data.errorsMessage !== null &&
            result.data.errorsMessage !== undefined
          ) {
            this.setState({
              errorsMessageShow: true,
              errorsMessageValue: result.data.errorsMessage,
            });
          } else {
            this.setState({
              myToastShow: true,
              type: "success",
              errorsMessageShow: false,
              message:
                "事前に登録したメールにパスワードリセットURLが発信しました!",
            });
            setTimeout(() => this.setState({ myToastShow: false }), 3000);
            this.setState({
              btnDisable: true,
              buttonText: "180s後再発行",
            });
            $("#verificationCode").attr("readOnly", false);
            $("#login").attr("disabled", false);
            //每隔一秒执行一次clock方法
            timeChange = setInterval(clock, 1000);
          }
        });
    };
    return (
      <div className="loginBody">
        <div style={{ marginTop: "10%" }}>
          <div style={{ display: this.state.myToastShow ? "block" : "none" }}>
            <MyToast
              myToastShow={this.state.myToastShow}
              message={message}
              type={type}
            />
          </div>
          <div
            style={{ display: this.state.errorsMessageShow ? "block" : "none" }}
          >
            <ErrorsMessageToast
              errorsMessageShow={this.state.errorsMessageShow}
              message={errorsMessageValue}
              type={"danger"}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <img
              className="mb-4"
              alt="title"
              src={this.state.pic}
              style={{ width: "65px" }}
            />
            {"   "}
            <a className="loginMark">{this.state.companyName}</a>
          </div>
          <Form className="form-signin" id="loginForm">
            <Form.Group>
              <Form.Control
                id="employeeNo"
                name="employeeNo"
                maxLength="6"
                type="text"
                placeholder="社员番号"
                onChange={this.setReadOnly}
              />
              <Form.Control
                id="password"
                name="password"
                maxLength="12"
                type="password"
                placeholder="Password"
                onChange={this.setReadOnly}
              />
            </Form.Group>
          </Form>
          <div className="form-signin">
            <div className="text-center">
              <button
                onClick={sendMail}
                disabled={this.state.btnDisable}
                className="btn btn-link resetFont"
              >
                {this.state.buttonText}
              </button>
              <br />
              <div style={{ textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={this.state.remberPassWord}
                  onChange={this.handleChecked}
                  // value={this.state.remberPassWord}
                />
                <span> ログイン情報保存</span>
              </div>
              <Button
                variant="primary"
                id="login"
                block
                onClick={this.login}
                type="button"
              >
                ログイン
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login2;
