import React from 'react';
import { Button, Form, Col, Row, InputGroup, FormControl, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../asserts/css/development.css';
import '../asserts/css/style.css';
import $ from 'jquery';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUpload,faDownload, faSave, faEdit, faTrash} from '@fortawesome/free-solid-svg-icons';
import * as publicUtils from './utils/publicUtils.js';
import store from './redux/store';
import MyToast from './myToast';
axios.defaults.withCredentials = true;

/**
 * 作業報告書登録画面
 */
class dataShareEmployee extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initialState;// 初期化
		this.valueChange = this.valueChange.bind(this);
	};
	componentDidMount(){
		this.searchData();
	}
	// onchange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value
		})
	}
	// 初期化データ
	initialState = {
		dataShareList: [],
		currentPage: 1,
		rowClickFlag: true,
		rowNo: '',
		rowFilePath : '',
		rowShareStatus: '',
		shareStatusAll : [{code:"0",value:"upload済み"},{code:"1",value:"共有済み"}],
		serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
	};

	searchData = () => {
    	axios.post(this.state.serverIP + "dataShare/selectDataShareFileOnly")
		.then(response => response.data)
		.then((data) => {
			if (data.length!=0) {
				for(var i=0;i<data.length;i++){
					if(data[i].filePath!=null){
						let fileNames=data[i].filePath.split("/");
						data[i].fileName = fileNames[fileNames.length-1];
						data[i].rowNo = i + 1;
					}
				}
			}
			this.setState({ 
				dataShareList: data,
			})
		});
    }
	
	// 行Selectファンクション
	handleRowSelect = (row, isSelected, e) => {
		if (isSelected) {
			this.setState({
				rowNo: row.fileNo,
				rowFilePath: row.filePath,
				rowShareStatus: row.shareStatus,
				rowClickFlag: false,
			})
		} else {
			this.setState({
				rowNo: '',
				rowFilePath: '',
				rowShareStatus: '',
				rowClickFlag: true,
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
	
	
	
	render() {
		const {dataShareList} = this.state;
		// テーブルの行の選択
		const selectRow = {
			mode: 'radio',
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
		};
		const cellEdit = {
			mode: 'click',
			blurToSave: true,
			afterSaveCell: this.sumWorkTimeChange,
		}
		return (
			<div>
				<div style={{ "display": this.state.myToastShow ? "block" : "none" }}>
					<MyToast myToastShow={this.state.myToastShow} message={this.state.message} type={"success"} />
				</div>
				<Form >
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
				<div >
                    <Row>
                        <Col sm={12}>
                            <div style={{ "float": "right" }}>
								<Button variant="info" size="sm" onClick={publicUtils.handleDownload.bind(this, this.state.rowFilePath, this.state.serverIP)} id="workRepotDownload" disabled={this.state.rowShareStatus === ""}>
	                          		 <FontAwesomeIcon icon={faDownload} />Download
		                        </Button>
	 						</div>
						</Col>
                    </Row>
					<Col >
					<BootstrapTable data={dataShareList} pagination={true}  ref='table' options={options} approvalRow selectRow={selectRow} headerStyle={ { background: '#5599FF'} } striped hover condensed >
						<TableHeaderColumn width='10%'　tdStyle={ { padding: '.45em' } }   dataField='rowNo'  isKey>番号</TableHeaderColumn>
						<TableHeaderColumn width='40%' tdStyle={ { padding: '.45em' } }   dataField='fileName' >ファイル名</TableHeaderColumn>
						<TableHeaderColumn width='20%' tdStyle={ { padding: '.45em' } }   dataField='shareUser' >共有者</TableHeaderColumn>
						<TableHeaderColumn width='20%' tdStyle={ { padding: '.45em' } }   dataField='updateTime' >日付</TableHeaderColumn>
					</BootstrapTable>
					</Col>
				</div>
			</div >
		);
	}
}
export default dataShareEmployee;