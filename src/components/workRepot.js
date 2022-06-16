import React from "react";
import {
  Button,
  Form,
  Col,
  Row,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import axios from "axios";
import "../asserts/css/development.css";
import "../asserts/css/style.css";
import $ from "jquery";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faDownload,
  faMoneyCheckAlt,
  faLevelUpAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { connect } from "react-redux";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import * as publicUtils from "./utils/publicUtils.js";
import store from "./redux/store";
import { Tag, message, Modal, notification } from "antd";
axios.defaults.withCredentials = true;

/**
 * 作業報告書登録画面
 */
class workRepot extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState; //初期化
    this.valueChange = this.valueChange.bind(this);
    this.searchWorkRepot = this.searchWorkRepot.bind(this);
    this.sumWorkTimeChange = this.sumWorkTimeChange.bind(this);
  }
  componentDidMount() {
    if (this.props.location.state) {
      this.setState(
        {
          backPage: this.props.location.state.backPage,
          employeeNo: this.props.location.state.employeeNo,
          employeeName: this.props.location.state.employeeName,
          dutyManagementTempState:
            this.props.location.state.dutyManagementTempState,
        },
        () => {
          this.searchWorkRepot();
        }
      );
    } else {
      this.searchWorkRepot();
    }
    this.setState({
      workRepotUploadDisable: true,
      workRepotDownload: true,
      workRepotClear: true,
    });
  }
  //onchange
  valueChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  //　初期化データ
  initialState = {
    isMobileDevice: store.getState().isMobileDevice,
    employeeList: [],
    rowApprovalStatus: "",
    disabledFlag: [false, false],
    costClassificationCode: store.getState().dropDown[30],
    serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
  };
  approvalStatus = (code, row) => {
    if (code === "1") {
      return <Tag color="green">承認済み</Tag>;
    } else if (code === "0") {
      return <Tag color="gold">未承認</Tag>;
    }
    // if (row.workingTimeReportFile === "まずファイルをアップロードしてください")
    //   return <Tag color="magenta">未完成</Tag>;
    // else if (code === "1") {
    //   return <Tag color="green">承認済み</Tag>;
    // } else if (code === "0") {
    //   return <Tag color="gold">未承認</Tag>;
    // } else {
    //   return <Tag color="magenta">未完成</Tag>;
    // }
  };
  //　検索
  searchWorkRepot = () => {
    const workRepotModel = {
      employeeNo: this.state.employeeNo,
      employeeName: this.state.employeeName,
    };
    axios
      .post(this.state.serverIP + "workRepot/selectWorkRepot", workRepotModel)
      .then((response) => response.data)
      .then((data) => {
        if (data?.length > 0) {
          this.setState({ originList: [...data] });
          for (var i = 0; i < data.length; i++) {
            if (data[i].workingTimeReport != null) {
              let fileName = data[i].workingTimeReport.split("/");
              data[i].workingTimeReportFile = fileName[fileName.length - 1];
            } else {
              data[i].workingTimeReportFile =
                "まずファイルをアップロードしてください";
            }
            if (data[i].isByEveryDay) {
              data[i].disabledFlag = true;
              data[i].workingTimeReportFile = "作業時間入力画面で存在しました";
            }
          }
          if (this.state.rowId !== "") {
            for (var i = 0; i < data.length; i++) {
              if (String(data[i].id) === String(this.state.rowId)) {
                this.setState({
                  rowSelectWorkingTimeReport: data[i].workingTimeReport,
                });
                break;
              }
            }
          }
        } else {
          data = [];
          data.push({
            approvalStatus: 0,
            approvalStatusName: "アップロード済み",
            attendanceYearAndMonth: publicUtils.setFullYearMonth(new Date()),
          });
        }
        this.setState({
          employeeList: data,
        });
      });
  };
  //　変更
  sumWorkTimeChange = (sumWorkTime, row) => {
    if (
      row.workingTimeReportFile === "まずファイルをアップロードしてください" &&
      !this.state.employeeNo?.startsWith("BP")
    ) {
      message.error("まずファイルをアップロードしてください");
      let employeeList = this.state.employeeList;
      employeeList[row.id].sumWorkTime = "";
      this.setState({
        employeeList: employeeList,
      });
    } else {
      var re = /^[0-9]+.?[0-9]*/;
      if (sumWorkTime === null || sumWorkTime === "") return;
      if (sumWorkTime !== null) {
        if (sumWorkTime.length > 6) {
          message.error("稼働時間をチェックしてください。");
          return;
        } else if (!re.test(sumWorkTime)) {
          message.error("数字のみを入力してください。");
          row.sumWorkTime = "";
          let employeeList = this.state.employeeList;
          employeeList[row.id].sumWorkTime = "";
          this.setState({
            employeeList: employeeList,
          });
          return;
        } else {
          if (sumWorkTime.split(".").length > 1) {
            if (
              sumWorkTime.split(".")[0].length > 3 ||
              sumWorkTime.split(".")[1].length > 2
            ) {
              message.error("稼働時間をチェックしてください。");
              return;
            }
          } else {
            if (sumWorkTime.length > 3) {
              message.error("稼働時間をチェックしてください。");
              return;
            }
          }
        }
      }
      const emp = {
        employeeNo: this.state.employeeNo,
        employeeName: this.state.employeeName,
        attendanceYearAndMonth: this.state.rowSelectAttendanceYearAndMonth,
        sumWorkTime: sumWorkTime,
      };
      axios
        .post(this.state.serverIP + "workRepot/updateworkRepot", emp)
        .then((response) => {
          if (response.data != null) {
            this.searchWorkRepot();
            message.success("更新成功！");
            // this.setState({ rowSelectSumWorkTime: sumWorkTime });
            // setTimeout(() => window.location.reload(), 1000);
          } else {
            alert("err");
          }
        });
    }
  };
  /**
   * 作業報告書ボタン
   */
  workRepotUpload = () => {
    let getfile = $("#getFile").val();
    let fileName = getfile.split(".");
    if (
      fileName[fileName.length - 1] === "xlsx" ||
      fileName[fileName.length - 1] === "xls" ||
      fileName[fileName.length - 1] === "xltx" ||
      fileName[fileName.length - 1] === "xlt" ||
      fileName[fileName.length - 1] === "xlsm" ||
      fileName[fileName.length - 1] === "xlsb" ||
      fileName[fileName.length - 1] === "xltm" ||
      fileName[fileName.length - 1] === "csv" ||
      fileName[fileName.length - 1] === "pdf" ||
      fileName[fileName.length - 1] === "jpg" ||
      fileName[fileName.length - 1] === "bmp" ||
      fileName[fileName.length - 1] === "png" ||
      fileName[fileName.length - 1] === "jpeg"
    ) {
    } else {
      message.error("PDF或いはexcelをアップロードしてください");
      return false;
    }
    /*if($("#getFile").get(0).files[0].size>1048576){
	 alert('１M以下のファイルをアップロードしてください')
    return false;
}*/
    const formData = new FormData();
    const emp = {
      employeeNo: this.state.employeeNo,
      employeeName: this.state.employeeName,
      attendanceYearAndMonth: this.state.rowSelectAttendanceYearAndMonth,
    };
    formData.append("emp", JSON.stringify(emp));
    formData.append("workRepotFile", $("#getFile").get(0).files[0]);
    axios
      .post(this.state.serverIP + "workRepot/updateWorkRepotFile", formData)
      .then((response) => {
        if (response.data != null) {
          this.searchWorkRepot();
          message.success("アップロード成功！");
        } else {
          alert("err");
        }
      });
  };
  getFile = () => {
    /*if(this.state.rowSelectSumWorkTime === undefined || this.state.rowSelectSumWorkTime === null || this.state.rowSelectSumWorkTime === "")
			if(this.state.rowDisabledFlag)
				alert("勤務時間データすでに存在しているため、初期化してください。")
			else
				alert("稼働時間を入力してください。")
		else
			$("#getFile").click();*/
    if (this.state.rowDisabledFlag)
      message.error(
        "勤務時間入力からのデータすでに存在しているため、初期化してください。"
      );
    else $("#getFile").click();
  };

  downLoad = () => {
    let fileKey = "";
    let downLoadPath = "";
    if (!this.state.rowSelectWorkingTimeReport) {
      message.error("ファイルが存在しません。");
      return;
    }
    let path = this.state.rowSelectWorkingTimeReport.replace(/\\/g, "/");
    if (path.split("file/").length > 1) {
      fileKey = path.split("file/")[1];
      downLoadPath = path.replaceAll("/", "//");
    }
    if (fileKey && downLoadPath) {
      axios
        .post(this.state.serverIP + "s3Controller/downloadFile", {
          fileKey,
          downLoadPath,
        })
        .then((result) => {
          publicUtils.handleDownload(downLoadPath, this.state.serverIP);
        })
        .catch(function (error) {
          notification.error({
            message: "サーバーエラー",
            description: "ファイルが存在しません。",
            placement: "topLeft",
          });
        });
    }
  };

  //行Selectファンクション
  handleRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      this.setState({
        workRepotUploadDisable: true,
        workRepotDownload: true,
        workRepotClear: true,
      });
      var TheYearMonth = publicUtils.setFullYearMonth(new Date()) - 1;
      this.setState({
        rowId: row.id,
        rowSelectAttendanceYearAndMonth: row.attendanceYearAndMonth,
        rowSelectWorkingTimeReport: row.workingTimeReport,
        rowSelectSumWorkTime: row.sumWorkTime,
        rowSelectapproval:
          row.attendanceYearAndMonth - 0 >= TheYearMonth &&
          row.approvalStatus !== "1"
            ? true
            : false,
        rowApprovalStatus: row.approvalStatus,
        rowDisabledFlag: row.disabledFlag,
      });
      if (
        row.attendanceYearAndMonth - 0 >= TheYearMonth &&
        row.approvalStatus !== "1"
      ) {
        this.setState({
          workRepotUploadDisable: false,
        });
      }
      if (row.workingTimeReport) {
        this.setState({
          workRepotDownload: false,
        });
      }

      if (row.attendanceYearAndMonth - 0 >= TheYearMonth) {
        this.setState({
          workRepotClear: false,
        });
      }
    } else {
      this.setState({
        workRepotUploadDisable: true,
        workRepotDownload: true,
        workRepotClear: true,
      });
      this.setState({
        rowId: "",
        rowSelectWorkingTimeReport: "",
        //rowSelectAttendanceYearAndMonth: '',
        rowSelectSumWorkTime: "",
        rowSelectapproval: "",
        rowApprovalStatus: "",
        rowDisabledFlag: false,
      });
    }
  };
  renderShowsTotal(start, to, total) {
    return (
      <p
        style={{
          color: "dark",
          float: "left",
          display: total > 0 ? "block" : "none",
        }}
      >
        {start}から {to}まで , 総計{total}
      </p>
    );
  }

  clear = () => {
    if (this.state.rowApprovalStatus === "1") {
      message.error("承認済みのため、クリアできません。");
    } else if (this.state.rowDisabledFlag) {
      message.error(
        "勤務時間入力からのデータすでに存在しているため、初期化してください。"
      );
    } else {
      Modal.confirm({
        title: "データをクリアしてよろしいでしょうか？",
        icon: <ExclamationCircleOutlined />,
        onOk: () => {
          const emp = {
            employeeNo: this.state.employeeNo,
            employeeName: this.state.employeeName,
            attendanceYearAndMonth: this.state.rowSelectAttendanceYearAndMonth,
          };
          axios
            .post(this.state.serverIP + "workRepot/clearworkRepot", emp)
            .then((response) => {
              if (response.data != null) {
                let employeeList = this.state.employeeList;
                employeeList[this.state.rowId]["sumWorkTime"] = "";

                this.setState({
                  employeeList: employeeList,
                });
                this.refs.table.store.selected = [];
                this.refs.table.setState({
                  selectedRowKeys: [],
                });
                this.searchWorkRepot();
                message.success("クリア完成！");
                // setTimeout(() => window.location.reload(), 1000);
              } else {
                alert("err");
              }
            });
        },
        className: this.state.isMobileDevice
          ? "confirmModalBtnCenterClass"
          : "",
      });
    }
  };

  /**
   * 戻るボタン
   */
  back = () => {
    var path = {};
    path = {
      pathname: this.state.backPage,
      state: {},
    };
    if (this.state.dutyManagementTempState) {
      path.state.dutyManagementTempState = this.state.dutyManagementTempState;
    }
    this.props.history.push(path);
  };

  shuseiTo = (actionType) => {
    var path = {};
    const sendValue = {};
    switch (actionType) {
      case "costRegistration":
        path = {
          pathname:
            this.state.employeeNo === undefined ||
            this.state.employeeNo === null
              ? "/subMenuEmployee/costRegistration"
              : "/subMenuManager/costRegistration",
          state: {
            backPage: "workRepot",
            sendValue: sendValue,
            employeeNo: this.state.employeeNo,
            employeeName: this.state.employeeName,
          },
        };
        break;
      default:
    }
    this.props.history.push(path);
  };

  updateUserFormatter = (cell, row) => {
    if (row.sumWorkTime === null || row.sumWorkTime === "") return "";
    else return cell;
  };

  updateTimeFormatter = (cell, row) => {
    if (
      row.sumWorkTime === null ||
      row.sumWorkTime === "" ||
      row.updateUser === ""
    )
      return "";
    else return cell;
  };

  //onChange
  tableValueChange = (event, cell, row) => {
    let employeeList = this.state.employeeList;
    employeeList[row.id][event.target.name] = event.target.value;

    this.setState({
      employeeList: employeeList,
    });
  };

  sumWorkTimeFormatter = (cell, row) => {
    let returnItem = cell;
    let lastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      0
    );
    if (
      row.id < 2 &&
      !this.state.disabledFlag[row.id] &&
      row.approvalStatus !== "1" &&
      Number(row.attendanceYearAndMonth) >=
        Number(
          lastMonth.getFullYear() +
            (lastMonth.getMonth() + 1).toString().padStart(2, "0")
        )
    )
      returnItem = (
        <span className="dutyRegistration-DataTableEditingCell">
          <input
            type="text"
            className=" form-control editor edit-text"
            name="sumWorkTime"
            value={cell || ""}
            onChange={(event) => this.tableValueChange(event, cell, row)}
            onBlur={(event) => this.sumWorkTimeChange(cell, row)}
          />
        </span>
      );
    return returnItem;
  };

  attendanceYearAndMonthFormatter = (cell) => {
    let arr = cell.split("");
    arr.splice(4, 0, "/");
    return arr.join("");
  };

  fileNameFormatter = (cell) => {
    if (cell === "まずファイルをアップロードしてください")
      return (
        <font style={{ color: "#dc3545" }}>
          {" "}
          {this.state.isMobileDevice ? "未" : cell}
        </font>
      );
    if (cell === "作業時間入力画面で存在しました")
      return (
        <font style={{ color: "#28a745" }}>
          {this.state.isMobileDevice ? "入力済み" : cell}
        </font>
      );
    else
      return (
        <font style={{ color: "#28a745" }}>
          {this.state.isMobileDevice ? "upload済み" : cell}
        </font>
      );
  };

  optionsBtn = () => {
    const { isMobileDevice } = this.state;
    return (
      <Row>
        <Col xs={12} sm={12}>
          <div className={"df justify-between "}>
            <div>
              <Button
                variant="info"
                size="sm"
                onClick={this.shuseiTo.bind(this, "costRegistration")}
              >
                {isMobileDevice ? null : (
                  <FontAwesomeIcon icon={faMoneyCheckAlt} />
                )}
                費用登録
              </Button>{" "}
              {this.props.state.initEmployee.authorityCode === "1" ||
              isMobileDevice ? null : (
                <Button
                  size="sm"
                  variant="info"
                  type="button"
                  onClick={this.back}
                >
                  <FontAwesomeIcon icon={faLevelUpAlt} /> 戻る
                </Button>
              )}
            </div>
            <div>
              {" "}
              <Button
                variant="info"
                size="sm"
                onClick={this.getFile}
                id="workRepotUpload"
                disabled={this.state.workRepotUploadDisable}
              >
                {isMobileDevice ? null : <FontAwesomeIcon icon={faUpload} />}{" "}
                Upload
              </Button>{" "}
              <Button
                variant="info"
                size="sm"
                onClick={this.downLoad}
                id="workRepotDownload"
                disabled={this.state.workRepotDownload}
              >
                {isMobileDevice ? null : <FontAwesomeIcon icon={faDownload} />}{" "}
                Download
              </Button>{" "}
              <Button
                variant="info"
                size="sm"
                onClick={this.clear}
                id="workRepotClear"
                disabled={this.state.workRepotClear}
              >
                {isMobileDevice ? null : <FontAwesomeIcon icon={faTrash} />}{" "}
                クリア
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    );
  };

  render() {
    const { employeeList } = this.state;
    console.log(
      {
        state: this.state,
        propsState: this.props.state,
      },
      "render"
    );
    //　テーブルの行の選択
    const selectRow = {
      mode: "radio",
      bgColor: "pink",
      clickToSelectAndEditCell: true,
      hideSelectColumn: true,
      clickToExpand: true, // click to expand row, default is false
      onSelect: this.handleRowSelect,
    };
    //　 テーブルの定義
    const options = {
      page: 1,
      sizePerPage: 10, // which size per page you want to locate as default
      pageStartIndex: 1, // where to start counting the pages
      paginationSize: 3, // the pagination bar size.
      prePage: "<", // Previous page button text
      nextPage: ">", // Next page button text
      firstPage: "<<", // First page button text
      lastPage: ">>", // Last page button text
      paginationShowsTotal: this.renderShowsTotal, // Accept bool or function
      hideSizePerPage: true, //> You can hide the dropdown for sizePerPage
      expandRowBgColor: "rgb(165, 165, 165)",
      approvalBtn: this.createCustomApprovalButton,
      onApprovalRow: this.onApprovalRow,
      handleConfirmApprovalRow: this.customConfirm,
    };

    const filterEmpList =
      employeeList?.filter((item, i) => {
        if (i < 2) return true;
        return item.sumWorkTime;
      }) || [];

    const { isMobileDevice } = this.state;
    return (
      <div className={isMobileDevice ? "clear-grid-padding" : ""}>
        <FormControl
          id="rowSelectCheckSection"
          name="rowSelectCheckSection"
          hidden
        />
        <Form>
          <div>
            <Form.Group>
              <Row inline="true">
                <Col className="text-center">
                  <h2>
                    {this.state.employeeName === undefined ||
                    this.state.employeeName === null
                      ? ""
                      : this.state.employeeName + "_"}
                    作業報告書アップロード
                  </h2>
                </Col>
              </Row>
            </Form.Group>
          </div>
        </Form>
        <div>
          <Form.File
            id="getFile"
            custom
            hidden="hidden"
            onChange={this.workRepotUpload}
          />
          <br />
          {this.optionsBtn()}
          <Col
          // style={isMobileDevice ? { paddingLeft: 0, paddingRight: 0 } : null}
          >
            <BootstrapTable
              data={filterEmpList}
              ref="table"
              pagination={true}
              options={options}
              approvalRow
              selectRow={selectRow}
              headerStyle={{ background: "#5599FF" }}
              striped
              hover
              condensed
            >
              <TableHeaderColumn
                width={isMobileDevice ? "70" : "100"}
                tdStyle={{ padding: ".45em" }}
                dataField="attendanceYearAndMonth"
                dataFormat={(cell) => publicUtils.addLeftSlash(cell)}
                isKey
              >
                年月
              </TableHeaderColumn>
              <TableHeaderColumn
                width={isMobileDevice ? "90" : "320"}
                tdStyle={{ padding: ".45em" }}
                dataField="workingTimeReportFile"
                dataFormat={this.fileNameFormatter}
              >
                {isMobileDevice ? "ファイル" : "ファイル名（必）"}
              </TableHeaderColumn>
              <TableHeaderColumn
                width={isMobileDevice ? "95" : "140"}
                tdStyle={{ padding: ".45em" }}
                dataField="sumWorkTime"
                dataFormat={this.sumWorkTimeFormatter}
              >
                {isMobileDevice ? "稼働時間" : "稼働時間（必）"}
              </TableHeaderColumn>
              <TableHeaderColumn
                width="100"
                tdStyle={{ padding: ".45em" }}
                dataField="updateUser"
                dataFormat={this.updateUserFormatter}
                hidden={isMobileDevice}
              >
                登録者
              </TableHeaderColumn>
              <TableHeaderColumn
                width="170"
                tdStyle={{ padding: ".45em" }}
                dataField="updateTime"
                dataFormat={this.updateTimeFormatter}
                hidden={isMobileDevice}
              >
                更新日
              </TableHeaderColumn>
              <TableHeaderColumn
                width={isMobileDevice ? "90" : "110"}
                dataAlign="center"
                headerAlign="center"
                tdStyle={{ padding: ".45em" }}
                dataField="approvalStatus"
                dataFormat={this.approvalStatus}
              >
                ステータス
              </TableHeaderColumn>
            </BootstrapTable>
          </Col>
        </div>
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
    return {};
  }
)(workRepot);
