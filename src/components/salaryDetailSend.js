import React,{Component} from 'react';
import {Row , Col , InputGroup ,Form, Button, Modal } from 'react-bootstrap';
import '../asserts/css/style.css';
import DatePicker from "react-datepicker";
import * as publicUtils from './utils/publicUtils.js';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import ErrorsMessageToast from './errorsMessageToast';
import $ from 'jquery';
import axios from 'axios';
import store from './redux/store';
import MyToast from './myToast';
import MailSalary from './mailSalary';
import TableSelect from './TableSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEnvelope, faIdCard, faListOl, faBuilding, faTrash, faUpload, faGlasses } from '@fortawesome/free-solid-svg-icons';
axios.defaults.withCredentials = true;

class salaryDetailSend extends Component {// 状況変動一覧
     constructor(props){
        super(props);
        this.state = this.initialState;// 初期化
		this.options = {
			sizePerPage: 15,
			pageStartIndex: 1,
			paginationSize: 3,
			prePage: '<', // Previous page button text
            nextPage: '>', // Next page button text
            firstPage: '<<', // First page button text
            lastPage: '>>', // Last page button text
			hideSizePerPage: true,
            alwaysShowAllBtns: true,
            paginationShowsTotal: this.renderShowsTotal,
			sortIndicator: false, // 隐藏初始排序箭头
		};
    }

