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
  faSave,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import * as publicUtils from "./utils/publicUtils.js";
import store from "./redux/store";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { notification, message, Modal } from "antd";
axios.defaults.withCredentials = true;

/**
 * 作業報告書登録画面
 */
class dataShareEmployee extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState; // 初期化
    this.valueChange = this.valueChange.bind(this);
  }
  componentDidMount() {
    this.getLoginUserInfo();
    this.searchData();
  }

  getLoginUserInfo = () => {
    axios
      .post(this.state.serverIP + "sendLettersConfirm/getLoginUserInfo")
      .then((result) => {
        this.setState({
          loginUserInfo: result.data,
        });
      })
      .catch(function (error) {
        //alert(error);
      });
  };

  // onchange
  valueChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  dataStatusChange = (event) => {
    this.refs.table.setState({
      selectedRowKeys: [],
    });
    this.setState(
      {
        [event.target.name]: event.target.value,
      },
      () => {
        this.searchData();
      }
    );
  };

  // 初期化データ
  initialState = {
    dataShareList: [],
    currentPage: 1,
    dataStatus: "0",
    addDisabledFlag: false,
    rowClickFlag: true,
    rowNo: "",
    rowFilePath: "",
    rowShareStatus: "",
    shareStatusAll: [
      { code: "0", value: "upload済み" },
      { code: "1", value: "共有済み" },
      { code: "2", value: "upload済み" },
      { code: "3", value: "承認済み" },
    ],
    serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
  };

  searchData = () => {
    const formData = new FormData();
    const emp = {};
    formData.append("emp", JSON.stringify(emp));
    formData.append("dataStatus", this.state.dataStatus);
    axios
      .post(this.state.serverIP + "dataShare/selectDataShareFileOnly", formData)
      .then((response) => response.data)
      .then((data) => {
        if (data.length != 0) {
          for (var i = 0; i < data.length; i++) {
            if (data[i].filePath != null) {
              let fileNames = data[i].filePath.split("/");
              data[i].fileName = fileNames[fileNames.length - 1];
              data[i].rowNo = i + 1;
            }
          }
        }
        this.setState({
          dataShareList: data,
          addDisabledFlag: false,
          rowShareStatus: "",
          rowChangeFlag: false,
          rowClickFlag: true,
        });
      });
  };

  // 行Selectファンクション
  handleRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      this.setState({
        rowNo: row.rowNo,
        fileNo: row.fileNo,
        rowFilePath: row.filePath,
        rowShareStatus: row.shareStatus,
        rowChangeFlag: row.changeFlag,
      });
      if (
        row.shareUser === "" ||
        (row.shareUser ===
          this.state.loginUserInfo[0].employeeFristName +
            this.state.loginUserInfo[0].employeeLastName &&
          row.shareStatus === "2")
      ) {
        this.setState({
          rowClickFlag: false,
        });
      } else {
        this.setState({
          rowClickFlag: true,
        });
      }
    } else {
      this.setState({
        rowNo: "",
        fileNo: "",
        rowFilePath: "",
        rowShareStatus: "",
        rowClickFlag: true,
        rowChangeFlag: false,
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

  shareStatus(code) {
    if (code === null || code === "") return;
    let shareStatusAll = this.state.shareStatusAll;
    for (var i in shareStatusAll) {
      if (code === shareStatusAll[i].code) {
        return shareStatusAll[i].value;
      }
    }
  }

  /**
   * 行追加
   */
  insertRow = () => {
    var dataShareList = this.state.dataShareList;
    var dataShareModel = {};
    if (dataShareList.length > 0) {
      dataShareModel["rowNo"] = dataShareList.length + 1;
    } else {
      dataShareModel["rowNo"] = 1;
    }
    dataShareModel["fileNo"] = "";
    dataShareModel["fileName"] = "";
    dataShareModel["shareUser"] = "";
    dataShareModel["updateTime"] = "";
    dataShareModel["shareStatus"] = "";

    dataShareList.push(dataShareModel);
    var currentPage = Math.ceil(dataShareList.length / 10);
    this.setState({
      dataShareList: dataShareList,
      currentPage: currentPage,
      rowClickFlag: false,
      rowNo: dataShareList.length,
      fileNo: "",
      rowShareStatus: "",
      addDisabledFlag: true,
    });
    this.refs.table.setState({
      selectedRowKeys: [dataShareList.length],
    });
  };

  downLoad = () => {
    let fileKey = "";
    let downLoadPath = "";
    if (this.state.rowFilePath !== null) {
      let path = this.state.rowFilePath.replace(/\\/g, "/");
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
        notification.error({
          message: "エラー",
          description: "ファイルが存在しません",
          placement: "topLeft",
        });
      });
  };

  getFile = () => {
    $("#getFile").click();
  };

  /**
   * uploadボタン
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
    const formData = new FormData();
    const emp = {};
    formData.append("emp", JSON.stringify(emp));
    formData.append("dataShareFile", $("#getFile").get(0).files[0]);
    formData.append("fileNo", this.state.fileNo);
    formData.append("shareStatus", "2");

    axios
      .post(this.state.serverIP + "dataShare/updateDataShareFile", formData)
      .then((response) => {
        if (response.data != null) {
          this.searchData();
          message.success("アップロード成功！");
        } else {
          notification.error({
            message: "エラー",
            description: "アップロード失敗",
            placement: "topLeft",
          });
        }
      });
  };

  dataDelete = () => {
    Modal.confirm({
      title: "削除していただきますか？",
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        var model = {};
        model["fileNo"] = this.state.fileNo;
        axios
          .post(this.state.serverIP + "dataShare/deleteDataShare", model)
          .then((response) => {
            if (response.data != null) {
              this.setState(
                {
                  rowNo: "",
                  fileNo: "",
                  rowShareStatus: "",
                },
                () => {
                  this.refs.table.setState({
                    selectedRowKeys: [],
                  });
                  this.searchData();
                }
              );
              message.success("削除成功！");
              this.setState({
                rowClickFlag: true,
              });
            } else {
              notification.error({
                message: "エラー",
                description: "削除失敗",
                placement: "topLeft",
              });
            }
          });
      },
    });
  };

  //onChange
  tableValueChange = (event, cell, row) => {
    let dataShareList = this.state.dataShareList;
    dataShareList[row.rowNo - 1][event.target.name] = event.target.value;

    this.setState({
      dataShareList: dataShareList,
    });
  };

  fileNameChange = () => {
    let dataShareList = this.state.dataShareList;
    dataShareList[this.state.rowNo - 1].changeFlag = true;
    this.setState({
      dataShareList: dataShareList,
      rowChangeFlag: true,
    });
  };

  fileNameReset = () => {
    if (
      this.state.dataShareList[this.state.rowNo - 1].fileName === null ||
      this.state.dataShareList[this.state.rowNo - 1].fileName === ""
    ) {
      message.error("ファイル名を入力してください。");
      return;
    }

    var model = {};
    model["fileNo"] = this.state.fileNo;
    model["fileName"] = this.state.dataShareList[this.state.rowNo - 1].fileName;
    model["filePath"] = this.state.dataShareList[this.state.rowNo - 1].filePath;

    axios
      .post(this.state.serverIP + "dataShare/updateFileName", model)
      .then((response) => {
        if (response.data != null && response.data.flag) {
          this.setState(
            {
              rowFilePath: response.data.newFilePath,
              rowChangeFlag: false,
            },
            () => {
              this.searchData();
            }
          );
          message.success("更新成功！");
        } else {
          notification.error({
            message: "エラー",
            description: "更新失敗",
            placement: "topLeft",
          });
        }
      });
  };

  fileNameFormat = (cell, row) => {
    if (row.changeFlag) {
      return (
        <span class="dutyRegistration-DataTableEditingCell">
          <input
            type="text"
            class=" form-control editor edit-text"
            name="fileName"
            value={cell}
            onChange={(event) => this.tableValueChange(event, cell, row)}
          />
        </span>
      );
    } else {
      return cell;
    }
  };

  render() {
    const { dataShareList } = this.state;
    // テーブルの行の選択
    const selectRow = {
      mode: "radio",
      bgColor: "pink",
      clickToSelectAndEditCell: true,
      hideSelectColumn: true,
      clickToExpand: true, // click to expand row, default is false
      onSelect: this.handleRowSelect,
    };
    // テーブルの定義
    const options = {
      page: this.state.currentPage,
      sizePerPage: 10, // which size per page you want to locate as
      // default
      pageStartIndex: 1, // where to start counting the pages
      paginationSize: 3, // the pagination bar size.
      prePage: "<", // Previous page button text
      nextPage: ">", // Next page button text
      firstPage: "<<", // First page button text
      lastPage: ">>", // Last page button text
      paginationShowsTotal: this.renderShowsTotal, // Accept bool or
      // function
      hideSizePerPage: true, // > You can hide the dropdown for
      // sizePerPage
      expandRowBgColor: "rgb(165, 165, 165)",
      approvalBtn: this.createCustomApprovalButton,
      onApprovalRow: this.onApprovalRow,
      handleConfirmApprovalRow: this.customConfirm,
    };
    return (
      <div>
        <Form>
          <div>
            <Form.Group>
              <Row inline="true">
                <Col className="text-center">
                  <h2>共有ファイル</h2>
                </Col>
              </Row>
            </Form.Group>
          </div>
        </Form>
        <div>
          <Form.File
            id="getFile"
            accept="application/pdf,application/vnd.ms-excel"
            custom
            hidden="hidden"
            onChange={this.workRepotUpload}
          />
          <Row>
            <Col sm={3}>
              <InputGroup size="sm" className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text id="fourKanji">共有区分</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  id="dataStatus"
                  as="select"
                  size="sm"
                  onChange={this.dataStatusChange}
                  name="dataStatus"
                  value={this.state.dataStatus}
                  autoComplete="off"
                >
                  <option value="0">すべて</option>
                  <option value="1">個人</option>
                  <option value="2">会社</option>
                </Form.Control>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={6}>
              <div>
                <Button
                  variant="info"
                  size="sm"
                  title="複数のファイルは一つのzip化にしてください。"
                  onClick={this.getFile}
                  id="workRepotUpload"
                  disabled={this.state.rowClickFlag}
                >
                  <FontAwesomeIcon icon={faUpload} />
                  Upload
                </Button>{" "}
                <Button
                  variant="info"
                  size="sm"
                  onClick={
                    this.state.rowChangeFlag
                      ? this.fileNameReset
                      : this.fileNameChange
                  }
                  disabled={
                    this.state.rowClickFlag || this.state.rowShareStatus === ""
                  }
                >
                  <FontAwesomeIcon icon={faUpload} />
                  {this.state.rowChangeFlag
                    ? "ファイル名更新"
                    : "ファイル名修正"}
                </Button>
              </div>
            </Col>
            <Col sm={6}>
              <div style={{ float: "right" }}>
                <Button
                  variant="info"
                  size="sm"
                  id="revise"
                  onClick={this.insertRow}
                  disabled={
                    this.state.addDisabledFlag || this.state.dataStatus === "2"
                  }
                >
                  <FontAwesomeIcon icon={faSave} /> 追加
                </Button>{" "}
                <Button
                  variant="info"
                  size="sm"
                  onClick={this.downLoad}
                  id="workRepotDownload"
                  disabled={this.state.rowShareStatus === ""}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </Button>{" "}
                <Button
                  variant="info"
                  size="sm"
                  id="revise"
                  onClick={this.dataDelete}
                  disabled={this.state.rowClickFlag}
                >
                  <FontAwesomeIcon icon={faTrash} /> 削除
                </Button>{" "}
              </div>
            </Col>
          </Row>
          <Col>
            <BootstrapTable
              data={dataShareList}
              pagination={true}
              ref="table"
              options={options}
              approvalRow
              selectRow={selectRow}
              headerStyle={{ background: "#5599FF" }}
              striped
              hover
              condensed
            >
              <TableHeaderColumn
                width="10%"
                tdStyle={{ padding: ".45em" }}
                dataField="rowNo"
                isKey
              >
                番号
              </TableHeaderColumn>
              <TableHeaderColumn
                width="40%"
                tdStyle={{ padding: ".45em" }}
                dataField="fileName"
                dataFormat={this.fileNameFormat}
              >
                ファイル名
              </TableHeaderColumn>
              <TableHeaderColumn
                width="20%"
                tdStyle={{ padding: ".45em" }}
                dataField="shareUser"
              >
                共有者
              </TableHeaderColumn>
              <TableHeaderColumn
                width="20%"
                tdStyle={{ padding: ".45em" }}
                dataField="updateTime"
              >
                日付
              </TableHeaderColumn>
              <TableHeaderColumn
                width="10%"
                tdStyle={{ padding: ".45em" }}
                dataFormat={this.shareStatus.bind(this)}
                dataField="shareStatus"
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
export default dataShareEmployee;
