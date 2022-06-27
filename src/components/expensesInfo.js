import React, { Component } from 'react';
import { Row, Form, Col, InputGroup, Button, FormControl, OverlayTrigger, Tooltip } from 'react-bootstrap';
import MyToast from './myToast';
import $ from 'jquery';
import ErrorsMessageToast from './errorsMessageToast';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker, { registerLocale } from "react-datepicker"
import ja from 'date-fns/locale/ja';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import * as utils from './utils/publicUtils.js';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import store from './redux/store';

registerLocale('ja', ja);
axios.defaults.withCredentials = true;
/**
 * 諸費用画面
 */
class ExpensesInfo extends Component {
    constructor(props) {
        super(props);
        this.state = this.initialState;//初期化
    }
    initialState = {
        employeeNo: '',//社員番号
        expensesReflectStartDate: '',//反映年月開始年月
        expensesReflectYearAndMonth: '',//反映年月
        transportationExpenses: '',//交通費
        otherAllowanceName: '',//他の手当名称
        otherAllowanceAmount: '',//他の手当
        leaderAllowanceAmount: '',//リーダー手当
        totalExpenses: '',//住宅ステータス
        introductionAllowance: '',//住宅手当
        message: '',//toastのメッセージ
        type: '',//成功や失敗
        myToastShow: false,//toastのフラグ
        errorsMessageShow: false,///エラーのメッセージのフラグ
        errorsMessageValue: '',//エラーのメッセージ
        actionType: 'insert',//処理区分
        expensesInfoModels: [],//諸費用履歴
        btnText: '登録',//ボタン文字
        kadouCheck: true,//稼働フラグ
        relatedEmployees: '',//要員
        leaderCheck: false,//リーダーフラグ
        siteRoleCode: '',//役割
        remark: '', //備考
        deleteFlag: true,
        serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],//劉林涛　テスト
    }
    componentDidMount() {
    	this.getExpensesInfoModels(this.props.employeeNo,this.props.period);
        this.setState({
            employeeNo: this.props.employeeNo,
            //expensesInfoModels: this.props.expensesInfoModels,
            kadouCheck: this.props.kadouCheck,
            leaderCheck: this.props.leaderCheck,
            actionType:this.props.actionType,
        })
        if(this.props.relatedEmployees !== null && this.props.relatedEmployees !== undefined){
            if(this.props.relatedEmployees[0] !== null && this.props.relatedEmployees[0] !== undefined){
                this.setState({
                    relatedEmployees: this.props.relatedEmployees[0].relatedEmployees,
                })
            }
        }
        if (this.props.expensesInfoModel !== null) {
            this.giveValue(this.props.expensesInfoModel);
            this.setState({
                actionType: 'update',
            })
        }
    }
    
    getExpensesInfoModels = (employeeNo,period) => {
        var expensesInfoModel = {};
        expensesInfoModel["employeeNo"] = employeeNo;
        expensesInfoModel["expensesReflectYearAndMonth"] = period;
        axios.post(this.state.serverIP + "expensesInfo/getExpensesInfoModels", expensesInfoModel)
        .then(result => {
            if (result.data.errorsMessage === null || result.data.errorsMessage === undefined) {
                this.setState({ expensesInfoModels: result.data.expensesInfoModels });
            } else {
                this.setState({ "errorsMessageShow": true, errorsMessageValue: result.data.errorsMessage });
            }
        })
        .catch(error => {
            this.setState({ "errorsMessageShow": true, errorsMessageValue: "エラーが発生してしまいました、画面をリフレッシュしてください" });
        });
    }
    
    /**
     * 昇給期日の変化
     */
    expensesReflectStartDateChange = date => {
        if (date !== null) {
            this.setState({
                expensesReflectStartDate: date,
            });
        } else {
            this.setState({
                expensesReflectStartDate: '',
            });
        }
    };
    /**
     * 値を設定
     */
    giveValue = (expensesInfoMod) => {
        this.setState({
            expensesReflectStartDate: utils.converToLocalTime(expensesInfoMod.expensesReflectYearAndMonth, false),
            transportationExpenses: expensesInfoMod.transportationExpenses,
            otherAllowanceName: expensesInfoMod.otherAllowanceName,
            otherAllowanceAmount: expensesInfoMod.otherAllowanceAmount,
            leaderAllowanceAmount: expensesInfoMod.leaderAllowanceAmount,
            totalExpenses: expensesInfoMod.totalExpenses,
            introductionAllowance: expensesInfoMod.introductionAllowance,
            remark: expensesInfoMod.remark,
        })
    }
    /**
     * 値をリセット
     */
    resetValue = () => {
        this.setState({
            expensesReflectStartDate: '',
            transportationExpenses: '',
            otherAllowanceName: '',
            otherAllowanceAmount: '',
            leaderAllowanceAmount: '',
            totalExpenses: '',
            introductionAllowance: '',
            remark: '',
        })
    }
    //onchange
    valueChange = event => {
        this.setState({
            [event.target.name]: event.target.value,
        })
    }
    //onchange(金額)
    valueChangeMoney = event => {
        var name = event.target.name;
        var value = event.target.value;
        this.setState({
            [event.target.name]: event.target.value,
        }, () => {
            this.totalKeisan();
            this.setState({
                [name]: utils.addComma(value)
            });
        }
        )
    }
    expensesInfoToroku() {
        var expensesInfoModel = {};
        var formArray = $("#expensesInfoForm").serializeArray();
        $.each(formArray, function (i, item) {
            expensesInfoModel[item.name] = item.value;
        });
        expensesInfoModel["transportationExpenses"] = utils.deleteComma(this.state.transportationExpenses);
        expensesInfoModel["leaderAllowanceAmount"] = utils.deleteComma(this.state.leaderAllowanceAmount);
        expensesInfoModel["otherAllowanceAmount"] = utils.deleteComma(this.state.otherAllowanceAmount);
        expensesInfoModel["introductionAllowance"] = utils.deleteComma(this.state.introductionAllowance);
        expensesInfoModel["totalExpenses"] = utils.deleteComma(this.state.totalExpenses);
        expensesInfoModel["actionType"] = this.state.actionType;
        expensesInfoModel["employeeNo"] = this.state.employeeNo;
        expensesInfoModel["remark"] = this.state.remark;
        expensesInfoModel["expensesReflectYearAndMonth"] = utils.formateDate(this.state.expensesReflectStartDate, false);
        axios.post(this.state.serverIP + "expensesInfo/toroku", expensesInfoModel)
            .then(result => {
                if (result.data.errorsMessage === null || result.data.errorsMessage === undefined) {
                    this.setState({ "myToastShow": true, "type": "success", "errorsMessageShow": false, message: result.data.message });
                    setTimeout(() => this.setState({ "myToastShow": false }), 3000);
                    var seikou = "success";
                	this.getExpensesInfoModels(this.props.employeeNo,this.props.period);
                    this.props.expensesInfoToroku(seikou);
                } else {
                    this.setState({ "errorsMessageShow": true, errorsMessageValue: result.data.errorsMessage });
                }
            })
            .catch(error => {
                this.setState({ "errorsMessageShow": true, errorsMessageValue: "エラーが発生してしまいました、画面をリフレッシュしてください" });
            });
    }

    /**
     * 行Selectファンクション
     */
    handleRowSelect = (row, isSelected, e) => {
        if (isSelected) {
            if (row.expensesPeriod.length <= 7) {
                this.giveValue(row);
                this.setState({
                	deleteFlag: false,
                    actionType: 'update',
                    btnText: '更新',
                })
            } else {
                this.resetValue();
                this.setState({
                	deleteFlag: true,
                    actionType: 'insert',
                    btnText: '登録',
                })
            }
        } else {
            this.resetValue();
            this.setState({
            	deleteFlag: true,
                actionType: 'insert',
                btnText: '登録',
            })
        }
    }
    renderShowsTotal(start, to, total) {
        return (
            <p style={{ color: 'dark', "float": "left", "display": total > 0 ? "block" : "none" }}  >
                {start}から  {to}まで , 総計{total}
            </p>
        );
    }
    totalKeisan=()=>{
        var sum = 0;
        var transportationExpenses = utils.deleteComma(this.state.transportationExpenses);
        var leaderAllowanceAmount = utils.deleteComma(this.state.leaderAllowanceAmount);
        var otherAllowanceAmount = utils.deleteComma(this.state.otherAllowanceAmount);
        var introductionAllowance = utils.deleteComma(this.state.introductionAllowance);

        sum = sum + parseInt((transportationExpenses === '' ? 0 : transportationExpenses))+ parseInt((leaderAllowanceAmount === '' ? 0 : leaderAllowanceAmount))
        + parseInt((otherAllowanceAmount === '' ? 0 : otherAllowanceAmount))+ parseInt((introductionAllowance === '' ? 0 : introductionAllowance));
        var totalExpenses = (isNaN(sum) ? '' : (sum === 0 ? '' : sum));
        this.setState({
            totalExpenses: utils.addComma(totalExpenses),
        })
    }
    delete=()=>{
        var a = window.confirm("削除していただきますか？");
        if (a) {
            var deleteMod = {};
            deleteMod["employeeNo"] = this.state.employeeNo;
            deleteMod["expensesReflectYearAndMonth"] = utils.formateDate(this.state.expensesReflectStartDate);
            axios.post(this.state.serverIP + "expensesInfo/delete", deleteMod)
                .then(result => {
                    if (result.data.errorsMessage === null || result.data.errorsMessage === undefined) {
                        this.setState({ "myToastShow": true, "type": "success", "errorsMessageShow": false, message: "削除成功",actionType: 'insert', });
                        setTimeout(() => this.setState({ "myToastShow": false }), 3000);
                        var expensesInfoMod = {};
                        expensesInfoMod["employeeNo"] = this.state.employeeNo;
                        var seikou = "success";
                    	this.getExpensesInfoModels(this.props.employeeNo,this.props.period);
                        this.props.expensesInfoToroku(seikou);
                    } else {
                        this.setState({ "errorsMessageShow": true, errorsMessageValue: result.data.errorsMessage });
                        setTimeout(() => this.setState({ "errorsMessageShow": false }), 3000);
                    }
                })
                .catch(error => {
                    this.setState({ "errorsMessageShow": true, errorsMessageValue: "エラーが発生してしまいました、画面をリフレッシュしてください" });
                });
        }
    }
    addMarkTransportationExpenses = (cell, row) => {
        let transportationExpenses = utils.addComma(row.transportationExpenses);
        return transportationExpenses;
    }
    addMarkLeaderAllowanceAmount = (cell, row) => {
        let leaderAllowanceAmount = utils.addComma(row.leaderAllowanceAmount);
        return leaderAllowanceAmount;
    }
    addMarkintroductionAllowance = (cell, row) => {
        let introductionAllowance = utils.addComma(row.introductionAllowance);
        return introductionAllowance;
    }
    addMarkOtherAllowanceAmount = (cell, row) => {
        let otherAllowanceAmount = utils.addComma(row.otherAllowanceAmount);
        return otherAllowanceAmount;
    }
    render() {
        const {
            transportationExpenses,
            otherAllowanceName,
            otherAllowanceAmount,
            leaderAllowanceAmount,
            introductionAllowance,
            message,
            type,
            totalExpenses,
            errorsMessageValue,
            actionType,
            expensesInfoModels,
            btnText,
            kadouCheck,
            leaderCheck,
            relatedEmployees,
            deleteFlag,
            remark} = this.state;
        //テーブルの列の選択
        const selectRow = {
            mode: 'radio',
            bgColor: 'pink',
            hideSelectColumn: true,
            clickToSelect: true,  // click to select, default is false
            clickToExpand: true,// click to expand row, default is false
            onSelect: this.handleRowSelect,
        };
        //テーブルの列の選択(詳細)
        const selectRowDetail = {
        };
        //テーブルの定義
        const options = {
            noDataText: (<i>データなし</i>),
            page: 1,  // which page you want to show as default
            sizePerPage: 5,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: '<', // Previous page button text
            nextPage: '>', // Next page button text
            firstPage: '<<', // First page button text
            lastPage: '>>', // Last page button text
            expandRowBgColor: 'rgb(165, 165, 165)',
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            hideSizePerPage: true, //> You can hide the dropdown for sizePerPage
            expandRowBgColor: 'rgb(165, 165, 165)',
        };
        return (
            <div>
                <div style={{ "display": this.state.myToastShow ? "block" : "none" }}>
                    <MyToast myToastShow={this.state.myToastShow} message={message} type={type} />
                </div>
                <div style={{ "display": this.state.errorsMessageShow ? "block" : "none" }}>
                    <ErrorsMessageToast errorsMessageShow={this.state.errorsMessageShow} message={errorsMessageValue} type={"danger"} />
                </div>
                <div id="HomePage">
                    <Row inline="true">
                        <Col className="text-center">
                            <h2>諸費用</h2>
                        </Col>
                    </Row>
                    <br />
                    <Form id="expensesInfoForm">
                        <Row>
                            <Col sm={6}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text>交通費</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        maxLength="6"
                                        value={transportationExpenses}
                                        name="transportationExpenses"
                                        onChange={this.valueChangeMoney}
                                        disabled={actionType === "detail" ? true : false}
                                        placeholder="例：12000" />
                                </InputGroup>
                            </Col>
                            <Col sm={6}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="sixKanji">リーダー手当</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        maxLength="7"
                                        value={leaderAllowanceAmount}
                                        name="leaderAllowanceAmount"
                                        onChange={this.valueChangeMoney}
                                        readOnly={!leaderCheck}
                                        disabled={actionType === "detail" ? true : false}
                                        placeholder="例：112000" />
                                    <OverlayTrigger
                                        placement={'top'}
                                        overlay={
                                            <Tooltip>
                                                {relatedEmployees}
                                            </Tooltip>
                                        }
                                    >
                                        <Button size="sm" disabled={kadouCheck}>要員</Button>
                                    </OverlayTrigger>
                                </InputGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text>他の手当</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        maxLength="20"
                                        value={otherAllowanceName}
                                        name="otherAllowanceName"
                                        onChange={this.valueChange}
                                        disabled={actionType === "detail" ? true : false}
                                        placeholder="例：家族手当" />
                                </InputGroup>
                            </Col>
                            <Col sm={4}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text>費用</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        maxLength="7"
                                        value={otherAllowanceAmount}
                                        name="otherAllowanceAmount"
                                        onChange={this.valueChangeMoney}
                                        disabled={actionType === "detail" ? true : false}
                                        placeholder="例：112000" />
                                </InputGroup>
                            </Col>
                            <Col sm={4}>
	                            <InputGroup size="sm" className="mb-3">
	                                <InputGroup.Prepend>
	                                    <InputGroup.Text> 紹介費用</InputGroup.Text>
	                                </InputGroup.Prepend>
	                                <FormControl
	                                    maxLength="7"
	                                    value={introductionAllowance}
	                                    name="introductionAllowance"
	                                    onChange={this.valueChangeMoney}
	                                    disabled={actionType === "detail" ? true : false}
	                                    placeholder="例：10000" />
	                            </InputGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text> 総額</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl
                                        maxLength="5"
                                        value={totalExpenses}
                                        readOnly
                                        name="totalExpenses"
                                        onChange={this.valueChange}
                                        disabled={actionType === "detail" ? true : false}
                                        placeholder="例：10000" />
                                </InputGroup>
                            </Col>
                            <Col sm={4}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text>開始年月</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <InputGroup.Append>
                                        <DatePicker
                                            selected={this.state.expensesReflectStartDate}
                                            onChange={this.expensesReflectStartDateChange}
                                            dateFormat={"yyyy MM"}
                                            autoComplete="off"
                                            locale="pt-BR"
                                            showMonthYearPicker
                                            showFullMonthYearPicker
                                            // minDate={new Date()}
                                            showDisabledMonthNavigation
                                            className="form-control form-control-sm"
                                            id={actionType === "detail" ? "expensesInfoDatePicker-readOnly" : "expensesInfoDatePicker"}
                                            dateFormat={"yyyy/MM"}
                                            name="expensesReflectYearAndMonth"
                                            locale="ja"
                                            disabled={actionType === "detail" ? true : false}
                                        />
                                        <font color="red" className="site-mark">★</font>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>
                            <Col sm={4}>
	                            <InputGroup size="sm" className="mb-3">
	                                <InputGroup.Prepend>
	                                    <InputGroup.Text>備考</InputGroup.Text>
	                                </InputGroup.Prepend>
	                                <FormControl
	                                    maxLength="20"
	                                    value={remark}
	                                    name="remark"
	                                    onChange={this.valueChange}
	                                    disabled={actionType === "detail" ? true : false}
	                                    placeholder="備考" />
	                            </InputGroup>
                            </Col>
                        </Row>
                        <div style={{ "textAlign": "center" }}>
                            <Button
                                size="sm"
                                disabled={actionType === "detail" ? true : false}
                                variant="info"
                                onClick={this.expensesInfoToroku.bind(this)}>
                                <FontAwesomeIcon icon={faSave} />{btnText}
                            </Button>{" "}
                            <Button
                                size="sm"
                                disabled={actionType === "detail" ? true : false}
                                onClick={this.resetValue}
                                variant="info" >
                                <FontAwesomeIcon icon={faUndo} />リセット
                            </Button>
                        </div>
                        <Row>
                        <Col sm={10}>
                        </Col>
                        <Col sm={2}>
                            <div style={{ "float": "right" }}>
                                <Button
                                    variant="info"
                                    size="sm"
                                    id="delete"
                                    onClick={this.delete}
                                    disabled={deleteFlag}
                                >
                                    <FontAwesomeIcon icon={faTrash} />削除
                                </Button>
                            </div>
                        </Col>
                        </Row>
                        <div>
                            <Col sm={12}>
                                <BootstrapTable
                                    selectRow={/*actionType !== "detail" ? */selectRow/* : selectRowDetail*/}
                                    pagination={true}
                                    options={options}
                                    data={expensesInfoModels}
                                    headerStyle={{ background: '#5599FF' }}
                                    striped>
                                    <TableHeaderColumn isKey={true} dataField='expensesPeriod' tdStyle={{ padding: '.45em' }} width="230">諸費用期間</TableHeaderColumn>
                                    <TableHeaderColumn dataField='transportationExpenses' tdStyle={{ padding: '.45em' }} dataFormat={this.addMarkTransportationExpenses}>交通代</TableHeaderColumn>
                                    <TableHeaderColumn dataField='leaderAllowanceAmount' tdStyle={{ padding: '.45em' }} dataFormat={this.addMarkLeaderAllowanceAmount}>リーダー</TableHeaderColumn>
                                    <TableHeaderColumn dataField='introductionAllowance' tdStyle={{ padding: '.45em' }} dataFormat={this.addMarkintroductionAllowance}>紹介費用</TableHeaderColumn>
                                    <TableHeaderColumn dataField='otherAllowanceAmount' tdStyle={{ padding: '.45em' }} dataFormat={this.addMarkOtherAllowanceAmount}>他の手当</TableHeaderColumn>
                                </BootstrapTable>
                            </Col>
                        </div>
                    </Form>
                </div>
            </div>
        );
    }
}
export default ExpensesInfo;