import React from "react";
import {
  Button,
  Form,
  Col,
  Row,
  InputGroup,
  FormControl,
  OverlayTrigger,
} from "react-bootstrap";
import axios from "axios";
import "../asserts/css/development.css";
import "../asserts/css/style.css";
import $ from "jquery";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import DatePicker, { registerLocale } from "react-datepicker";
import ja from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faUpload,
  faSearch,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import * as publicUtils from "./utils/publicUtils.js";
import MyToast from "./myToast";
import Autocomplete from "@material-ui/lab/Autocomplete";
import store from "./redux/store";
import { message, Tooltip, Popover, notification } from "antd";
registerLocale("ja", ja);
axios.defaults.withCredentials = true;

const SIZE_PRE_PAGE = 10;
const MIN_WIDTH = 1650;

/**
 * 社員勤務管理画面
 */
class dutyManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state =
      this.props.location?.state?.dutyManagementTempState || this.initialState; //初期化
    this.approvalStatusChange = this.approvalStatusChange.bind(this);
    this.searchEmployee = this.searchDutyManagement.bind(this);
  }

  setStyleObjByWidth = (width) => {
    let styleObj = {};
    if (width < MIN_WIDTH) {
      styleObj.padding = "0 15px";
      styleObj.marginTop = "-1rem";
    }
    this.setState({ innerWidth: width, styleObj });
  };

  handleResize = (e) => {
    this.setStyleObjByWidth(e.target.innerWidth);
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize.bind(this));
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize.bind(this));
    this.setStyleObjByWidth(document.body.offsetWidth);
    $("#update").attr("disabled", true);
    $("#syounin").attr("disabled", true);
    $("#upload").attr("disabled", true);
    $("#workRepot").attr("disabled", true);
    $("#datePicker").attr("readonly", "readonly");
    axios
      .post(this.state.serverIP + "sendLettersConfirm/getLoginUserInfo")
      .then((result) => {
        this.setState({
          authorityCode: result.data[0].authorityCode,
        });
      })
      .catch(function (error) {
        //alert(error);
      });

    const { location } = this.props;
    if (
      !(
        location.state === undefined ||
        location.state.yearAndMonth === undefined ||
        location.state.yearAndMonth === null
      )
    ) {
      $("#datePicker").val(location.state.yearAndMonth);
      this.setState(
        {
          yearAndMonth: location.state.yearAndMonth,
        },
        () => {
          this.searchDutyManagement();
        }
      );
    } else {
      this.searchDutyManagement();
    }
  }
  //onchange
  approvalStatusChange = (event) => {
    this.refs.table.setState({
      selectedRowKeys: [],
    });
    this.setState(
      {
        [event.target.name]: event.target.value,
        rowSelectEmployeeNo: "",
        rowSelectEmployeeName: "",
      },
      () => {
        $("#update").attr("disabled", true);
        $("#workRepot").attr("disabled", true);
        $("#syounin").attr("disabled", true);
        $("#upload").attr("disabled", true);
        this.searchDutyManagement();
      }
    );
  };
  /**
   * タイプが違う時に、色々な操作をします。
   */
  employeeStatusChange = (event) => {
	const value = event.target.value;
    let employeeInfoList = this.state.employeeInfoAll;
    let newEmpInfoList = [];
    if (value === "-1") {
      for (let i in employeeInfoList) {
        newEmpInfoList.push(employeeInfoList[i]);
      }
    } else if (value === "0") {
      for (let i in employeeInfoList) {
        if (employeeInfoList[i].code.substring(0, 3) === "LYC") {
          newEmpInfoList.push(employeeInfoList[i]);
        }
      }
    } else if (value === "1") {
      for (let i in employeeInfoList) {
        if (employeeInfoList[i].code.substring(0, 2) === "BP") {
          newEmpInfoList.push(employeeInfoList[i]);
        }
      }
    } else if (value === "2") {
      for (let i in employeeInfoList) {
        if (employeeInfoList[i].code.substring(0, 2) === "SP") {
          newEmpInfoList.push(employeeInfoList[i]);
        }
      }
    }
    this.setState(
      {
		employeeInfo: newEmpInfoList,
        employeeName: "",
        employeeNo: null,
        [event.target.name]: event.target.value,
      },
      () => {
        this.searchDutyManagement();
      }
    );
  };
  
      /**
   * 社員名連想
   *
   * @param {}
   *            event
   */
  getEmployeeName = (event, values) => {
    this.setState(
      {
        [event.target.name]: event.target.value,
      },
      () => {
        let employeeName = null;
        let employeeNo = null;
        if (values !== null) {
          employeeName = values.text;
          employeeNo = values.code;
        }
        this.setState({
          employeeName: employeeName,
          employeeNo: employeeNo,
        },() => {
        this.searchDutyManagement();
      });
      }
    );
  };
  
  //　初期化データ
  initialState = {
    employeeStatus: "-1",
    employeeNo: null,
    //yearAndMonth: new Date(new Date().getFullYear() + '/' + (new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1))).getTime(),
    yearAndMonth: new Date(),
    month: new Date().getMonth() + 1,
    employeeList: [],
    totalPersons: "",
    averageWorkingTime: "",
    totalWorkingTime: "",
    rowSelectEmployeeNo: "",
    rowSelectEmployeeName: "",
    authorityCode: "",
    rowWorkTime: "",
    rowApprovalStatus: "",
    rowSelectWorkingTimeReport: "",
    rowDownload: "",
    customerNo: null,
    loading: true,
    employeeInfoAll: store.getState().dropDown[9].slice(1),
    employeeInfo: store.getState().dropDown[9].slice(1),
    customerAbbreviationList: store.getState().dropDown[73].slice(1),
    approvalStatuslist: store.getState().dropDown[27],
    checkSectionlist: store.getState().dropDown[28],
    costClassification: store.getState().dropDown[30],
    serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
    employeeStatusS: store.getState().dropDown[4].slice(1)
      ? store
          .getState()
          .dropDown[4].slice(1)
          .filter((item, index) => {
            return ["0", "1", "2"].includes(item.code);
          })
      : store.getState().dropDown[4].slice(1),
  };
  checkSection(code) {
    let checkSections = this.state.checkSectionlist;
    for (var i in checkSections) {
      if (code === checkSections[i].code) {
        return checkSections[i].name;
      }
    }
  }

  greyShow(cell, row) {
    if (row.workTime === "" || row.workTime === null)
      return <div style={{ color: "grey" }}>{cell}</div>;
    else return cell;
  }

  approvalStatus(code, row) {
    if (row.workTime === "" || row.workTime === null) return "";
    let approvalStatuss = this.state.approvalStatuslist;
    for (var i in approvalStatuss) {
      if (code === approvalStatuss[i].code) {
        if (code === "0") return approvalStatuss[i].name;
        else
          return (
            approvalStatuss[i].name +
            (row.approvalUser === null ? "" : "(" + row.approvalUser + ")")
          );
      }
    }
  }

  //　検索
  searchDutyManagement = () => {
    const emp = {
      yearAndMonth: publicUtils.formateDate($("#datePicker").val(), false),
      approvalStatus: this.state.approvalStatus,
      customerNo: this.state.customerNo,
      employeeStatus: this.state.employeeStatus,
      employeeNo: this.state.employeeNo,
    };

    axios
      .post(this.state.serverIP + "dutyManagement/selectDutyManagement", emp)
      .then((response) => {
        var totalPersons = 0;
        var averageWorkingTime = 0;
        var totalWorkingTime = 0;
        var minWorkingTime = 999;
        if (response.data.length > 0) {
          //totalPersons=response.data.length;
          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].workTime !== null) {
              averageWorkingTime =
                Number(averageWorkingTime) + Number(response.data[i].workTime);
              totalPersons = totalPersons + 1;
            }
            if (Number(totalWorkingTime) < Number(response.data[i].workTime)) {
              totalWorkingTime = response.data[i].workTime;
            }
            if (
              !(
                response.data[i].workTime === "" ||
                response.data[i].workTime === null
              )
            ) {
              if (Number(minWorkingTime) > Number(response.data[i].workTime)) {
                minWorkingTime = response.data[i].workTime;
              }
            }
          }
          averageWorkingTime =
            Math.round((averageWorkingTime / totalPersons) * 100) / 100;
          if (isNaN(averageWorkingTime)) {
            averageWorkingTime = 0;
          }
        } else {
          totalPersons = "";
          averageWorkingTime = "";
          totalWorkingTime = "";
          minWorkingTime = "";
        }
        if (minWorkingTime === 999) minWorkingTime = "";
        if (totalWorkingTime === 0) totalWorkingTime = "";
        if (averageWorkingTime === 0) averageWorkingTime = "";
        this.setState(
          {
            employeeList: response.data,
            totalPersons,
            totalWorkingTime,
            minWorkingTime,
            averageWorkingTime,
          },
          () => {
            // 当前employeeNo对应res.data中的下标
            let { rowSelectEmployeeNo } = this.state;
            let rowNo;
            response.data.forEach((item) => {
              if (item.employeeNo === rowSelectEmployeeNo) rowNo = item.rowNo;
            });

            if (rowNo) {
              if (rowNo > response.data.length) {
                this.setState({
                  rowSelectEmployeeNo: "",
                  rowSelectEmployeeName: "",
                  currentPage: 1,
                });
                // this.refs.table.setState({
                //   selectedRowKeys: [],
                // });
                $("#update").attr("disabled", true);
                $("#workRepot").attr("disabled", true);
                $("#syounin").attr("disabled", true);
                $("#upload").attr("disabled", true);
              } else {
                let row = response.data[rowNo - 1];
                this.setState({
                  rowNo,
                  rowApprovalStatus: row.approvalStatus,
                  currentPage: Math.ceil(rowNo / SIZE_PRE_PAGE),
                  rowSelectEmployeeNo: row.employeeNo,
                  rowSelectEmployeeName: row.employeeName,
                  rowSelectCheckSection: row.checkSection,
                  rowSelectDeductionsAndOvertimePay:
                    row.deductionsAndOvertimePay,
                  rowSelectDeductionsAndOvertimePayOfUnitPrice:
                    row.deductionsAndOvertimePayOfUnitPrice,
                  rowWorkTime: row.workTime,
                  rowSelectWorkingTimeReport: row.workingTimeReport,
                  downloadEmployeeNo: row.employeeNo,
                  downloadEmployeeName: row.employeeName.replaceAll(
                    "\n\t\t",
                    ""
                  ),
                });
                $("#workRepot").attr("disabled", false);
                $("#upload").attr("disabled", false);
                $("#syounin").attr("disabled", false);
                if (response.data[rowNo - 1].approvalStatus === "1") {
                  $("#update").attr("disabled", true);
                } else {
                  $("#update").attr("disabled", false);
                }
              }
            } else {
              this.setState({
                rowSelectEmployeeNo: "",
                rowSelectEmployeeName: "",
                currentPage: 1,
              });
            }
            let flag = false;
            for (let i in response.data) {
              if (
                String(response.data[i].employeeNo) ===
                String(this.refs.table.state.selectedRowKeys)
              ) {
                flag = true;
                break;
              }
            }
            if (!flag) {
              axios
                .post(this.state.serverIP + "subMenu/checkSession")
                .then((resultMap) => {
                  if (!(resultMap.data === null || resultMap.data === "")) {
                    this.setState({
                      rowSelectEmployeeNo: "",
                      rowSelectEmployeeName: "",
                    });
                    this.refs.table.setState({
                      selectedRowKeys: [],
                    });
                  }
                });
              $("#update").attr("disabled", true);
              $("#workRepot").attr("disabled", true);
              $("#syounin").attr("disabled", true);
              $("#upload").attr("disabled", true);
            }
          }
        );
      });
  };
  /**
   * 行の承認
   */
  listApproval = (approvalStatus) => {
    const emp = {
      yearAndMonth: publicUtils.formateDate(this.state.yearAndMonth, false),
      employeeNo: this.state.rowSelectEmployeeNo,
      checkSection: this.state.rowSelectCheckSection,
      deductionsAndOvertimePay: publicUtils.deleteComma(
        this.state.employeeList[this.state.rowNo - 1].deductionsAndOvertimePay
      ),
      deductionsAndOvertimePayOfUnitPrice: publicUtils.deleteComma(
        this.state.employeeList[this.state.rowNo - 1]
          .deductionsAndOvertimePayOfUnitPrice
      ),
      approvalStatus: approvalStatus,
    };
    this.setState({
      rowApprovalStatus: approvalStatus,
    });
    axios
      .post(this.state.serverIP + "dutyManagement/updateDutyManagement", emp)
      .then((result) => {
        if (result.data) {
          this.searchDutyManagement();
          this.setState({
            myToastShow: true,
            message:
              approvalStatus === 2
                ? "更新成功!"
                : approvalStatus === 0
                ? "取消成功!"
                : "承認成功!",
          });
          setTimeout(() => this.setState({ myToastShow: false }), 3000);
        } else {
          this.setState({ myToastShow: false });
          message.error("承認失敗");
        }
      })
      .catch(function (error) {
        notification.error({
          message: "エラー",
          description: "承認失败，请检查程序",
          placement: "topLeft",
        });
      });
  };
  state = {
    yearAndMonth: new Date(),
  };

  workTimeFormat = (cell, row) => {
    let arr = [cell, `${cell}(アップロード)`, `${cell}(時間入力)`];
    return (
      <Tooltip title={String(row.checkSection) ? arr[row.checkSection] : cell}>
        {cell}
      </Tooltip>
    );
  };

  employeeNameFormat = (cell, row) => {
    let text = cell;

    if (row.employeeNo?.startsWith("BP")) {
      text += row.bpBelongCustomerAbbreviation
        ? `(${row.bpBelongCustomerAbbreviation})`
        : "(BP)";
    }
    return <Tooltip title={row.employeeNo}>{this.greyShow(text, row)}</Tooltip>;
  };

  overtimePayFormat = (cell, row) => {
    if (row.workTime === "" || row.workTime === null) return "";
    if (cell === null || cell === "") return "";
    else return "￥" + publicUtils.addComma(cell);
  };

  //　年月
  inactiveYearAndMonth = (date) => {
    this.setState({
      yearAndMonth: date,
      month: date.getMonth() + 1,
    });
    $("#datePicker").val(date);
    this.refs.table.setState({
      selectedRowKeys: [],
    });
    this.searchDutyManagement();
  };

  handleRowClick = (row, isSelected, e) => {
    if (isSelected) {
      this.setState({ rowDownload: row.costFile, rowCost: row.cost });
    } else {
      this.setState({ rowDownload: "", rowCost: "" });
    }
  };

  //行Selectファンクション
  handleRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      this.setState({
        rowSelected: row,
        rowNo: row.rowNo,
        rowSelectEmployeeNo: row.employeeNo,
        rowSelectEmployeeName: row.employeeName,
        rowSelectCheckSection: row.checkSection,
        rowSelectDeductionsAndOvertimePay: row.deductionsAndOvertimePay,
        rowSelectDeductionsAndOvertimePayOfUnitPrice:
          row.deductionsAndOvertimePayOfUnitPrice,
        rowWorkTime: row.workTime,
        rowApprovalStatus: row.approvalStatus,
        rowSelectWorkingTimeReport: row.workingTimeReport,
        downloadEmployeeNo: row.employeeNo,
        downloadEmployeeName: row.employeeName.replaceAll("\n\t\t", ""),
      });
      if (!(row.workTime === "" || row.workTime === null)) {
        $("#syounin").attr("disabled", false);
        $("#upload").attr("disabled", false);
        $("#workRepot").attr("disabled", false);
        if (row.approvalStatus !== "1") $("#update").attr("disabled", false);
        else $("#update").attr("disabled", true);
      } else {
        $("#syounin").attr("disabled", true);
        $("#upload").attr("disabled", true);
        $("#update").attr("disabled", true);
        $("#workRepot").attr("disabled", true);
      }

      if (row.checkSection == 0) {
        $("#workRepot").attr("disabled", false);
      }
    } else {
      this.setState({
        rowSelected: {},
        rowNo: "",
        rowSelectEmployeeNo: "",
        rowSelectEmployeeName: "",
        rowSelectCheckSection: "",
        rowSelectDeductionsAndOvertimePay: "",
        rowSelectDdeductionsAndOvertimePayOfUnitPrice: "",
        rowSelectWorkingTimeReport: "",
      });
      $("#syounin").attr("disabled", true);
      $("#upload").attr("disabled", true);
      $("#update").attr("disabled", true);
      $("#workRepot").attr("disabled", true);
    }
  };

  shuseiTo = (actionType) => {
    var path = {};
    const sendValue = {
      yearAndMonth: this.state.yearAndMonth,
      enterPeriodKbn: this.state.enterPeriodKbn,
      employeeName: this.state.employeeName,
      employeeNo: $("#employeeName").val(),
    };
    switch (actionType) {
      case "employeeInfo":
        path = {
          pathname: "/subMenuManager/employeeUpdateNew",
          state: {
            id: this.state.rowSelectEmployeeNo,
            employeeNo: this.state.rowSelectEmployeeNo,
            backPage: "dutyManagement",
            sendValue: sendValue,
            searchFlag: true,
            actionType: "update",
            dutyManagementTempState: this.state,
          },
        };
        break;
      case "siteInfo":
        path = {
          pathname: "/subMenuManager/siteInfo",
          state: {
            employeeNo: this.state.rowSelectEmployeeNo,
            backPage: "dutyManagement",
            sendValue: sendValue,
            dutyManagementTempState: this.state,
          },
        };
        break;
      case "sendInvoice":
        path = {
          pathname: "/subMenuManager/sendInvoice",
          state: {
            yearAndMonth: this.state.yearAndMonth,
            backPage: "dutyManagement",
            sendValue: sendValue,
            dutyManagementSelectedEmployeeNo: this.state.rowSelectEmployeeNo,
            dutyManagementSelectedEmployeeName:
              this.state.rowSelectEmployeeName,
            dutyManagementTempState: this.state,
          },
        };
        break;
      case "workRepot":
        path = {
          pathname: "/subMenuManager/workRepot",
          state: {
            employeeNo: this.state.rowSelectEmployeeNo,
            employeeName: this.state.rowSelectEmployeeName,
            backPage: "dutyManagement",
            sendValue: sendValue,
            searchFlag: this.state.searchFlag,
            dutyManagementTempState: this.state,
          },
        };
        break;
      default:
    }
    this.props.history.push(path);
  };

  renderShowsTotal = (start, to, total) => {
	  var approvalStatusCount = 0;
	  for (var i in this.state.employeeList) {
	  	if(this.state.employeeList[i].approvalStatus === "1"){
			  approvalStatusCount++;
		  }
	  }
      return (
      <p
        style={{
          color: "dark",
          float: "left",
          display: total > 0 ? "block" : "none",
        }}
      >
        {start}から {to}まで , 総計{total} , 登録済み{approvalStatusCount}
      </p>
    );
  }

  costClassificationCodeFormat(cell, row) {
    if (cell === "0") {
      if (row.regularStatus === "0") return "定期";
      else return "通勤費";
    } else {
      let costClassificationCode = this.state.costClassification;
      for (var i in costClassificationCode) {
        if (costClassificationCode[i].code != "") {
          if (cell == costClassificationCode[i].code) {
            return costClassificationCode[i].name;
          }
        }
      }
    }
  }

  happendDateFormat(cell, row) {
    if (row.costClassificationCode === "0") {
      if (row.regularStatus === "0") {
        return cell.substring(0, 4) + "/" + cell.substring(4, 6);
      } else {
        return row.detailedNameOrLine + "回";
      }
    } else {
      return (
        cell.substring(0, 4) +
        "/" +
        cell.substring(4, 6) +
        "/" +
        cell.substring(6, 8)
      );
    }
  }

  remarkFormat(cell, row) {
    let remark = "";
    if (!(row.costClassificationCode === "0" && row.regularStatus !== "0")) {
      remark = row.detailedNameOrLine + " " + cell;
    } else {
      remark = cell;
    }
    return <span title={remark}>{remark}</span>;
  }

  cost(cell) {
    return publicUtils.addComma(cell);
  }

  costTotalFormat(cell, row) {
    if (row.costClassificationCode === "0") {
      return publicUtils.addComma(row.cost);
    } else {
      return publicUtils.addComma(cell);
    }
  }

  costFileFormat(cell) {
    if (cell !== "") {
      return "〇";
    }
  }

  rowClassNameFormat = (row) => {
    return row.costClassificationCode === "0"
      ? "transportationExpenses"
      : "otherCost";
  };

  updateTimeFormat = (cell, row) => {
    if (row.workTime === "" || row.workTime === null) return "";
    else return cell;
  };

  downloadTest = () => {
    if (
      this.state.rowSelectWorkingTimeReport === undefined ||
      this.state.rowSelectWorkingTimeReport === null ||
      this.state.rowSelectWorkingTimeReport === ""
    ) {
      this.setState({ loading: false });
      let dataInfo = {};
      dataInfo["yearMonth"] =
        String(this.state.yearAndMonth.getFullYear()) +
        (this.state.yearAndMonth.getMonth() + 1 < 10
          ? "0" + String(this.state.yearAndMonth.getMonth() + 1)
          : String(this.state.yearAndMonth.getMonth() + 1));
      dataInfo["employeeName"] = this.state.rowSelectEmployeeName;
      dataInfo["employeeNo"] = this.state.rowSelectEmployeeNo;
      axios
        .post(this.state.serverIP + "dutyRegistration/downloadPDF", dataInfo)
        .then((resultMap) => {
          let extraData = {
            employeeNo: this.state.rowSelected.employeeNo,
            employeeName: this.state.rowSelected.employeeName,
            type: "作業報告書",
          };
          if (this.state.rowSelected.workTime !== null) {
            extraData.workTime = this.state.rowSelected.workTime + "H";
          }
          // 報告書なら要らない
          // if (this.state.rowSelected.cost > 0) {
          //   extraData.cost =
          //     publicUtils.addComma(this.state.rowSelected.cost) + "円";
          // }
          if (resultMap.data) {
            publicUtils.handleDownload(resultMap.data, this.state.serverIP, {
              clearName: true,
              extraData,
            });
          } else {
            notification.error({
              message: "エラー",
              description: "download失败",
              placement: "topLeft",
            });
          }
          this.setState({ loading: true });
        })
        .catch(function () {
          notification.error({
            message: "エラー",
            description: "download错误，请检查程序",
            placement: "topLeft",
          });
          this.setState({ loading: true });
        });
    } else {
      let fileKey = "";
      let downLoadPath = "";
      if (this.state.rowSelectWorkingTimeReport !== null) {
        let path = this.state.rowSelectWorkingTimeReport.replace(/\\/g, "/");
        if (path.split("file/").length > 1) {
          fileKey = path.split("file/")[1];
          downLoadPath = path.replaceAll("/", "//");
        }
      }
      let extraData = {};
      if (this.state.rowSelected.workTime !== null) {
        extraData.workTime = this.state.rowSelected.workTime + "H";
      }
      // 報告書なら要らない
      // if (this.state.rowSelected.cost > 0) {
      //   extraData.cost =
      //     publicUtils.addComma(this.state.rowSelected.cost) + "円";
      // }
      axios
        .post(this.state.serverIP + "s3Controller/downloadFile", {
          fileKey: fileKey,
          downLoadPath: downLoadPath,
        })
        .then((result) => {
          let path = downLoadPath.replaceAll("//", "/");
          publicUtils.handleDownload(path, this.state.serverIP, {
            extraData,
          });
        })
        .catch(function (error) {
          notification.error({
            message: "エラー",
            description: "ファイルが存在しません。",
            placement: "topLeft",
          });
        });
    }
  };

  rowDownload = () => {
    let fileKey = "";
    let downLoadPath = "";
    if (this.state.rowDownload !== null) {
      let path = this.state.rowDownload.replace(/\\/g, "/");
      if (path.split("file/").length > 1) {
        fileKey = path.split("file/")[1];
        downLoadPath = path.replaceAll("/", "//");
      }
    }
    fileKey =
      fileKey.substring(0, fileKey.lastIndexOf("/") + 1) +
      this.state.downloadEmployeeNo +
      "_" +
      this.state.downloadEmployeeName +
      "_" +
      fileKey.substring(fileKey.lastIndexOf("/") + 1, fileKey.length);
    axios
      .post(this.state.serverIP + "s3Controller/downloadFile", {
        fileKey: fileKey,
        downLoadPath: downLoadPath,
      })
      .then((result) => {
        let path = downLoadPath.replaceAll("//", "/");
        let extraData = {};
        // show cost when download
        if (this.state.rowCost !== "") {
          extraData.cost = publicUtils.addComma(this.state.rowCost) + "円";
        }
        publicUtils.handleDownload(path, this.state.serverIP, {
          fileKey,
          extraData,
        });
      })
      .catch(function (error) {
        notification.error({
          message: "エラー",
          description: "ファイルが存在しません。",
          placement: "topLeft",
        });
      });
  };

  /**
   * 社員名連想
   * @param {} event
   */
  getCustomer = (event, values) => {
    this.setState(
      {
        [event.target.name]: event.target.value,
      },
      () => {
        let customerNo = null;
        if (values !== null) {
          customerNo = values.code;
        }
        this.setState(
          {
            customerNo: customerNo,
            customerAbbreviation: customerNo,
          },
          () => {
            this.searchDutyManagement();
          }
        );
      }
    );
  };

  costFormat = (cell, row) => {
    let returnItem = cell;
    const options = {
      noDataText: (
        <i className="" style={{ fontSize: "20px" }}>
          データなし
        </i>
      ),
      expandRowBgColor: "rgb(165, 165, 165)",
      hideSizePerPage: true, //> You can hide the dropdown for sizePerPage
    };
    const selectRow = {
      mode: "radio",
      bgColor: "pink",
      hideSelectColumn: true,
      clickToSelect: true,
      clickToExpand: true,
      onSelect: this.handleRowClick,
    };

    returnItem = (
      <Popover
        overlayClassName={"w50p"}
        placement="leftBottom"
        content={
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Row>
              <Col style={{ padding: "0px", marginTop: "10px" }}>
                <font>{this.state.month + "月"}</font>
              </Col>
              <Col style={{ padding: "0px", marginTop: "10px" }}>
                <h2>費用詳細</h2>
              </Col>
              <Col style={{ padding: "0px" }}>
                <div style={{ float: "right" }}>
                  <Button
                    variant="info"
                    size="sm"
                    disabled={this.state.rowDownload === ""}
                    onClick={this.rowDownload}
                    id="workRepot"
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    download
                  </Button>
                </div>
              </Col>
            </Row>
            <Row>
              <BootstrapTable
                pagination={false}
                options={options}
                data={row.costRegistrationModel}
                selectRow={selectRow}
                headerStyle={{ background: "#5599FF" }}
                trClassName={this.rowClassNameFormat}
                condensed
              >
                <TableHeaderColumn isKey={true} dataField="rowNo" hidden>
                  番号
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="costClassificationCode"
                  width="10%"
                  dataFormat={this.costClassificationCodeFormat.bind(this)}
                >
                  種別
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="happendDate"
                  width="30%"
                  dataFormat={this.happendDateFormat.bind(this)}
                >
                  日付・回数
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="cost"
                  width="15%"
                  dataFormat={this.cost.bind(this)}
                >
                  費用
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="costFile"
                  width="10%"
                  dataFormat={this.costFileFormat.bind(this)}
                >
                  添付
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="costTotal"
                  width="15%"
                  dataFormat={this.costTotalFormat.bind(this)}
                >
                  合計
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="remark"
                  width="20%"
                  dataFormat={this.remarkFormat.bind(this)}
                >
                  備考
                </TableHeaderColumn>
              </BootstrapTable>
            </Row>
          </div>
        }
        title=""
        trigger="click"
      >
        <div style={{ float: "right" }}>
          <Button variant="warning" size="sm">
            詳細
          </Button>
        </div>
      </Popover>
    );
    if (row.costRegistrationModel.length > 0)
      return (
        <div>
          {publicUtils.addComma(cell)} {returnItem}
        </div>
      );
    else return "";
  };

  getFile = () => {
    $("#getFile").click();
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
      fileName[fileName.length - 1] === "pdf"
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
      attendanceYearAndMonth: publicUtils.formateDate(
        this.state.yearAndMonth,
        false
      ),
    };
    formData.append("emp", JSON.stringify(emp));
    formData.append("workRepotFile", $("#getFile").get(0).files[0]);
    axios
      .post(this.state.serverIP + "workRepot/updateWorkRepotFile", formData)
      .then((response) => {
        if (response.data != null) {
          this.searchDutyManagement();
          this.setState({ myToastShow: true, message: "アップロード成功！" });
          setTimeout(() => this.setState({ myToastShow: false }), 3000);
        } else {
          notification.error({
            message: "エラー",
            description: "アップロード失敗",
            placement: "topLeft",
          });
        }
      });
  };

  renderTimeRow = () => {
    return (
      <div className="df mb5" style={this.state.styleObj}>
        <InputGroup className="mr5 " size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text id="sixKanji" className="input-group-indiv">
              最小稼働時間
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            className="w70"
            defaultValue={this.state.minWorkingTime}
            disabled
          />
        </InputGroup>
        <InputGroup className="mr5" size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text id="sixKanji" className="input-group-indiv">
              最大稼働時間
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            className="w70"
            defaultValue={this.state.totalWorkingTime}
            disabled
          />
        </InputGroup>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text id="sixKanji" className="input-group-indiv">
              平均稼働時間
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            className="w70"
            defaultValue={this.state.averageWorkingTime}
            disabled
          />
        </InputGroup>
      </div>
    );
  };

  render() {
    const {
      approvalStatus,
      employeeList,
      customerAbbreviationList,
      employeeStatusS,
    } = this.state;

    console.log(
      {
        state: this.state,
        propsState: this.props.location.state,
      },
      "render"
    );

    //　テーブルの行の選択
    const selectRow = {
      mode: "radio",
      bgColor: "pink",
      clickToSelectAndEditCell: true,
      hideSelectColumn: true,
      clickToSelect: true, // click to select, default is false
      clickToExpand: true, // click to expand row, default is false
      onSelect: this.handleRowSelect,
      selected: this.state.rowSelectEmployeeNo
        ? [this.state.rowSelectEmployeeNo]
        : [],
    };
    //　 テーブルの定義
    const options = {
      // page: 1,
      onPageChange: (page) => {
        this.setState({ currentPage: page });
      },
      page: this.state.currentPage,
      sizePerPage: SIZE_PRE_PAGE, // which size per page you want to locate as default
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
    const cellEdit = {
      mode: "click",
      blurToSave: true,
    };

    let customerNoList = employeeList?.map((item) => item.customerNo);
    let filteredCustomerAbbreviationList = customerAbbreviationList.filter(
      (item) => customerNoList.includes(item.code)
    );

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
          id="rowSelectEmployeeNo"
          name="rowSelectEmployeeNo"
          hidden
        />
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
                  <h2>社員勤務管理</h2>
                </Col>
              </Row>
            </Form.Group>
            <Form.Group>
              <Row>
                <Col sm={2}>
                  <InputGroup size="sm" className="mb-2 flexWrapNoWrap">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="inputGroup-sizing-sm">
                        年月
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <DatePicker
                      selected={this.state.yearAndMonth}
                      onChange={this.inactiveYearAndMonth}
                      autoComplete="off"
                      locale="ja"
                      dateFormat="yyyy/MM"
                      showMonthYearPicker
                      showFullMonthYearPicker
                      maxDate={new Date()}
                      id="datePicker"
                      className="form-control form-control-sm"
                    />
                  </InputGroup>
                </Col>
                <Col sm={2}>
                  <InputGroup size="sm" className="mb-2 flexWrapNoWrap">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="sixKanji">
                        ステータス
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      id="approvalStatus"
                      as="select"
                      size="sm"
                      onChange={this.approvalStatusChange}
                      style={{ width: "30px" }}
                      name="approvalStatus"
                      value={approvalStatus}
                      autoComplete="off"
                    >
                      <option value="0">すべて</option>
                      <option value="1">未登録</option>
                      <option value="2">登録済</option>
                      <option value="3">未承認</option>
                      <option value="4">承認済</option>
                    </Form.Control>
                  </InputGroup>
                </Col>
                <Col sm={2}>
                  <InputGroup size="sm" className="mb-3 flexWrapNoWrap">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="inputGroup-sizing-sm">
                        社員区分
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      as="select"
                      size="sm"
                      onChange={(event) => this.employeeStatusChange(event)}
                      name="employeeStatus"
                      value={this.state.employeeStatus}
                      autoComplete="off"
                    >
                      <option key="all" value="-1">
                        すべて
                      </option>
                      {employeeStatusS.length > 0
                        ? employeeStatusS.map((date) => (
                            <option key={date.code} value={date.code}>
                              {date.name}
                            </option>
                          ))
                        : null}
                    </Form.Control>
                    <font className="site-mark"></font>
                  </InputGroup>
                </Col>
                <Col sm={3}>
                  <InputGroup size="sm" className="mb-3">
                    <InputGroup.Prepend>
                      <InputGroup.Text id="fiveKanji">
                        社員名(BP)
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Autocomplete
                      className="fx1"
                      id="employeeName"
                      name="employeeName"
                      value={
                        this.state.employeeInfo.find(
                          (v) => v.text === this.state.employeeName
                        ) || {}
                      }
                      options={this.state.employeeInfo}
                      getOptionLabel={(option) => option.name || ""}
                      // onSelect={(event) =>
                      //   this.handleTag(event, "employeeName")
                      // }
                      onChange={(event, values) =>
                        this.getEmployeeName(event, values)
                      }
                      renderOption={(option) => {
                        return (
                          <React.Fragment>{option.name || ""}</React.Fragment>
                        );
                      }}
                      renderInput={(params) => (
                        <div ref={params.InputProps.ref}>
                          <input
                            type="text"
                            {...params.inputProps}
                            className="auto form-control Autocompletestyle-siteInfoSearch-employeeNo w100p"
                          />
                        </div>
                      )}
                    />
                  </InputGroup>
                </Col>
                <Col sm={3}>
                  <InputGroup size="sm" className="mb-3 flexWrapNoWrap">
                    <InputGroup.Prepend>
                      <InputGroup.Text className="width-auto" id="sanKanji">
                        お客様
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Autocomplete
                      id="customerAbbreviation"
                      name="customerAbbreviation"
                      value={
                        filteredCustomerAbbreviationList.find(
                          (v) => v.code === this.state.customerAbbreviation
                        ) || ""
                      }
                      options={filteredCustomerAbbreviationList}
                      getOptionLabel={(option) =>
                        option.text ? option.text : ""
                      }
                      onChange={(event, values) =>
                        this.getCustomer(event, values)
                      }
                      renderOption={(option) => {
                        return (
                          <React.Fragment>{option.name || ""}</React.Fragment>
                        );
                      }}
                      renderInput={(params) => (
                        <div ref={params.InputProps.ref}>
                          <input
                            type="text"
                            {...params.inputProps}
                            className="auto form-control Autocompletestyle-dutyManagement"
                          />
                        </div>
                      )}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Form.Group>
          </div>
        </Form>
        <div>
          {this.state.innerWidth > MIN_WIDTH ? null : (
            <Row>{this.renderTimeRow()} </Row>
          )}

          <Row>
            <Col>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  {/*<font style={{ whiteSpace: 'nowrap' }}>稼動人数：{this.state.totalPersons}</font>*/}
                  <Button
                    size="sm"
                    onClick={this.shuseiTo.bind(this, "employeeInfo")}
                    disabled={
                      this.state.rowSelectEmployeeNo === "" ? true : false
                    }
                    variant="info"
                    id="employeeInfo"
                  >
                    個人情報
                  </Button>{" "}
                  <Button
                    size="sm"
                    onClick={this.shuseiTo.bind(this, "siteInfo")}
                    disabled={
                      this.state.rowSelectEmployeeNo === "" ? true : false
                    }
                    name="clickButton"
                    variant="info"
                    id="siteInfo"
                  >
                    現場情報
                  </Button>{" "}
                  <Button
                    size="sm"
                    onClick={this.shuseiTo.bind(this, "workRepot")}
                    disabled={
                      this.state.rowSelectEmployeeNo === "" ? true : false
                    }
                    hidden={this.state.authorityCode === "4" ? false : true}
                    name="clickButton"
                    variant="info"
                    id="workRepot"
                  >
                    勤務管理
                  </Button>{" "}
                  <Button
                    size="sm"
                    onClick={() => {
                      if (
                        this.state.rowSelectEmployeeNo &&
                        this.state?.rowApprovalStatus + "" !== "1"
                      ) {
                        message.info(
                          `まず${this.state.rowSelectEmployeeName}のデータを承認してください！`
                        );
                        return;
                      }
                      this.shuseiTo("sendInvoice");
                    }}
                    name="clickButton"
                    variant="info"
                    id="siteInfo"
                  >
                    請求書一覧
                  </Button>{" "}
                </div>
                {this.state.innerWidth > MIN_WIDTH
                  ? this.renderTimeRow()
                  : null}
                <div>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={this.downloadTest}
                    id="workRepot"
                    disabled={
                      this.state.rowWorkTime === null ||
                      (this.state.rowSelectEmployeeNo.includes("BP") &&
                        this.state.rowSelectWorkingTimeReport === null)
                    }
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    報告書
                  </Button>{" "}
                  <Button
                    variant="info"
                    size="sm"
                    id="upload"
                    onClick={this.getFile}
                  >
                    <FontAwesomeIcon icon={faUpload} />
                    upload
                  </Button>{" "}
                  <Button
                    variant="info"
                    size="sm"
                    id="update"
                    onClick={this.listApproval.bind(this, 2)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    残控更新
                  </Button>{" "}
                  <Button
                    variant="info"
                    size="sm"
                    id="syounin"
                    onClick={
                      this.state.rowApprovalStatus !== "1"
                        ? this.listApproval.bind(this, 1)
                        : this.listApproval.bind(this, 0)
                    }
                    // disable={!this.state.rowWorkTime}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    {this.state.rowApprovalStatus !== "1" ? "承認" : "取消"}
                  </Button>{" "}
                </div>
              </div>
            </Col>
          </Row>

          <Col>
            <BootstrapTable
              data={employeeList}
              ref="table"
              selectRow={selectRow}
              pagination={true}
              cellEdit={cellEdit}
              options={options}
              approvalRow
              headerStyle={{ background: "#5599FF" }}
              striped
              hover
              condensed

              // tdStyle={{ padding: ".45em" }}
            >
              <TableHeaderColumn
                width="55"
                dataFormat={this.greyShow.bind(this)}
                dataField="rowNo"
                editable={false}
                // hidden
              >
                番号
              </TableHeaderColumn>
              <TableHeaderColumn
                width="90"
                dataFormat={this.greyShow.bind(this)}
                dataField="employeeNo"
                isKey
                hidden
              >
                社員番号
              </TableHeaderColumn>
              <TableHeaderColumn
                width="150"
                dataField="employeeName"
                editable={false}
                dataFormat={this.employeeNameFormat.bind(this)}
              >
                氏名
              </TableHeaderColumn>
              <TableHeaderColumn
                width="150"
                dataFormat={this.greyShow.bind(this)}
                dataField="customerName"
                editable={false}
              >
                お客様
              </TableHeaderColumn>
              <TableHeaderColumn
                width="120"
                dataFormat={this.greyShow.bind(this)}
                dataField="stationName"
                editable={false}
              >
                場所
              </TableHeaderColumn>
              <TableHeaderColumn
                width="95"
                dataFormat={this.greyShow.bind(this)}
                dataField="payOffRange"
                editable={false}
              >
                精算範囲
              </TableHeaderColumn>
              <TableHeaderColumn
                width="90"
                dataField="workTime"
                dataFormat={this.workTimeFormat.bind(this)}
                editable={false}
              >
                稼働時間
              </TableHeaderColumn>
              <TableHeaderColumn
                width="125"
                hidden={this.state.authorityCode === "4" ? false : true}
                dataField="deductionsAndOvertimePay"
                editable={
                  !(
                    this.state.rowWorkTime === "" ||
                    this.state.rowWorkTime === null
                  ) && this.state.rowApprovalStatus !== "1"
                }
                editColumnClassName="dutyRegistration-DataTableEditingCell"
                dataFormat={this.overtimePayFormat.bind(this)}
              >
                残業/控除
              </TableHeaderColumn>
              <TableHeaderColumn
                width="110"
                dataField="deductionsAndOvertimePayOfUnitPrice"
                editable={
                  !(
                    this.state.rowWorkTime === "" ||
                    this.state.rowWorkTime === null
                  ) && this.state.rowApprovalStatus !== "1"
                }
                editColumnClassName="dutyRegistration-DataTableEditingCell"
                dataFormat={this.overtimePayFormat.bind(this)}
              >
                残業/控除(客)
              </TableHeaderColumn>
              <TableHeaderColumn
                width="110"
                dataFormat={this.checkSection.bind(this)}
                hidden
                dataField="checkSection"
                editable={false}
              >
                確認区分
              </TableHeaderColumn>
              <TableHeaderColumn
                width="120"
                dataField="cost"
                dataFormat={this.costFormat.bind(this)}
                editable={false}
              >
                費用
              </TableHeaderColumn>
              <TableHeaderColumn
                width="160"
                dataField="updateTime"
                dataFormat={this.updateTimeFormat.bind(this)}
                editable={false}
              >
                更新日付
              </TableHeaderColumn>
              <TableHeaderColumn
                width="110"
                dataFormat={this.approvalStatus.bind(this)}
                dataField="approvalStatus"
                editable={false}
              >
                ステータス
              </TableHeaderColumn>
            </BootstrapTable>
          </Col>
        </div>
        <div className="loadingImageContainer">
          <div className="loadingImage" hidden={this.state.loading}>
            <Form.File
              id="getFile"
              custom
              hidden="hidden"
              onChange={this.workRepotUpload}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default dutyManagement;
