import React, { Component } from 'react';
import {Row , Col , InputGroup ,Form, Button, Modal, FormControl } from 'react-bootstrap';
import store from './redux/store';
import DatePicker from "react-datepicker";
import $ from 'jquery';

import { Card } from 'antd'
//	按需导入
import echarts from 'echarts/lib/echarts'
//	导入柱形图
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/markPoint'
import ReactEcharts from 'echarts-for-react'
//	引入样式
//import '../common.less'
import axios from 'axios'
axios.defaults.withCredentials = true;


// マスター登録
class profitChartist extends Component {
	
    constructor(props){
        super(props);
        this.state = this.initialState;// 初期化
    }
    
    initialState = {
            serverIP: store.getState().dropDown[store.getState().dropDown.length - 1],
            targetStatus: "0",
            employeeStatus: "0",
            yearStatus: "0",
    		echartsData: [],
    		xAxisData:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    }
    
    componentDidMount() {
		let date = new Date();
        var year = date.getFullYear();
        for (var i = 2020; i <= year; i++) {
            $('#year').append('<option value="' + i + '">' + i + '</option>');
        }
        
		this.echartsDataChange();
    }
    
   	// onchange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value
        });
		this.echartsDataChange();
    }
	
	echartsDataChange = () => {
		let echartsData = [];
		for(let i=0;i<12;i++){
			let random = parseInt(Math.random()*(1000-100+1)+100,10);
			echartsData.push(random);
		}
		this.setState({
			echartsData: echartsData
        });
	}
	
    getOption = () => {
        let option = {
            title: {
                text: '売上(十万円)',
                textStyle: {
                	color: "#000000",
                	fontSize: "16px",
                },
            },
            tooltip:{
                trigger: 'axis'
            },
            legend: {
                data:['売上','純利益'],
                textStyle: {
                	fontSize: "16px",
                },
            },
            xAxis: {
                data: this.state.xAxisData,
                axisLabel: {
                    show: true,
                    textStyle: {
                    	fontSize: "16px",
                    }
                },
            },
            yAxis: {
                type: 'value'
            },
            grid: {
                top: '10%',
                left: '0%',
                right: '0%',
                bottom: '0%',
                containLabel: true
            },
            series : [
                {
                    name:'売上',
                    type:'bar',
                    barWidth: '20%',
                    data: this.state.echartsData
                },
                {
                    name:'純利益',
                    type:'bar',
                    barWidth: '20%',
                    data: this.state.echartsData
                }
            ]
        }
        return option;
    }
    
	render() {
		return (
				<div>
	                <Row inline="true">
		               <Col className="text-center">
		               		<h2>売上と純利益の推移</h2>
		               </Col> 
		            </Row>
	                <br/>
	                <Row>
		                <Col sm={3}>
			                <InputGroup size="sm" className="mb-3">
								<InputGroup.Prepend>
									<InputGroup.Text >区分</InputGroup.Text>
								</InputGroup.Prepend>
								<Form.Control id="targetStatus" as="select" size="sm" onChange={this.valueChange} name="targetStatus" value={this.state.targetStatus} autoComplete="off" >
									<option value="0">全員売上</option>
									<option value="1">お客様売上</option>
								</Form.Control>
								<Form.Control id="employeeStatus" as="select" size="sm" onChange={this.valueChange} name="employeeStatus" value={this.state.employeeStatus} autoComplete="off" >
									<option value="0">全員</option>
									<option value="1">社員</option>
									<option value="2">BP</option>
								</Form.Control>
							</InputGroup>
		                </Col>
		                <Col sm={3}>
		                <InputGroup size="sm" className="mb-3">
							<InputGroup.Prepend>
								<InputGroup.Text >日付</InputGroup.Text>
							</InputGroup.Prepend>
							<Form.Control id="yearStatus" as="select" size="sm" onChange={this.valueChange} name="yearStatus" value={this.state.yearStatus} autoComplete="off" >
								<option value="0">年月</option>
								<option value="1">年</option>
							</Form.Control>
                            <FormControl id="year" name="year" value={this.state.year} as="select" aria-label="Small" aria-describedby="inputGroup-sizing-sm" onChange={this.valueChange} hidden={this.state.yearStatus === "1"} />
						</InputGroup>
		                </Col>
		            </Row>
		            <div>
			            <Card.Grid className="bar_b">
			                <ReactEcharts option={this.getOption()} style={{width:'100%',height:'550px'}} />
			            </Card.Grid>
		            </div>
	            </div>
	        )
	}
}

export default profitChartist;