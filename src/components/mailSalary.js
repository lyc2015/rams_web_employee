import React from 'react';
import "react-datepicker/dist/react-datepicker.css";
/**
 * メール確認
 * 
 */
class mailSalary extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initState;
	}

	initState = ({
				loginUserInfo: this.props.personalInfo.state.loginUserInfo,
				employeeNo: this.props.personalInfo.state.rowEmployeeNo,
    			employeeFristName: this.props.personalInfo.state.rowEmployeeFristName,
    			companyMail: this.props.personalInfo.state.rowCompanyMail,
				yearAndMonth: this.props.personalInfo.state.yearAndMonth,
				format: this.props.personalInfo.state.format,
				letterStatus: this.props.personalInfo.state.letterStatus,
				letterYearAndMonth: this.props.personalInfo.state.letterYearAndMonth === "0" ? new Date().getFullYear() : new Date().getFullYear() - 1,
				fileName: this.props.personalInfo.state.rowFileName,
	})
	componentDidMount() {
	}

	render() {
		return (
			<div>
				<div >
					<textarea ref={(textarea) => this.textArea = textarea} disabled
						style={{ height: '560px', width: '100%', resize: 'none', border: '0'}}
					value={
`宛先：` + this.state.companyMail + `
タイトル：` + (this.state.format === "0" ? (this.state.letterStatus === "0" ? (this.state.yearAndMonth + "給料明細") : ("給与所得の源泉徴収票_" + this.state.letterYearAndMonth + "年分")) : this.state.fileName) +`

` + this.state.employeeFristName + `さん` + `

お疲れ様です。LYCの` + this.state.loginUserInfo[0].employeeFristName + this.state.loginUserInfo[0].employeeLastName + `です。

表題の件につきまして、
`+ (this.state.format === "0" ? (this.state.letterStatus === "0" ? (this.state.yearAndMonth + "分の給料明細") : (this.state.letterYearAndMonth + "年の給与所得の源泉徴収票")) : this.state.fileName) + `を添付致しました。
ご確認お願いいたします。

以上です。

----------------------------------------------------------------------------
LYC株式会社
事務担当　`+ this.state.loginUserInfo[0].employeeFristName + ` ` + this.state.loginUserInfo[0].employeeLastName + `
〒101-0032 東京都千代田区岩本町3-3-3サザンビル3F  
URL：http://www.lyc.co.jp/
TEL：03-6908-5796
E-mail：`+ this.state.loginUserInfo[0].companyMail + ` 共通mail：eigyou@lyc.co.jp
P-mark：第21004525(02)号
労働者派遣事業許可番号　派13-306371
`}
					/></div>
			</div>
		);
	}
}
export default mailSalary;