import React from 'react';
import { Button, Form, Col, Row, InputGroup, FormControl, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../asserts/css/development.css';
import '../asserts/css/style.css';
import $ from 'jquery';
import DatePicker from "react-datepicker";
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUpload,faDownload, faSave, faEdit, faTrash} from '@fortawesome/free-solid-svg-icons';
import * as publicUtils from './utils/publicUtils.js';
import store from './redux/store';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MyToast from './myToast';
axios.defaults.withCredentials = true;

/**
 * 作業報告書登録画面
 */
class dataShare extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initialState;// 初期化
		this.valueChange = this.valueChange.bind(this);
	};
	componentDidMount(){
		this.searchData(this.state.fileNo);
	}
	// onchange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value
		})
	}
	
	dataStatusChange = event => {
		this.refs.table.setState({
			selectedRowKeys: []
		});
		this.setState({
			modeSelect: event.target.value === "0" ? 'radio' : 'checkbox',
			fileNo: event.target.value === "0" ? "" : [],
			rowNo: event.target.value === "0" ? "" : [],
			rowFilePath : event.target.value === "0" ? "" : [],
			rowShareStatus: event.target.value === "0" ? "" : [],
			rowClickFlag: true,
			employeeNo: null,
			employeeName: null,
			[event.target.name]: event.target.value
		},() => {
			this.searchData(this.state.fileNo);
		})
	}
	
	// 初期化データ
	initialState = {
		modeSelect: 'radio',
		dataShareList: [],
		currentPage: 1,
		rowClickFlag: true,
		rowNo: '',
		fileNo: '',
		rowFilePath : '',
		rowShareStatus: '',
		dataStatus: '0',
		yearAndMonth: null,
		shareStatusAll : [{code:"0",value:"upload済み"},{code:"1",value:"共有済み"},{code:"2",value:"upload済み"},{code:"3",value:"承認済み"}],
		employeeNameDrop: store.getState().dropDown[38].slice(1),
		serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
	};
	
	// 年月
	inactiveYearAndMonth = (date) => {
		this.setState({
			yearAndMonth: date,
		}, () => {
			this.searchData(this.state.fileNo);
		});
	};

  /**
	 * uploadボタン
	 */
    workRepotUpload=()=>{
	let getfile=$("#getFile").val();
	let fileName = getfile.split('.');
	if(
		fileName[fileName.length -1]=== "xlsx" ||
		fileName[fileName.length -1]=== "xls" ||
		fileName[fileName.length -1]=== "xltx" ||
		fileName[fileName.length -1]=== "xlt" ||
		fileName[fileName.length -1]=== "xlsm" ||
		fileName[fileName.length -1]=== "xlsb" ||
		fileName[fileName.length -1]=== "xltm" ||
		fileName[fileName.length -1]=== "csv"||
		fileName[fileName.length -1]=== "pdf"
		){
	  }else{
	    alert('PDF或いはexcelをアップロードしてください')
	    return false;
	  }
		const formData = new FormData()
		const emp = {
				attendanceYearAndMonth:this.state.rowSelectAttendanceYearAndMonth,
			};
			formData.append('emp', JSON.stringify(emp))
			formData.append('dataShareFile', $("#getFile").get(0).files[0])
			formData.append('fileNo', this.state.fileNo)
			formData.append('shareStatus', "0")
						
			axios.post(this.state.serverIP + "dataShare/updateDataShareFile",formData)
			.then(response => {
				if (response.data != null) {
					this.searchData(response.data);
					this.setState({ "myToastShow": true, message: "アップロード成功！"  });
					setTimeout(() => this.setState({ "myToastShow": false }), 3000);
				} else {
					alert("err")
				}
			});
    }
    
    searchData = (fileNo) => {
    	let model = {
    			dataStatus: this.state.dataStatus,
    			shareUser: this.state.employeeName,
    			updateTime: this.state.yearAndMonth === null ? null : this.state.yearAndMonth.getFullYear() + (this.state.yearAndMonth.getMonth() + 1).toString().padStart(2, "0") + "00",
    			nextMonthTime: this.state.yearAndMonth === null ? null : this.state.yearAndMonth.getFullYear() + (this.state.yearAndMonth.getMonth() + 2).toString().padStart(2, "0") + "00",
    			}
    	
    	axios.post(this.state.serverIP + "dataShare/selectDataShareFile", model)
		.then(response => response.data)
		.then((data) => {
			if (data.length!=0) {
				for(var i=0;i<data.length;i++){
					if(data[i].filePath!=null){
						let fileNames=data[i].filePath.split("/");
						data[i].fileName=fileNames[fileNames.length-1];
					}
				}
			}
			this.setState({ 
				dataShareList: data,
				fileNo: fileNo,
			})
			
			let rowNo = this.state.rowNo;
			
			if(this.state.rowNo !== '' && data.length > 0){
				if(this.state.rowNo > data.length){
					this.setState({ 
						rowShareStatus: data[data.length - 1].shareStatus,
						rowFilePath: data[data.length - 1].filePath,
						rowNo: data.length,
					})
					rowNo =  data.length;
				}
				else{
					if(this.state.dataStatus === "0"){
						this.setState({ 
							rowShareStatus: data[this.state.rowNo - 1].shareStatus,
							rowFilePath: data[this.state.rowNo - 1].filePath,
						})
					}
				}
			}
			this.refs.table.setState({
				selectedRowKeys: [String(rowNo)]
			});
		});
    }
    
	getFile=()=>{
		$("#getFile").click();
	}
	
	// 行Selectファンクション
	handleRowSelect = (row, isSelected, e) => {
		if(this.state.dataStatus === "0"){
			if (isSelected) {
				this.setState({
					rowNo: row.rowNo,
					fileNo: row.fileNo,
					rowFilePath: row.filePath,
					rowShareStatus: row.shareStatus,
					rowClickFlag: false,
				})
			} else {
				this.setState({
					rowNo: '',
					fileNo: '',
					rowFilePath: '',
					rowShareStatus: '',
					rowClickFlag: true,
				})
			}
		}
		else{
			if (isSelected) {
				this.setState({
					rowNo: this.state.rowNo.concat([row.rowNo]),
					fileNo: this.state.fileNo.concat([row.fileNo]),
					rowFilePath: this.state.rowFilePath.concat([row.filePath]),
					rowShareStatus: this.state.rowShareStatus.concat([row.shareStatus]),
					rowClickFlag: false,
				})
			} else {
	    		let index;
				index = this.state.rowNo.findIndex(item => item === row.rowNo);
				if(index !== -1)
					this.state.rowNo.splice(index, 1);
				
				index = this.state.fileNo.findIndex(item => item === row.fileNo);
				if(index !== -1)
					this.state.fileNo.splice(index, 1);
				
				index = this.state.rowFilePath.findIndex(item => item === row.filePath);
				if(index !== -1)
					this.state.rowFilePath.splice(index, 1);
				
				index = this.state.rowShareStatus.findIndex(item => item === row.shareStatus);
				if(index !== -1)
					this.state.rowShareStatus.splice(index, 1);
				
				this.setState({
	    			rowNo: this.state.rowNo,
	    			fileNo: this.state.fileNo,
	    			rowFilePath: this.state.rowFilePath,
	    			rowShareStatus: this.state.rowShareStatus,
	    			rowClickFlag: this.state.rowNo.length === 0 ? true : false,
	    		});
			}
		}
	}
	
	selectAll = () => {
		let rowNo = [];
		let fileNo = [];
		let filePath = [];
		let shareStatus = [];
		let selectedRowKeys = [];
		
		for(let i in this.state.dataShareList){
			rowNo.push(this.state.dataShareList[i].rowNo);
			fileNo.push(this.state.dataShareList[i].fileNo);
			filePath.push(this.state.dataShareList[i].filePath);
			shareStatus.push(this.state.dataShareList[i].shareStatus);
			selectedRowKeys.push(this.state.dataShareList[i].rowNo);
		}
		
		this.refs.table.store.selected = this.refs.table.state.selectedRowKeys.length !== this.state.dataShareList.length ? selectedRowKeys : [];
		this.refs.table.setState({
			selectedRowKeys: this.refs.table.state.selectedRowKeys.length !== this.state.dataShareList.length ? selectedRowKeys : [],
		});
		
		if(this.refs.table.state.selectedRowKeys.length !== this.state.dataShareList.length){
			this.setState({
				rowNo: rowNo,
				fileNo: fileNo,
				rowFilePath: filePath,
				rowShareStatus: shareStatus,
				rowClickFlag: rowNo.length === 0 ? true : false,
			});
		}
		else{
			this.setState({
				rowNo: [],
				fileNo: [],
				rowFilePath: [],
				rowShareStatus: [],
				rowClickFlag: true,
			});
		}
	}
	
	renderShowsTotal(start, to, total) {
		return (
			<p style={{ color: 'dark', "float": "left", "display": total > 0 ? "block" : "none" }}  >
				{start}から  {to}まで , 総計{total}
			</p>
		);
	}
	
	/**
	 * 行追加
	 */
	insertRow = () => {
		var dataShareList = this.state.dataShareList;
		var dataShareModel = {};
		if(dataShareList.length > 0){
			dataShareModel["rowNo"] = dataShareList.length + 1;
		}else{
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
			fileNo: '',
			rowShareStatus: '',
		})
		this.refs.table.setState({
			selectedRowKeys: [dataShareList.length]
		});
	}
	
	dataApproval = () => {
		let fileNoList = [];
		for(let i in this.state.fileNo){
			fileNoList.push(this.state.fileNo[i]);
		}
		axios.post(this.state.serverIP + "dataShare/updateDataShares",fileNoList)
		.then(response => {
			if (response.data != null) {
				this.searchData(this.state.fileNo);
				this.setState({ "myToastShow": true, message: "承認成功！"  });
				setTimeout(() => this.setState({ "myToastShow": false }), 3000);
			} else {
				alert("err")
			}
		});
	}
	
	dataShare = () => {
		var model = {};
		model["fileNo"] = this.state.fileNo;
		model["shareStatus"] = this.state.rowShareStatus === "0" ? "1" : "0";
		axios.post(this.state.serverIP + "dataShare/updateDataShare",model)
		.then(response => {
			if (response.data != null) {
				this.searchData(this.state.fileNo);
				this.setState({ "myToastShow": true, message: "共有成功！"  });
				setTimeout(() => this.setState({ "myToastShow": false }), 3000);
			} else {
				alert("err")
			}
		});
	}
	
	dataDelete = () => {
        var a = window.confirm("削除していただきますか？");
        if(a){
			if(this.dataStatus === "0"){
				var model = {};
				model["fileNo"] = this.state.fileNo;
				axios.post(this.state.serverIP + "dataShare/deleteDataShare",model)
				.then(response => {
					if (response.data != null) {
						this.setState({ 
							rowNo: '',
							fileNo: '',
							rowShareStatus: '',
						}, () => {
							this.searchData(this.state.fileNo);
						})
						this.setState({ "myToastShow": true, message: "削除成功！" , rowClickFlag: true });
						setTimeout(() => this.setState({ "myToastShow": false }), 3000);
					} else {
						alert("err")
					}
				});
			}
			else{
				let fileNoList = [];
				for(let i in this.state.fileNo){
					fileNoList.push(this.state.fileNo[i]);
				}

				axios.post(this.state.serverIP + "dataShare/deleteDataShares",fileNoList)
				.then(response => {
					if (response.data != null) {
						this.setState({ 
							rowNo: '',
							fileNo: '',
							rowShareStatus: '',
						}, () => {
							this.searchData(this.state.fileNo);
						})
						this.setState({ "myToastShow": true, message: "削除成功！" , rowClickFlag: true });
						setTimeout(() => this.setState({ "myToastShow": false }), 3000);
					} else {
						alert("err")
					}
				});
			}
        }
	}
	
	shareStatus(code) {
		if(code === null || code === "")
			return;
		let shareStatusAll = this.state.shareStatusAll;
        for (var i in shareStatusAll) {
            if (code === shareStatusAll[i].code) {
                return shareStatusAll[i].value;
            }
        }
    };

	downLoad = () => {
		for(let i in this.state.rowFilePath){
			publicUtils.handleDownload(this.state.rowFilePath[i], this.state.serverIP);
		}
	}
	
	employeeNameChange = (event, values) => {
        if (values !== null) {
        	this.setState({
                employeeNo: values.code,
                employeeName: values.text,
            }, () => {
    			this.searchData(this.state.fileNo);
            })
        }else{
        	this.setState({
                employeeNo: null,
                employeeName: null,
            }, () => {
    			this.searchData(this.state.fileNo);
            })
        }
	}
	
	nameReset = () => {
		var model = {};
		model["fileNo"] = this.state.fileNo;
		model["fileName"] = this.state.dataShareList[this.state.rowNo - 1].fileName;
		model["filePath"] = this.state.dataShareList[this.state.rowNo - 1].filePath;

		axios.post(this.state.serverIP + "dataShare/updateFileName",model)
		.then(response => {
			if (response.data != null && response.data.flag) {
				this.setState({
					rowFilePath: response.data.newFilePath,
				},()=>{
						this.searchData();
					})
				this.setState({ "myToastShow": true, message: "更新成功！", });
				setTimeout(() => this.setState({ "myToastShow": false }), 3000);
			} else {
				alert("err")
			}
		});
	}
	
	render() {
		const {dataShareList} = this.state;
		// テーブルの行の選択
		const selectRow = {
			mode: this.state.modeSelect,
			bgColor: 'pink',
			clickToSelectAndEditCell: true,
			hideSelectColumn: true,
			clickToExpand: true,// click to expand row, default is false
			onSelect: this.handleRowSelect,
		};
		// テーブルの定義
		const options = {
			page: this.state.currentPage, 
			sizePerPage: 10,  // which size per page you want to locate as
								// default
			pageStartIndex: 1, // where to start counting the pages
			paginationSize: 3,  // the pagination bar size.
			prePage: '<', // Previous page button text
            nextPage: '>', // Next page button text
            firstPage: '<<', // First page button text
            lastPage: '>>', // Last page button text
			paginationShowsTotal: this.renderShowsTotal,  // Accept bool or
															// function
			hideSizePerPage: true, // > You can hide the dropdown for
									// sizePerPage
			expandRowBgColor: 'rgb(165, 165, 165)',
			approvalBtn: this.createCustomApprovalButton,
			onApprovalRow: this.onApprovalRow,
			handleConfirmApprovalRow: this.customConfirm,
			sortIndicator: false, // 隐藏初始排序箭头
		};
		
		const cellEdit = {
				mode: 'click',
				blurToSave: true,
			}
		return (
			<div>
				<div style={{ "display": this.state.myToastShow ? "block" : "none" }}>
					<MyToast myToastShow={this.state.myToastShow} message={this.state.message} type={"success"} />
				</div>
				<FormControl id="rowSelectCheckSection" name="rowSelectCheckSection" hidden />
				<Form >
					<div>
						<Form.Group>
							<Row inline="true">
								<Col className="text-center">
									<h2>資料共有</h2>
								</Col>
							</Row>
						</Form.Group>
					</div>
				</Form>
				<div >
				<Form.File id="getFile" accept="application/pdf,application/vnd.ms-excel" custom hidden="hidden" onChange={this.workRepotUpload}/>
                	<Row>
		                <Col sm={2}>
			                <InputGroup size="sm" className="mb-3">
								<InputGroup.Prepend>
									<InputGroup.Text >区分</InputGroup.Text>
								</InputGroup.Prepend>
								<Form.Control id="dataStatus" as="select" size="sm" onChange={this.dataStatusChange} name="dataStatus" value={this.state.dataStatus} autoComplete="off" >
									<option value="0">共有</option>
									<option value="1">取得</option>
								</Form.Control>
							</InputGroup>
						</Col>
						
						<Col sm={3}>
			                <InputGroup size="sm" className="mb-3">
								<InputGroup.Prepend>
									<InputGroup.Text >年月</InputGroup.Text>
								</InputGroup.Prepend>
								<DatePicker
									selected={this.state.yearAndMonth}
									onChange={this.inactiveYearAndMonth}
									autoComplete="off"
									locale="ja"
									dateFormat="yyyy/MM"
									showMonthYearPicker
									showFullMonthYearPicker
									id={"datePicker"}
									className="form-control form-control-sm"
								/>
							</InputGroup>
						</Col>
						
						<Col style={{marginLeft:"-120px"}} hidden={this.state.dataStatus === "0"}>
							<InputGroup size="sm" className="mb-3">
				                <InputGroup.Prepend>
									<InputGroup.Text >社員</InputGroup.Text>
								</InputGroup.Prepend>
								<Autocomplete
									id="employeeNo"
		                            name="employeeNo"
		                            value={this.state.employeeNameDrop.find(v => v.code === this.state.employeeNo) || {}}
		                            options={this.state.employeeNameDrop}
		                            getOptionDisabled={(option) => option.name}
		                            getOptionLabel={(option) => option.text}
		                            onChange={(event, values) => this.employeeNameChange(event, values)}
		                            renderOption={(option) => {
		                                return (
		                                    <React.Fragment>
		                                        {option.name}
		                                    </React.Fragment>
		                                )
		                            }}
		                            renderInput={(params) => (
		                                <div ref={params.InputProps.ref}>
		                                    <input placeholder="  例：佐藤真一" type="text" {...params.inputProps} className="auto form-control Autocompletestyle-salaryDetailSend" />
		                                </div>
		                            )}
								/>
							</InputGroup>
					</Col>
                	</Row>
					<Row>
                        <Col sm={4}>
                            <div>
                               <Button variant="info" size="sm" onClick={this.getFile} id="workRepotUpload" disabled={this.state.rowClickFlag || this.state.dataStatus === "1"} hidden={this.state.dataStatus === "1"}>
									<FontAwesomeIcon icon={faUpload} /> Upload
								</Button>{' '}
								<Button variant="info" size="sm" onClick={this.selectAll} disabled={this.state.dataStatus === "0"} hidden={this.state.dataStatus === "0"}>すべて選択</Button>{' '}
								<Button variant="info" size="sm" onClick={this.state.dataStatus === "0" ? publicUtils.handleDownload.bind(this, this.state.rowFilePath, this.state.serverIP) : this.downLoad} id="workRepotDownload" disabled={this.state.rowShareStatus === "" || this.state.rowShareStatus.length === 0}>
	                          		 <FontAwesomeIcon icon={faDownload} /> Download
		                        </Button>{' '}
								<Button variant="info" size="sm" onClick={this.nameReset} disabled={this.state.rowClickFlag}>
									<FontAwesomeIcon icon={faUpload} />ファイル名修正
								</Button>
	 						</div>
						</Col>
                        <Col sm={8}>
                        <div style={{ "float": "right" }}>
							<Button variant="info" size="sm" id="revise" onClick={this.dataApproval} disabled={this.state.rowClickFlag || this.state.dataStatus === "0"} hidden={this.state.dataStatus === "0"}><FontAwesomeIcon icon={faSave}/> 承認</Button>{' '}
							<Button variant="info" size="sm" id="revise" onClick={this.state.rowClickFlag ? this.insertRow : this.dataShare} disabled={(this.state.rowClickFlag ? false : this.state.rowShareStatus === "") || this.state.dataStatus === "1"} hidden={this.state.dataStatus === "1"}><FontAwesomeIcon icon={faSave}/> {this.state.rowClickFlag || this.state.dataStatus === "1" ? "追加" : this.state.rowShareStatus === "1" ? "解除" : "共有"}</Button>{' '}
							<Button variant="info" size="sm" id="revise" onClick={this.dataDelete} disabled={this.state.rowClickFlag || this.state.rowShareStatus === "1"}><FontAwesomeIcon icon={faTrash} /> 削除</Button>{' '}
 						</div>
					</Col>
                    </Row>
					<Col >
					<BootstrapTable data={dataShareList} pagination={true}  ref='table' options={options} cellEdit={cellEdit} approvalRow selectRow={selectRow} headerStyle={ { background: '#5599FF'} } striped hover condensed >
						<TableHeaderColumn width='10%'　tdStyle={ { padding: '.45em' } }   dataField='rowNo' editable={false} isKey dataSort>番号</TableHeaderColumn>
						<TableHeaderColumn width='10%' tdStyle={ { padding: '.45em' } }   dataField='employeeNo' editable={false} dataSort>社員番号</TableHeaderColumn>
						<TableHeaderColumn width='35%' tdStyle={ { padding: '.45em' } }   dataField='fileName' editColumnClassName="dutyRegistration-DataTableEditingCell">ファイル名</TableHeaderColumn>
						<TableHeaderColumn width='15%' tdStyle={ { padding: '.45em' } }   dataField='shareUser' editable={false} >共有者</TableHeaderColumn>
						<TableHeaderColumn width='20%' tdStyle={ { padding: '.45em' } }   dataField='updateTime' editable={false} dataSort>日付</TableHeaderColumn>
						<TableHeaderColumn width='10%' tdStyle={ { padding: '.45em' } } dataFormat={this.shareStatus.bind(this)} dataField='shareStatus' editable={false}>ステータス</TableHeaderColumn>
					</BootstrapTable>
					</Col>
				</div>
			</div >
		);
	}
}
export default dataShare;