import React,{Component} from 'react';
import {Row , Form , Col , InputGroup , Button , Modal} from 'react-bootstrap';
import * as customerInfoJs from '../components/CustomerInfoJs.js';
import $ from 'jquery';
import BankInfo from './bankInfo';
import Autosuggest from 'react-autosuggest';
import '../asserts/css/style.css';
import TopCustomerInfo from './topCustomerInfo';
import { BrowserRouter as Router, Route } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker ,　{registerLocale} from "react-datepicker"
import ja from 'date-fns/locale/ja';
import axios from 'axios';
import {BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

registerLocale('ja', ja);
/**
 * 以下の四つメソッドは連想検索
 */
function escapeRegexCharacters(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getSuggestions(value, datas) {
	const escapedValue = escapeRegexCharacters(value.trim());
	const regex = new RegExp('^' + escapedValue, 'i');

	return datas.filter(data => regex.test(data.topCustomerName));
}
function getSuggestionDlt1(suggestion) {
	return suggestion.topCustomerName;
}
function renderSuggestion(suggestion) {
	return (
		<span>{suggestion.topCustomerName}</span>
	);
}
var oldForm_data;//画面初期のデータ
var oldForm_dataJson;//画面初期のデータのjson
var newForm_data;//登録の際データ
var newForm_dataJson;//登録の際データのjson

class CustomerInfo extends Component {
    state = {
        showBankInfoModal:false,//口座情報画面フラグ
        showCustomerInfoModal:false,//上位お客様情報画面フラグ
        establishmentDate: new Date(),//設立の期日
        businessStartDate: new Date(),//取引開始の期日
        topCustomerSuggestions:[],//上位お客様連想の数列
        topCustomerValue:'',//上位お客様項目の値
        topCustomerName:'',//上位お客様のname
        customerDepartmentName:'',//部門のname
        customerDepartmentNameValue:'',//部門の項目値
        customerDepartmentNameSuggestions:[],//部門の連想数列
        customerDepartmentList:[],//部門情報数列
     }
    /**
     *  設立のonChange
     */
    establishmentDateChange = date => {
    this.setState({
        establishmentDate: date,
    });
        let month = date.getMonth() + 1;
        $("#establishmentDate").val(date.getFullYear() + '' + (month < 10 ? '0'+month: month));
    
    };
    /**
     * 取引開始のonChange 
     */
    businessStartDateChange = date => {
        this.setState({
            businessStartDate: date,
        });
            let month = date.getMonth() + 1;
            $("#businessStartDate").val(date.getFullYear() + '' + (month < 10 ? '0'+month: month));
        
        };
     constructor(props){
         super(props);
         this.handleShowModal = this.handleShowModal.bind(this);
         this.handleShowModal = this.handleShowModal.bind(this);
     }
     /**
     * 小さい画面の閉め 
     */
     handleHideModal=(Kbn)=>{
         if(Kbn === "bankInfo"){
            this.setState({showBankInfoModal:false})
         }else if(Kbn === "customerInfo"){
            this.setState({showCustomerInfoModal:false})
         }
     }
     /**
     *  小さい画面の開き
     */
     handleShowModal=(Kbn)=>{
        if(Kbn === "bankInfo"){
            this.setState({showBankInfoModal:true})
         }else if(Kbn === "customerInfo"){
            this.setState({showCustomerInfoModal:true})
         }
     }
     /**
     * 画面の初期化 
     */
    async componentDidMount(){
        var pro = this.props.location.state;
        $("#shoriKbn").val( pro.split("-")[0]);
        $("#customerNo").val( pro.split("-")[1]);

        if($("#shoriKbn").val() !== "shusei"){
            $("#toBankInfo").attr("disabled",true);
            $("#toCustomerInfo").attr("disabled",true);
          }
            var customerInfoMod = {};
            customerInfoMod["customerNo"] = $("#customerNo").val();
            customerInfoMod["shoriKbn"] = $("#shoriKbn").val();
            await axios.post("http://127.0.0.1:8080/customerInfo/onloadPage" , customerInfoMod)
            .then(resultMap => {
                var customerRanking = {};
                var companyNature = {};
                var customerInfoMod;
                var shoriKbn = $("#shoriKbn").val();
                customerRanking = resultMap.data.selectModel.customerRanking;
                companyNature = resultMap.data.selectModel.companyNature;
                customerInfoMod = resultMap.data.customerInfoMod;
                for(let i = 0;i<customerRanking.length ; i++){
                    $("#customerRankingCode").append('<option value="'+customerRanking[i]["customerRankingCode"]+'">'+customerRanking[i]["customerRankingName"]+'</option>');
                }
                for(let i = 0;i<companyNature.length ; i++){
                    $("#companyNatureCode").append('<option value="'+companyNature[i]["companyNatureCode"]+'">'+companyNature[i]["companyNatureName"]+'</option>');
                }
                if(shoriKbn === 'tsuika'){
                    var customerNoSaiBan = resultMap.data.customerNoSaiBan;
                    customerNoSaiBan =  parseInt(customerNoSaiBan.substring(1,4)) + 1;
                    if(customerNoSaiBan < 10){
                        customerNoSaiBan = 'C00' + customerNoSaiBan;
                    }else if(customerNoSaiBan >= 10 && customerNoSaiBan < 100){
                        customerNoSaiBan = 'C0' + customerNoSaiBan;
                    }else if(customerNoSaiBan >=100){
                        customerNoSaiBan = 'C' + customerNoSaiBan;
                    }
                    $("#customerNo").val(customerNoSaiBan);
                    $("#customerNo").attr("readOnly",true);
                }else{
                    $("#customerName").val(customerInfoMod.customerName);
                    $("#topCustomerNameShita").val(customerInfoMod.topCustomerName);
                    $("#customerAbbreviation").val(customerInfoMod.customerAbbreviation);
                    $("#businessStartDate").val(customerInfoMod.businessStartDate);
                    $("#headOffice").val(customerInfoMod.headOffice);
                    $("#establishmentDate").val(customerInfoMod.establishmentDate);
                    $("#customerRankingCode").val(customerInfoMod.customerRankingCode);
                    $("#listedCompany").val(customerInfoMod.listedCompany);
                    $("#companyNatureCode").val(customerInfoMod.companyNatureCode);
                    $("#url").val(customerInfoMod.url);
                    $("#remark").val(customerInfoMod.remark);
                    this.setState({
                        topCustomerValue:resultMap.data.customerInfoMod.topCustomerName,
                        customerDepartmentList:resultMap.data.customerDepartmentInfoList,
                    })
                    oldForm_data = $("#customerForm").serializeArray();
                    oldForm_dataJson = JSON.stringify({ dataform: oldForm_data });
                    if(shoriKbn === 'sansho'){
                        customerInfoJs.setDisabled();
                  }
                }
            })
            .catch(function (error) {
              alert("select框内容获取错误，请检查程序");
            });  
    }
     /**
     * 上位お客様連想のデータ取得 
     */   
	onDlt1SuggestionsFetchRequested = ({ value }) => {
		const customerInfoMod = {
			topCustomerName: value
		};
		axios.post("http://127.0.0.1:8080/customerInfo/getTopCustomer", customerInfoMod)
			.then(response => {
				console.log(response);
				if (response.data != null) {
					this.setState({
						topCustomerSuggestions: getSuggestions(value, response.data)
					});
				}
			}).catch((error) => {
				console.error("Error - " + error);
			});
    };
    /**
     *  上位お客様連想のデータのクリア
     */
    onDlt1SuggestionsClearRequested = () => {
		this.setState({
			developement1Suggestions: []
		});
    };
    /**
     *  上位お客様連想のデータの選択
     */
    onDlt1SuggestionSelected = (event, { suggestion }) => {
		this.setState({
			topCustomerValue: suggestion.topCustomerName
		});
    };
    /**
     *  上位お客様連想のデータの変化
     */
    onDevelopement1Change = (event, { newValue }) => {
		this.setState({
			topCustomerValue: newValue
		});
    };
    /**
     *  部門連想のデータ取得
     */
    meisaiToroku =()=>{
        // var customerInfoMod = {};
        // var formArray =$("#conditionForm").serializeArray();
        // $.each(formArray,function(i,item){
        //     customerInfoMod[item.name] = item.value;     
        // });
        // axios.post("http://127.0.0.1:8080/customerInfoSearch/search" , customerInfoMod)
        // .then(resultList => {
        //     this.setState({
        //         customerInfoData : resultList.data,
        //     })
        // })
        // .catch(function (error) {
        // alert("查询错误，请检查程序");
        // });  
    }
    render() {
        const {topCustomerSuggestions , topCustomerValue , customerDepartmentList} = this.state;
        //上位お客様連想
        const topcustomerInputProps = {
			placeholder: "例：富士通",
			value: topCustomerValue,
            onChange: this.onDevelopement1Change,
            id:"topCustomerNameShita",
            
        };
        //部門の連想
        const customerDepartmentNameInputProps = {
			placeholder: "例：第一事業部",
			value: topCustomerValue,
            onChange: this.onDevelopement1Change,
            id:"customerDepartmentName",
            
        };
        //テーブルの列の選択
        const selectRow = {
            mode: 'radio',
            bgColor: 'pink',
            hideSelectColumn: true,
            clickToSelect: true,  // click to select, default is false
            clickToExpand: true,// click to expand row, default is false
            onSelect:this.handleRowSelect,
        };
        //テーブルの定義
        const options = {
        page: 1,  // which page you want to show as default
        sizePerPage: 5,  // which size per page you want to locate as default
        pageStartIndex: 1, // where to start counting the pages
        paginationSize: 3,  // the pagination bar size.
        prePage: 'Prev', // Previous page button text
        nextPage: 'Next', // Next page button text
        firstPage: 'First', // First page button text
        lastPage: 'Last', // Last page button text
        paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
        // paginationPosition: 'top'  // default is bottom, top and both is all available
        hideSizePerPage: true, //> You can hide the dropdown for sizePerPage
        // alwaysShowAllBtns: true // Always show next and previous button
        // withFirstAndLast: false > Hide the going to First and Last page button
        expandRowBgColor: 'rgb(165, 165, 165)',
        deleteBtn: this.createCustomDeleteButton,
        onDeleteRow: this.onDeleteRow,
        };
        return (
            <div style={{"background":"#f5f5f5"}}>
            <div style={{"background":"#f5f5f5"}}>
                <Modal aria-labelledby="contained-modal-title-vcenter" centered backdrop="static" 
                onHide={this.handleHideModal.bind(this,"bankInfo")} show={this.state.showBankInfoModal}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body className="show-grid">
                <div key={this.props.location.key} >
                                <Router>
                                    <Route exact path={`${this.props.match.url}/`} component={BankInfo} />
                                </Router>
                            </div>
                </Modal.Body>
                </Modal>
                <Modal aria-labelledby="contained-modal-title-vcenter" centered backdrop="static" 
                onHide={this.handleHideModal.bind(this,"customerInfo")} show={this.state.showCustomerInfoModal}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body className="show-grid">
                <div key={this.props.location.key} >
                                <Router>
                                    <Route exact path={`${this.props.match.url}/`} component={TopCustomerInfo} />
                                </Router>
                            </div>
                </Modal.Body>
                </Modal>
                <Row inline="true">
                    <Col  className="text-center">
                    <h2>お客様情報</h2>
                    </Col>
                </Row>
                <Row>
                    <Col sm={5}></Col>
                    <Col sm={2}>
                        <Button size="sm" id="toBankInfo" onClick={this.handleShowModal.bind(this,"bankInfo")}>
                            お客様口座情報
                        </Button>{' '}
                        <Button size="sm" id="toCustomerInfo" onClick={this.handleShowModal.bind(this,"customerInfo")}>
                            上位お客様
                        </Button>
                    </Col>
                    <Col sm={2}>
                        
                    </Col>
                </Row>
                <Row>
                        <Col sm={4}>
                        </Col>
                        <Col sm={7}>
                        <p id="erorMsg" style={{visibility:"hidden"}} class="font-italic font-weight-light text-danger">★がついてる項目を入力してください！</p>
                        </Col>
                </Row>
                <Form id="customerForm">
                <Row>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">お客様番号</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="お客様番号" id="customerNo" name="customerNo" readOnly/>
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">お客様名</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="例：LYC株式会社" id="customerName" onChange={customerInfoJs.toDisabed} name="customerName" /><font  color="red"
				style={{marginLeft: "10px",marginRight: "10px"}}>★</font>
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">略称</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="LYC" id="customerAbbreviation" name="customerAbbreviation" />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">代表取締役</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="例：中山毛石" id="representative" name="representative" />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">本社場所</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="例：秋葉原駅" id="headOffice" name="headOffice" />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">設立</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="yyyydd" id="establishmentDate" readOnly name="establishmentDate" />
                                <DatePicker
                                selected={this.state.establishmentDate}
                                onChange={this.establishmentDateChange}
                                dateFormat={"yyyy MM"}
                                autoComplete="on"
                                locale="pt-BR"
                                showMonthYearPicker
                                showFullMonthYearPicker
                                // minDate={new Date()}
                                showDisabledMonthNavigation
                                className={"dateInput"}
                                id="establishmentDateSelect"
                                locale="ja"
                                />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">取引開始日</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="yyyydd" id="businessStartDate" readOnly name="businessStartDate" />
                                <DatePicker
                                selected={this.state.businessStartDate}
                                onChange={this.businessStartDateChange}
                                dateFormat={"yyyy MM"}
                                autoComplete="on"
                                locale="pt-BR"
                                showMonthYearPicker
                                showFullMonthYearPicker
                                // minDate={new Date()}
                                showDisabledMonthNavigation
                                className={"dateInput"}
                                id="businessStartDateSelect"
                                locale="ja"
                                />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">上位お客様</InputGroup.Text>
                            </InputGroup.Prepend>
                                {/* <Form.Control placeholder="上位お客様" id="topCustomer" name="topCustomer" /> */}
                                <Autosuggest
                                    suggestions={topCustomerSuggestions}
                                    onSuggestionsFetchRequested={this.onDlt1SuggestionsFetchRequested}
                                    onSuggestionsClearRequested={this.onDlt1SuggestionsClearRequested}
                                    onSuggestionSelected={this.onDlt1SuggestionSelected}
                                    getSuggestionValue={getSuggestionDlt1}
                                    renderSuggestion={renderSuggestion}
                                    inputProps={topcustomerInputProps}                                    
                                />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">お客様ランキング</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control as="select" placeholder="お客様ランキング" id="customerRankingCode" name="customerRankingCode" />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">上場会社</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control as="select" placeholder="上場会社" id="listedCompany" name="listedCompany">
                                <option value="0">はい</option>
                                <option value="1">いいえ</option>
                                </Form.Control>
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">会社性質</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control as="select" placeholder="会社性質" id="companyNatureCode" name="companyNatureCode" />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">URL</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="www.lyc.co.jp" id="url" name="url" />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">購買担当</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="購買担当" id="PurchasingManagers" name="PurchasingManagers" />
                        </InputGroup>
                    </Col>
                    <Col sm={4}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">メール</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="メール" id="PurchasingManagersOfmail" name="PurchasingManagersOfmail" />
                        </InputGroup>
                    </Col>
                    <Col sm={4}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">備考</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="備考" id="remark" name="remark" />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={5}></Col>
                        <Col sm={1} className="text-center">
                                <Button block size="sm" onClick={customerInfoJs.toroku}  variant="primary" id="toroku" type="button">
                                    登録
                                </Button>
                        </Col>
                        <Col sm={1} className="text-center">
                                <Button  block size="sm" id="reset" onClick={customerInfoJs.reset} >
                                    リセット
                                </Button>
                        </Col>
                </Row>
                <hr style={{height:"1px",border:"none",borderTop:"1px solid #555555"}} /> 
                <Form.Text className="text-muted">部門情報</Form.Text>
                <Row>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">部門</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Autosuggest
                                        suggestions={topCustomerSuggestions}
                                        onSuggestionsFetchRequested={this.onDlt1SuggestionsFetchRequested}
                                        onSuggestionsClearRequested={this.onDlt1SuggestionsClearRequested}
                                        onSuggestionSelected={this.onDlt1SuggestionSelected}
                                        getSuggestionValue={getSuggestionDlt1}
                                        renderSuggestion={renderSuggestion}
                                        inputProps={customerDepartmentNameInputProps}                                    
                                    />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">職位</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="例：部長" id="position" name="position" />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">責任者</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="例：田中一郎" id="PurchasingManagersOfmail" name="PurchasingManagersOfmail" />
                        </InputGroup>
                    </Col>
                    <Col sm={3}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">メール</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="xxxxxx@xx.com" id="PurchasingManagersOfmail" name="PurchasingManagersOfmail" />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={5}></Col>
                        <Col sm={1} className="text-center">
                                <Button block size="sm" variant="primary" id="meisaiToroku" type="button">
                                    明細登録
                                </Button>
                        </Col>
                        <Col sm={1} className="text-center">
                                <Button  block size="sm" id="meisaiReset" >
                                    リセット
                                </Button>
                        </Col>
                </Row>
                <Row>
                    <BootstrapTable selectRow={ selectRow } pagination={ true } options={ options } deleteRow={true} data={customerDepartmentList}>
                        <TableHeaderColumn isKey dataField='rowNo' headerAlign='center' dataAlign='center' width='90'>番号</TableHeaderColumn>
                        <TableHeaderColumn dataField='responsiblePerson' headerAlign='center' dataAlign='center' width="130">名前</TableHeaderColumn>
                        <TableHeaderColumn dataField='customerDepartmentName' headerAlign='center' dataAlign='center' width="230">部門</TableHeaderColumn>
                        <TableHeaderColumn dataField='position' headerAlign='center' dataAlign='center' width="190">職位</TableHeaderColumn>
                        <TableHeaderColumn dataField='mail' headerAlign='center' dataAlign='center'>メール</TableHeaderColumn>
                        <TableHeaderColumn dataField='companyNatureName' headerAlign='center' dataAlign='center' width="140">取引人数</TableHeaderColumn>
                    </BootstrapTable>
                </Row>
                <input type="hidden" id="employeeNo" name="employeeNo"/>
                <input type="hidden" id="shoriKbn" name="shoriKbn"/>
                </Form>
            </div>
            </div>
        );
    }
}

export default CustomerInfo;