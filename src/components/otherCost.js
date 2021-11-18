/* 社員を追加 */
import React from 'react';
import $ from 'jquery'
import { Form, Button, Col, Row, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import '../asserts/css/style.css';
import DatePicker from "react-datepicker";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUpload, faUndo, faFile } from '@fortawesome/free-solid-svg-icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as publicUtils from './utils/publicUtils.js';
import store from './redux/store';
import MyToast from './myToast';
import ErrorsMessageToast from './errorsMessageToast';
import costRegistration from './costRegistration';
import * as utils from './utils/publicUtils.js';
axios.defaults.withCredentials = true;
/**1
 * 他の費用画面
 */
class otherCost extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initialState;//初期化
		this.valueChange = this.valueChange.bind(this);
	}
	//初期化
	initialState = {
		salesProgressCodes: [],
		costClassificationCode: '',//選択中の区分
		transportationCode: '',//選択中の交通手段
		stationCode3: '',　// 出発
		stationCode4: '',　// 到着
		stationCode5: '',　// 場所
		errorItem: '',
		costClassificationsts: 0,//区分状態
		otherCostFileFlag: false,//ファイル状態
		station: store.getState().dropDown[14],
		costClassificationForOtherCost: store.getState().dropDown[47],
		transportation: store.getState().dropDown[31],
		round: store.getState().dropDown[37],
		serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
	};
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value,
		})
	}
	costValueChange = (e) => {
		let cost = e.target.value
		if(cost.length > 7)
			return cost;
		let result = "";
		for (let i = 0; i < cost.length; i++ )
		{
			if (cost.charCodeAt(i)==12288)
			{
				result += String.fromCharCode(cost.charCodeAt(i)-12256);
				continue;
			}
			if (cost.charCodeAt(i)>65280 && cost.charCodeAt(i)<65375)
				result += String.fromCharCode(cost.charCodeAt(i)-65248);
			else result += String.fromCharCode(cost.charCodeAt(i));
		}
		cost = utils.addComma(result) 
		this.setState({
			[e.target.name]: cost
		})
	}
	valueChangeAndFlag = event => {
		if (event.target.value > 1 && this.state.costClassificationCode ==1) {
			this.resetBook2();
		} else if(this.state.costClassificationCode > 1 && event.target.value == 1){
			this.resetBook2();
        }
		if(event.target.value === ""){
			this.setState({
				yearAndMonth: null,
			})
		}
		this.setState({
			[event.target.name]: event.target.value,
			changeFile: true,
		})

		

	}
	//初期化メソッド
	componentDidMount() {
		this.setState({ "errorsMessageShow": false, "myToastShow": false, minDate: this.props.minDate, deleteFile:false });
		//定期を選択欄から除去
		if (this.state.costClassificationForOtherCost.length >= 6) {
			this.costClassificationForOtherCost();
		}
		if (this.state.round.length > 3) {
			this.roundSet();
		}
		
		this.setState({ yearMonth: this.props.yearMonth, });

		if (this.props.changeData1) {
			if (this.props.costClassification == 1) {
				this.setState({
					costClassificationCode: this.props.costClassification,
					oldCostClassification: this.props.oldCostClassification1,
					oldHappendDate: this.props.oldHappendDate1,
					yearAndMonth: this.props.yearAndMonth,
					transportationCode: this.props.transportationCode.toString(),
					stationCode3: this.props.stationCode3.toString(),
					stationCode4: this.props.stationCode4.toString(),
					cost1: this.props.cost1,
					oldCostFile: this.props.oldCostFile1,
					changeData: this.props.changeData1,
					changeFile: this.props.changeFile1,
					costRegistrationFileFlag2: this.props.costRegistrationFileFlag1,
					remark: this.props.remark,
					otherCostFilePath: this.props.otherCostFile,
				})
			} else {
				this.setState({
					yearAndMonth: this.props.yearAndMonth,
					costClassificationCode: this.props.costClassification,
					oldCostClassification: this.props.oldCostClassification1,
					oldHappendDate: this.props.oldHappendDate1,
					detailedNameOrLine2: this.props.detailedNameOrLine2,
					stationCode5: this.props.stationCode5.toString(),
					remark: this.props.remark,
					cost2: this.props.cost2,
					oldCostFile: this.props.oldCostFile1,
					changeData: this.props.changeData1,
					changeFile: this.props.changeFile1,
					costRegistrationFileFlag3: this.props.costRegistrationFileFlag1,
					otherCostFilePath: this.props.otherCostFile,
				})
			}
		} else {
			this.resetBook();
        }
	}

	costClassificationForOtherCost = () => {
		var costClassificationForOtherCost = this.state.costClassificationForOtherCost;
		console.log(this.state.costClassificationForOtherCost)
		console.log(this.state.costClassificationForOtherCost.splice(1, 1))
		this.setState({
			costClassificationForOtherCost: this.state.costClassificationForOtherCost,
		})
	};
	roundSet = () => {
		var round = this.state.round;
		console.log(this.state.round)
		console.log(this.state.round.splice(1, 1))
		this.setState({
			round: this.state.round,
		})
	};
	/**
     * 添付ボタン
     */
	addFile = (event, name) => {
		$("#" + name).click();
	}

	changeFile = (event, name) => {
		var filePath = event.target.value;
		var arr = filePath.split('\\');
		var fileName = arr[arr.length - 1];
		if (name === "otherCostFile") {
			this.setState({
				otherCostFile: filePath,
				otherCostFilePath: filePath,
				otherCostFileName: fileName,
				changeFile: true,
				costRegistrationFileFlag: true,
			})
			if (filePath != null) {
				this.setState({
					otherCostFileFlag: true,
				})
			}
		}
	}
	//reset
	resetBook = () => {
		this.setState(() => this.resetStates);
		this.setState({ "errorsMessageShow": false, "myToastShow": false, });
	};
	//リセット　reset
	resetStates = {
		costClassificationCode: '', yearAndMonth: null, stationCode2: '',
		stationCode3: '', stationCode4: '', stationCode5: '', detailedNameOrLine2: '',
		cost1: '', cost2: '', transportationCode: '', costRegistrationFileFlag2: '',
		costRegistrationFileFlag3: '', remark: '', oldCostFile: '', otherCostFile: '',
		otherCostFilePath: '',
	};
	resetBook2 = () => {
		this.setState(() => this.changeCostClassificationCode);
		this.setState({ "errorsMessageShow": false, "myToastShow": false, });
	};
	changeCostClassificationCode={
		stationCode2: '',
		stationCode3: '', stationCode4: '', stationCode5: '', detailedNameOrLine2: '',
		cost1: '', cost2: '', transportationCode: '', costRegistrationFileFlag2: '',
		costRegistrationFileFlag3: '', remark: '',
	};
	costClassificationCode(code) {
		let costClassificationCode = this.state.costClassificationForOtherCost;
		for (var i in costClassificationCode) {
			if (costClassificationCode[i].code != "") {
				if (code == costClassificationCode[i].code) {
					return costClassificationCode[i].name;
				}
			}
		}
	};
	//　年月3
	inactiveYearAndMonth = (date) => {
		this.setState(
			{
				yearAndMonth: date,
				changeFile: true,
			}
		);
	};
	
	handleTag = ({ target }, fieldName) => {
		const { value, id } = target;
		if (value === '') {
			this.setState({
				[id]: '',
			})
		} else {
			if (fieldName === "costClassification" && this.state.costClassification.find((v) => (v.name === value)) !== undefined) {
				this.setState({
					costClassificationCode: this.state.costClassification.find((v) => (v.name === value)).code,
				})
			} else if (fieldName === "transportation" && this.state.transportation.find((v) => (v.name === value)) !== undefined) {
				switch (fieldName) {
					case 'transportation':
						this.setState({
							transportationCode: this.state.transportation.find((v) => (v.name === value)).code,
						})
						break;
					default:
				}
			} else if (fieldName === "station" && this.state.station.find((v) => (v.name === value)) !== undefined) {
				switch (id) {
					case 'stationCode3':
						this.setState({
							stationCode3: this.state.station.find((v) => (v.name === value)).code,
						})
						break;
					case 'stationCode4':
						this.setState({
							stationCode4: this.state.station.find((v) => (v.name === value)).code,
						})
						break;
					case 'stationCode5':
						this.setState({
							stationCode5: this.state.station.find((v) => (v.name === value)).code,
						})
						break;
					default:
				}
			}
		}
	};
	//登録と修正
	InsertCost = () => {
		this.setState({ "errorsMessageShow": false, "myToastShow": false,  });
		const formData = new FormData()
		if (this.props.changeData1) {
			var theUrl = "costRegistration/updateCostRegistration"
		} else {
			var theUrl = "costRegistration/insertCostRegistration"
		}
		if (this.state.costClassificationCode < 1) {
			this.setState({ errorItem: "costClassificationCode" });
			this.setState({ "errorsMessageShow": true, "type": "fail", "method": "put", "message": "区分を入力してください" });
				return;
			}
		if (this.state.costClassificationCode == 1) {
			if (this.state.yearAndMonth == "" || this.state.yearAndMonth == null ||
			this.state.transportationCode == "" || this.state.cost1 == "" || this.state.cost1 == null ||
			this.state.stationCode3 == "" ||
			this.state.stationCode4 == "") {
				this.setState({ "errorsMessageShow": true, "type": "fail", "method": "put", "message": this.costClassificationCode(this.state.costClassificationCode) + "関連の項目入力してください" });
				if(this.state.yearAndMonth == "" || this.state.yearAndMonth == null){
					this.setState({ errorItem: "yearAndMonth" });
					return;
				}
				if(this.state.transportationCode == ""){
					this.setState({ errorItem: "transportationCode" });
					return;
				}
				if(this.state.stationCode3 == ""){
					this.setState({ errorItem: "stationCode3" });
					return;
				}
				if(this.state.stationCode4 == ""){
					this.setState({ errorItem: "stationCode4" });
					return;
				}
				if(this.state.cost1 == "" || this.state.cost1 == null){
					this.setState({ errorItem: "cost1" });
					return;
				}
				return;
			}
			if(isNaN(utils.deleteComma(this.state.cost1))){
				this.setState({ errorItem: "cost1" });
				this.setState({ "errorsMessageShow": true, "type": "fail", "method": "put", "message": "料金は半角数字のみ入力してください。" });
				return;
			}
			const emp = {
				yearMonth: publicUtils.formateDate(this.state.yearMonth, true).substring(0,6),
				costClassificationName: this.costClassificationCode(this.state.costClassificationCode),
				costClassificationCode: this.state.costClassificationCode,
				oldCostClassificationName: this.costClassificationCode(this.state.oldCostClassification),
				oldCostClassificationCode: this.state.oldCostClassification,
				oldHappendDate: this.state.oldHappendDate,
				happendDate: publicUtils.formateDate(this.state.yearAndMonth, true),
				transportationCode: this.state.transportationCode,
				originCode: this.state.stationCode3,
				destinationCode: this.state.stationCode4,
				remark: this.state.remark,
				cost: utils.deleteComma(this.state.cost1),
				changeFile: this.state.changeFile,
				oldCostFile: this.state.oldCostFile,
			}
			formData.append('emp', JSON.stringify(emp))
			formData.append('costFile', publicUtils.nullToEmpty($('#otherCostFile').get(0).files[0]))

		} else if (this.state.costClassificationCode > 1) {
			if (this.state.yearAndMonth == "" || this.state.yearAndMonth == null || this.state.detailedNameOrLine2 == "" ||
				(this.state.stationCode5 == "" && this.state.costClassificationCode != 4) || this.state.cost2 == "" || this.state.cost2 == null) {
				this.setState({ "errorsMessageShow": true, "method": "put", "message": this.costClassificationCode(this.state.costClassificationCode) + "関連の項目入力してください"  });
				if(this.state.yearAndMonth == "" || this.state.yearAndMonth == null){
					this.setState({ errorItem: "yearAndMonth" });
					return;
				}
				if(this.state.detailedNameOrLine2 == ""){
					this.setState({ errorItem: "detailedNameOrLine2" });
					return;
				}
				if(this.state.stationCode5 == "" && this.state.costClassificationCode != 4){
					this.setState({ errorItem: "stationCode5" });
					return;
				}
				if(this.state.cost2 == "" || this.state.cost2 == null){
					this.setState({ errorItem: "cost2" });
					return;
				}
				return;
			}
			if(isNaN(utils.deleteComma(this.state.cost2))){
				this.setState({ errorItem: "cost2" });
				this.setState({ "errorsMessageShow": true, "type": "fail", "method": "put", "message": "料金は半角数字のみ入力してください。" });
				return;
			}
			const emp = {
				yearMonth: publicUtils.formateDate(this.state.yearMonth, true).substring(0,6),
				costClassificationName: this.costClassificationCode(this.state.costClassificationCode),
				costClassificationCode: this.state.costClassificationCode,
				happendDate: publicUtils.formateDate(this.state.yearAndMonth, true),
				oldCostClassificationName: this.costClassificationCode(this.state.oldCostClassification),
				oldCostClassificationCode: this.state.oldCostClassification,
				oldHappendDate: this.state.oldHappendDate,
				detailedNameOrLine: this.state.detailedNameOrLine2,
				stationCode: this.state.stationCode5,
				transportationCode: this.state.transportationCode,
				remark: this.state.remark,
				cost: utils.deleteComma(this.state.cost2),
				changeFile: this.state.changeFile,
				oldCostFile: this.state.oldCostFile,
			}
			formData.append('emp', JSON.stringify(emp))
			formData.append('costFile', publicUtils.nullToEmpty($('#otherCostFile').get(0).files[0]))
		}
		axios.post(this.state.serverIP + theUrl, formData)
			.then(response => {
				if (response.data) {
					this.setState({ "myToastShow": true, "method": "put", "message": "登録完了"});
					setTimeout(() => this.setState({ "myToastShow": false }), 3000);
					this.props.otherCostToroku();
				} else {
					this.setState({ "errorsMessageShow": true, "message": this.costClassificationCode(this.state.costClassificationCode) + "データはすでに存在している"});
					setTimeout(() => this.setState({ "myToastShow": false }), 3000);
				}
				
			}).catch((error) => {
				console.error("Error - " + error);
			});
	};
	render() {
		const { cost1, cost2, remark, costClassificationsts, otherCostFileFlag } = this.state;
		const station = this.state.station;
		const round = this.state.round;
		return (
			<div>
				<div hidden>
					<Form.File id="getFile" accept="application/pdf,application/vnd.ms-excel" custom hidden onChange={this.fileUpload} />
				</div>
				<div style={{ "display": this.state.myToastShow ? "block" : "none" }}>
					<MyToast myToastShow={this.state.myToastShow} message={this.state.message} type={"success"} />
				</div>
				<div style={{ "display": this.state.errorsMessageShow ? "block" : "none" }}>
					<ErrorsMessageToast errorsMessageShow={this.state.errorsMessageShow} message={this.state.message} type={"danger"} />
				</div>
				<Form >
					<div>
						<Form.Group>
							<Row inline="true">
								<Col className="text-center">
									<h2>他の費用</h2>
								</Col>
							</Row>
						</Form.Group>
					</div>
				</Form>
				<Form >
					<Form.Group>
						<Row>
							<Col>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">区分</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control as="select"
										onChange={this.valueChangeAndFlag.bind(this)}
										size="sm"
										name="costClassificationCode"
										value={this.state.costClassificationCode}
										style={this.state.errorItem === "costClassificationCode" ? {borderColor: "red"} : {borderColor: ""}}
										autoComplete="off">
										{this.state.costClassificationForOtherCost.map(data =>
											<option key={data.code} value={data.code}>
												{data.name}
											</option>
										)}
									</Form.Control>
								</InputGroup>
							</Col>
							<Col>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="threeKanji">日付</InputGroup.Text>
										<DatePicker
											value={this.state.yearAndMonth}
											selected={this.state.yearAndMonth}
											onChange={this.inactiveYearAndMonth}
											disabled={this.state.costClassificationCode === ""}
											autoComplete="off"
											locale="ja"
											minDate={this.state.minDate}
											dateFormat="yyyy/MM/dd"
											id={this.state.costClassificationCode === "" ? "datePickerReadonlyDefault" : (this.state.errorItem === "yearAndMonth" ? "datePickerRed" : "datePicker")}
											className="form-control form-control-sm"
										/>
									</InputGroup.Prepend>
								</InputGroup>
							</Col>
							<Col sm={6}>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="threeKanji">備考</InputGroup.Text>
									</InputGroup.Prepend>
									<FormControl placeholder="例：XXXXX" name="remark" value={this.state.remark} autoComplete="off" disabled={this.state.costClassificationCode === ""}
										onChange={this.valueChange} type="text" aria-label="Small" size="sm" aria-describedby="inputGroup-sizing-sm"/>
								</InputGroup>
							</Col>
						</Row>
						<Row>
							<Col>
								<font style={{ whiteSpace: 'nowrap' }}><b>出張費用</b></font>
							</Col>
						</Row>
						<Row>
							<Col>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">交通手段</InputGroup.Text>
									</InputGroup.Prepend>
									<Form.Control as="select"
										onChange={this.valueChange}
										size="sm"
										name="transportationCode"
										value={this.state.transportationCode}
										style={this.state.errorItem === "transportationCode" ? {borderColor: "red"} : {borderColor: ""}}
										autoComplete="off"
										disabled={this.state.costClassificationCode != 1 ? true : false}
									>
										{this.state.transportation.map(data =>
											<option key={data.code} value={data.code}>
												{data.name}
											</option>
										)}
									</Form.Control>
								</InputGroup>
							</Col>
							<Col>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="threeKanji">出発</InputGroup.Text>
									</InputGroup.Prepend>
									<Autocomplete
										value={this.state.station.find((v) => (v.code === this.state.stationCode3)) || {}}
										options={this.state.station}
										id="station3"
										disabled={this.state.costClassificationCode != 1 ? true : false}
										name="station"
										getOptionLabel={(option) => option.name}
										onSelect={(event) => this.handleTag(event, 'station')}
										renderInput={(params) => (
											<div ref={params.InputProps.ref}>
												<input placeholder="  出発" type="text" {...params.inputProps} style={this.state.errorItem === "stationCode3" ? {borderColor: "red"} : {borderColor: ""}} className="auto form-control Autocompletestyle-costRegistration" id="stationCode3" />
											</div>
										)}
									/>
								</InputGroup>
							</Col>
							<Col>
								<InputGroup size="sm" className="mb-3" >
									<InputGroup.Prepend>
										<InputGroup.Text id="threeKanji">到着</InputGroup.Text>
									</InputGroup.Prepend>
									<Autocomplete
										value={this.state.station.find((v) => (v.code === this.state.stationCode4)) || {}}
										options={this.state.station}
										id="station4"
										name="station"
										disabled={this.state.costClassificationCode != 1 ? true : false}
										getOptionLabel={(option) => option.name}
										onSelect={(event) => this.handleTag(event, 'station')}
										renderInput={(params) => (
											<div ref={params.InputProps.ref}>
												<input placeholder="  到着" type="text" {...params.inputProps} style={this.state.errorItem === "stationCode4" ? {borderColor: "red"} : {borderColor: ""}} className="auto form-control Autocompletestyle-costRegistration" id="stationCode4" />
											</div>
										)}
									/>
								</InputGroup>
							</Col>
							<Col>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="threeKanji">料金</InputGroup.Text>
									</InputGroup.Prepend>
									<FormControl value={cost1} name='cost1' maxLength='7' onChange={(e) => this.costValueChange(e)} style={this.state.errorItem === "cost1" ? {borderColor: "red"} : {borderColor: ""}}  disabled={this.state.costClassificationCode != 1 ? true : false} placeholder="例：XXXXX" autoComplete="off"  type="text" aria-label="Small" size="sm" aria-describedby="inputGroup-sizing-sm" />
								</InputGroup>
							</Col>
						</Row>
						<Row>
							<Col>
								<font style={{ whiteSpace: 'nowrap' }}><b>宿泊と食事費用など</b></font>
							</Col>
						</Row>
						<Row>							
							<Col>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="inputGroup-sizing-sm">名称</InputGroup.Text>
									</InputGroup.Prepend>
									<FormControl placeholder="" autoComplete="off" name="detailedNameOrLine2" value={this.state.detailedNameOrLine2} style={this.state.errorItem === "detailedNameOrLine2" ? {borderColor: "red"} : {borderColor: ""}}
										onChange={this.valueChange} type="text" aria-label="Small" size="sm" aria-describedby="inputGroup-sizing-sm" disabled={this.state.costClassificationCode > 1 ? false : true} />
								</InputGroup>
							</Col>
							<Col>
								<InputGroup size="sm" className="mb-3" >
									<InputGroup.Prepend>
										<InputGroup.Text id="threeKanji">場所</InputGroup.Text>
									</InputGroup.Prepend>
									<Autocomplete
										value={this.state.station.find((v) => (v.code === this.state.stationCode5)) || {}}
										options={this.state.station}
										name="station"
										disabled={this.state.costClassificationCode > 1 ? false : true}
										getOptionLabel={(option) => option.name}
										onSelect={(event) => this.handleTag(event, 'station')}
										renderInput={(params) => (
											<div ref={params.InputProps.ref}>
												<input placeholder="  場所" type="text" {...params.inputProps} style={this.state.errorItem === "stationCode5" ? {borderColor: "red"} : {borderColor: ""}} className="auto form-control Autocompletestyle-costRegistration" id="stationCode5" />
											</div>
										)}
									/>
								</InputGroup>
							</Col>
							<Col>
								<InputGroup size="sm" className="mb-3">
									<InputGroup.Prepend>
										<InputGroup.Text id="threeKanji">料金</InputGroup.Text>
									</InputGroup.Prepend>
									<FormControl value={cost2} name='cost2' maxLength='7' style={this.state.errorItem === "cost2" ? {borderColor: "red"} : {borderColor: ""}} onChange={(e) => this.costValueChange(e)}  value={this.state.cost2} placeholder="例：XXXXX" autoComplete="off" type="text" aria-label="Small" size="sm" aria-describedby="inputGroup-sizing-sm" disabled={this.state.costClassificationCode > 1 ? false : true} />
								</InputGroup>
							</Col>
							<Col></Col>
						</Row>
					</Form.Group>
					<div style={{ "textAlign": "center" }}>
						<Button size="sm" variant="info" onClick={this.InsertCost} type="button" on>
							<FontAwesomeIcon icon={faSave} /> {this.props.changeData1 ? "更新" : "登録"}
						</Button>{' '}
						<Button size="sm" variant="info" type="reset" onClick={this.resetBook}>
							<FontAwesomeIcon icon={faUndo} /> Reset
						</Button>{' '}
						<Button size="sm" variant="info" type="reset" onClick={(event) => this.addFile(event, 'otherCostFile')} disabled={this.state.costClassificationCode === ""}>
							<FontAwesomeIcon icon={faFile} /> {this.state.otherCostFilePath === "" ? "添付" : "済み"}
						</Button>{' '}
					</div>
					<div>
						<Form.File id="otherCostFile" hidden data-browse="添付" value={this.state.otherCostFile} custom onChange={(event) => this.changeFile(event, 'otherCostFile')} />
					</div>
				</Form>
			</div>
		);
	}
}
export default otherCost;