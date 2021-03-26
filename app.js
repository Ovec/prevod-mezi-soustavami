const base = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const baseArr = base.split('');


/**
 * Conversion from decimal system 
 * to other systems
 * @param { Number } system destination system
 * @param { String } str string to be converted
 * @param { [ String ] } baseArr base array
 * @returns { String } converted string
 */
const convertFromDecimal = (system, str, baseArr) => {
    let result = [];

    do {
        rest = str % system;
        str = Math.floor(str / system);
        result.push(baseArr[rest]);

    } while (str > 0);

    return result.reverse().join('');
}

/**
 * Conversion from any system
 * to decimal system
 * @param { Number } system destination system
 * @param { String } str string to be converted
 * @param { [ String ] } baseArr base array
 * @returns { String }
 */
const convertToDecimal = (system, str, baseArr) => {
    let result = 0;

    const strArr = str.split('').reverse();

    for (let i = strArr.length - 1; i >= 0; i--) {
        if (strArr[i] !== "0") result += Math.pow(system, i) * baseArr.findIndex(str => str == strArr[i]);
    }

    return result;
}

/**
 * Chech if direct conversion
 * is possible
 * @param { Number } sourceBase Source base
 * @param { Number } destinationBase Destination base
 * @returns { type, base } type of convetion and base
 */
const getDirectConversionType = (sourceBase, destinationBase) => {
    let base = Decimal.log(sourceBase) / Decimal.log(destinationBase);
    if (Number.isInteger(base)) return { type: "down", base };

    base = Decimal.log(destinationBase) / Decimal.log(sourceBase);
    if (Number.isInteger(base)) return { type: "up", base };

    return false;
}

/**
 * Direct conversion
 * @param { Number } sourceSystem Source system
 * @param { Number } destinationSystem Destination system
 * @param { String } str string to convert
 * @param { Object } conversionType getDirectConversionType response
 * @param { [ String ] } baseArr base array
 * @returns { String } converted string
 */
const directConversion = (sourceSystem, destinationSystem, str, conversionType, baseArr) => {
    console.warn({ sourceSystem, destinationSystem, str, conversionType, baseArr });
    let res = [];
    let strings = str.toString().split('');

    if (conversionType.type == "down") {

        strings.forEach(str => {
            const index = baseArr.findIndex(e => e == str);
            let value = convertFromDecimal(destinationSystem, index, baseArr);

            while (value.length < conversionType.base) {
                value = "0" + value;
            }

            res.push(value)
        });
    } else {
        let parts = [], part = [];

        while (strings.length % conversionType.base > 0) {
            strings.unshift(0);
        }

        for (let i = 0; i <= strings.length; i++) {
            if (i % conversionType.base == 0 && i / conversionType.base > 0) parts.push(part.join(''));
            part[i % conversionType.base] = strings[i] || '0';
        }

        parts.forEach(part => {

            let value = convertToDecimal(sourceSystem, part, baseArr);
            res.push(baseArr[value]);

        })



    }
    return res.join('');

}

// Controler part
const sourceStringInput = document.getElementById("sourceString");
const sourceSystemInput = document.getElementById("sourceSystem");
const destinationSystemInput = document.getElementById("destinationSystem");
const transferTypeInput = document.getElementById("transferType");
const resultInput = document.getElementById("result");
let typeOfDirectConversion;

document.getElementById("transferForm").addEventListener("submit", formSubmited);

sourceSystemInput.addEventListener("change", checkDirectTransfer);
destinationSystem.addEventListener("change", checkDirectTransfer);


/**
 * For submit controller
 * @returns void
 */
function formSubmited() {
    const validation = validateInputs(sourceStringInput.value, sourceSystemInput.value, destinationSystemInput.value, transferTypeInput.value);

    if (validation.error) {
        resultInput.value = "ERROR: " + validation.error.message;
        return;
    }

    const res = convert(sourceStringInput.value, sourceSystemInput.value, destinationSystemInput.value, transferTypeInput.value);

    resultInput.value = res;
}

/**
 * Form validation
 * @param { String } sourceString value from form
 * @param { Number } sourceSystem value from form 
 * @param { Number } destinationSystem value from form
 * @param { Number } transferType value from form
 * @returns 0 || error
 */
function validateInputs(sourceString, sourceSystem, destinationSystem, transferType) {
    let stringCheck = true;
    const soureArr = sourceString.split("");

    if (!sourceString || !sourceSystem || !destinationSystem || !transferType) return { error: { message: "Některá z hodnot nutných pro výpočet není vyplněná" } };

    if (soureArr.find(str => str == "," || str == ".")) return { error: { message: "Bohužel neumím počítat desetiné čísla. :-(" } };
    soureArr.forEach(str => {
        if (!baseArr.find(e => e == str)) stringCheck = { error: { message: "Znak použitý ve zdrojovém řetězci není v základu." } };
        if (!baseArr.slice(0, sourceSystem).find(e => e == str)) stringCheck = { error: { message: "Některý ze znaků do sady nepatří." } };
    });



    if (stringCheck.error) return stringCheck;

    if (sourceSystem == destinationSystem) return { error: { message: "Zdrojová soustava a cílová jsou stejné" } };

    return 0;
}

/**
 * Check if direct transfer is possibe
 * @returns void
 */
function checkDirectTransfer() {
    if (!sourceSystemInput.value || !destinationSystemInput.value) return;
    
    if (getDirectConversionType(sourceSystemInput.value, destinationSystemInput.value)) {
        document.getElementById("directTrasfer").removeAttribute("disabled");
    } else {
        document.getElementById("directTrasfer").setAttribute("disabled", "true");
        transferTypeInput.value = 10;
    }
}

function convert(sourceString, sourceSystem, destinationSystem, transferType) {
    if (transferType == 1) return directConversion(sourceSystem, destinationSystem, sourceString, getDirectConversionType(sourceSystem, destinationSystem), baseArr);
    return convertFromDecimal(destinationSystem, convertToDecimal(sourceSystem, sourceString, baseArr), baseArr)
}