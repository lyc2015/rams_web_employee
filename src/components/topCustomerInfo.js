import React,{Component} from 'react';
import {Row , Form , Col , InputGroup , Button } from 'react-bootstrap';
import * as TopCustomerInfoJs from '../components/topCustomerInfoJs.js';
import $ from 'jquery';
import axios from 'axios';
import * as utils from './utils/dateUtils.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo, faSearch } from '@fortawesome/free-solid-svg-icons';

class TopCustomerInfo extends Component {
    state = {
        actionType:'',//処理区分
    }
    /**
     * 画面の初期化
     */
    componentDidMount(){
        var actionType = this.props.actionType;//父画面のパラメータ（処理区分）
        var topCustomerNo = this.props.topCustomerNo;//父画面のパラメータ（画面既存上位お客様情報）
        console.log($("#topCustomerNameShita").val());
        var topCustomerInfo = this.props.topCustomerInfo;
        if(!$.isEmptyObject(topCustomerInfo)){//上位お客様追加でも修正したい場合
            document.getElementById("topCustomerNo").innerHTML = topCustomerInfo.topCustomerNo;
            $("#topCustomerName").val(topCustomerInfo.topCustomerName);
            $("#topCustomerAbbreviation").val(topCustomerInfo.topCustomerAbbreviation);
            $("#topUrl").val(topCustomerInfo.url);
            $("#topRemark").val(topCustomerInfo.remark);
            this.setState({
                actionType:'insert',
            })
        }else{
            if(topCustomerNo !== null && topCustomerNo !== '' && topCustomerNo !== undefined){
                var topCustomerMod = {};
                topCustomerMod["topCustomerNo"] = topCustomerNo;
                axios.post("http://127.0.0.1:8080/topCustomerInfo/onloadPage", topCustomerMod)
                    .then(resultMap => {
                        topCustomerMod = resultMap.data.topCustomerMod;
                        document.getElementById("topCustomerNo").innerHTML = topCustomerMod.topCustomerNo;
                        $("#topCustomerName").val(topCustomerMod.topCustomerName);
                        $("#topCustomerAbbreviation").val(topCustomerMod.topCustomerAbbreviation);
                        $("#topUrl").val(topCustomerMod.url);
                        $("#topRemark").val(topCustomerMod.remark);
                        this.setState({
                            actionType:'update',
                        })
                    })
                    .catch(function(){
                        alert("页面加载错误，请检查程序");
                    })
            }else{
                var topCustomerNo = "";
                const promise = Promise.resolve(utils.getNO("topCustomerNo", "T", "T008TopCustomerInfo"));
                promise.then((value) => {
                    console.log(value);
                            topCustomerNo = value;
                            document.getElementById("topCustomerNo").innerHTML = topCustomerNo;
                });
                this.setState({
                    actionType:'insert',
                })
            }
        }
        if(actionType === "detail"){
            TopCustomerInfoJs.setDisabled();
        }
    }
    /**-
     * 上位お客様情報登録ボタン
     */
    topCustomerToroku(){
        if($("#topCustomerName").val() !== "" && $("#topCustomerName").val() != null){
            var topCustomerInfo = {};
            var actionType = this.state.actionType;
            topCustomerInfo["topCustomerNo"] = document.getElementById("topCustomerNo").innerHTML;
            topCustomerInfo["topCustomerAbbreviation"] = $("#topCustomerAbbreviation").val();
            topCustomerInfo["topCustomerName"] = $("#topCustomerName").val();
            topCustomerInfo["url"] = $("#topUrl").val();
            topCustomerInfo["remark"] = $("#topRemark").val();
            topCustomerInfo["updateUser"] = sessionStorage.getItem('employeeNo');
            if(actionType === "update"){
                topCustomerInfo["actionType"] = "update";
                axios.post("http://127.0.0.1:8080/topCustomerInfo/toroku", topCustomerInfo)
                .then(resultMap => {
                    if(resultMap.data){
                        alert("更新成功");
                        var methodArray = ["getTopCustomerDrop"]
                        var selectDataList = utils.getPublicDropDown(methodArray);
                        var topCustomerDrop = selectDataList[0];
                        this.props.topCustomerToroku(topCustomerDrop);
                    }else{
                        alert("更新失败");
                    }
                })
                .catch(function(){
                    alert("更新错误，请检查程序");
                })
            }else if(actionType === "insert"){
                this.props.topCustomerToroku(topCustomerInfo);
            }
        }else{
            if($("#topCustomerName").val() === "" || $("#topCustomerName").val() === null){
                document.getElementById("topCustomerInfoErorMsg").style = "visibility:visible";
                document.getElementById("topCustomerInfoErorMsg").innerHTML = "★がついてる項目を入力してください！"
            }
            
        } 
    }
    render() {
        const {actionType} = this.state;
        return (
            <div >
            <div >
                <Row inline="true">
                    <Col  className="text-center">
                    <h2>上位お客様情報</h2>
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                    </Col>
                    <Col sm={7}>
                    <p id="topCustomerInfoErorMsg" style={{visibility:"hidden"}} class="font-italic font-weight-light text-danger">★</p>
                    </Col>
                </Row>
                <Form id="topCustomerInfoForm">
                <Row>
                    <Col sm={6}>
                        <InputGroup size="sm" className="mb-3">
                                上位お客様番号：                            
                                    <a id="topCustomerNo" name="topCustomerNo"></a>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">お客様名</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="例：富士通" id="topCustomerName" name="topCustomerName" /><font  color="red"
				                style={{marginLeft: "10px",marginRight: "10px"}}>★</font>
                        </InputGroup>
                    </Col>
                    <Col sm={6}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">略称</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="略称" id="topCustomerAbbreviation" name="topCustomerAbbreviation"/>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">URL</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="www.123321.com" id="topUrl" name="topUrl"/>
                        </InputGroup>
                    </Col>
                    <Col sm={6}>
                        <InputGroup size="sm" className="mb-3">
                            <InputGroup.Prepend>
                                <InputGroup.Text id="inputGroup-sizing-sm">備考</InputGroup.Text>
                            </InputGroup.Prepend>
                                <Form.Control placeholder="備考" id="topRemark" name="topRemark" />
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}></Col>
                    {actionType === "update" ? 
                        <Col sm={3} className="text-center">
                            <Button block size="sm" onClick={this.topCustomerToroku.bind(this)} variant="info" id="update" type="button">
                            <FontAwesomeIcon icon={faSave} />更新
                            </Button>
                        </Col>
                        :
                        <Col sm={3} className="text-center">
                                <Button block size="sm" onClick={this.topCustomerToroku.bind(this)} variant="info" id="toroku" type="button">
                                <FontAwesomeIcon icon={faSave} /> 登録
                                </Button>
                        </Col>
                }
                        <Col sm={3} className="text-center">
                                <Button  block size="sm" variant="info" id="reset" onClick={TopCustomerInfoJs.reset} >
                                <FontAwesomeIcon icon={faUndo} /> リセット
                                </Button>
                        </Col>
                </Row>
                </Form>
                <input type="hidden" id="actionType" name="actionType"/>
            </div>
            </div>
        );
    }
}

export default TopCustomerInfo;