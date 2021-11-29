import React, { Component } from 'react';
import { Form, Button, Col, Row, InputGroup } from 'react-bootstrap';
import * as TopCustomerInfoJs from '../components/topCustomerInfoJs.js';
import $ from 'jquery';
import axios from 'axios';
import * as utils from './utils/publicUtils.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo, faLevelUpAlt } from '@fortawesome/free-solid-svg-icons';
import store from './redux/store';

import '../asserts/css/style.css';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
axios.defaults.withCredentials = true;

/**
 * 勤務->勤務登録->休憩時間 の画面
 * 20201019 謝
 */
class BreakTime extends Component {
    constructor() {
        super();
        this.state = {
            actionType: '',//処理区分
            breakTimeDate: new Date(),
            breakTimeDayHourStart: [],//　　お昼時から
            breakTimeDayMinuteStart: [],//　　お昼分から
            breakTimeDayHourEnd: [],//　　お昼時まで
            breakTimeDayMinuteEnd: [],//　　お昼分まで
            breakTimeNightHourStart: [],//　　お昼時から
            breakTimeNightMinuteStart: [],//　　お昼分から
            breakTimeNightHourEnd: [],//　　お昼時まで
            breakTimeNightMinuteEnd: [],//　　お昼分まで
            serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],//劉林涛　テスト
            year: new Date().getFullYear(),
            month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
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
		const { location } = this.props
		this.setState(
				{
					backPage: location.state.backPage,
					sendValue: location.state.sendValue,
					flag: location.state.sendValue.flag,
				}
			);
        let postData = {
            yearMonth: this.state.year + this.state.month,
        }
        axios.post(this.state.serverIP + "dutyRegistration/getDutyInfo", postData)
            .then(resultMap => {
                this.setState({
                    breakTimeUser: resultMap.data.employeeName,
                });
                $("#employeeNo").val(resultMap.data.employeeNo);

                if (resultMap.data.breakTime !== null) {
                    $("#breakTimeDayHourStart").val(Number(resultMap.data.breakTime.lunchBreakStartTime.toString().substring(0, 2)));
                    $("#breakTimeDayMinuteStart").val(Number(resultMap.data.breakTime.lunchBreakStartTime.toString().substring(2)));
                    $("#breakTimeDayHourEnd").val(Number(resultMap.data.breakTime.lunchBreakFinshTime.toString().substring(0, 2)));
                    $("#breakTimeDayMinuteEnd").val(Number(resultMap.data.breakTime.lunchBreakFinshTime.toString().substring(2)));
                    $("#breakTimeNightHourStart").val(Number(resultMap.data.breakTime.nightBreakStartTime.toString().substring(0, 2)));
                    $("#breakTimeNightMinuteStart").val(Number(resultMap.data.breakTime.nightBreakStartTime.toString().substring(2)));
                    $("#breakTimeNightHourEnd").val(Number(resultMap.data.breakTime.nightBreakfinshTime.toString().substring(0, 2)));
                    $("#breakTimeNightMinuteEnd").val(Number(resultMap.data.breakTime.nightBreakfinshTime.toString().substring(2)));
                    this.setState({
                        breakTimeDaybreakTimeHour: resultMap.data.breakTime.lunchBreakTime,
                        breakTimeNightbreakTimeHour: resultMap.data.breakTime.nightBreakTime, breakTimeSumHour: resultMap.data.breakTime.totalBreakTime,
                    });
                }
            })
            .catch(function (e) {
                alert("error");
            })
    }
    calculateTime = () => {
        var breakTimeDayHourStart = Number($("#breakTimeDayHourStart").val());
        var breakTimeDayHourEnd = Number($("#breakTimeDayHourEnd").val());
        var breakTimeDayMinuteStart = Number($("#breakTimeDayMinuteStart").val());
        var breakTimeDayMinuteEnd = Number($("#breakTimeDayMinuteEnd ").val());
        var breakTimeNightHourStart = Number($("#breakTimeNightHourStart").val());
        var breakTimeNightHourEnd = Number($("#breakTimeNightHourEnd").val());
        var breakTimeNightMinuteStart = Number($("#breakTimeNightMinuteStart").val());
        var breakTimeNightMinuteEnd = Number($("#breakTimeNightMinuteEnd ").val());

        var breakTimeDaybreakTimeHour = breakTimeDayHourEnd * 60 + breakTimeDayMinuteEnd - breakTimeDayHourStart * 60 - breakTimeDayMinuteStart;
        var breakTimeNightbreakTimeHour = breakTimeNightHourEnd * 60 + breakTimeNightMinuteEnd - breakTimeNightHourStart * 60 - breakTimeNightMinuteStart;

        $("#breakTimeDaybreakTimeHour").val(breakTimeDaybreakTimeHour / 60);
        $("#breakTimeNightbreakTimeHour").val(breakTimeNightbreakTimeHour / 60);
        $("#breakTimeSumHour").val(Number($("#breakTimeDaybreakTimeHour").val()) + Number($("#breakTimeNightbreakTimeHour").val()));
        
        this.setState({
        	breakTimeDaybreakTimeHour: Number(breakTimeDaybreakTimeHour) / 60,
            breakTimeNightbreakTimeHour: Number(breakTimeNightbreakTimeHour) / 60,
            breakTimeSumHour: Number($("#breakTimeDaybreakTimeHour").val()) + Number($("#breakTimeNightbreakTimeHour").val()),
        });
    }
    
