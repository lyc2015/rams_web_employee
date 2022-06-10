import { message } from "antd";
import JapaneseHolidays from "japanese-holidays";
import axios from "axios";
axios.defaults.withCredentials = true;
const $ = require("jquery");
// 時間段を取得
export function getFullYearMonth(date, now) {
  if (
    date !== undefined &&
    date !== null &&
    date !== "" &&
    now !== undefined &&
    now !== null &&
    now !== ""
  ) {
    var returnYears = 0;
    var returnMonths = 0;
    var yearmonth = -1;
    var keyYear = date.getFullYear();
    var keyMonth = date.getMonth() + 1;
    var keyDay = date.getDate();
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth() + 1;
    var nowDay = now.getDate();
    var yearDiff = nowYear - keyYear;
    var monthDiff = nowMonth - keyMonth;
    var dayDiff = nowDay - keyDay;

    if (yearDiff < 0) {
      return "0年0月";
    }

    if (yearDiff === 0 && monthDiff < 0) {
      return "0年0月";
    }

    if (yearDiff === 0 && monthDiff === 0 && dayDiff < 0) {
      return "0年0月";
    }

    returnYears = yearDiff;
    if (monthDiff < 0) {
      returnYears = returnYears - 1;
      monthDiff = 12 + monthDiff;
    }

    returnMonths = monthDiff;
    /*
     * if (dayDiff < 0) { returnMonths = returnMonths - 1; }
     */
    if (returnYears === 0) {
      yearmonth = returnMonths + "ヶ月";
    } else {
      yearmonth = returnYears + "年" + returnMonths + "ヶ月";
    }
    return yearmonth;
  } else {
    return "";
  }
}

export function getYear(date, now) {
  if (
    date !== undefined &&
    date !== null &&
    date !== "" &&
    now !== undefined &&
    now !== null &&
    now !== ""
  ) {
    var returnYears = 0;
    var returnMonths = 0;
    var yearmonth = -1;
    var keyYear = date.getFullYear();
    var keyMonth = date.getMonth() + 1;
    var keyDay = date.getDate();
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth() + 1;
    var nowDay = now.getDate();
    var yearDiff = nowYear - keyYear;
    var monthDiff = nowMonth - keyMonth;
    var dayDiff = nowDay - keyDay;

    if (yearDiff < 0) {
      return "0";
    }

    if (yearDiff === 0 && monthDiff < 0) {
      return "0";
    }

    if (yearDiff === 0 && monthDiff === 0 && dayDiff < 0) {
      return "0";
    }

    returnYears = yearDiff;
    if (monthDiff < 0) {
      returnYears = returnYears - 1;
      monthDiff = 12 + monthDiff;
    }

    returnMonths = monthDiff;
    /*
     * if (dayDiff < 0) { returnMonths = returnMonths - 1; }
     */
    if (returnYears === 0) {
      yearmonth = "0";
    } else {
      yearmonth = returnYears;
    }
    return yearmonth;
  } else {
    return "";
  }
}

// ド時間プラグインの値をセット
export function setFullYearMonth(date) {
  var month = date.getMonth() + 1;
  var value = date.getFullYear() + "" + (month < 10 ? "0" + month : month);
  return value;
}

// ドロップダウン
export function getdropDown(method, serverIP) {
  var array = [{ code: "", name: "" }];
  $.ajax({
    type: "POST",
    url: serverIP + method,
    async: false,
    xhrFields: {
      // 允许带上凭据
      withCredentials: true,
    },
    success: function (msg) {
      for (var i in msg) {
        array.push(msg[i]);
      }
    },
  });
  return array;
}
// ドロップダウン 多くメソッド
export function getPublicDropDown(methodNameList, serverIP) {
  var outArray = [];
  var par = JSON.stringify(methodNameList);
  $.ajax({
    type: "POST",
    url: serverIP + "initializationPage",
    data: par,
    async: false,
    xhrFields: {
      // 允许带上凭据
      withCredentials: true,
    },
    contentType: "application/json",
    success: function (resultList) {
      for (let j = 0; j < resultList.length; j++) {
        var array = [{ code: "", name: "" }];
        var list = resultList[j];
        for (var i in list) {
          array.push(list[i]);
        }
        outArray.push(array);
      }
    },
  });
  return outArray;
}

