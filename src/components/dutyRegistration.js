/* 社員を追加 */
import React from 'react';
import { Form, Button, Col, Row, InputGroup, FormControl, Modal } from 'react-bootstrap';
import axios from 'axios';
import $ from 'jquery';
import "react-datepicker/dist/react-datepicker.css";
import '../asserts/css/style.css';
import ErrorsMessageToast from './errorsMessageToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faUndo } from '@fortawesome/free-solid-svg-icons';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as publicUtils from './utils/publicUtils.js';
import * as messageUtils from './utils/messageUtils.js';
import { Link } from "react-router-dom";
import store from './redux/store';

import BreakTime from './breakTime';
import * as DutyRegistrationJs from './dutyRegistrationJs.js';
import { string } from 'prop-types';

axios.defaults.withCredentials = true;

/**
 * 勤務->勤務登録 の画面
 * 20201019 謝
 */
class DutyRegistration extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			weekDay: { 0: "日", 1: "月", 2: "火", 3: "水", 4: "木", 5: "金", 6: "土" },
			hasWork: ["休日", "出勤"],
			hours: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
			minutes: ["00", "15", "30", "45"],
			dateData: [],
			dateDataTemp: [],
			rowNo: [],
			year: new Date().getFullYear(),
			month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
			//			status: {sleep2sleep: 0 ,work2work: 1, sleep2work: 2, work2sleep: 3},
			workDays: 0,
			workHours: 0,
			isConfirmedPage: false,
			breakTime: {},
			serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],//劉林涛　テスト
			sleepHour: 0,
			loading: true,
		}
		this.options = {
			defaultSortName: 'day',
			defaultSortOrder: 'dsc',
			sizePerPage: 40,
			hideSizePerPage: true,
			paginationShowsTotal: this.renderShowsTotal,
			hidePageListOnlyOnePage: true,
		};
		this.cellEditProp = {
			mode: 'click',
			blurToSave: true,
			beforeSaveCell: this.beforeSaveCell,
			afterSaveCell: this.afterSaveCell
		};
		this.valueChange = this.valueChange.bind(this);
	}
	//onChange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value
		})
	}
	//onChange
	tableValueChange = (event, cell, row) => {
		let dataData = this.state.dateData;
		/* 		if (publicUtils.isNull(event.target.dataset["beforevalue"])) {
					event.target.dataset["beforevalue"] = dataData[row.id][event.target.name];
				} */
		dataData[row.id][event.target.name] = event.target.value;

		if (dataData[row.id]["hasWork"] === "休日") {
			row.startTime = "";
			row.startTimeHours = "";
			row.startTimeMinutes = "";
			row.endTime = "";
			row.endTimeHours = "";
			row.endTimeMinutes = "";
			dataData[row.id]["workContent"] = "";
			dataData[row.id]["remark"] = "";
			dataData[row.id]["workHour"] = "";
			dataData[row.id]["sleepHour"] = "";
		} else {
			if(row.startTimeHours === "")
				row.startTimeHours = "00";
			if(row.startTimeMinutes === "")
				row.startTimeMinutes = "00";
			if(row.endTimeHours === "")
				row.endTimeHours = "00";
			if(row.endTimeMinutes === "")
				row.endTimeMinutes = "00";
			dataData[row.id]["sleepHour"] = this.state.sleepHour;
		}
		row['isChanged'] = true;
		this.setState({
			dateData: dataData
		})
	}
	//onChangeAfter
	tableValueChangeAfter = (event, cell, row) => {

		this.setTableStyle(row.id);

		let dataData = this.state.dateData;

		let startTime = (row.startTimeHours === undefined ? "00" : row.startTimeHours) + ":" + (row.startTimeMinutes === undefined ? "00" : row.startTimeMinutes);
		let endTime = (row.endTimeHours === undefined ? "00" : row.endTimeHours) + ":" + (row.endTimeMinutes === undefined ? "00" : row.endTimeMinutes);
		row.startTime = startTime;
		row.endTime = endTime;

		let workHour = this.getWorkHour(startTime,endTime,
		this.state.lunchBreakStartTime,this.state.lunchBreakFinshTime,this.state.lunchBreakTime,this.state.nightBreakStartTime,this.state.nightBreakfinshTime,this.state.nightBreakTime);
		
		dataData[row.id]["workHour"] = workHour;
		this.setState({
			dateData: dataData
		})
	}
	
	getWorkHour = (startTime,endTime,lunchBreakStartTime,lunchBreakFinshTime,lunchBreakTime,nightBreakStartTime,nightBreakfinshTime,nightBreakTime) => {
		let workHour = "";
		
		if(startTime === "" || endTime === "")
			return workHour;
		
		let startTimeNum = Number(startTime.replace(":",""));
		let endTimeNum = Number(endTime.replace(":",""));

		if(startTimeNum <= lunchBreakStartTime && endTimeNum <= lunchBreakStartTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, endTime));
		else if(lunchBreakStartTime <= startTimeNum && startTimeNum <= lunchBreakFinshTime && lunchBreakStartTime <= endTimeNum && endTimeNum <= lunchBreakFinshTime )
			workHour = "";
		else if(lunchBreakFinshTime <= startTimeNum && startTimeNum <= nightBreakStartTime && lunchBreakFinshTime <= endTimeNum && endTimeNum <= nightBreakStartTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, endTime));
		else if(nightBreakStartTime <= startTimeNum && startTimeNum <= nightBreakfinshTime && nightBreakStartTime <= endTimeNum && endTimeNum <= nightBreakfinshTime )
			workHour = "";
		else if(startTimeNum >= nightBreakfinshTime && endTimeNum >= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, endTime));
		else if(startTimeNum <= lunchBreakStartTime && lunchBreakStartTime <= endTimeNum && endTimeNum <= lunchBreakFinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, (lunchBreakStartTime.substring(0,2) + ":" + lunchBreakStartTime.substring(2,4))));
		else if(startTimeNum <= lunchBreakStartTime && lunchBreakFinshTime <= endTimeNum && endTimeNum <= nightBreakStartTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, endTime)) - lunchBreakTime;
		else if(startTimeNum <= lunchBreakStartTime && nightBreakStartTime <= endTimeNum && endTimeNum <= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, (nightBreakStartTime.substring(0,2) + ":" + nightBreakStartTime.substring(2,4)))) - lunchBreakTime;
		else if(startTimeNum <= lunchBreakStartTime && endTimeNum >= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, endTime)) - lunchBreakTime - nightBreakTime;
		else if(lunchBreakStartTime <= startTimeNum && startTimeNum <= lunchBreakFinshTime && lunchBreakFinshTime <= endTimeNum && endTimeNum <= nightBreakStartTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff((lunchBreakFinshTime.substring(0,2) + ":" + lunchBreakFinshTime.substring(2,4)), endTime));
		else if(lunchBreakStartTime <= startTimeNum && startTimeNum <= lunchBreakFinshTime && nightBreakStartTime <= endTimeNum && endTimeNum <= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff((lunchBreakFinshTime.substring(0,2) + ":" + lunchBreakFinshTime.substring(2,4)), (nightBreakStartTime.substring(0,2) + ":" + nightBreakStartTime.substring(2,4))));
		else if(lunchBreakStartTime <= startTimeNum && startTimeNum <= lunchBreakFinshTime && endTimeNum >= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff((lunchBreakFinshTime.substring(0,2) + ":" + lunchBreakFinshTime.substring(2,4)), endTime)) - nightBreakTime;
		else if(lunchBreakFinshTime <= startTimeNum && startTimeNum <= nightBreakStartTime && nightBreakStartTime <= endTimeNum && endTimeNum <= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, (nightBreakStartTime.substring(0,2) + ":" + nightBreakStartTime.substring(2,4))));
		else if (lunchBreakFinshTime <= startTimeNum && startTimeNum <= nightBreakStartTime && endTimeNum >= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff(startTime, endTime)) - nightBreakTime;
		else if (nightBreakStartTime <= startTimeNum && startTimeNum <= nightBreakfinshTime && endTimeNum >= nightBreakfinshTime)
			workHour = publicUtils.nullToEmpty(publicUtils.timeDiff((nightBreakfinshTime.substring(0,2) + ":" + nightBreakfinshTime.substring(2,4)), endTime));

		return workHour;
	}
	
	setTableStyle = (rowId,day) => {
		if (publicUtils.isNull(rowId)) {
			for (let i = 0; i < this.state.dateData.length; i++) {
				this.setTableStyle(this.state.dateData[i].id);
			}
			return;
		}
		let dateData = this.state.dateData;
		let target = $("#dutyDataRowNumber-" + rowId).parent().parent()[0];
		DutyRegistrationJs.removeRowAllClass(target);
		for (let i = 0; i < dateData.length; i++) {
			target = $("#dutyDataRowNumber-" + dateData[i].id).parent().parent()[0];
			if (this.state.isConfirmedPage && dateData[i].isChanged) {
				DutyRegistrationJs.addRowClass(target, "dutyRegistration-IsChanged");
			}
			else {
				if(dateData[i].confirmFlag === "1"){
					if(day !== undefined && day !== null && dateData[i].day === day){
						if (dateData[i].hasWork == this.state.hasWork[1]) {
							DutyRegistrationJs.addRowClass(target, "dutyRegistration-WorkSelect");
						}
						else if (dateData[i].hasWork == this.state.hasWork[0]) {
							DutyRegistrationJs.addRowClass(target, "dutyRegistration-SleepSelect");
						}
					}
					else{
						if (dateData[i].hasWork == this.state.hasWork[1]) {
							DutyRegistrationJs.addRowClass(target, "dutyRegistration-WorkConfirmation");
						}
						else if (dateData[i].hasWork == this.state.hasWork[0]) {
							DutyRegistrationJs.addRowClass(target, "dutyRegistration-SleepConfirmation");
						}
					}
				}
				else{
					if (dateData[i].hasWork == this.state.hasWork[1]) {
						DutyRegistrationJs.addRowClass(target, "dutyRegistration-Work");
					}
					else if (dateData[i].hasWork == this.state.hasWork[0]) {
						DutyRegistrationJs.addRowClass(target, "dutyRegistration-Sleep");
					}
				}
			}
		}
	}
	//リセット化
	resetState = {
		siteCustomer: "",
	};
	//初期化メソッド
	componentDidMount() {
		var dateData = [];
		var monthDays = new Date(this.state.year, this.state.month, 0).getDate();
		let workDays = 0;
		let workHours = 0;
		for (var i = 0; i < monthDays; i++) {
			dateData[i] = {};
			dateData[i]['id'] = i;
			dateData[i]['isChanged'] = false;
			dateData[i]['day'] = i + 1;
			dateData[i]['week'] = this.state.weekDay[new Date(this.state.year + "/" + this.state.month + "/" + (i + 1)).getDay()];
			dateData[i]['startTime'] = "";
			dateData[i]['startTimeHours'] = "";
			dateData[i]['startTimeMinutes'] = "";
			dateData[i]['endTime'] = "";
			dateData[i]['endTimeHours'] = "";
			dateData[i]['endTimeMinutes'] = "";
			dateData[i]['sleepHour'] = "";
			dateData[i]['workHour'] = "";
			dateData[i]['workContent'] = "";
			dateData[i]['remark'] = "";
			if (publicUtils.isHoliday(this.state.year, this.state.month, dateData[i]['day'])) {
				dateData[i]['isWork'] = 0;
				dateData[i]['hasWork'] = this.state.hasWork[0];
			}
			else {
				dateData[i]['isWork'] = 1;
				dateData[i]['hasWork'] = this.state.hasWork[1];
				dateData[i]['sleepHour'] = 0;
			}
			if (dateData[i]["hasWork"] == this.state.hasWork[1]) {
				workDays++;
			}
		}
		this.setState({ dateData: dateData, workDays: workDays, workHours: workHours });
		let postData = {
			yearMonth: this.state.year + this.state.month,
		}
		axios.post(this.state.serverIP + "dutyRegistration/getDutyInfo", postData)
			.then(resultMap => {
				if (resultMap.data.breakTime !== null) {
					let dateData = [];
					let defaultDateData = [];
					let workDays = 0;
					let workHours = 0;
					let sleepHour = 0;
					dateData = this.state.dateData;
					defaultDateData = resultMap.data.dateData;
					if (publicUtils.isNull(resultMap.data.breakTime)) {
						resultMap.data.breakTime = {};
					}
					//					console.log(resultMap.data);
					if (!publicUtils.isNull(resultMap.data.breakTime) && resultMap.data.breakTime["breakTimeFixedStatus"] === "1" && resultMap.data.breakTime !== "0") {
						sleepHour = resultMap.data.breakTime["totalBreakTime"];
					}
					let dayIndex = -1;
					
					let lunchBreakStartTime = resultMap.data.breakTime.lunchBreakStartTime;
					let lunchBreakFinshTime = resultMap.data.breakTime.lunchBreakFinshTime;
					let lunchBreakTime = resultMap.data.breakTime.lunchBreakTime;
					let nightBreakStartTime = resultMap.data.breakTime.nightBreakStartTime;
					let nightBreakfinshTime = resultMap.data.breakTime.nightBreakfinshTime;
					let nightBreakTime = resultMap.data.breakTime.nightBreakTime;
					
					for (let i = 0; i < defaultDateData.length; i++) {
						dayIndex = defaultDateData[i].day - 1;
						dateData[dayIndex].hasWork = this.state.hasWork[defaultDateData[i].isWork];
						if (defaultDateData[i].isWork == 1) {
							dateData[dayIndex].startTime = publicUtils.timeInsertChar(publicUtils.nullToEmpty(defaultDateData[i].startTime));
							dateData[dayIndex].startTimeHours = publicUtils.nullToEmpty(defaultDateData[i].startTime) === "" ? "" : defaultDateData[i].startTime.substring(0,2);
							dateData[dayIndex].startTimeMinutes = publicUtils.nullToEmpty(defaultDateData[i].startTime) === "" ? "" : defaultDateData[i].startTime.substring(2,4);
							dateData[dayIndex].endTime = publicUtils.timeInsertChar(publicUtils.nullToEmpty(defaultDateData[i].endTime));
							dateData[dayIndex].endTimeHours = publicUtils.nullToEmpty(defaultDateData[i].endTime) === "" ? "" : defaultDateData[i].endTime.substring(0,2);
							dateData[dayIndex].endTimeMinutes = publicUtils.nullToEmpty(defaultDateData[i].endTime) === "" ? "" : defaultDateData[i].endTime.substring(2,4);
							dateData[dayIndex].sleepHour = sleepHour;
							let startTime = publicUtils.timeInsertChar(publicUtils.nullToEmpty(defaultDateData[i].startTime));
							let endTime = publicUtils.timeInsertChar(publicUtils.nullToEmpty(defaultDateData[i].endTime));
							dateData[dayIndex].workHour = this.getWorkHour(startTime,endTime,lunchBreakStartTime,lunchBreakFinshTime,lunchBreakTime,nightBreakStartTime,nightBreakfinshTime,nightBreakTime);
							workDays++;
							workHours += Number(dateData[dayIndex].workHour);
							dateData[dayIndex].endTime = publicUtils.timeInsertChar(publicUtils.nullToEmpty(defaultDateData[i].endTime));
							dateData[dayIndex]['workContent'] = publicUtils.nullToEmpty(defaultDateData[i].workContent);
							dateData[dayIndex]['remark'] = publicUtils.nullToEmpty(defaultDateData[i].remark);
						} else { dateData[dayIndex].sleepHour = ""; }
						dateData[dayIndex].confirmFlag = publicUtils.nullToEmpty(defaultDateData[i].confirmFlag) === "" ? "" : defaultDateData[i].confirmFlag;
					}
					this.setState({
						breakTime: resultMap.data.breakTime, dateData: dateData, workDays: workDays, workHours: workHours,
						employeeNo: resultMap.data.employeeNo, siteCustomer: resultMap.data.siteCustomer, customer: resultMap.data.customer,
						siteResponsiblePerson: resultMap.data.siteResponsiblePerson, systemName: resultMap.data.systemName,
						employeeName: resultMap.data.employeeName, sleepHour: sleepHour,
						lunchBreakStartTime: lunchBreakStartTime,
						lunchBreakFinshTime: lunchBreakFinshTime,
						lunchBreakTime: lunchBreakTime,
						nightBreakStartTime: nightBreakStartTime,
						nightBreakfinshTime: nightBreakfinshTime,
						nightBreakTime: nightBreakTime,
					});
				} else {
					alert("休憩時間を登録してください。");
				}
				this.setTableStyle();
			})
			.catch(function (e) {
				alert("error");
			})
	}
	/**
	* 小さい画面の閉め 
	*/
	handleHideModal = (kbn) => {
		if (kbn === "breakTime") {//PW設定
			this.setState({ showbreakTimeModal: false })
		}
	}

	/**
 　　　* 小さい画面の開き
    */
	handleShowModal = (kbn) => {
		if (kbn === "breakTime") {//PW設定
			this.setState({ showbreakTimeModal: true })
		}
	}
	setWorkDays() {
		let workDays = 0;
		for (var i = 0; i < this.state.dateData.length; i++) {
			if (this.state.dateData[i]["hasWork"] == this.state.hasWork[1]) {
				workDays++;
			}
		}
		this.setState({ workDays: workDays });
	}
	setWorkHours() {
		let workHours = 0;
		for (var i = 0; i < this.state.dateData.length; i++) {
			workHours += Number(this.state.dateData[i]["workHour"]);
		}
		this.setState({ workHours: workHours });
	}
	onSubmit = (event) => {
		this.setState({ loading: false, });
		var dataInfo = {};
		var actionType = "insert";
		dataInfo["actionType"] = actionType;
		dataInfo["dateData"] = this.state.dateData;
		dataInfo["yearMonth"] = this.state.year + this.state.month;
		dataInfo["siteCustomer"] = this.state.siteCustomer;
		dataInfo["customer"] = this.state.customer;
		dataInfo["siteResponsiblePerson"] = this.state.siteResponsiblePerson;
		dataInfo["systemName"] = this.state.systemName;
		let submitData = [];
/* 		let j = 0; */
		let nowDay = new Date().getDate();
		for (let i = 0; i < dataInfo["dateData"].length; i++) {
			dataInfo["dateData"][i]["isWork"] = (dataInfo["dateData"][i]["hasWork"] == this.state.hasWork[0]) ? 0 : 1;
			if(nowDay >= dataInfo["dateData"][i]["day"]){
				dataInfo["dateData"][i]["confirmFlag"] = "1";
			}
			/* if (dataInfo["dateData"][i]["isChanged"]) { */
				submitData[i] = JSON.parse(JSON.stringify(dataInfo["dateData"][i]));
/* 				j++;
			} */
		}
		dataInfo["dateData"] = submitData;
		console.log(dataInfo);
		if (actionType === "insert") {
			axios.post(this.state.serverIP + "dutyRegistration/dutyInsert", dataInfo)
				.then(resultMap => {
					this.setState({ loading: true, });
					if (resultMap.data) {
						alert("更新成功");
					} else {
						alert("更新失败");
					}
					//window.location.reload();
					this.onBack();
				})
				.catch(function () {
					this.setState({ loading: true, });
					alert("更新错误，请检查程序");
				})
		}
	}
	beforeSubmit = (event) => {
		//		let arrWorkContent = $("input[name=workContent]");
		//		console.log(arrWorkContent[0].value);
		let errorMessage = "";
		let nowDay = new Date().getDate();
		for (let i = 0; i < this.state.dateData.length; i++) {
			if (nowDay < this.state.dateData[i]["day"]) {
				break;
			}
			if (this.state.dateData[i]["hasWork"] == this.state.hasWork[1]) {
				if (publicUtils.isEmpty(this.state.dateData[i]["startTime"])) {
					errorMessage += messageUtils.getMessage("E0003", this.state.dateData[i]["day"], true);
					break;
				}
				if (publicUtils.isEmpty(this.state.dateData[i]["endTime"])) {
					errorMessage += messageUtils.getMessage("E0004", this.state.dateData[i]["day"], true);
					break;
				}
				if (nowDay >= this.state.dateData[i]["day"]) {
					if (publicUtils.isEmpty(this.state.dateData[i]["workContent"])) {
						errorMessage += messageUtils.getMessage("E0001", this.state.dateData[i]["day"], true);
						break;
					}
				}
			}
			/*if (!publicUtils.isEmpty(this.state.dateData[i]["startTime"]) && !this.state.dateData[i]["startTime"].toString().match(/^((0[0-9]|1[0-9]|2[0-3]):(0[0]|1[5]|3[0]|4[5])|24:00)$/)) {
				errorMessage += messageUtils.getMessage("E0005", this.state.dateData[i]["day"], true);
				break;
			}
			if (!publicUtils.isEmpty(this.state.dateData[i]["endTime"]) && !this.state.dateData[i]["endTime"].toString().match(/^((0[0-9]|1[0-9]|2[0-3]):(0[0]|1[5]|3[0]|4[5])|24:00)$/)) {
				errorMessage += messageUtils.getMessage("E0006", this.state.dateData[i]["day"], true);
				break;
			}*/
			if (!publicUtils.isEmpty(this.state.dateData[i]["startTime"]) && !publicUtils.isEmpty(this.state.dateData[i]["endTime"])) {
				if (this.state.dateData[i]["startTime"] > this.state.dateData[i]["endTime"]) {
					errorMessage += messageUtils.getMessage("E0002", this.state.dateData[i]["day"], true);
					break;
				}
			}
		}
		if (!publicUtils.isEmpty(errorMessage)) {
			this.setState({
				errorsMessageShow: true,
				errorsMessageValue: errorMessage,
			});
			return;
		}
		this.setState({ isConfirmedPage: true, errorsMessageShow: false }, () => {
			this.setTableStyle();
		});
	}
	onBack = (event) => {
		this.setState({ isConfirmedPage: false }, () => {
			this.setTableStyle();
		});
	}
	downloadPDF = (event) => {
		let dataInfo = {};
		dataInfo["yearMonth"] = this.state.year + this.state.month;
		axios.post(this.state.serverIP + "dutyRegistration/downloadPDF", dataInfo)
			.then(resultMap => {
				if (resultMap.data) {
					publicUtils.handleDownload(resultMap.data, this.state.serverIP);
					//			        alert(resultMap.data);
				} else {
					alert("更新失败");
				}
			})
			.catch(function () {
				alert("更新错误，请检查程序");
			});
	}
	hasWorkFormatter = (cell, row) => {
		let returnItem = (
			<span id={"dutyDataRowNumber-" + row.id}>{cell}</span>
		)
		if (/*!this.state.isConfirmedPage*/row.confirmFlag !== "1") {
			returnItem = (
				<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >
					<select class=" form-control editor edit-select" name="hasWork" value={cell} onChange={(event) => { this.tableValueChange(event, cell, row); this.tableValueChangeAfter(event, cell, row) }} >
						{this.state.hasWork.map(date =>
							<option key={date} value={date}>
								{date}
							</option>
						)}
					</select>
				</span>
			)
		}else{
			returnItem = (<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >&nbsp;{cell}</span>)
		}
		return returnItem;
	}
	startTimeFormatter = (cell, row) => {
		let returnItem = cell;
		if (!this.state.isConfirmedPage && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			//returnItem = <span class="dutyRegistration-DataTableEditingCell"><input type="text" class=" form-control editor edit-text" name="startTime" value={cell} maxLength="5" onChange={(event) => this.tableValueChange(event, cell, row)} onBlur={(event) => this.tableValueChangeAfter(event, cell, row)} /></span>;
			returnItem = (
			<div>
				<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >
					<select class=" form-control editor edit-select" name="startTimeHours" value={cell} onChange={(event) => { this.tableValueChange(event, cell, row); this.tableValueChangeAfter(event, cell, row) }} >
						{this.state.hours.map(date =>
						<option key={date} value={date}>
							{date}
						</option>)}
					</select>
				</span>
				
				<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >
					<select class=" form-control editor edit-select" name="startTimeMinutes" value={cell} onChange={(event) => { this.tableValueChange(event, cell, row); this.tableValueChangeAfter(event, cell, row) }} >
						{this.state.minutes.map(date =>
						<option key={date} value={date}>
							{date}
						</option>)}
					</select>
				</span>
			</div>
			)
		}
		return returnItem;
	}
	
	startTimeHoursFormatter = (cell, row) => {
		let returnItem = cell;
		if (row.confirmFlag !== "1" && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			returnItem = (
				<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >
					<select class=" form-control editor edit-select" name="startTimeHours" value={cell} onChange={(event) => { this.tableValueChange(event, cell, row); this.tableValueChangeAfter(event, cell, row) }} >
						{this.state.hours.map(date =>
						<option key={date} value={date}>
							{date}
						</option>)}
					</select>
				</span>
			)
		}else{
			returnItem = (<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >&nbsp;{cell}</span>)
		}
		return returnItem;
	}
	
	startTimeMinutesFormatter = (cell, row) => {
		let returnItem = cell;
		if (row.confirmFlag !== "1" && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			returnItem = (
				<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >
					<select class=" form-control editor edit-select" name="startTimeMinutes" value={cell} onChange={(event) => { this.tableValueChange(event, cell, row); this.tableValueChangeAfter(event, cell, row) }} >
						{this.state.minutes.map(date =>
						<option key={date} value={date}>
							{date}
						</option>)}
					</select>
				</span>
			)
		}else{
			returnItem = (<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >&nbsp;{cell}</span>)
		}
		return returnItem;
	}
	
	endTimeFormatter = (cell, row) => {
		let returnItem = cell;
		if (!this.state.isConfirmedPage && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			returnItem = <span class="dutyRegistration-DataTableEditingCell"><input type="text" class=" form-control editor edit-text" name="endTime" value={cell} maxLength="5" onChange={(event) => this.tableValueChange(event, cell, row)} onBlur={(event) => this.tableValueChangeAfter(event, cell, row)} /></span>;
		}
		return returnItem;
	}
	
	endTimeHoursFormatter = (cell, row) => {
		let returnItem = cell;
		if (row.confirmFlag !== "1" && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			returnItem = (
				<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >
					<select class=" form-control editor edit-select" name="endTimeHours" value={cell} onChange={(event) => { this.tableValueChange(event, cell, row); this.tableValueChangeAfter(event, cell, row) }} >
						{this.state.hours.map(date =>
						<option key={date} value={date}>
							{date}
						</option>)}
					</select>
				</span>
			)
		}else{
			returnItem = (<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >&nbsp;{cell}</span>)
		}
		return returnItem;
	}
	
	endTimeMinutesFormatter = (cell, row) => {
		let returnItem = cell;
		if (row.confirmFlag !== "1" && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			returnItem = (
				<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >
					<select class=" form-control editor edit-select" name="endTimeMinutes" value={cell} onChange={(event) => { this.tableValueChange(event, cell, row); this.tableValueChangeAfter(event, cell, row) }} >
						{this.state.minutes.map(date =>
						<option key={date} value={date}>
							{date}
						</option>)}
					</select>
				</span>
			)
		}else{
			returnItem = (<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >&nbsp;{cell}</span>)
		}
		return returnItem;
	}
	
	workHourFormatter = (cell) => {
		if(Number(cell) > 0)
			return cell;
	}
	
	sleepHourFormatter = (cell, row) => {
		let returnItem = cell;
		if (!this.state.isConfirmedPage && this.state.dateData[row.id].hasWork === this.state.hasWork[1] && this.state.breakTime.breakTimeFixedStatus == 0) {
			returnItem = <span class="dutyRegistration-DataTableEditingCell"><input type="text" class=" form-control editor edit-text" name="sleepHour" value={cell} onChange={(event) => this.tableValueChange(event, cell, row)} onBlur={(event) => this.tableValueChangeAfter(event, cell, row)} /></span>;
		}
		else if (!this.state.isConfirmedPage && this.state.dateData[row.id].hasWork === this.state.hasWork[1] && this.state.breakTime.breakTimeFixedStatus) {
			row.sleepHour = this.state.breakTime.totalBreakTime;
		}
		return returnItem;
	}
	workContentFormatter = (cell, row) => {
		let returnItem = cell;
		if (row.confirmFlag !== "1" && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			returnItem = <span class="dutyRegistration-DataTableEditingCell"><input type="text" class=" form-control editor edit-text" name="workContent" value={cell} onChange={(event) => this.tableValueChange(event, cell, row)} onBlur={(event) => this.tableValueChangeAfter(event, cell, row)} /></span>;
		}else{
			returnItem = (<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >&nbsp;{cell}</span>)
		}
		return returnItem;
	}
	remarkFormatter = (cell, row) => {
		let returnItem = cell;
		if (row.confirmFlag !== "1"  && this.state.dateData[row.id].hasWork === this.state.hasWork[1]) {
			returnItem = <span class="dutyRegistration-DataTableEditingCell"><input type="text" class=" form-control editor edit-text" name="remark" value={cell} onChange={(event) => this.tableValueChange(event, cell, row)} onBlur={(event) => this.tableValueChangeAfter(event, cell, row)} /></span>;
		}else{
			returnItem = (<span id={"dutyDataRowNumber-" + row.id} class="dutyRegistration-DataTableEditingCell" >&nbsp;{cell}</span>)
		}
		return returnItem;
	}
	
	release = () => {
		let dateData = this.state.dateData;
		for(let i in dateData){
			for(let j in this.state.rowNo){
				if(dateData[i].day === this.state.rowNo[j]){
					dateData[i].confirmFlag = "0";
				}
			}
		}
		this.setState({
			dateData: dateData,
		});
		this.setTableStyle();
	}
	
	beferShuseiTo = (actionType) => {
    	let flag = false;
    	for(let i in this.state.dateData){
    		if(this.state.dateData[i].workContent !== null || this.state.dateData[i].workContent !== ""){
    			flag = true;
    			break;
    		}
    	}
    	if(flag){
			var a = window.confirm("休憩時間更新すると、作業時間再計算します、よろしいでしょうか？");
			if(a){
				this.shuseiTo(actionType);
			}
    	}else{
    		this.shuseiTo(actionType);
    	}
	}
	
    shuseiTo = (actionType) => {
    	 var path = {};
         var sendValue = {
         };
 		switch (actionType) {
 			case "breakTime":
 				path = {
 					pathname: '/subMenuEmployee/breakTime',
 					state: {
 						backPage: "dutyRegistration",
 						sendValue: sendValue,
 					},
 				}
 				break;
 			default:
 		}
        this.props.history.push(path);
    }
    
	//行Selectファンクション
	handleRowSelect = (row, isSelected, e) => {
		if(row.confirmFlag === "1"){
			if (isSelected) {
				this.setState({
	    			rowNo: this.state.rowNo.concat([row.day]),
	    		});
				this.setTableStyle(row.id,row.day);
			} else {
	    		let index;
				index = this.state.rowNo.findIndex(item => item === row.day);
				this.state.rowNo.splice(index, 1);
				this.setTableStyle(row.id);
			}
		}
	}

	render() {
		const selectRow = {
				mode: 'radio',
				bgColor: 'pink',
				clickToSelectAndEditCell: true,
				hideSelectColumn: true,
				clickToExpand: true,// click to expand row, default is false
				onSelect: this.handleRowSelect,
			};
		return (
			<div>
				<div style={{ "display": this.state.errorsMessageShow ? "block" : "none" }}>
					<ErrorsMessageToast errorsMessageShow={this.state.errorsMessageShow} message={this.state.errorsMessageValue} type={"danger"} />
				</div>
				<div>
					{/*　 開始 */}
					{/*　 休憩時間 */}
					<Modal aria-labelledby="contained-modal-title-vcenter" centered backdrop="static"
						onHide={this.handleHideModal.bind(this, "breakTime")} show={this.state.showbreakTimeModal} dialogClassName="modal-breakTime">
						<Modal.Header closeButton>
						</Modal.Header>
						<Modal.Body >
							<BreakTime actionType={sessionStorage.getItem('actionType')} />
						</Modal.Body>
					</Modal>
					{/* 終了 */}
					{/*　 休憩時間 ボタン*/}
					{/* 					<div style={{ "textAlign": "center" }}>
						<Button size="sm" className="btn btn-info btn-sm" onClick={this.handleShowModal.bind(this, "breakTime")}>休憩時間</Button>{' '}
					</div> */}
				</div>
				<div>
					<Form.Group>
						<Row>
							{/*<Col sm={3} hidden>
								<InputGroup size="sm" className="mb-3">
									<input style={{ width: "150px" }} value={this.state.siteCustomer} name="siteCustomer" onChange={this.valueChange} className="inputWithoutBorder" />
									&nbsp;御中
								</InputGroup>
							</Col>
							<Col sm={3} md={{ span: 3, offset: 6 }} hidden>
								<InputGroup size="sm" className="mb-3">
									会社名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									<input style={{ width: "150px" }} value={this.state.customer} name="customer" onChange={this.valueChange} className="inputWithoutBorder" />
								</InputGroup>
							</Col>*/}
							<Col sm={3}>
								<InputGroup size="sm" className="mb-3">
									<Form.Control type="text" value={this.state.siteCustomer} name="siteCustomer" autoComplete="off" size="sm" onChange={this.valueChange} />
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">御中</InputGroup.Text>
									</InputGroup.Prepend>
								</InputGroup>
							</Col>
							<Col sm={6}>
							</Col>
							<Col sm={3}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">会社名</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control type="text" value={this.state.customer} name="customer" autoComplete="off" size="sm" onChange={this.valueChange} />
								</InputGroup>
							</Col>
						</Row>
						<Row className="align-items-center">
							<Col sm={4} md={{ span: 4, offset: 4 }}>
								<span size="lg" className="mb-3">
									<h3 >{this.state.year}年{this.state.month}月　作業報告書</h3>
								</span>
							</Col>
							<Col sm={3} md={{ span: 3, offset: 1 }} hidden>
								<InputGroup size="sm" className="mb-3">
									責任者名&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									<input style={{ width: "150px" }} value={this.state.siteResponsiblePerson} name="siteResponsiblePerson" onChange={this.valueChange} className="inputWithoutBorder" />
								</InputGroup>
							</Col>
							<Col sm={1}>
							</Col>
							<Col sm={3}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">責任者名</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control type="text" value={this.state.siteResponsiblePerson} name="siteResponsiblePerson" autoComplete="off" size="sm" onChange={this.valueChange} />
								</InputGroup>
							</Col>
						</Row>
						<Row>
							{/*<Col sm={3} hidden>
								<InputGroup size="sm" className="mb-3">
									業務名称&nbsp;
									<input style={{ width: "120px" }} value={this.state.systemName} name="systemName" onChange={this.valueChange} className="inputWithoutBorder" />
								</InputGroup>
							</Col>
							<Col sm={3} md={{ span: 3, offset: 6 }} hidden>
								<InputGroup size="sm" className="mb-3">
									作業担当者&nbsp;
									<input style={{ width: "150px" }} value={this.state.employeeName} name="employeeName" onChange={this.valueChange} className="inputWithoutBorder" disabled />
								</InputGroup>
							</Col>*/}
							<Col sm={3}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">業務名称</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control type="text" value={this.state.systemName} name="systemName" autoComplete="off" size="sm" onChange={this.valueChange} />
								</InputGroup>
							</Col>
							<Col sm={6}>
							</Col>
							<Col sm={3}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="fiveKanji">作業担当者</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control type="text" value={this.state.employeeName} name="employeeName" autoComplete="off" size="sm" onChange={this.valueChange} />
								</InputGroup>
							</Col>
						</Row>
						<Row>
							<Col sm={12}>
                        		<Button size="sm" variant="info" name="clickButton" title="月に一回のみ登録してください" onClick={this.beferShuseiTo.bind(this, "breakTime")} variant="info" id="employeeInfo">休憩時間登録</Button>
								<div style={{ "float": "right" }}>
                        			<Button size="sm" variant="info" name="clickButton" onClick={this.release} disabled={this.state.rowNo.length === 0} variant="info">解除</Button>{" "}
									<Link className="btn btn-info btn-sm" onClick={this.downloadPDF.bind(this)} id="downloadPDF"><FontAwesomeIcon icon={faDownload} /> PDF</Link>
								</div>
							</Col>
						</Row>
						<Row>
							<Col sm={12}>
								<BootstrapTable className={"bg-white text-dark"} data={this.state.dateData} selectRow={selectRow} pagination={false} options={this.options} headerStyle={{ background: '#5599FF' }} >
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='50' dataField='hasWork' dataFormat={this.hasWorkFormatter} >勤務</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='30' dataField='day' isKey>日</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='40' dataField='week' >曜日</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='100' dataField='startTime' dataFormat={this.startTimeFormatter} hidden>作業開始時刻</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='50' dataField='startTimeHours' dataFormat={this.startTimeHoursFormatter}>開始時</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='50' dataField='startTimeMinutes' dataFormat={this.startTimeMinutesFormatter}>開始分</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='100' dataField='endTime' dataFormat={this.endTimeFormatter} hidden>作業終了時刻</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='50' dataField='endTimeHours' dataFormat={this.endTimeHoursFormatter} >終了時</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='50' dataField='endTimeMinutes' dataFormat={this.endTimeMinutesFormatter} >終了分</TableHeaderColumn>

									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='70' dataField='sleepHour' dataFormat={this.sleepHourFormatter} hidden >休憩時間</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='60' dataField='workHour'  dataFormat={this.workHourFormatter}>作業時間</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='220' dataField='workContent' dataFormat={this.workContentFormatter} >作業内容</TableHeaderColumn>
									<TableHeaderColumn tdStyle={{ padding: '.20em' }} width='220' dataField='remark' dataFormat={this.remarkFormatter} >備考</TableHeaderColumn>
								</BootstrapTable>
							</Col>
						</Row>
						<Row>
							<Col sm={3}>
								出勤日数：
								{this.state.workDays}
							</Col>
							<Col sm={3} md={{ span: 0, offset: 2 }}>
								合計時間：
								{this.state.workHours}H
							</Col>
						</Row>
						<br/>
						<Row>
							<Col style={{ "textAlign": "right" }} sm={3} md={{ span: 0, offset: 3 }} >
								<div hidden={this.state.isConfirmedPage}>
									<Button size="sm" className="btn btn-info btn-sm" onClick={this.beforeSubmit.bind(this)}>
										<FontAwesomeIcon icon={faUpload} /> 提出
									</Button>
								</div>
								<div hidden={!this.state.isConfirmedPage}>
									<Button size="sm" className="btn btn-info btn-sm" onClick={this.onBack.bind(this)}>
										<FontAwesomeIcon icon={faUndo} /> 戻る
										</Button>
										&nbsp;&nbsp;
										<Button size="sm" className="btn btn-info btn-sm" onClick={this.onSubmit.bind(this)}>
										<FontAwesomeIcon icon={faUpload} /> 確認
										</Button>
								</div>
							</Col>
						</Row>
					</Form.Group>
				</div>
		         <div className='loadingImage' hidden={this.state.loading} style = {{"position": "absolute","top":"60%","left":"60%","margin-left":"-200px", "margin-top":"-150px",}}></div>
			</div >
		);
	}
}

export default DutyRegistration;
