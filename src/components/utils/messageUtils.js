import * as publicUtils from './publicUtils.js';
/**
 * フロントサイトしか使わないメッセージ
 * 20201019 謝
 */
export function getMessage(key, option, isNextLine) {
	let returnMessage = "";
	let message = {};
	message["E0001"] = "{{{0}}}日目は作業内容を入力してください。";
	message["E0002"] = "{{{0}}}日目は開始時間は終了時間以後になっています。";
	message["E0003"] = "{{{0}}}日目は作業時間を入力してください。";
	message["E0004"] = "{{{0}}}日目は終了時間を入力してください。";
	message["E0005"] = "{{{0}}}日目は作業時間0H以上を入力してください。";
	//message["E0005"] = "{{{0}}}日 startTime is be not normative";
	//message["E0006"] = "{{{0}}}日 endTime is be not normative";
	returnMessage = message[key];
	if (!publicUtils.isNull(option)) {
		if (Array.isArray(option)) {
			for (let i = 0; i < option.length; i++) {
				returnMessage = returnMessage.replace("{{{" + i + "}}}", option[i]);
			}
		}
		returnMessage = returnMessage.replace("{{{0}}}", option);
	}
	if (!publicUtils.isNull(isNextLine) && isNextLine === true) {
		returnMessage += "\n";
	}
	return returnMessage;
}

