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
				yearAndMonth: new Date(),
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
`宛先：` + "xxxxxx@xxx.xxx" + `
タイトル：` + this.state.yearAndMonth.getFullYear() + "年" + (this.state.yearAndMonth.getMonth() + 1) + "月" + `給料明細

XXさん` + `

お疲れ様です。LYCの` + this.state.loginUserInfo[0].employeeFristName + this.state.loginUserInfo[0].employeeLastName + `です。

表題の件につきまして、
`+ this.state.yearAndMonth.getFullYear() + "年" + (this.state.yearAndMonth.getMonth() + 1) + "月" + `分の給料明細を添付致しました。
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