    beferBreakTimeRegister = () => {
    	if(Number($("#breakTimeDaybreakTimeHour").val()) <= 0){
    		alert("昼休憩時間を0時間以上入力してください。")
    		return;
    	}
    	if(Number($("#breakTimeNightbreakTimeHour").val()) <= 0){
    		alert("夜休憩時間を0時間以上入力してください。")
    		return;
    	}
    	
    	if(!this.state.flag){
			var a = window.confirm("休憩時間更新すると、作業時間再計算します、よろしいでしょうか？");
			if(a){
	    		this.breakTimeRegister();
			}else{
				return;
			}
    	}
    	else{
    		this.breakTimeRegister();
    	}
    }
    
    /**-
     * 登録ボタン
     */
    breakTimeRegister = () => {
        var breakTimeInfo = {};
        var actionType = this.state.actionType;
        breakTimeInfo["employeeNo"] = $("#employeeNo").val();
        breakTimeInfo["breakTimeIsConst"] = $("#isConst").val();
        breakTimeInfo["breakTimeYearMonth"] = utils.formateDate(this.state.breakTimeDate, false);
        breakTimeInfo["breakTimeDayStart"] = $("#breakTimeDayHourStart").val().padStart(2, "0") + $("#breakTimeDayMinuteStart").val().padEnd(2, "0");
        breakTimeInfo["breakTimeDayEnd"] = $("#breakTimeDayHourEnd").val().padStart(2, "0") + $("#breakTimeDayMinuteEnd").val().padEnd(2, "0");
        breakTimeInfo["breakTimeNightStart"] = $("#breakTimeNightHourStart").val().padStart(2, "0") + $("#breakTimeNightMinuteStart").val().padEnd(2, "0");
        breakTimeInfo["breakTimeNightEnd"] = $("#breakTimeNightHourEnd").val().padStart(2, "0") + $("#breakTimeNightMinuteEnd").val().padEnd(2, "0");
        breakTimeInfo["breakTimeDaybreakTimeHour"] = $("#breakTimeDaybreakTimeHour").val();
        breakTimeInfo["breakTimeNightbreakTimeHour"] = $("#breakTimeNightbreakTimeHour").val();
        breakTimeInfo["breakTimeSumHour"] = $("#breakTimeSumHour").val();
        breakTimeInfo["updateUser"] = sessionStorage.getItem('employeeNo');
        console.log(breakTimeInfo);
        actionType = "insert";
        if (actionType === "insert") {
            breakTimeInfo["actionType"] = "insert";
            axios.post(this.state.serverIP + "dutyRegistration/breakTimeInsert", breakTimeInfo)
                .then(resultMap => {
                    if (resultMap.data) {
                        alert("更新成功");
                    } else {
                        alert("更新失败");
                    }
                    //window.location.reload();
                })
                .catch(function () {
                    alert("更新错误，请检查程序");
                })
        }
    }
    isConst() {
        var isConst = $("#isConst").val();
        var isDisable = false;
        if (isConst === 0) {
            isDisable = true;
        }
        else if (isConst === 1) {
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
		let backPage = this.state.backPage
		if (backPage !== null && backPage !== undefined && backPage !== '') {
	        var path = {};
	        path = {
	            pathname: "/subMenuEmployee/" + backPage,
	            state: { sendValue: this.state.sendValue,
	            },
	        }
			return this.props.history.push(path);
		}
	};
    
    render() {
        const { actionType } = this.state;
        return (
            <div >
                <div >
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
                                        <InputGroup.Text id="sixKanji">休憩時間固定</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control id="isConst" name="isConst" as="select" onChange={this.isConst} style={{ width: "5rem" }}>
                                        <option value="1">はい</option>
                                        <option value="0">いいえ</option>
                                    </Form.Control>
                                </InputGroup>
                            </Col>
                        </Row>
                        <Row>
                        	<Col sm={2}>
                        	</Col>
                            <Col sm={2}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">氏名</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control readOnly id="breakTimeUser" value={this.state.breakTimeUser} name="breakTimeUser" />
                                </InputGroup>
                            </Col>
                            <Col sm={3}>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">年月</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <InputGroup.Append>
                                        <DatePicker
                                            selected={this.state.breakTimeDate}
                                            onChange={date => { this.setState({ breakTimeDate: date }); }}
                                            locale="ja"
                                            dateFormat="yyyy/MM"
                                            showMonthYearPicker
                                            id="datePicker"
                                            className="form-control form-control-sm"
                                            autoComplete="off"
                                        />
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>
                        </Row>
                        <Row>
	                        <Col sm={2}>
	                        </Col>
                            <Col>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">お昼</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control id="breakTimeDayHourStart" name="breakTimeDayHourStart" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeDayHourStart.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">時</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    &nbsp;
                                    <Form.Control id="breakTimeDayMinuteStart" name="breakTimeDayMinuteStart" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeDayMinuteStart.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">分</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <font style={{ marginLeft: "10px", marginRight: "10px", marginTop: "5px" }}>～</font>
                                    <Form.Control id="breakTimeDayHourEnd" name="breakTimeDayHourEnd" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeDayHourEnd.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">時</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    &nbsp;
                                    <Form.Control id="breakTimeDayMinuteEnd" name="breakTimeDayMinuteEnd" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeDayMinuteEnd.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">分</InputGroup.Text>
                                    </InputGroup.Prepend>
                                </InputGroup>
                            </Col>
                            <Col sm={2}>
                            </Col>
                        </Row>
                        <Row>
	                        <Col sm={2}>
	                        </Col>
                            <Col>
                                <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">夜　</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control id="breakTimeNightHourStart" name="breakTimeNightHourStart" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeNightHourStart.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">時</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    &nbsp;
                                    <Form.Control id="breakTimeNightMinuteStart" name="breakTimeNightMinuteStart" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeNightMinuteStart.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">分</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <font style={{ marginLeft: "10px", marginRight: "10px", marginTop: "5px" }}>～</font>
                                    <Form.Control id="breakTimeNightHourEnd" name="breakTimeNightHourEnd" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeNightHourEnd.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">時</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    &nbsp;
                                    <Form.Control id="breakTimeNightMinuteEnd" name="breakTimeNightMinuteEnd" as="select" onChange={this.calculateTime} >
                                        {this.state.breakTimeNightMinuteEnd.map(data =>
                                            <option value={data}>
                                                {data}
                                            </option>
                                        )}
                                    </Form.Control>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">分</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    </InputGroup>
                            </Col>
                            <Col sm={2}>
                            </Col>
                        </Row>
                        <Row>
                        	<Col sm={2}>
                            </Col>

                            <Col>
                                <InputGroup size="sm" className="mb-3">
                                	<InputGroup.Prepend>
                                		<InputGroup.Text id="fiveKanji">昼休憩時間</InputGroup.Text>
                                	</InputGroup.Prepend>
                                	<Form.Control readOnly id="breakTimeDaybreakTimeHour" value={this.state.breakTimeDaybreakTimeHour} name="breakTimeDaybreakTimeHour" />
                                </InputGroup>
                            </Col>
                            
                            <Col>
                            <InputGroup size="sm" className="mb-3">
                                   <InputGroup.Prepend>
                                    	<InputGroup.Text id="fiveKanji">夜休憩時間</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control readOnly id="breakTimeNightbreakTimeHour" value={this.state.breakTimeNightbreakTimeHour} name="breakTimeNightbreakTimeHour" />
                                </InputGroup>
                             </Col>
                             
                             <Col>
                             <InputGroup size="sm" className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="inputGroup-sizing-sm">合計</InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control readOnly id="breakTimeSumHour" value={this.state.breakTimeSumHour} name="breakTimeSumHour" />
                                </InputGroup>
                            </Col>
                            
                            <Col sm={2}>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4}></Col>
                            <Col sm={4} className="text-center">
                                <div >
                                    <Button size="sm" className="btn btn-info btn-sm" onClick={this.beferBreakTimeRegister} variant="info" id="toroku" type="button">
                                        <FontAwesomeIcon icon={faSave} /> 登録
										</Button>
										&nbsp;&nbsp;
										<Button size="sm" className="btn btn-info btn-sm" onClick={TopCustomerInfoJs.reset} >
                                        <FontAwesomeIcon icon={faUndo} /> リセット
										</Button>
										&nbsp;&nbsp;
                                        <Button size="sm" variant="info" type="button" onClick={this.back} hidden={this.state.backPage === ""}>
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