// ドロップダウン 多くメソッド react-bootstrap-table---->select専用
export function getPublicDropDownRtBtSpTleOnly(methodNameList, serverIP) {
  var outArray = [];
  var par = JSON.stringify(methodNameList);
  $.ajax({
    type: "POST",
    data: par,
    url: serverIP + "initializationPage",
    contentType: "application/json",
    async: false,
    xhrFields: {
      // 允许带上凭据
      withCredentials: true,
    },
    success: function (resultList) {
      for (let j = 0; j < resultList.length; j++) {
        var array = [{ value: "", text: "" }];
        var List = resultList[j];
        for (var k in List) {
          var arrayDetail1 = { value: "", text: "" };
          if (List[k].code !== null) {
            arrayDetail1 = { value: List[k].code, text: List[k].name };
          } else {
            arrayDetail1 = { value: List[k].value, text: List[k].label };
          }
          array.push(arrayDetail1);
        }
        outArray.push(array);
      }
    },
  });
  return outArray;
}

// 採番番号
export async function getNO(columnName, typeName, table, serverIP) {
  var no;
  var mo = {
    columnName: columnName,
    typeName: typeName,
    name: table,
  };
  if (typeName.length > 3) {
    $.ajax({
      type: "POST",
      url: serverIP + "getNoG",
      data: JSON.stringify(mo),
      contentType: "application/json",
      async: false,
      xhrFields: {
        // 允许带上凭据
        withCredentials: true,
      },
      success: function (data) {
        if (data != null) {
          no = data;
        }
      },
    });
  } else {
    if (typeName === "BPR" || typeName === "SP" || typeName === "SC") {
      $.ajax({
        type: "POST",
        url: serverIP + "getNO",
        data: JSON.stringify(mo),
        contentType: "application/json",
        async: false,
        xhrFields: {
          // 允许带上凭据
          withCredentials: true,
        },
        success: function (data) {
          if (data != null) {
            no = data;
          }
        },
      });
    } else if (typeName === "BP") {
      $.ajax({
        type: "POST",
        url: serverIP + "getNoBP",
        data: JSON.stringify(mo),
        contentType: "application/json",
        async: false,
        xhrFields: {
          // 允许带上凭据
          withCredentials: true,
        },
        success: function (data) {
          if (data != null) {
            no = data;
          }
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: serverIP + "getNoNew",
        data: JSON.stringify(mo),
        contentType: "application/json",
        async: false,
        xhrFields: {
          // 允许带上凭据
          withCredentials: true,
        },
        success: function (data) {
          if (data != null) {
            no = data;
          }
        },
      });
    }
  }

  return no;
}

/**
 * 前到后时间格式
 *
 * @param {*}
 *            datetime 日本时间时间戳
 * @param {*}
 *            flag 判断是年月(false)还是年月日(true)
 * @return 年月或年月日（没有/）或空
 */
export function formateDate(datetime, flag) {
  if (datetime !== undefined && datetime !== null && datetime !== "") {
    function addDateZero(num) {
      return num < 10 ? "0" + num : num;
    }
    console.log(datetime instanceof Date, datetime, "formateDate");
    let d = datetime;
    if (!(d instanceof Date)) {
      d = new Date(datetime);
    }
    let formatdatetime;
    if (flag === true) {
      formatdatetime =
        d.getFullYear() +
        "" +
        addDateZero(d.getMonth() + 1) +
        "" +
        addDateZero(d.getDate());
    } else {
      formatdatetime = d.getFullYear() + "" + addDateZero(d.getMonth() + 1);
    }
    return formatdatetime;
  } else {
    return "";
  }
}
/**
 * 后到前时间格式
 *
 * @param {*}
 *            serverDate 数据库的时间
 * @param {*}
 *            flag 判断是年月(false)还是年月日(true)
 * @retur 日本时间戳
 */
export function converToLocalTime(serverDate, flag) {
  if (serverDate !== undefined && serverDate !== null && serverDate !== "") {
    if (flag === true) {
      var pattern = /(\d{4})(\d{2})(\d{2})/;
      var dt = new Date(serverDate.replace(pattern, "$1-$2-$3"));
      return dt;
    } else {
      var pattern = /(\d{4})(\d{2})/;
      var dt = new Date(serverDate.replace(pattern, "$1-$2"));
      return dt;
    }
  } else {
    return "";
  }
}

export function timeToStr(date) {
  if (date !== undefined && date !== null && date !== "") {
    function addDateZero(num) {
      return num < 10 ? "0" + num : num;
    }
    let d = new Date(date);
    return (
      d.getFullYear() +
      "" +
      addDateZero(d.getMonth() + 1) +
      "" +
      addDateZero(d.getDate()) +
      "" +
      addDateZero(d.getHours()) +
      "" +
      addDateZero(d.getMinutes())
    );
  } else {
    return "";
  }
}

// yyyymmddhhmm→yyyy/mm/dd hh:mm
export function strToTime(datetime) {
  if (datetime !== undefined && datetime !== null && datetime !== "") {
    var pattern = /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/;
    return datetime.replace(pattern, "$1/$2/$3 $4:$5");
  } else {
    return "";
  }
}

// 誕生日ー年齢計算
export function birthday_age(age) {
  if (age !== undefined && age !== null && age !== "") {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var value =
      year -
      age +
      "" +
      (month < 10 ? "0" + month : month) +
      "" +
      (day < 10 ? "0" + day : day);
    return value;
  } else {
    return age;
  }
}
/**
 * 联想框label的value取得
 *
 * @param {*}
 *            name name的值
 * @param {*}
 *            list 后台传来的下拉框数组
 * @return name对应的code值
 */
export function labelGetValue(name, list) {
  for (var i in list) {
    if (name === list[i].name) {
      return list[i].code;
    }
  }
}

/**
 * 联想框label的value取得
 *
 * @param {*}
 *            name name的值
 * @param {*}
 *            list 后台传来的下拉框数组
 * @return name对应的code值
 */
export function textGetValue(text, list) {
  for (var i in list) {
    if (text === list[i].text) {
      return list[i].code;
    }
  }
}
/**
 * 联想框value的label取得
 *
 * @param {*}
 *            name name的值
 * @param {*}
 *            list 后台传来的下拉框数组
 * @return name对应的code值
 */
export function valueGetLabel(code, list) {
  for (var i in list) {
    if (code === list[i].code) {
      return list[i].name;
    }
  }
}

/**
 * 联想框value的text取得
 *
 * @param {*}
 *            name name的值
 * @param {*}
 *            list 后台传来的下拉框数组
 * @return name对应的code值
 */
export function valueGetText(code, list) {
  for (var i in list) {
    if (code === list[i].code) {
      return list[i].text;
    }
  }
}

// // Download 方法
// // param path 備考：ファイルのフォーマットは下記です
// // c:/file/LYC124_12/12_履歴書1.xlsx
// export function handleDownload(path, serverIP, fileKey) {
//   if (path !== undefined && path !== null && path !== "") {
//     var NewPath = new Array();
//     NewPath = path.split("/");
//     let fileKeyArr = fileKey.split("/");
//     if (NewPath.length == 1) {
//       NewPath = path.split("\\");
//     }
//     var xhr = new XMLHttpRequest();
//     xhr.open("post", serverIP + "download", true);
//     xhr.responseType = "blob";
//     xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
//     xhr.withCredentials = true;
//     xhr.onload = function () {
//       if (this.status === 200) {
//         var blob = this.response;
//         if (blob.size === 0) {
//           alert("no resume");
//         } else {
//           var a = document.createElement("a");
//           var url = window.URL.createObjectURL(blob);
//           a.href = url;
//           // 设置文件名称
//           a.download = fileKeyArr[fileKeyArr.length - 1];
//           a.click();
//           a.remove();
//         }
//       }
//     };
//     xhr.send(
//       JSON.stringify({
//         name: path,
//       })
//     );
//   } else {
//     alert("ファイルが存在しません。");
//   }
// }

// 浏览器下载附件
function showDownloadResume(fileBlobUrl, path) {
  var a = document.createElement("a");

  a.href = fileBlobUrl;
  if (!path) return;
  let pathArr = [];
  if (path.includes("/")) {
    pathArr = path.split("/");
  } else if (path.includes("\\")) {
    pathArr = path.split("\\");
  }

  a.download = pathArr[pathArr.length - 1];
  a.click();
  a.remove();
}

// Download 方法 by:FanChongXin
export async function handleDownload(path, serverIP) {
  let res = await axios.post(
    serverIP + "download",
    {
      name: path,
    },
    {
      responseType: "blob",
    }
  );
  let fileBlobUrl = window.URL.createObjectURL(res.data);
  showDownloadResume(fileBlobUrl, path);
}

// Download 方法
// param path 備考：ファイルのフォーマットは下記です
// c:/file/LYC124_12/12_履歴書1.xlsx
export function resumeDownload(path, serverIP, name) {
  if (path !== undefined && path !== null && path !== "") {
    var NewPath = new Array();
    NewPath = path.split("/");
    if (NewPath.length == 1) {
      NewPath = path.split("\\");
    }
    var xhr = new XMLHttpRequest();
    xhr.open("post", serverIP + "download", true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
    xhr.withCredentials = true;
    xhr.onload = function () {
      if (this.status === 200) {
        var blob = this.response;
        if (blob.size === 0) {
          alert("no resume");
        } else {
          var a = document.createElement("a");
          var url = window.URL.createObjectURL(blob);
          a.href = url;
          // 设置文件名称
          if (name !== undefined && name !== null && name !== "") {
            a.download =
              NewPath[NewPath.length - 1].split("_")[0].replace(/[　]/g, "") +
              "_" +
              name +
              "." +
              NewPath[NewPath.length - 1].split(".")[
                NewPath[NewPath.length - 1].split(".").length - 1
              ];
          } else {
            a.download = NewPath[NewPath.length - 1];
          }
          a.click();
          a.remove();
        }
      }
    };
    xhr.send(
      JSON.stringify({
        name: path,
      })
    );
  } else {
    alert("ファイルが存在しません。");
  }
}

// Download 方法
// param path 備考：ファイルのフォーマットは下記です
// c:/file/LYC124_12/12_履歴書1.xlsx
export function testHandleDownload(path, serverIP) {
  for (let i = 0; i < path.length; i++) {
    if (path[i] !== undefined && path[i] !== null && path[i] !== "") {
      var NewPath = new Array();
      NewPath = path[i].split("/");
      if (NewPath.length == 1) {
        NewPath = path[i].split("\\");
      }
      var xhr = new XMLHttpRequest();
      xhr.open("post", serverIP + "download", true);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
      xhr.withCredentials = true;
      xhr.onload = function () {
        if (this.status === 200) {
          var blob = this.response;
          if (blob.size === 0) {
            alert("no resume");
          } else {
            var a = document.createElement("a");
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            // 设置文件名称
            a.download = path[i].split("/")[path[i].split("/").length - 1];
            a.click();
            a.remove();
          }
        }
      };
      xhr.send(
        JSON.stringify({
          name: path[i],
        })
      );
    }
  }
}

// Download 方法
// param path 備考：ファイルのフォーマットは下記です
// c:/file/LYC124_12/12_履歴書1.xlsx
export function folderDownload(path, serverIP) {
  if (path !== undefined && path !== null && path !== "") {
    var NewPath = new Array();
    NewPath = path.split("/");
    if (NewPath.length == 1) {
      NewPath = path.split("\\");
    }
    var xhr = new XMLHttpRequest();
    xhr.open("post", serverIP + "download", true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
    xhr.withCredentials = true;
    xhr.onload = function () {
      if (this.status === 200) {
        var blob = this.response;
        if (blob.size === 0) {
          alert("データ存在しない");
        } else {
          var a = document.createElement("a");
          var url = window.URL.createObjectURL(blob);
          a.href = url;
          // 设置文件名称
          a.download = NewPath[NewPath.length - 1];
          a.click();
          a.remove();
        }
      }
    };
    xhr.send(
      JSON.stringify({
        name: path,
      })
    );
  }
}

export function postcodeApi(postcode) {
  if (postcode !== undefined && postcode !== null && postcode !== "") {
    var outArray = [];
    $.ajax({
      type: "post",
      url: "/postcodeApi/search?zipcode=" + postcode,
      async: false,
      contentType: "application/json",
      xhrFields: {
        // 允许带上凭据
        withCredentials: true,
      },
      dataType: "json",
      success: function (result) {
        console.log(result);
        if (result.status === 200) {
          if (result.results != null) {
            outArray.push(
              result.results[0].address1 +
                result.results[0].address2 +
                result.results[0].address3
            );
          } else {
            // alert("郵便番号がわからない場合もこちら")
          }
        } else {
          // alert(result.message)
        }
      },
    });
  }
  return outArray;
}

// 年齢と和暦
export function calApi(date) {
  var outArray = [];
  // http://ap.hutime.org/cal/ 西暦と和暦の変換
  const ival =
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  $.ajax({
    type: "get",
    url: "/cal?method=conv&ical=101.1&itype=date&ival=" + ival + "&ocal=1001.1",
    async: false,
    xhrFields: {
      // 允许带上凭据
      withCredentials: true,
    },
    contentType: "application/json",
    success: function (result) {
      if (result != null) {
        outArray.push(result);
        outArray.push(GetAgeByBrithday(date));
      }
    },
  });
  return outArray;
}

// diff time, 11:30 - 09:00 = 2.5(H)
// input startTime(string), endTime(string)
// output double
export function timeDiff(startTime, endTime) {
  let result = 0;
  let startMinute = 0;
  let endMinute = 0;
  let temp = "";

  if (!startTime || !endTime) {
    result = "";
  } else {
    temp = startTime.split(":");
    startMinute = Number(temp[0]) * 60 + Number(temp[1]);
    temp = endTime.split(":");
    endMinute = Number(temp[0]) * 60 + Number(temp[1]);
    result = (endMinute - startMinute) / 60;
  }
  return result;
}
// 0130 -> 01:30
// input time(string), char(string default->:)
// output string
export function timeInsertChar(time, inputChar) {
  if (isNull(inputChar)) {
    inputChar = ":";
  }
  return isEmpty(time)
    ? ""
    : time.substring(0, 2) + inputChar + time.substring(2, 4);
}
// is Null?
// input Object
// output boolean
export function isNull(obj) {
  return obj === undefined || obj === null;
}
// is empty?
// input Object
// output boolean
export function isEmpty(obj) {
  return isNull(obj) || obj === "";
}
// Null to empty
// input Object
// output Object or ""
export function nullToEmpty(obj) {
  return isNull(obj) ? "" : obj;
}
/**
 * お金の三枠でカンマ区切り
 *
 * @param {*}
 *            num strの数字
 */
export function addComma(num) {
  if (num !== null && num !== "" && num !== undefined) {
    num = num.toString();
  } else {
    return "";
  }
  var oldNum = num;
  if (num !== null && num !== "" && num !== undefined) {
    if (num.substring(0, 1) === "-") {
      num = num.replace("-", "");
    }
  }
  var type = true;
  var value = "";
  num = num.replace(/,/g, "");
  if (num.indexOf(".") < 0) {
    var t1 = num.toString().split("");
  } else {
    type = false;
    var arr = num.toString().split(".");
    var t1 = arr[0].toString().split("");
    var t2 = arr[1].toString();
  }
  var result = [],
    counter = 0;
  for (var i = t1.length - 1; i >= 0; i--) {
    counter++;
    result.unshift(t1[i]);
    if (counter % 3 == 0 && i != 0) {
      result.unshift(",");
    }
  }
  if (type === true) {
    value = result.join("");
  } else {
    value = result.join("") + "." + t2;
  }
  if (oldNum !== null && oldNum !== "" && oldNum !== undefined) {
    if (oldNum.substring(0, 1) === "-") {
      value = "-" + value;
    }
  }
  return value;
}

/**
 * お金の三枠でカンマ削除
 *
 * @param {*}
 *            money strの数字
 * @param {*}
 *            decimalPointFlag 小数点保留フラグ
 */
export function deleteComma(money) {
  if (money === null || money === undefined || money === "") {
    return "";
  }
  var moneyStr = money + "";
  return moneyStr.replaceAll(",", "");
}
/**
 * YYYYMMDD→YYYY/MM/DDまたYYYYMM→YYYY/MM
 *
 * @param {*}
 *            datestrの数字
 * @return {*} YYYY/MM/DDまたYYYY/MM
 */
export function dateFormate(dateStr) {
  if (dateStr === null || dateStr === undefined) {
    return "";
  }
  if (dateStr.length == 8) {
    return (
      dateStr.substring(0, 4) +
      "/" +
      dateStr.substring(4, 6) +
      "/" +
      dateStr.substring(6, 8)
    );
  } else if (dateStr.length == 6) {
    return dateStr.substring(0, 4) + "/" + dateStr.substring(4, 6);
  } else {
    return dateStr;
  }
}

// isHoliday?
// input Object or year, month, day
// output boolean
export function isHoliday() {
  switch (arguments.length) {
    case 1: // main
      let date = arguments[0];
      return (
        JapaneseHolidays.isHoliday(date) ||
        date.getDay() === 0 ||
        date.getDay() === 6
      );
    case 3:
      let year = arguments[0];
      let month = arguments[1];
      let day = arguments[2];
      return isHoliday(new Date(Number(year), Number(month) - 1, Number(day)));
    default:
      return isHoliday(new Date());
  }
}

export function GetAgeByBrithday(birthday) {
  var age = 0;
  var today = new Date();
  var todayYear = today.getFullYear();
  var todayMonth = today.getMonth() + 1;
  var todayDay = today.getDate();

  var birthdayYear = new Date(birthday).getFullYear();
  var birthdayMonth = new Date(birthday).getMonth() + 1;
  var birthdayDay = new Date(birthday).getDate();

  if (todayMonth * 1 - birthdayMonth * 1 < 0) {
    age = todayYear * 1 - birthdayYear * 1 - 1;
  } else if (todayMonth * 1 - birthdayMonth * 1 > 0) {
    age = todayYear * 1 - birthdayYear * 1;
  } else {
    if (todayDay * 1 - birthdayDay * 1 >= 0) {
      age = todayYear * 1 - birthdayYear * 1;
    } else {
      age = todayYear * 1 - birthdayYear * 1 - 1;
    }
  }
  return age;
}

export async function katakanaApi(value) {
  $.ajax({
    type: "POST",
    url: "/katakana",
    data: {
      app_id:
        "36767e486ea387713ac17cff9c07ee840ce0781e7320010bd6ff661724a49c7a",
      request_id: "record003",
      sentence: value,
      output_type: "katakana",
    },
    xhrFields: {
      // 允许带上凭据
      withCredentials: true,
    },
    dataType: "json",
    contentType: "application/x-www-form-urlencoded",
    async: false,
    success: function (data) {
      value = data.converted;
    },
  });
  return value;
}

/**
 * trim(str, pos)
 * 该方法可以去除空格，分别可以去除所有空格，两端空格，左边空格，右边空格，默认为去除两端空格
 * str <String> 字符串
 * pos <String> 去除那些位置的空格，可选为：both-默认值，去除两端空格，left-去除左边空格，right-去除右边空格，all-去除包括中间和两端的所有空格
 */
export function trim(str, pos = "both") {
  if (pos == "both") {
    return str.replace(/^\s+|\s+$/g, "");
  } else if (pos == "left") {
    return str.replace(/^\s*/, "");
  } else if (pos == "right") {
    return str.replace(/(\s*$)/g, "");
  } else if (pos == "all") {
    return str.replace(/\s+/g, "");
  } else {
    return str;
  }
}

/**
 * INPUT输入的时候全角自动转为半角
 */
export function enToManEn(en) {
  let manEn = (en / 10000).toFixed(1).replace(".0", "") + "万円";
  return en === "" ? "" : manEn;
}

/**
 * INPUT输入的时候全角自动转为半角
 */
export function costValueChange(v) {
  let cost = v + "";
  if (cost.length > 7) {
    message.error("入力された金額は合理的ではありません！");
    return "";
  }
  let result = "";
  for (let i = 0; i < cost.length; i++) {
    if (cost.charCodeAt(i) === 12288) {
      result += String.fromCharCode(cost.charCodeAt(i) - 12256);
      continue;
    }
    if (cost.charCodeAt(i) > 65280 && cost.charCodeAt(i) < 65375)
      result += String.fromCharCode(cost.charCodeAt(i) - 65248);
    else result += String.fromCharCode(cost.charCodeAt(i));
  }
  cost = addComma(result);
  return cost;
}
