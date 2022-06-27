/* 営業確認 */
import React from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "../asserts/css/style.css";
import Autocomplete from "@material-ui/lab/Autocomplete";
axios.defaults.withCredentials = true;
/**
 *営業送信TABLEのAUTOCOMPULETE
 */
class TableSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allOption: [],
      selectedValue: "",
      everyWidth: 0,
    };
  }
  componentDidMount() {
    if (this.props.flag === 1) {
      this.setState({
        allOption: this.props.dropdowns.state.allCustomer,
        selectedValue: this.props.dropdowns.state.customerNo,
        everyWidth: 133,
      });
    } else if (this.props.flag === 2) {
      if (
        String(this.props.dropdowns.state.lastEmpNo) === "" ||
        String(this.props.dropdowns.state.lastEmpNo).substring(0, 2) === "BP"
      ) {
        this.setState({
          allOption: this.props.dropdowns.state.salesProgressCodes,
        });
      } else {
        let temp = [];
        for (let i in this.props.dropdowns.state.salesProgressCodes) {
          if (this.props.dropdowns.state.salesProgressCodes[i].code !== "4") {
            temp.push(this.props.dropdowns.state.salesProgressCodes[i]);
          }
        }
        this.setState({
          allOption: temp,
        });
      }
      this.setState({
        selectedValue: this.props.dropdowns.state.salesProgressCode,
        everyWidth: 120,
      });
    } else if (this.props.flag === 3) {
      this.setState({
        allOption: this.props.dropdowns.state.salesPersons,
        selectedValue: this.props.dropdowns.state.salesStaff,
        everyWidth: 105,
      });
    } else if (this.props.flag === 4) {
      this.setState({
        allOption: this.props.dropdowns.state.customerContracts,
        selectedValue: this.props.dropdowns.state.customerContractStatus,
        everyWidth: 80,
      });
    } else if (this.props.flag === 5) {
      this.setState({
        allOption: this.props.dropdowns.state.customerDepartmentNameDrop,
        selectedValue: this.props.dropdowns.state.customerDepartmentName,
        everyWidth: "6rem",
      });
    } else if (this.props.flag === 6) {
      this.setState({
        allOption: this.props.dropdowns.state.positionDrop,
        selectedValue: this.props.dropdowns.state.positionCode,
        everyWidth: "4rem",
      });
    } else if (this.props.flag === 7) {
      this.setState({
        allOption: this.props.dropdowns.state.typeOfIndustryDrop,
        selectedValue: this.props.dropdowns.state.typeOfIndustryCode,
        everyWidth: 70,
      });
    } else if (this.props.flag === 8) {
      this.setState({
        allOption: this.props.dropdowns.state.stationCodeDrop,
        selectedValue: this.props.dropdowns.state.stationCode,
        everyWidth: "6rem",
      });
    } else if (this.props.flag === 9) {
      this.setState({
        allOption: this.props.dropdowns.state.developLanguageDrop,
        selectedValue: this.props.dropdowns.state.developLanguageCode1,
        everyWidth: 140,
      });
    } else if (this.props.flag === 10) {
      this.setState({
        allOption: this.props.dropdowns.state.developLanguageDrop,
        selectedValue: this.props.dropdowns.state.developLanguageCode2,
        everyWidth: 140,
      });
    } else if (this.props.flag === 11) {
      this.setState({
        allOption: this.props.dropdowns.state.topCustomerDrop,
        selectedValue: this.props.dropdowns.state.topCustomerCode,
        everyWidth: 110,
      });
    } else if (this.props.flag === 12) {
      this.setState({
        allOption: this.props.dropdowns.state.salesProgressCodes,
        selectedValue: this.props.dropdowns.state.dealDistinctioCode,
        everyWidth: 100,
      });
    }
  }

  focus() {
    this.refs.inputRef.focus();
  }

  onchange = (event, values) => {
    if (this.props.flag === 1) {
      this.props.dropdowns.getCustomerNo(
        values === null ? this.props.dropdowns.state.customerNo : values.code
      );
      this.setState({
        selectedValue:
          values === null ? this.props.dropdowns.state.customerNo : values.code,
      });
    } else if (this.props.flag === 2) {
      this.props.dropdowns.getSalesProgressCode(
        values === null
          ? this.props.dropdowns.state.salesProgressCode
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.salesProgressCode
            : values.code,
      });
    } else if (this.props.flag === 3) {
      this.props.dropdowns.getSalesStaff(
        values === null ? this.props.dropdowns.state.salesStaff : values.code
      );
      this.setState({
        selectedValue:
          values === null ? this.props.dropdowns.state.salesStaff : values.code,
      });
    } else if (this.props.flag === 4) {
      this.props.dropdowns.getCustomerContract(
        values === null
          ? this.props.dropdowns.state.customerContractStatus
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.customerContractStatus
            : values.code,
      });
    } else if (this.props.flag === 5) {
      this.props.dropdowns.getCustomerDepartment(
        values === null
          ? this.props.dropdowns.state.customerDepartmentCode
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.customerDepartmentCode
            : values.code,
      });
    } else if (this.props.flag === 6) {
      this.props.dropdowns.getPosition(
        values === null ? this.props.dropdowns.state.positionCode : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.positionCode
            : values.code,
      });
    } else if (this.props.flag === 7) {
      this.props.dropdowns.getIndustry(
        values === null
          ? this.props.dropdowns.state.typeOfIndustryCode
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.typeOfIndustryCode
            : values.code,
      });
    } else if (this.props.flag === 8) {
      this.props.dropdowns.getStation(
        values === null ? this.props.dropdowns.state.stationCode : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.stationCode
            : values.code,
      });
    } else if (this.props.flag === 9) {
      this.props.dropdowns.getLanguage1(
        values === null
          ? this.props.dropdowns.state.developLanguageCode1
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.developLanguageCode1
            : values.code,
      });
    } else if (this.props.flag === 10) {
      this.props.dropdowns.getLanguage2(
        values === null
          ? this.props.dropdowns.state.developLanguageCode2
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.developLanguageCode2
            : values.code,
      });
    } else if (this.props.flag === 11) {
      this.props.dropdowns.getTopCustomer1(
        values === null
          ? this.props.dropdowns.state.topCustomerCode
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.topCustomerCode
            : values.code,
      });
    } else if (this.props.flag === 12) {
      this.props.dropdowns.getDealDistinctioCode(
        values === null
          ? this.props.dropdowns.state.salesProgressCode
          : values.code
      );
      this.setState({
        selectedValue:
          values === null
            ? this.props.dropdowns.state.salesProgressCode
            : values.code,
      });
    }
  };

  render() {
    return (
      <span>
        <Autocomplete
          //className="MuiAutocomplete-popupIndicator"
          ref="inputRef"
          blurOnSelect={true}
          options={this.state.allOption}
          value={
            this.state.allOption.find(
              (v) => v.code === this.state.selectedValue
            ) || ""
          }
          onChange={this.onchange}
          getOptionLabel={(option) => (option.name ? option.name : "")}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                /* placeholder="選択してください" */ type="text"
                {...params.inputProps}
                style={{
                  width: this.state.everyWidth,
                  height: 20,
                  borderColor: "",
                  borderWidth: 0,
                }}
              />
            </div>
          )}
        />
      </span>
    );
  }
}
export default TableSelect;

/*
  The getElement function take two arguments,
  1. onUpdate: if you want to apply the modified data, call this function
  2. props: contain customEditorParameters, whole row data, defaultValue and attrs
*/
/* const createPriceEditor = (onUpdate, props) => (<PriceEditor onUpdate={ onUpdate } {...props}/>);
const products=[{name:'qqq',price:'125'},{name:'qqq',price:'125'}];
class CustomCellEditTable extends React.Component {
  render() {
    return (
      <BootstrapTable data={ products } cellEdit={ cellEditProp }>
          <TableHeaderColumn dataField='id' isKey={ true }>Product ID</TableHeaderColumn>
          <TableHeaderColumn
            dataField='price'
            customEditor={ { getElement: createPriceEditor } }>
            Product Price
          </TableHeaderColumn>
      </BootstrapTable>
    );
  }
} */
