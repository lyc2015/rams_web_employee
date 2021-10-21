import React, { Component } from 'react';
import {Row , Col , InputGroup ,Form, Button, Modal, FormControl } from 'react-bootstrap';
import store from './redux/store';
import DatePicker from "react-datepicker";
import $ from 'jquery';
import Autocomplete from '@material-ui/lab/Autocomplete';

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
	        var month = date.getMonth() + 1;
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
						for(let i in response.data.data){
							let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;

							if(response.data.data[i].unitPrice==null||response.data.data[i].unitPrice==""){
				                unitPirceTotal[month] = parseInt(unitPirceTotal[month]) + 0;
				            }else{
				                if(response.data.data[i].deductionsAndOvertimePayOfUnitPrice===null || response.data.data[i].deductionsAndOvertimePayOfUnitPrice===""){
				                    unitPirceTotal[month] = parseInt(unitPirceTotal[month])+parseInt(response.data.data[i].unitPrice) 
				                }else{
				                    unitPirceTotal[month] = parseInt(unitPirceTotal[month])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
				                }               
				            }
							
				            if(response.data.data[i].monthlyGrosProfits==null||response.data.data[i].monthlyGrosProfits==""){
				                grossProfitTotal[month] = parseInt(grossProfitTotal[month]) + 0;
				            }else{
				                grossProfitTotal[month] = parseInt(grossProfitTotal[month]) + parseInt(response.data.data[i].monthlyGrosProfits) 
				            }
						}
						for(let i in unitPirceTotal){
							unitPirceTotal[i] = parseInt(unitPirceTotal[i] / 100000);
							grossProfitTotal[i] = parseInt(grossProfitTotal[i] / 100000);
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
								for(let i in response.data.data){
									let month = Number(response.data.data[i].yearAndMonth.substring(4,6)) - 1;
					            	countPeoData[month] = countPeoData[month] + 1;
								}
								this.setState({
									profitData: unitPirceTotal,
						    		grossProfitData: grossProfitTotal,
									countPeoData: countPeoData,
						        });
							}
						});
					}
					else{
						let years = (new Date().getFullYear() - 2020) + 1;
						let unitPirceTotal = [];
				        let grossProfitTotal= [];
						for(let i = 0;i < years;i++){
							unitPirceTotal.push(0);
							grossProfitTotal.push(0);
						}
						for(let i in response.data.data){
							let year = Number(response.data.data[i].yearAndMonth.substring(0,4)) - 2020;

							if(response.data.data[i].unitPrice==null||response.data.data[i].unitPrice==""){
				                unitPirceTotal[year] = parseInt(unitPirceTotal[year]) + 0;
				            }else{
				                if(response.data.data[i].deductionsAndOvertimePayOfUnitPrice===null || response.data.data[i].deductionsAndOvertimePayOfUnitPrice===""){
				                    unitPirceTotal[year] = parseInt(unitPirceTotal[year])+parseInt(response.data.data[i].unitPrice) 
				                }else{
				                    unitPirceTotal[year] = parseInt(unitPirceTotal[year])+parseInt(response.data.data[i].unitPrice) +parseInt(response.data.data[i].deductionsAndOvertimePayOfUnitPrice)
				                }               
				            }
							
				            if(response.data.data[i].monthlyGrosProfits==null||response.data.data[i].monthlyGrosProfits==""){
				                grossProfitTotal[year] = parseInt(grossProfitTotal[year]) + 0;
				            }else{
				                grossProfitTotal[year] = parseInt(grossProfitTotal[year]) + parseInt(response.data.data[i].monthlyGrosProfits) 
				            }
						}
						for(let i in unitPirceTotal){
							unitPirceTotal[i] = parseInt(unitPirceTotal[i] / 100000);
							grossProfitTotal[i] = parseInt(grossProfitTotal[i] / 100000);
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
								for(let i = 0;i < years;i++){
									countPeoData.push(0);
								}
								for(let i in response.data.data){
									let year = Number(response.data.data[i].yearAndMonth.substring(0,4)) - 2020;
					            	countPeoData[year] = countPeoData[year] + 1;
								}
								this.setState({
									profitData: unitPirceTotal,
						    		grossProfitData: grossProfitTotal,
									countPeoData: countPeoData,
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
	                    for(let i in response.data.data){
							unitPirceTotal[i] = parseInt(response.data.data[i].totalUnitPrice / 100000);
							grossProfitTotal[i] = parseInt(response.data.data[i].grossProfit / 100000);
							countPeoData[i] = response.data.data[i].workPeoSum;
	                    }
						this.setState({
							profitData: unitPirceTotal,
				    		grossProfitData: grossProfitTotal,
							countPeoData: countPeoData,
				        });
						
						
					}
					else{
						let years = (new Date().getFullYear() - 2020) + 1;
						let unitPirceTotal = [];
				        let grossProfitTotal= [];
						let countPeoData = [];
						for(let i = 0;i < years;i++){
							unitPirceTotal.push(0);
							grossProfitTotal.push(0);
							countPeoData.push(0);
						}
						for(let i in response.data.data){
							let year = Number(response.data.data[i].yearAndMonth.substring(0,4)) - 2020;
							unitPirceTotal[year] = unitPirceTotal[year] + parseInt(response.data.data[i].totalUnitPrice);
							grossProfitTotal[year] = grossProfitTotal[year] + parseInt(response.data.data[i].grossProfit);
			            	countPeoData[year] = countPeoData[year] + parseInt(response.data.data[i].workPeoSum);
						}
						for(let i in unitPirceTotal){
							unitPirceTotal[i] = parseInt(unitPirceTotal[i] / 100000);
							grossProfitTotal[i] = parseInt(grossProfitTotal[i] / 100000);
						}
						this.setState({
							profitData: unitPirceTotal,
				    		grossProfitData: grossProfitTotal,
							countPeoData: countPeoData,
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
			        let dateMonth = date.getMonth() + 1;
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
								newUnitPirceTotal.push(unitPirceTotalOld[i]);
								newUnitPirceTotal.push(unitPirceTotal[i]);
								newUnitPirceTotal.push(null);
								newGrossProfitTotal.push(grossProfitTotalOld[i]);
								newGrossProfitTotal.push(grossProfitTotal[i]);
								newGrossProfitTotal.push(null);
								newCountPeoData.push(countPeoDataOld[i]);
								newCountPeoData.push(countPeoData[i]);
								newCountPeoData.push(null);
					        }
							this.setState({
								profitData: newUnitPirceTotal,
					    		grossProfitData: newGrossProfitTotal,
								countPeoData: newCountPeoData,
					        });
						}
					});
                }
			}).catch((error) => {
				console.error("Error - " + error);
			});
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
						if(item.seriesName === "稼働人数"){
							if(item.data !== null){
								str = "稼働人数　" + item.data;
							}
						}
					})
					return str === "" ? "" : ('<div><font style="color:#FFD24F">●</font>' + str + '</div>');
				},
            },
            legend: {
                data:['売上','純利益'],
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
                    name:'売上',
                    type:'bar',
                    barWidth: this.state.targetStatus === '2' ? '60%' : '30%',
                    color: 'blue',
                    label: {
                    	show: true,
                    	position: 'top',
                    	fontSize: '14px',
                    },
                    data: this.state.profitData
                },
                {
                    name:'純利益',
                    type:'bar',
                    barWidth: this.state.targetStatus === '2' ? '60%' : '30%',
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
                    barGap: this.state.targetStatus === '2' ? '-100%' : '20%',
                    color: '#FFD24F',
                    itemStyle: {
                    	opacity: 0,
                    },
                    data: this.state.countPeoData
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
							<Form.Control id="yearStatus" as="select" size="sm" onChange={this.valueChange} name="yearStatus" disabled={this.state.targetStatus === "2"} value={this.state.yearStatus} autoComplete="off" >
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