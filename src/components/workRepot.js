import React from "react";
import {
  Button,
  Form,
  Col,
  Row,
  InputGroup,
  FormControl,
  Modal,
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
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import * as publicUtils from "./utils/publicUtils.js";
import store from "./redux/store";
import MyToast from "./myToast";
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
    if (this.props.location.state !== undefined) {
      this.setState(
        {
          employeeNo: this.props.location.state.employeeNo,
          employeeName: this.props.location.state.employeeName,
        },
        () => {
          this.selectWorkTime();
        }
      );
    } else {
      this.selectWorkTime();
    }
    $("#workRepotUpload").attr("disabled", true);
    $("#workRepotDownload").attr("disabled", true);
    $("#workRepotClear").attr("disabled", true);
  }
  //onchange
  valueChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };
  selectWorkTime = () => {
    let now = new Date();
    let dataInfo = {};
    let month = now.getMonth() + 1;
    dataInfo["attendanceYearAndMonth"] =
      String(now.getFullYear()) + String(month < 10 ? "0" + month : month);
    dataInfo["employeeNo"] = this.state.employeeNo;
    axios
      .post(this.state.serverIP + "workRepot/selectWorkTime", dataInfo)
      .then((response) => response.data)
      .then((data) => {
        let disabledFlag = this.state.disabledFlag;
        if (data != null) {
          disabledFlag[0] = data.nowMonth;
          disabledFlag[1] = data.lastMonth;
        }
        this.setState(
          {
            disabledFlag: disabledFlag,
          },
          () => {
            this.searchWorkRepot();
          }
        );
      });
  };

  //　初期化データ
  initialState = {
    employeeList: [],
    rowApprovalStatus: "",
    approvalStatuslist: [
      { code: "0", name: "アップロード済み" },
      { code: "1", name: "承認済み" },
    ],
    disabledFlag: [false, false],
    costClassificationCode: store.getState().dropDown[30],
    serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
  };
  approvalStatus = (code, row) => {
    if (row.workingTimeReportFile === "まずファイルをアップロードしてください")
      return "";
    else {
      if (row.sumWorkTime === "" || row.sumWorkTime === null) return "未完成";
    }

    let approvalStatuss = this.state.approvalStatuslist;
    for (var i in approvalStatuss) {
      if (code === approvalStatuss[i].code) {
        return approvalStatuss[i].name;
      }
    }
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
        if (data.length != 0) {
          for (var i = 0; i < data.length; i++) {
            if (data[i].workingTimeReport != null) {
              let fileName = data[i].workingTimeReport.split("/");
              data[i].workingTimeReportFile = fileName[fileName.length - 1];
            } else {
              data[i].workingTimeReportFile =
                "まずファイルをアップロードしてください";
            }
            if (i < 2 && this.state.disabledFlag[i]) {
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
      row.workingTimeReportFile === "まずファイルをアップロードしてください"
    ) {
      alert("まずファイルをアップロードしてください");
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
          alert("稼働時間をチェックしてください。");
          return;
        } else if (!re.test(sumWorkTime)) {
          alert("数字のみを入力してください。");
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
              alert("稼働時間をチェックしてください。");
              return;
            }
          } else {
            if (sumWorkTime.length > 3) {
              alert("稼働時間をチェックしてください。");
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
            this.setState({ myToastShow: true, message: "更新成功！" });
            this.setState({ rowSelectSumWorkTime: sumWorkTime });
            setTimeout(() => this.setState({ myToastShow: false }), 3000);
            setTimeout(() => window.location.reload(), 1000);
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
      alert("PDF或いはexcelをアップロードしてください");
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
          this.setState({ myToastShow: true, message: "アップロード成功！" });
          setTimeout(() => this.setState({ myToastShow: false }), 3000);
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
      alert("勤務時間データすでに存在しているため、初期化してください。");
    else $("#getFile").click();
  };

  downLoad = () => {
    let fileKey = "";
    let downLoadPath = "";
    if (this.state.rowSelectWorkingTimeReport !== null) {
      let path = this.state.rowSelectWorkingTimeReport.replace(/\\/g, "/");
      if (path.split("file/").length > 1) {
        fileKey = path.split("file/")[1];
        downLoadPath = path.replaceAll("/", "//");
      }
    }
    axios
      .post(this.state.serverIP + "s3Controller/downloadFile", {
        fileKey: fileKey,
        downLoadPath: downLoadPath,
      })
      .then((result) => {
        let path = downLoadPath.replaceAll("//", "/");
        publicUtils.handleDownload(path, this.state.serverIP);
      })
      .catch(function (error) {
        alert("ファイルが存在しません。");
      });
  };

  //行Selectファンクション
  handleRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      $("#workRepotUpload").attr("disabled", true);
      $("#workRepotDownload").attr("disabled", false);
      $("#workRepotClear").attr("disabled", false);
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
        $("#workRepotUpload").attr("disabled", false);
      }
    } else {
      $("#workRepotUpload").attr("disabled", true);
      $("#workRepotDownload").attr("disabled", true);
      $("#workRepotClear").attr("disabled", true);
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
      alert("承認済みのため、クリアできません。");
    } else {
      var a = window.confirm("データをクリアしてよろしいでしょうか？");
      if (a) {
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
              this.setState({ myToastShow: true, message: "クリア完成！" });
              setTimeout(() => this.setState({ myToastShow: false }), 3000);
              setTimeout(() => window.location.reload(), 1000);
            } else {
              alert("err");
            }
          });
      }
    }
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
        <span class="dutyRegistration-DataTableEditingCell">
          <input
            type="text"
            class=" form-control editor edit-text"
            name="sumWorkTime"
            value={cell}
            onChange={(event) => this.tableValueChange(event, cell, row)}
            onBlur={(event) => this.sumWorkTimeChange(cell, row)}
          />
        </span>
      );
    return returnItem;
  };

  fileNameFormatter = (cell) => {
    if (
      cell === "作業時間入力画面で存在しました" ||
      cell === "まずファイルをアップロードしてください"
    )
      return <font style={{ color: "red" }}>{cell}</font>;
    else return cell;
  };

  render() {
    const { employeeList } = this.state;
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
      sizePerPage: 5, // which size per page you want to locate as default
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
    return (
      <div>
        <div style={{ display: this.state.myToastShow ? "block" : "none" }}>
          <MyToast
            myToastShow={this.state.myToastShow}
            message={this.state.message}
            type={"success"}
          />
        </div>
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
          <Row>
            <Col sm={6}>
              <Button
                variant="info"
                size="sm"
                onClick={this.shuseiTo.bind(this, "costRegistration")}
              >
                <FontAwesomeIcon icon={faMoneyCheckAlt} /> 費用登録
              </Button>
            </Col>
            <Col sm={6}>
              <div style={{ float: "right" }}>
                <Button
                  variant="info"
                  size="sm"
                  onClick={this.getFile}
                  id="workRepotUpload"
                >
                  <FontAwesomeIcon icon={faUpload} /> Upload
                </Button>{" "}
                <Button
                  variant="info"
                  size="sm"
                  onClick={this.downLoad}
                  id="workRepotDownload"
                >
                  <FontAwesomeIcon icon={faDownload} /> Download
                </Button>{" "}
                <Button
                  variant="info"
                  size="sm"
                  onClick={this.clear}
                  id="workRepotClear"
                >
                  <FontAwesomeIcon icon={faTrash} /> クリア
                </Button>
              </div>
            </Col>
          </Row>
          <Col>
            <BootstrapTable
              data={employeeList}
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
                width="130"
                tdStyle={{ padding: ".45em" }}
                dataField="attendanceYearAndMonth"
                isKey
              >
                年月
              </TableHeaderColumn>
              <TableHeaderColumn
                width="380"
                tdStyle={{ padding: ".45em" }}
                dataField="workingTimeReportFile"
                dataFormat={this.fileNameFormatter}
              >
                ファイル名（必）
              </TableHeaderColumn>
              <TableHeaderColumn
                width="140"
                tdStyle={{ padding: ".45em" }}
                dataField="sumWorkTime"
                dataFormat={this.sumWorkTimeFormatter}
              >
                稼働時間（必）
              </TableHeaderColumn>
              <TableHeaderColumn
                width="150"
                tdStyle={{ padding: ".45em" }}
                dataField="updateUser"
                dataFormat={this.updateUserFormatter}
              >
                登録者
              </TableHeaderColumn>
              <TableHeaderColumn
                width="350"
                tdStyle={{ padding: ".45em" }}
                dataField="updateTime"
                dataFormat={this.updateTimeFormatter}
              >
                更新日
              </TableHeaderColumn>
              <TableHeaderColumn
                width="150"
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
export default workRepot;