    initialState = {
    	salesProgressCodes: store.getState().dropDown[70],// ステータス
        serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
		modeSelect: 'radio',
		selectetRowIds: [],
		loginUserInfo: [],
		rowNo: "",
		rowEmployeeNo: "",
		rowEmployeeFristName: "",
		rowCompanyMail: "",
		pdfUpdate: "",
		pdfUpdateName: "",
		yearAndMonth: "",
		loading: true,
		myToastShow: false,
    }
               	// onchange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value
        });   
    }

    componentDidMount(){
    	this.getLoginUserInfo();
    	this.getSalaryDetail();
    	
    	var yearAndMonth = this.getLastMonth();
		this.setState({
			yearAndMonth: yearAndMonth,
        });   
    }
    
	getLoginUserInfo = () => {
		axios.post(this.state.serverIP + "sendLettersConfirm/getLoginUserInfo")
			.then(result => {
				this.setState({
					loginUserInfo: result.data,
				})
			})
			.catch(function(error) {
				alert(error);
			});
	}
    
    getSalaryDetail(){
    	axios.post(this.state.serverIP + "SalaryDetailSend/getEmployee")
		.then(response => {
			this.setState({
				employeeList:response.data.data
	        });   
		}).catch((error) => {
			console.error("Error - " + error);
		});
    }
    
    getLastMonth = () => {
    	var date = new Date();
    	var year = date.getFullYear();
    	var month = date.getMonth();
    	if(month === 0){
    		year = year - 1;
    		month = 12;
    	}
    	return year + "年" + month + "月";
    }
    
    handleRowSelect = (row, isSelected, e) => {
    	if(isSelected){
    		this.setState({
    			rowNo: row.rowNo,
    			rowEmployeeNo: row.employeeNo,
    			rowEmployeeFristName: row.employeeFristName,
    			rowCompanyMail: row.companyMail,
    		});
    	}else{
    		this.setState({
    			rowNo: "",
    			rowEmployeeNo: "",
    			rowEmployeeFristName: "",
    			rowCompanyMail: "",
    		});
    	}

	}
    
	deleteRow = () => {
		let employeeList = this.state.employeeList;
		for(let i in employeeList){
			if(employeeList[i].rowNo === this.state.rowNo){
				employeeList.splice(i,1);
				break;
			}
		}
		for(let i in employeeList){
			employeeList[i].rowNo = Number(i) + 1;
		}
		this.setState({
			employeeList: employeeList,
			rowNo: "",
			rowEmployeeNo: "",
			rowEmployeeFristName: "",
			rowCompanyMail: "",
		});
	}
	
	openDaiolog = () => {
		this.setState({
			daiologShowFlag: true,
		});
	}
	
	closeDaiolog = () => {
		this.setState({
			daiologShowFlag: false,
		})
	}
	
	addFile = (event, name) => {
		$("#" + name).click();
	}
	
	changeFile = (event, name) => {
		this.setState({ loading: false, });

		var filePath = event.target.value;
		var arr = filePath.split('\\');
		var fileName = arr[arr.length - 1];
		this.setState({
			pdfUpdate: filePath,
			pdfUpdateName: fileName,
		})

		let fileNameList = [];
		for(let i = 0;i < $('#pdfUpdate').get(0).files.length;i++){
			const formData = new FormData();
			let employeeList = this.state.employeeList;
			for(let j in employeeList){
				if($('#pdfUpdate').get(0).files[i].name.search(String(employeeList[j].employeeNo)) !== -1){
					fileNameList.push($('#pdfUpdate').get(0).files[i].name);
					formData.append('pdfUpdate', $('#pdfUpdate').get(0).files[i]);
					break;
				}
			}
			axios.post(this.state.serverIP + "SalaryDetailSend/updatePDF", formData)
			.then(result => {
				if(i === $('#pdfUpdate').get(0).files.length - 1){
					this.updateEmployeeList(fileNameList);
					this.setState({ loading: true, });
					this.setState({ "myToastShow": true, myToastShowValue: "取り込み完了" });
					setTimeout(() => this.setState({ "myToastShow": false }), 3000);
				}
			}).catch((error) => {
				this.setState({ loading: true, });
				console.error("Error - " + error);
				this.setState({ "errorsMessageShow": true, errorsMessageValue: "アップデートするファイル大きすぎる。" });
				setTimeout(() => this.setState({ "errorsMessageShow": false }), 3000);
			});
		}
	}
	
	updateEmployeeList = (fileNameList) => {
		let employeeList = this.state.employeeList;
		for(let i in employeeList){
			for(let j in fileNameList){
				if(fileNameList[j].search(String(employeeList[i].employeeNo)) !== -1){
					employeeList[i].fileName = fileNameList[j];
					employeeList[i].sendState = "0";
					break;
				}
			}
		}
		this.setState({ employeeList: employeeList });
	}
    
	sendState(cell) {
		if(cell === "0")
			return "未送信";
		else if(cell === "1")
			return "送信済み";
    };

	// 送信チェック
	beforeSendMail = () => {
		let list = [];
		let employeeList = this.state.employeeList;
		for(let i in employeeList){
			if(employeeList[i].fileName === undefined || employeeList[i].fileName === null || employeeList[i].fileName === "" ){
				list.push(employeeList[i].employeeNo);
			}
		}
		if(list.length > 0){
			let message = "";
			for(let i in list){
				message += list[i] + " ";
			}
			message += "ファイル存在していません、チェックしてください。";
			this.setState({ "errorsMessageShow": true, errorsMessageValue: message });
			setTimeout(() => this.setState({ "errorsMessageShow": false }), 3000);
		}else{
			this.sendMailWithFile();
		}
	}

	// 送信処理
	sendMailWithFile = () => {
		let yearAndMonth = this.getLastMonth();
		let employeeList = this.state.employeeList;
		for(let i in employeeList){
			if(employeeList[i].companyMail !== undefined && employeeList[i].companyMail !== null && employeeList[i].companyMail !== "" && employeeList[i].sendState !== "1"){
				//	普通邮箱送信
				var mailConfirmContont = employeeList[i].employeeFristName + `さん<br/>
				<br/>
				お疲れ様です。LYCの`+ this.state.loginUserInfo[0].employeeFristName + this.state.loginUserInfo[0].employeeLastName + `です。<br/>
				<br/>` +
				`表題の件につきまして、<br/>` +
				yearAndMonth + `分の給料明細を添付致しました。<br/>
				ご確認お願いいたします。<br/>
				<br/>
				以上です。<br/>
				<br/>
				----------------------------------------------------------------------------<br/>
				LYC株式会社<br/>` + 
				`事務担当 ` + this.state.loginUserInfo[0].employeeFristName + ` ` + this.state.loginUserInfo[0].employeeLastName + `<br/>
				〒101-0032 東京都千代田区岩本町3-3-3サザンビル3F<br/> 
				URL：http://www.lyc.co.jp/<br/>
				TEL：03-6908-5796<br/>
				E-mail：`+ this.state.loginUserInfo[0].companyMail + ` 共通mail：eigyou@lyc.co.jp<br/>
				P-mark：第21004525(02)号<br/>
				労働者派遣事業許可番号　派13-306371<br/>`;
				
				//	@lyc.co.jp邮箱送信（　<br/>无法转换　）
				var mailConfirmContontNoBr = employeeList[i].employeeFristName + `さん
				
				お疲れ様です。LYCの`+ this.state.loginUserInfo[0].employeeFristName + this.state.loginUserInfo[0].employeeLastName + `です。
				` +`
				表題の件につきまして、
				` + yearAndMonth + `分の給料明細を添付致しました。
				ご確認お願いいたします。
				
				以上です。
				
				----------------------------------------------------------------------------
				LYC株式会社` + `
				事務担当 ` + this.state.loginUserInfo[0].employeeFristName + ` ` + this.state.loginUserInfo[0].employeeLastName + `
				〒101-0032 東京都千代田区岩本町3-3-3サザンビル3F
				URL：http://www.lyc.co.jp/
				TEL：03-6908-5796
				E-mail：`+ this.state.loginUserInfo[0].companyMail + ` 共通mail：eigyou@lyc.co.jp
				P-mark：第21004525(02)号
				労働者派遣事業許可番号　派13-306371`;
				
				var model = {};
				
				model["mailTitle"] = yearAndMonth + "給料明細";
				if(employeeList[i].companyMail.search("@lyc.co.jp") !== -1)
					model["mailConfirmContont"] = mailConfirmContontNoBr;
				else
					model["mailConfirmContont"] = mailConfirmContont;
				model["selectedmail"] = employeeList[i].companyMail;
				model["resumePath"] = employeeList[i].fileName;
				model["mailFrom"] = this.state.loginUserInfo[0].companyMail;
				
				axios.post(this.state.serverIP + "SalaryDetailSend/sendMailWithFile", model)
				.then(result => {
					if (result.data.errorsMessage != null) {
						this.setState({ "errorsMessageShow": true, errorsMessageValue: result.data.errorsMessage });
						setTimeout(() => this.setState({ "errorsMessageShow": false }), 3000);
					} 								
					else{
						employeeList[i].sendState = "1";
						this.setState({ employeeList: employeeList });
					}
				})
				.catch(function(error) {
					alert(error);
				});
			}
		}
	}
	
    render(){
        const  situationChanges= this.state.situationChanges;
        const  errorsMessageValue= this.state.errorsMessageValue;
        const  myToastShowValue= this.state.myToastShowValue;

        const selectRow = {
				bgColor: 'pink',
    			mode: this.state.modeSelect,
    			clickToSelectAndEditCell: true,
    			hideSelectColumn: true,
    			clickToSelect: true,
    			clickToExpand: true,
    			onSelect: this.handleRowSelect,
    		};
				
        return(
            <div>
                <div style={{ "display": this.state.errorsMessageShow ? "block" : "none" }}>
					<ErrorsMessageToast errorsMessageShow={this.state.errorsMessageShow} message={errorsMessageValue} type={"danger"} />
				</div>
					<div style={{ "display": this.state.myToastShow ? "block" : "none" }}>
					<MyToast myToastShow={this.state.myToastShow} message={myToastShowValue} type={"success"} />
				</div>
				<Modal aria-labelledby="contained-modal-title-vcenter" centered backdrop="static"
					onHide={this.closeDaiolog} show={this.state.daiologShowFlag} dialogClassName="modal-bankInfo">
					<Modal.Header closeButton><Col className="text-center">
						<h2>送信メール確認</h2>
					</Col></Modal.Header>
					<Modal.Body >
						<MailSalary personalInfo={this} />
					</Modal.Body>
				</Modal>
                 <Row inline="true">
                     <Col  className="text-center">
                    <h2>給料明細送信</h2>
                    </Col> 
                </Row>
                <br/>
                <Row>
                    <Col sm={12}>
	                    <div style={{ "float": "left" }}>
							<Button size="sm" variant="info" name="clickButton"　onClick={this.openDaiolog} disabled={this.state.rowEmployeeNo === ""}><FontAwesomeIcon icon={faGlasses} /> メール確認</Button>{' '}
		                </div>
	                    <div style={{ "float": "right" }}>
							<Button size="sm" variant="info" name="clickButton"　onClick={(event) => this.addFile(event, 'pdfUpdate')}　><FontAwesomeIcon icon={faUpload} /> 取込</Button>{' '}
							<Button size="sm" variant="info" name="clickButton"　onClick={this.deleteRow} disabled={this.state.rowEmployeeNo === ""}><FontAwesomeIcon icon={faTrash} /> 削除</Button>{' '}
							<Button size="sm" variant="info" name="clickButton"　onClick={this.beforeSendMail}　><FontAwesomeIcon icon={faEnvelope} /> 送信</Button>{' '}
	                    </div>
	                    <div hidden>
							<Form.File id="pdfUpdate" data-browse="添付" multiple="multiple" value={this.state.pdfUpdate} custom onChange={(event) => this.changeFile(event, 'pdfUpdate')} />
						</div>
                    </Col>
				</Row>
				<Col>
                <div>
                    <BootstrapTable
                    data={this.state.employeeList}
                    pagination={true}
                    headerStyle={{ background: '#5599FF' }}
                    options={this.options}
                    selectRow={selectRow}
　					striped hover condensed>
							<TableHeaderColumn tdStyle={{ padding: '.45em' }} width='15%' dataField='rowNo' dataSort >番号</TableHeaderColumn>
							<TableHeaderColumn tdStyle={{ padding: '.45em' }} width='15%' dataField='employeeNo' isKey >社員番号</TableHeaderColumn>
							<TableHeaderColumn tdStyle={{ padding: '.45em' }} width='20%' dataField='employeeName'>氏名</TableHeaderColumn>
							<TableHeaderColumn tdStyle={{ padding: '.45em' }} width='30%' dataField='fileName'>ファイル名</TableHeaderColumn>
							<TableHeaderColumn tdStyle={{ padding: '.45em' }} width='20%' dataField='sendState' dataFormat={this.sendState.bind(this)}>送信ステータス</TableHeaderColumn>
					</BootstrapTable>
                    </div>
                 </Col>
         <div className='loadingImage' hidden={this.state.loading} style = {{"position": "absolute","top":"60%","left":"60%","margin-left":"-200px", "margin-top":"-150px",}}></div>
         </div>
        )
    }
}
    export default salaryDetailSend;

