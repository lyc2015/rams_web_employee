import React, { Component } from 'react';
import {Row , Col , InputGroup ,Form, Button, Modal, FormControl } from 'react-bootstrap';
import store from './redux/store';
import DatePicker from "react-datepicker";
import $ from 'jquery';
import Autocomplete from '@material-ui/lab/Autocomplete';
import * as utils from './utils/publicUtils.js';

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
            customerNo: "",
    		profitData: [],
    		grossProfitData: [],
    		countPeoData: [],
    		textData: [],
    		year: new Date().getFullYear(),
    		xAxisData:[
    			['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    			[],
    			[],
    			],
    }
    
    componentDidMount() {
		let date = new Date();
        var year = date.getFullYear();
        let xAxisYearData = [];
        for (var i = 2020; i <= year; i++) {
            $('#year').append('<option value="' + i + '">' + i + '</option>');
            xAxisYearData.push(i + "年");
        }
        let xAxisData = this.state.xAxisData;
        xAxisData[1] = xAxisYearData;
        this.setState({
        	xAxisData: xAxisData
        });
		this.dataSearch();
    }
        
   	// onchange
	valueChange = event => {
		this.setState({
			[event.target.name]: event.target.value,
			profitData: [],
    		grossProfitData: [],
    		countPeoData: [],
    		textData: [],
        }, () => {
    		this.dataSearch();
        });
    }
	
	setXAxisData2 = (year,month) => {
		let xAxisYearData = [];
        for(let i = 0; i < month;i++){
        	xAxisYearData.push((i + 1) + "月");
        	xAxisYearData.push((i + 1) + "月");
        	xAxisYearData.push("");
        }
        let xAxisData = this.state.xAxisData;
        xAxisData[2] = xAxisYearData;
        this.setState({
        	xAxisData: xAxisData
        });
	}
	
	targetStatusChange = event => {
		if(event.target.value === "2"){
			$('#year').empty();
			let date = new Date();
	        var year = date.getFullYear();
	        var month = date.getMonth() + 2;
	        for (var i = 2021; i <= year; i++) {
	            $('#year').append('<option value="' + i + '">' + i + '</option>');
	        }
	        this.setXAxisData2(year,month);
		}
		else{
			$('#year').empty();
			let date = new Date();
	        var year = date.getFullYear();
	        for (var i = 2020; i <= year; i++) {
	            $('#year').append('<option value="' + i + '">' + i + '</option>');
	        }
		}
		this.setState({
			[event.target.name]: event.target.value,
			yearStatus: event.target.value === "2" ? "0" : this.state.yearStatus,
			year: year,
			profitData: [],
    		grossProfitData: [],
    		countPeoData: [],
    		textData: [],
        }, () => {
    		this.dataSearch();
        });
    }
	
	dataSearch = () => {
		let date = new Date();
		let targetStatus = this.state.targetStatus;
		let employeeStatus = targetStatus === "0" ? this.state.employeeStatus : "";
		let customerNo = targetStatus === "1" ? this.state.customerNo : "";
		if(targetStatus === "1" && (customerNo === null || customerNo === ""))
			return;
		let yearStatus = this.state.yearStatus;
		let yearAndMonthStart = yearStatus === "0" ? (this.state.year + "01") : ("202001");
		let yearAndMonthEnd = yearStatus === "0" ? (this.state.year + "12") : (date.getFullYear() + "12");
		
		if(targetStatus === "0"){
			let monthlyInfo = {
		            employeeClassification: employeeStatus === "0" ? null : (employeeStatus === "1" ? "1" : "023"),
		            startYandM: yearAndMonthStart,
		            endYandM: yearAndMonthEnd,
		        };
	        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
			.then(response => {
				if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					if(yearStatus === "0"){
						let unitPirceTotal = [0,0,0,0,0,0,0,0,0,0,0,0];
				        let grossProfitTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
				        let employeeTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
				        let employeePercent= [];
				        let spTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
				        let spPercent= [];
				        let bpTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
				        let bpPercent= [];
				        let textData= [];

						for(let i in response.data.data){
							let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;

							if(response.data.data[i].unitPrice==null||response.data.data[i].unitPrice==""){
				                unitPirceTotal[month] = parseInt(unitPirceTotal[month]) + 0;
				                switch (response.data.data[i].employeeNo.substring(0,2)) {
								case "BP":
									bpTotal[month] = parseInt(bpTotal[month]) + 0;
									break;
								case "SP":
									spTotal[month] = parseInt(spTotal[month]) + 0;
									break;
								default:
									employeeTotal[month] = parseInt(employeeTotal[month]) + 0;
									break;
								}
				            }else{
				                if(response.data.data[i].deductionsAndOvertimePayOfUnitPrice===null || response.data.data[i].deductionsAndOvertimePayOfUnitPrice===""){
				                    unitPirceTotal[month] = parseInt(unitPirceTotal[month])+parseInt(response.data.data[i].unitPrice)
				                    switch (response.data.data[i].employeeNo.substring(0,2)) {
										case "BP":
											bpTotal[month] = parseInt(bpTotal[month])+parseInt(response.data.data[i].unitPrice)
											break;
										case "SP":
											spTotal[month] = parseInt(spTotal[month])+parseInt(response.data.data[i].unitPrice)
											break;
										default:
											employeeTotal[month] = parseInt(employeeTotal[month])+parseInt(response.data.data[i].unitPrice)
											break;
										}
				                }else{
				                    unitPirceTotal[month] = parseInt(unitPirceTotal[month])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
				                    switch (response.data.data[i].employeeNo.substring(0,2)) {
										case "BP":
											bpTotal[month] = parseInt(bpTotal[month])+parseInt(response.data.data[i].unitPrice)
											break;
										case "SP":
											spTotal[month] = parseInt(spTotal[month])+parseInt(response.data.data[i].unitPrice)
											break;
										default:
											employeeTotal[month] = parseInt(employeeTotal[month])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
											break;
										}
				                }               
				            }
							
				            if(response.data.data[i].monthlyGrosProfits==null||response.data.data[i].monthlyGrosProfits==""){
				                grossProfitTotal[month] = parseInt(grossProfitTotal[month]) + 0;
				            }else{
				                grossProfitTotal[month] = parseInt(grossProfitTotal[month]) + parseInt(response.data.data[i].monthlyGrosProfits) 
				            }
						}

						monthlyInfo = {
					            employeeClassification: employeeStatus === "0" ? null : (employeeStatus === "1" ? "1" : "023"),
					            startYandM: yearAndMonthStart,
					            endYandM: yearAndMonthEnd,
					            kadou: "0",
					        };
				        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
						.then(response => {
							if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
								let countPeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
								let employeePeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
								let spPeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
								let bpPeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
								for(let i in response.data.data){
									let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
					            	countPeoData[month] = countPeoData[month] + 1;
					            	switch (response.data.data[i].employeeNo.substring(0,2)) {
									case "BP":
										bpPeoData[month] = bpPeoData[month] + 1;
										break;
									case "SP":
										spPeoData[month] = spPeoData[month] + 1;
										break;
									default:
										employeePeoData[month] = employeePeoData[month] + 1;
										break;
									}
								}
								for(let i in unitPirceTotal){
									employeePercent.push(parseInt(employeeTotal[i] * 100 / unitPirceTotal[i]) + "%");
									spPercent.push(parseInt(spTotal[i] * 100 / unitPirceTotal[i]) + "%");
									bpPercent.push(parseInt(bpTotal[i] * 100 / unitPirceTotal[i]) + "%");
									unitPirceTotal[i] = parseInt(unitPirceTotal[i] / 100000);
									grossProfitTotal[i] = parseInt(grossProfitTotal[i] / 100000);
									employeeTotal[i] = utils.addComma(employeeTotal[i]);
									spTotal[i] = utils.addComma(spTotal[i]);
									bpTotal[i] = utils.addComma(bpTotal[i]);

									textData.push("稼働人数<br/>1.社員：" + employeeTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + employeePercent[i] + "(" + employeePeoData[i] + ")<br/>" + 
												  "2.事業主：" + spTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + spPercent[i] + "(" + spPeoData[i] + ")<br/>" + 
												  "3.BP：" + bpTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + bpPercent[i] + "(" + bpPeoData[i] + ")<br/>");
								}
								this.setState({
									profitData: unitPirceTotal,
						    		grossProfitData: grossProfitTotal,
									countPeoData: countPeoData,
									textData: textData,
						        });
							}
						});
					}
					else{
						let years = (new Date().getFullYear() - 2020) + 1;
						let unitPirceTotal = [];
				        let grossProfitTotal= [];
				        let employeeTotal= [];
				        let employeePercent= [];
				        let spTotal= [];
				        let spPercent= [];
				        let bpTotal= [];
				        let bpPercent= [];
				        let textData= [];
						for(let i = 0;i < years;i++){
							unitPirceTotal.push(0);
							grossProfitTotal.push(0);
							employeeTotal.push(0);
							spTotal.push(0);
							bpTotal.push(0);
						}
						for(let i in response.data.data){
							let year = Number(response.data.data[i].yearAndMonth.substring(0,4)) - 2020;

							if(response.data.data[i].unitPrice==null||response.data.data[i].unitPrice==""){
				                unitPirceTotal[year] = parseInt(unitPirceTotal[year]) + 0;
				                switch (response.data.data[i].employeeNo.substring(0,2)) {
									case "BP":
										bpTotal[year] = parseInt(bpTotal[year]) + 0;
										break;
									case "SP":
										spTotal[year] = parseInt(spTotal[year]) + 0;
										break;
									default:
										employeeTotal[year] = parseInt(employeeTotal[year]) + 0;
										break;
									}
				            }else{
				                if(response.data.data[i].deductionsAndOvertimePayOfUnitPrice===null || response.data.data[i].deductionsAndOvertimePayOfUnitPrice===""){
				                    unitPirceTotal[year] = parseInt(unitPirceTotal[year])+parseInt(response.data.data[i].unitPrice) 
				                    switch (response.data.data[i].employeeNo.substring(0,2)) {
										case "BP":
											bpTotal[year] = parseInt(bpTotal[year])+parseInt(response.data.data[i].unitPrice) 
											break;
										case "SP":
											spTotal[year] = parseInt(spTotal[year])+parseInt(response.data.data[i].unitPrice) 
											break;
										default:
											employeeTotal[year] = parseInt(employeeTotal[year])+parseInt(response.data.data[i].unitPrice) 
											break;
										}
				                }else{
				                    unitPirceTotal[year] = parseInt(unitPirceTotal[year])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
				                    switch (response.data.data[i].employeeNo.substring(0,2)) {
										case "BP":
											bpTotal[year] = parseInt(bpTotal[year])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
											break;
										case "SP":
											spTotal[year] = parseInt(spTotal[year])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
											break;
										default:
											employeeTotal[year] = parseInt(employeeTotal[year])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
											break;
										}
				                }               
				            }
							
				            if(response.data.data[i].monthlyGrosProfits==null||response.data.data[i].monthlyGrosProfits==""){
				                grossProfitTotal[year] = parseInt(grossProfitTotal[year]) + 0;
				            }else{
				                grossProfitTotal[year] = parseInt(grossProfitTotal[year]) + parseInt(response.data.data[i].monthlyGrosProfits) 
				            }
						}
	
						monthlyInfo = {
					            employeeClassification: employeeStatus === "0" ? null : (employeeStatus === "1" ? "1" : "023"),
					            startYandM: yearAndMonthStart,
					            endYandM: yearAndMonthEnd,
					            kadou: "0",
					        };
				        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
						.then(response => {
							if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
								let countPeoData = [];
								let employeePeoData = [];
								let spPeoData = [];
								let bpPeoData = [];
								for(let i = 0;i < years;i++){
									countPeoData.push(0);
									employeePeoData.push(0);
									spPeoData.push(0);
									bpPeoData.push(0);
								}
								for(let i in response.data.data){
									let year = Number(response.data.data[i].yearAndMonth.substring(0,4)) - 2020;
					            	countPeoData[year] = countPeoData[year] + 1;
					            	switch (response.data.data[i].employeeNo.substring(0,2)) {
									case "BP":
										bpPeoData[year] = bpPeoData[year] + 1;
										break;
									case "SP":
										spPeoData[year] = spPeoData[year] + 1;
										break;
									default:
										employeePeoData[year] = employeePeoData[year] + 1;
										break;
									}
								}
								for(let i in unitPirceTotal){
									employeePercent.push(parseInt(employeeTotal[i] * 100 / unitPirceTotal[i]) + "%");
									spPercent.push(parseInt(spTotal[i] * 100 / unitPirceTotal[i]) + "%");
									bpPercent.push(parseInt(bpTotal[i] * 100 / unitPirceTotal[i]) + "%");
									unitPirceTotal[i] = parseInt(unitPirceTotal[i] / 100000);
									grossProfitTotal[i] = parseInt(grossProfitTotal[i] / 100000);
									employeeTotal[i] = utils.addComma(employeeTotal[i]);
									spTotal[i] = utils.addComma(spTotal[i]);
									bpTotal[i] = utils.addComma(bpTotal[i]);

									textData.push("稼働人数<br/>1.社員：" + employeeTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + employeePercent[i] + "(" + employeePeoData[i] + ")<br/>" + 
												  "2.事業主：" + spTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + spPercent[i] + "(" + spPeoData[i] + ")<br/>" + 
												  "3.BP：" + bpTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + bpPercent[i] + "(" + bpPeoData[i] + ")<br/>");
								}
								this.setState({
									profitData: unitPirceTotal,
						    		grossProfitData: grossProfitTotal,
									countPeoData: countPeoData,
									textData: textData,
						        });
							}
						});
					}
                }
			}).catch((error) => {
				console.error("Error - " + error);
			});
        }
		else if(targetStatus === "1"){
	        let customerInfo = {
	                customerName: this.state.customerNo,
	                fiscalYear: "",
	                startYear: yearAndMonthStart,
	                endYear: yearAndMonthEnd,
	            };
	        axios.post(this.state.serverIP + "customerSales/searchCustomerSales", customerInfo)
            .then(response => {
                if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					if(yearStatus === "0"){
						let unitPirceTotal = [0,0,0,0,0,0,0,0,0,0,0,0];
				        let grossProfitTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
						let countPeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
				        let employeeTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
				        let employeePercent= [];
				        let spTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
				        let spPercent= [];
				        let bpTotal= [0,0,0,0,0,0,0,0,0,0,0,0];
				        let bpPercent= [];
				        let employeePeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
						let spPeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
						let bpPeoData = [0,0,0,0,0,0,0,0,0,0,0,0];
				        let textData= [];
	                    for(let i in response.data.data){
							for(let j in response.data.data[i].empDetail){
								switch (response.data.data[i].empDetail[j].employeeNo.substring(0,2)) {
								case "BP":
									bpTotal[i] = parseInt(bpTotal[i]) + parseInt(response.data.data[i].empDetail[j].unitPrice) * 10000
									bpPeoData[i] = parseInt(bpPeoData[i]) + 1;
									break;
								case "SP":
									spTotal[i] = parseInt(spTotal[i]) + parseInt(response.data.data[i].empDetail[j].unitPrice) * 10000
									spPeoData[i] = parseInt(spPeoData[i]) + 1;
									break;
								default:
									employeeTotal[i] = parseInt(employeeTotal[i]) + parseInt(response.data.data[i].empDetail[j].unitPrice) * 10000
									employeePeoData[i] = parseInt(employeePeoData[i]) + 1;
									break;
								}
							}
							employeePercent.push(parseInt(employeeTotal[i] * 100 / response.data.data[i].totalUnitPrice) + "%");
							spPercent.push(parseInt(spTotal[i] * 100 / response.data.data[i].totalUnitPrice) + "%");
							bpPercent.push(parseInt(bpTotal[i] * 100 / response.data.data[i].totalUnitPrice) + "%");
							employeeTotal[i] = utils.addComma(employeeTotal[i]);
							spTotal[i] = utils.addComma(spTotal[i]);
							bpTotal[i] = utils.addComma(bpTotal[i]);
							unitPirceTotal[i] = parseInt(response.data.data[i].totalUnitPrice / 100000);
							grossProfitTotal[i] = parseInt(response.data.data[i].grossProfit / 100000);
							countPeoData[i] = response.data.data[i].workPeoSum;
							textData.push("稼働人数<br/>1.社員：" + employeeTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + employeePercent[i] + "(" + employeePeoData[i] + ")<br/>" + 
									  	  "2.事業主：" + spTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + spPercent[i] + "(" + spPeoData[i] + ")<br/>" + 
									  	  "3.BP：" + bpTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + bpPercent[i] + "(" + bpPeoData[i] + ")<br/>");
	                    }
						this.setState({
							profitData: unitPirceTotal,
				    		grossProfitData: grossProfitTotal,
							countPeoData: countPeoData,
							textData: textData,
				        });
					}
					else{
						let years = (new Date().getFullYear() - 2020) + 1;
						let unitPirceTotal = [];
				        let grossProfitTotal= [];
						let countPeoData = [];
						let employeeTotal= [];
				        let employeePercent= [];
				        let spTotal= [];
				        let spPercent= [];
				        let bpTotal= [];
				        let bpPercent= [];
				        let employeePeoData = [];
						let spPeoData = [];
						let bpPeoData = [];
				        let textData= [];
						for(let i = 0;i < years;i++){
							unitPirceTotal.push(0);
							grossProfitTotal.push(0);
							employeeTotal.push(0);
							spTotal.push(0);
							bpTotal.push(0);
							countPeoData.push(0);
							employeePeoData.push(0);
							spPeoData.push(0);
							bpPeoData.push(0);
						}
						for(let i in response.data.data){
							let year = Number(response.data.data[i].yearAndMonth.substring(0,4)) - 2020;
							for(let j in response.data.data[i].empDetail){
								switch (response.data.data[i].empDetail[j].employeeNo.substring(0,2)) {
								case "BP":
									bpTotal[year] = parseInt(bpTotal[year]) + parseInt(response.data.data[i].empDetail[j].unitPrice) * 10000
									bpPeoData[year] = parseInt(bpPeoData[year]) + 1;
									break;
								case "SP":
									spTotal[year] = parseInt(spTotal[year]) + parseInt(response.data.data[i].empDetail[j].unitPrice) * 10000
									spPeoData[year] = parseInt(spPeoData[year]) + 1;
									break;
								default:
									employeeTotal[year] = parseInt(employeeTotal[year]) + parseInt(response.data.data[i].empDetail[j].unitPrice) * 10000
									employeePeoData[year] = parseInt(employeePeoData[year]) + 1;
									break;
								}
							}
							unitPirceTotal[year] = unitPirceTotal[year] + parseInt(response.data.data[i].totalUnitPrice);
							grossProfitTotal[year] = grossProfitTotal[year] + parseInt(response.data.data[i].grossProfit);
			            	countPeoData[year] = countPeoData[year] + parseInt(response.data.data[i].workPeoSum);
						}
						for(let i in unitPirceTotal){
							employeePercent.push(parseInt(employeeTotal[i] * 100 / unitPirceTotal[i]) + "%");
							spPercent.push(parseInt(spTotal[i] * 100 / unitPirceTotal[i]) + "%");
							bpPercent.push(parseInt(bpTotal[i] * 100 / unitPirceTotal[i]) + "%");
							employeeTotal[i] = utils.addComma(employeeTotal[i]);
							spTotal[i] = utils.addComma(spTotal[i]);
							bpTotal[i] = utils.addComma(bpTotal[i]);
							unitPirceTotal[i] = parseInt(unitPirceTotal[i] / 100000);
							grossProfitTotal[i] = parseInt(grossProfitTotal[i] / 100000);
							textData.push("稼働人数<br/>1.社員：" + employeeTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + employeePercent[i] + "(" + employeePeoData[i] + ")<br/>" + 
								  	  "2.事業主：" + spTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + spPercent[i] + "(" + spPeoData[i] + ")<br/>" + 
								  	  "3.BP：" + bpTotal[i] + "<br/>&nbsp;&nbsp;&nbsp;比率：" + bpPercent[i] + "(" + bpPeoData[i] + ")<br/>");
						}
						this.setState({
							profitData: unitPirceTotal,
				    		grossProfitData: grossProfitTotal,
							countPeoData: countPeoData,
							textData: textData,
				        });
					}
                }
            }).catch((error) => {
                console.error("Error - " + error);
            });
		}
		else if(targetStatus === "2"){
			yearAndMonthStart = ((this.state.year - 1) + "01");
			yearAndMonthEnd = (this.state.year + "12");
			let monthlyInfo = {
		            employeeClassification: null,
		            startYandM: yearAndMonthStart,
		            endYandM: yearAndMonthEnd,
		        };
			axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
			.then(response => {
				if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					let unitPirceTotalOld = [];
					let unitPirceTotal = [];
			        let grossProfitTotalOld = [];
			        let grossProfitTotal = [];
			        let textData = [];
			        let dateMonth = date.getMonth() + 2;
			        for (let i = 0;i < dateMonth;i++){
			        	unitPirceTotalOld.push(0);
			        	unitPirceTotal.push(0);
			        	grossProfitTotalOld.push(0);
			        	grossProfitTotal.push(0);
			        }
					for(let i in response.data.data){
						let year = response.data.data[i].yearAndMonth.substring(0,4);
						let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
						if(month + 1 > dateMonth)
							continue;
						if(response.data.data[i].unitPrice==null||response.data.data[i].unitPrice==""){
							if(String(year) === String(this.state.year))
								unitPirceTotal[month] = parseInt(unitPirceTotal[month]) + 0;
							else 
								unitPirceTotalOld[month] = parseInt(unitPirceTotalOld[month]) + 0;
			            }else{
			                if(response.data.data[i].deductionsAndOvertimePayOfUnitPrice===null || response.data.data[i].deductionsAndOvertimePayOfUnitPrice===""){
								if(String(year) === String(this.state.year))
									unitPirceTotal[month] = parseInt(unitPirceTotal[month])+parseInt(response.data.data[i].unitPrice);
								else 
									unitPirceTotalOld[month] = parseInt(unitPirceTotalOld[month])+parseInt(response.data.data[i].unitPrice);
			                }else{
								if(String(year) === String(this.state.year))
									unitPirceTotal[month] = parseInt(unitPirceTotal[month])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice);
								else 
									unitPirceTotalOld[month] = parseInt(unitPirceTotalOld[month])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice);
			                }               
			            }
						
			            if(response.data.data[i].monthlyGrosProfits==null||response.data.data[i].monthlyGrosProfits==""){
							if(String(year) === String(this.state.year))
				                grossProfitTotal[month] = parseInt(grossProfitTotal[month]) + 0;
							else 
				                grossProfitTotalOld[month] = parseInt(grossProfitTotalOld[month]) + 0;
			            }else{
							if(String(year) === String(this.state.year))
				                grossProfitTotal[month] = parseInt(grossProfitTotal[month]) + parseInt(response.data.data[i].monthlyGrosProfits) 
							else 
								grossProfitTotalOld[month] = parseInt(grossProfitTotalOld[month]) + parseInt(response.data.data[i].monthlyGrosProfits) 
			            }
					}
					for(let i in unitPirceTotal){
						unitPirceTotal[i] = parseInt(unitPirceTotal[i] / 100000);
						grossProfitTotal[i] = parseInt(grossProfitTotal[i] / 100000);
						unitPirceTotalOld[i] = parseInt(unitPirceTotalOld[i] / 100000);
						grossProfitTotalOld[i] = parseInt(grossProfitTotalOld[i] / 100000);
					}
					monthlyInfo = {
				            employeeClassification: null,
				            startYandM: yearAndMonthStart,
				            endYandM: yearAndMonthEnd,
				            kadou: "0",
				        };
			        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
					.then(response => {
						if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
							let countPeoDataOld = [];
							let countPeoData = [];
							for (let i = 0;i < dateMonth;i++){
								countPeoDataOld.push(0);
								countPeoData.push(0);
					        }
							for(let i in response.data.data){
								let year = response.data.data[i].yearAndMonth.substring(0,4);
								let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
								if(String(year) === String(this.state.year))
					            	countPeoData[month] = countPeoData[month] + 1;
								else 
					            	countPeoDataOld[month] = countPeoDataOld[month] + 1;
							}
							let newUnitPirceTotal = [];
							let newGrossProfitTotal = [];
							let newCountPeoData = [];
							for (let i = 0;i < dateMonth;i++){
								newUnitPirceTotal.push({value:unitPirceTotalOld[i],itemStyle: {opacity: 0.6}});
								newUnitPirceTotal.push(unitPirceTotal[i]);
								newUnitPirceTotal.push(null);
								newGrossProfitTotal.push({value:grossProfitTotalOld[i],itemStyle: {opacity: 0.6}});
								newGrossProfitTotal.push(grossProfitTotal[i]);
								newGrossProfitTotal.push(null);
								newCountPeoData.push(countPeoDataOld[i]);
								newCountPeoData.push(countPeoData[i]);
								newCountPeoData.push(null);
								let unitPircePercent = parseInt((unitPirceTotal[i] / unitPirceTotalOld[i] - 1) * 100);
								let grossProfitPercent = parseInt((grossProfitTotal[i] / grossProfitTotalOld[i] - 1) * 100);
								let countPeoPercent = parseInt((countPeoData[i] / countPeoDataOld[i] - 1) * 100);
								let unitPirceAveragePercent = parseInt(((unitPirceTotal[i] * 100000 / countPeoData[i]) / (unitPirceTotalOld[i] * 100000 / countPeoDataOld[i]) - 1) * 100);
								let text = ("比率<br/>売上：" + (unitPircePercent >= 0 ? ("<font style='color: red'>↑" + unitPircePercent + "%</font>") : ("<font style='color: green'>↓" + unitPircePercent * -1 + "%</font>")) 
										+ "<br/>粗利：" + (grossProfitPercent >= 0 ? ("<font style='color: red'>↑" + grossProfitPercent + "%</font>") : ("<font style='color: green'>↓" + grossProfitPercent * -1 + "%</font>"))
										+ "<br/>稼働：" + (countPeoPercent >= 0 ? ("<font style='color: red'>↑" + countPeoPercent + "%</font>") : ("<font style='color: green'>↓" + countPeoPercent * -1 + "%</font>")) + "（" + countPeoDataOld[i] + " : " + countPeoData[i] + "）"
										+ "<br/>平均単価：" + (unitPirceAveragePercent >= 0 ? ("<font style='color: red'>↑" + unitPirceAveragePercent + "%</font>") : ("<font style='color: green'>↓" + unitPirceAveragePercent * -1 + "%</font>")));
								textData.push(text);
								textData.push(text);
								textData.push(null);
					        }
							this.setState({
								profitData: newUnitPirceTotal,
					    		grossProfitData: newGrossProfitTotal,
								countPeoData: newCountPeoData,
								textData: textData,
					        });
						}
					});
                }
			}).catch((error) => {
				console.error("Error - " + error);
			});
		}
		else if(targetStatus === "3"){
			let workTechnician = [0,0,0,0,0,0,0,0,0,0,0,0];
			let notWorkTechnician = [0,0,0,0,0,0,0,0,0,0,0,0];
			let manager = [0,0,0,0,0,0,0,0,0,0,0,0];
			let affairs = [0,0,0,0,0,0,0,0,0,0,0,0];
			let business = [0,0,0,0,0,0,0,0,0,0,0,0];
			let total = [0,0,0,0,0,0,0,0,0,0,0,0];

			// 稼働技術者
			let monthlyInfo = {
		            kadou: "0",
		            employeeOccupation: "3",
		            startYandM: yearAndMonthStart,
		            endYandM: yearAndMonthEnd,
		        };
	        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
			.then(response => {
				if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					for(let i in response.data.data){
						let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
						if(response.data.data[i].salary == null || response.data.data[i].salary == ""){
							workTechnician[month] = workTechnician[month] + 0;
			            }else{
			                if(response.data.data[i].deductionsAndOvertimePay===null || response.data.data.deductionsAndOvertimePay===""){
			                	workTechnician[month] = workTechnician[month] + parseInt(response.data.data[i].salary)
			                }
			                else{
			                	workTechnician[month] = workTechnician[month] + parseInt(response.data.data[i].salary)+parseInt(response.data.data[i].deductionsAndOvertimePay)
			                }              
			            }
					}
				}
			});
	        
	        // 非稼働技術者
			monthlyInfo = {
		            kadou: "1",
		            employeeOccupation: "3",
		            startYandM: yearAndMonthStart,
		            endYandM: yearAndMonthEnd,
		        };
	        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
			.then(response => {
				if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					for(let i in response.data.data){
						let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
						if(response.data.data[i].salary == null || response.data.data[i].salary == ""){
							notWorkTechnician[month] = notWorkTechnician[month] + 0;
			            }else{
			                if(response.data.data[i].deductionsAndOvertimePay===null || response.data.data.deductionsAndOvertimePay===""){
			                	notWorkTechnician[month] = notWorkTechnician[month] + parseInt(response.data.data[i].salary)
			                }
			                else{
			                	notWorkTechnician[month] = notWorkTechnician[month] + parseInt(response.data.data[i].salary)+parseInt(response.data.data[i].deductionsAndOvertimePay)
			                }              
			            }
					}
					for(let i in total){
						total[i] = parseInt(total[i]) + parseInt(notWorkTechnician[i]);
					}
				}
			});
	        
	     // 管理者
			monthlyInfo = {
		            employeeOccupation: "0",
		            startYandM: yearAndMonthStart,
		            endYandM: yearAndMonthEnd,
		        };
	        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
			.then(response => {
				if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					for(let i in response.data.data){
						let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
						if(response.data.data[i].salary == null || response.data.data[i].salary == ""){
							manager[month] = manager[month] + 0;
			            }else{
			                if(response.data.data[i].deductionsAndOvertimePay===null || response.data.data.deductionsAndOvertimePay===""){
			                	manager[month] = manager[month] + parseInt(response.data.data[i].salary)
			                }
			                else{
			                	manager[month] = manager[month] + parseInt(response.data.data[i].salary)+parseInt(response.data.data[i].deductionsAndOvertimePay)
			                }              
			            }
					}
					for(let i in total){
						total[i] = parseInt(total[i]) + parseInt(manager[i]);
					}
				}
			});
	        
		     // 事務
			monthlyInfo = {
		            employeeOccupation: "2",
		            startYandM: yearAndMonthStart,
		            endYandM: yearAndMonthEnd,
		        };
	        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
			.then(response => {
				if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					for(let i in response.data.data){
						let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
						if(response.data.data[i].salary == null || response.data.data[i].salary == ""){
							affairs[month] = affairs[month] + 0;
			            }else{
			                if(response.data.data[i].deductionsAndOvertimePay===null || response.data.data.deductionsAndOvertimePay===""){
			                	affairs[month] = affairs[month] + parseInt(response.data.data[i].salary)
			                }
			                else{
			                	affairs[month] = affairs[month] + parseInt(response.data.data[i].salary)+parseInt(response.data.data[i].deductionsAndOvertimePay)
			                }              
			            }
					}
					for(let i in total){
						total[i] = parseInt(total[i]) + parseInt(affairs[i]);
					}
				}
			});
	        
	        // 営業
			monthlyInfo = {
		            employeeOccupation: "1",
		            startYandM: yearAndMonthStart,
		            endYandM: yearAndMonthEnd,
		        };
	        axios.post(this.state.serverIP + "monthlySales/searchMonthlySales", monthlyInfo)
			.then(response => {
				if (response.data.errorsMessage === null || response.data.errorsMessage === undefined) {
					for(let i in response.data.data){
						let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
						if(response.data.data[i].salary == null || response.data.data[i].salary == ""){
							business[month] = business[month] + 0;
			            }else{
			                if(response.data.data[i].deductionsAndOvertimePay===null || response.data.data.deductionsAndOvertimePay===""){
			                	business[month] = business[month] + parseInt(response.data.data[i].salary)
			                }
			                else{
			                	business[month] = business[month] + parseInt(response.data.data[i].salary)+parseInt(response.data.data[i].deductionsAndOvertimePay)
			                }              
			            }
					}
					for(let i in total){
						total[i] = parseInt(total[i]) + parseInt(business[i]);
					}
				}
			});
	        
	        let textData = [];
			setTimeout(() => {
		        for(let i in total){
		        	textData.push("比率<br/>技術者稼働：" + utils.addComma(workTechnician[i]) + "<br/>"
		        				+ "技術者非稼働：" + utils.addComma(notWorkTechnician[i]) + "<br/>"
		        				+ "管理者：" + utils.addComma(manager[i]) + "<br/>"
		        				+ "事務：" + utils.addComma(affairs[i]) + "<br/>"
		        				+ "営業：" + utils.addComma(business[i]) + "<br/>");
		        	workTechnician[i] = parseInt(workTechnician[i] / 100000);
		        	total[i] = parseInt(total[i] / 100000);
		        }
		        
				this.setState({
					profitData: workTechnician,
		    		grossProfitData: total,
					textData: textData,
		        });
			}, 1500);
		}
	}
	
    getOption = () => {
        let option = {
            title: {
                text: '売上(十万円)',
                textStyle: {
                	fontSize: "16px",
                },
            },
            tooltip:{
                trigger: 'axis',
                formatter: function(params) {
					let str = "";
					params.forEach((item) => {
						if(item.seriesName === "text"){
							if(item.data !== null){
								str = item.data;
							}
						}
					})
					return str === "" ? "" : str;
				},
            },
            legend: {
                data: this.state.targetStatus !== '3' ? ['売上','純利益'] : ['稼働','非稼働'],
                textStyle: {
                	fontSize: "16px",
                },
            },
            xAxis: {
                data: this.state.targetStatus === "2" ? this.state.xAxisData[2] : this.state.yearStatus === "0" ? this.state.xAxisData[0] : this.state.xAxisData[1],
                axisLabel: {
                    show: true,
                    interval: this.state.targetStatus === "2" ? 2 : 0,
                    padding: this.state.targetStatus === "2" ? [0, 0, 0, 70] : 0,
                    textStyle: {
                    	fontSize: "16px",
                    }
                },
                axisTick: {
                    show: false,
                }
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
                    name: this.state.targetStatus !== '3' ? '売上' : '稼働',
                    type:'bar',
                    barWidth: this.state.targetStatus === '2' ? '70%' : '30%',
                    color: 'blue',
                    label: {
                    	show: true,
                    	position: 'top',
                    	fontSize: '14px',
                    },
                    data: this.state.profitData
                },
                {
                    name:this.state.targetStatus !== '3' ? '純利益' : '非稼働',
                    type:'bar',
                    barWidth: this.state.targetStatus === '2' ? '70%' : '30%',
                    color: '#D25050',
                    label: {
                    	show: true,
                    	position: 'top',
                    	fontSize: '14px',
                    },
                    data: this.state.grossProfitData
                },
                {
                    name:'稼働人数',
                    type:'bar',
                    barGap: this.state.targetStatus === '2' || this.state.targetStatus === '3' ? '-100%' : '20%',
                    color: '#FFD24F',
                    itemStyle: {
                    	opacity: 0,
                    },
                    data: this.state.countPeoData
                },
                {
                    name:'text',
                    type:'bar',
                    itemStyle: {
                    	show: false,
                    	opacity: 0,
                    },
                    data: this.state.textData
                }
            ]
        }
        return option;
    }
    
    /**
     * 社員名連想
     * @param {} event 
     */
    getCustomer = (event, values) => {
        this.setState({
            [event.target.name]: event.target.value,
        }, () => {
            let customerNo = null;
            if (values !== null) {
                customerNo = values.code;
            }
            this.setState({
                customerNo: customerNo,
            }, () => {
        		this.dataSearch();
            })
        })
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
								<Form.Control id="targetStatus" as="select" size="sm" onChange={this.targetStatusChange} name="targetStatus" value={this.state.targetStatus} autoComplete="off" >
									<option value="0">全員売上</option>
									<option value="1">お客様売上</option>
									<option value="2">売上比較</option>
									<option value="3">支出</option>
								</Form.Control>
								<Form.Control id="employeeStatus" as="select" size="sm" onChange={this.valueChange} name="employeeStatus" value={this.state.employeeStatus} autoComplete="off" hidden={this.state.targetStatus !== "0"}>
									<option value="0">全員</option>
									<option value="2">社員</option>
									<option value="1">BP</option>
								</Form.Control>
								<Autocomplete hidden={this.state.targetStatus !== "1"}
	                                id="customerNo"
	                                name="customerNo"
	                                value={store.getState().dropDown[73].slice(1).find(v => v.code === this.state.customerNo) || ""}
	                                options={store.getState().dropDown[73].slice(1)}
	                                getOptionLabel={(option) => option.text ? option.text : ""}
	                                onChange={(event, values) => this.getCustomer(event, values)}
	                                renderOption={(option) => {
	                                    return (
	                                        <React.Fragment>
	                                            {option.name}
	                                        </React.Fragment>
	                                    )
	                                }}
	                                renderInput={(params) => (
	                                    <div ref={params.InputProps.ref}>
	                                        <input type="text" {...params.inputProps} className="auto form-control Autocompletestyle-projitChartist"
	                                        />
	                                    </div>
	                                )}
	                            />
							</InputGroup>
		                </Col>
		                <Col sm={3}>
		                <InputGroup size="sm" className="mb-3">
							<InputGroup.Prepend>
								<InputGroup.Text >日付</InputGroup.Text>
							</InputGroup.Prepend>
							<Form.Control id="yearStatus" as="select" size="sm" onChange={this.valueChange} name="yearStatus" disabled={this.state.targetStatus === "2" || this.state.targetStatus === "3"} value={this.state.yearStatus} autoComplete="off" >
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