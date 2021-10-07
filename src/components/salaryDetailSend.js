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
import { faSave, faEnvelope, faIdCard, faListOl, faBuilding, faDownload, faBook, faGlasses } from '@fortawesome/free-solid-svg-icons';
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
		rowEmployeeNo: "",
		pdfUpdate: "",
		pdfUpdateName: "",
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
    
    handleRowSelect = (row, isSelected, e) => {
    	if(isSelected){
    		this.setState({
    			rowEmployeeNo: row.employeeNo,
    		});
    	}else{
    		this.setState({
    			rowEmployeeNo: "",
    		});
    	}

	}
    
	update = () => {
		
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
		var filePath = event.target.value;
		var arr = filePath.split('\\');
		var fileName = arr[arr.length - 1];
		this.setState({
			pdfUpdate: filePath,
			pdfUpdateName: fileName,
		})

		let fileNameList = [];
		for(let i = 0;i < $('#pdfUpdate').get(0).files.length;i++){
			this.setState({ loading: false, });
			fileNameList.push($('#pdfUpdate').get(0).files[i].name);
			
			const formData = new FormData();
			formData.append('pdfUpdate', $('#pdfUpdate').get(0).files[i]);
			
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
							<Button size="sm" variant="info" name="clickButton"　onClick={(event) => this.addFile(event, 'pdfUpdate')}　><FontAwesomeIcon icon={faSave} /> 取込</Button>{' '}
							<Button size="sm" variant="info" name="clickButton"　onClick={this.update} disabled={this.state.rowEmployeeNo === ""}><FontAwesomeIcon icon={faSave} /> 削除</Button>{' '}
							<Button size="sm" variant="info" name="clickButton"　onClick={this.update}　><FontAwesomeIcon icon={faSave} /> 送信</Button>{' '}
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

