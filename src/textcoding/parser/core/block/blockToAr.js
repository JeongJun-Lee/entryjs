/*
 * Convert code blocks to Arduino code for upload to HW
 */
'use strict';

Entry.BlockToArParser = class {
    constructor() {
        this._type = 'BlockToArParser';
        this._funcParamMap = new Entry.Map();
        this.funcDefMap = {};
        this.funcSyntax = '';
        this._funcParamTypeMap = new Entry.Map();
        this.init();
    }

    init() {
        this._iterVar = 'x';
        this._source = ['// Created by Entry\n', 'void setup() {', '}\n', 'void loop() {', '}\n'];
        this._curLine = this._source.length - 1; // the end of the source
        this._funcName = '';
        this._pinNum = -1;
        this._pinNum2 = -1;
        this._pinNum3 = -1;
        this._pinNum4 = -1;
        this._pramVal = [];
        this._isInRepeat = false;
        this._hasRootFunc = false;
        this.funcDefMap = {};
        this._funcParamTypeMap.clear();
    }

    Code(code, parseMode) {
        this._parseMode = parseMode;
        if (!code) {
            return;
        }

        if (this.isOver2StartBlk(code)) { // Start block should be only one in whole code
            this.throwErr('error', 'TooManyStart');
        }
        if (code instanceof Entry.Thread) {
            return this.Thread(code);
        }
        if (code instanceof Entry.Block) {
            return this.Block(code);
        }

        // init
        let results = '';
        this.init();

        const threads = code.getThreads();
        for (let i = 0; i < threads.length; i++) {
            this._forIdCharIndex = 0;
            const thread = threads[i];
            const data = thread._data;

            // Ignore thread not connected to Start block
            if (data[0].data.type !== 'when_run_button_click') {
                continue;
            }

            if (thread) {
                results = this.Thread(thread);
            }
        }

        results = this.indent();
        console.log(results.join('\n'));
        return results.join('\n');
    }

    isOver2StartBlk(code) {
        const threads = code.getThreads();

        let cnt = 0;
        threads.forEach(thread => {
            thread._data[0].data.type === 'when_run_button_click' && cnt++;
        });
        return (cnt >= 2) ? true : false;
    }

    Thread(thread) {
        if (thread instanceof Entry.Block) {
            return this.Block(thread);
        }
        const blocks = thread.getBlocks();
        if (blocks.length === 0 || this.isUnsupportedBlkInTopLvl(blocks)) {
            return '';
        }

        if (this._parseMode === Entry.Parser.PARSE_GENERAL) {
            blocks.map((block) => {
                if (Entry.TextCodingUtil.hasUnSupportedBlkInAr(block)) {
                    this.throwErr('error', 'UnsupportedBlk', block);
                } else {
                    const stat = this.Block(block);
                    if (stat) {
                        this.insertIntoSrc(stat, block);
                    }
                }

                // Handle blocks in loop or condition block
                if (block.statements.length) {
                    block.statements.forEach((stmt, idx) => {
                        this.Thread(stmt);

                        // In case of if-else, add middle frame
                        if (idx === block.statements.length - 2) {
                            this.insertIntoSrc('} else {');
                        }

                        // When escape loop or condition, add closed frame
                        if (idx === block.statements.length - 1 && (
                            block.statements[idx].parent.type !== 'repeat_inf' ||
                            block.thread.parent.type === 'repeat_basic' ||
                            block.thread.parent.type === '_if' ||
                            block.thread.parent.type === 'if_else'
                        )) {
                            this.insertIntoSrc('}');
                        } else if (block.statements[idx].parent.type === 'repeat_inf') {
                            this._isInRepeat = false;
                        }
                    });
                }
            });
        }

        return this._source;
    }

    // If possilbe, find at early stage
    isUnsupportedBlkInTopLvl(blocks) {
        // Check variable error
        const err = Entry.TextCodingUtil.validateVariableAndListToPython();
        if (err) {
            this.throwErr('error', err.message);
        }

        blocks.forEach((block) => {
            if (Entry.TextCodingUtil.hasUnSupportedBlkInAr(block)) {
                this.throwErr('error', 'UnsupportedBlk', block);
            }
        });
    }

    insertIntoSrc(stat, block, addFunc) {
        if (block && (
            block._schema.class === 'variable' ||
            block.type === 'arduino_ext_set_servo' ||
            block.type === 'ITPLE_set_servo' ||
            block.type === 'arduino_nano_ext_set_servo' ||
            block.type === 'arduino_ext_set_stepper' ||
            block.type === 'arduino_nano_ext_set_stepper' ||
            block.type === 'arduino_ext_get_ultrasonic_value' ||
            block.type === 'arduino_nano_ext_get_ultrasonic_value' ||
            block.type === 'ITPLE_get_ultrasonic_value' ||
            block.type === 'arduino_ext_set_temp_humi_init' ||
            block.type === 'arduino_nano_ext_set_temp_humi_init' ||
            block.type === 'arduino_ext_set_irremote_init' ||
            block.type === 'arduino_nano_ext_set_irremote_init' ||
            block.type === 'arduino_ext_set_lcd_init' ||
            block.type === 'arduino_nano_ext_set_lcd_init' ||
            block.type === 'arduino_nano_ext_get_mpu6050_value' ||
            block.type === 'arduino_nano_ext_get_mpu_angle'
        )) {
            this.insertIntoGlobal(block.type);
        }

        // Place UserFunc after loop()
        if (block && (
            block.type === 'arduino_ext_get_ultrasonic_value' ||
            block.type === 'arduino_nano_ext_get_ultrasonic_value' ||
            block.type === 'ITPLE_get_ultrasonic_value' ||
            block.type === 'arduino_ext_get_irremote_value' ||
            block.type === 'arduino_nano_ext_get_irremote_value' ||
            (this.isFunc(block) && addFunc) // User defined function
        )) {
            this.AddUserFunc(stat);
        } else if (block && (block.type === 'arduino_ext_set_lcd_init')) {
        } else if (block && (block.type === 'arduino_nano_ext_set_lcd_init')) {
            // Just pass adding the code
        } else {
            // In the setup();
            const stats = stat.split('\n');
            if (!this._isInRepeat) { // If the block is Not in the repeat, locate it in the setup();
                let idx = this._source.indexOf('}\n'); // At the end of the setup()
                stats.forEach(s => {
                    const trimmed = s.trim();
                    if (trimmed) {
                        this._source.splice(idx++, 0, trimmed);
                        this._curLine++;
                    }
                });

            } else { // In the loop()
                stats.forEach(s => {
                    const trimmed = s.trim();
                    if (trimmed) {
                        this._source.splice(this._curLine++, 0, trimmed);
                    }
                });
            }
        }

        // this._pinNum3 = -1;
        // this._pinNum4 = -1;
    }

    insertIntoGlobal(blockType) {
        let stat = '';
        if (blockType === 'arduino_ext_set_servo' || blockType === 'ITPLE_set_servo' || blockType === 'arduino_nano_ext_set_servo') {
            stat = '#include <Servo.h>\nServo myServo;\n';
        } else if (blockType === 'arduino_ext_set_stepper' || blockType === 'arduino_nano_ext_set_stepper') {
            stat = `#include <Stepper.h>\nStepper myStepper(2048, ${this._pinNum}, ${this._pinNum2}, ${this._pinNum3}, ${this._pinNum4});\n`;
        } else if (blockType === 'arduino_ext_get_ultrasonic_value' ||
            blockType === 'arduino_nano_ext_get_ultrasonic_value' ||
            blockType === 'ITPLE_get_ultrasonic_value') {
            stat = `int trig = ${this._pinNum};\nint echo = ${this._pinNum2};\n`;
        } else if (blockType === 'arduino_ext_set_temp_humi_init' || blockType === 'arduino_nano_ext_set_temp_humi_init') {
            stat = `#include <DHT.h>\nDHT dht(${this._pinNum}, DHT11);\n`;
        } else if (blockType === 'arduino_ext_set_irremote_init' || blockType === 'arduino_nano_ext_set_irremote_init') {
            stat = `#include <IRremote.h>\nIRrecv irrecv(${this._pinNum});\ndecode_results results;\n`;
        } else if (blockType === 'arduino_ext_set_lcd_init' || blockType === 'arduino_nano_ext_set_lcd_init') {
            // Don't chagne the tab space of the codes below!!
            stat =
                `#include <LCDI2C_Multilingual.h>
#include <Wire.h>\n
LCDI2C_RussianLatin *lcdObj = NULL;\n
byte findI2CAddress() {
    Wire.begin();
    byte error, address = 0, foundAddress;
    
    for (address = 1; address < 127; address++ ) {
        Wire.beginTransmission(address);
        error = Wire.endTransmission();
    
        if (error == 0) {
          foundAddress =  address;
        } 
    }
    return foundAddress;
}\n`;
        } else if (blockType === 'arduino_nano_ext_get_mpu6050_value' || blockType === 'arduino_nano_ext_get_mpu_angle') {
            stat = `#include <Wire.h>\n#define MPU_ADDR 0x68\nfloat mpuYaw = 0;\nunsigned long lastMpuTime = 0;\n`;
        } else { // variable
            stat = Entry.TextCodingUtil.generateVariablesDeclarationForAr();
        }

        if (stat) {
            if (!this._source.find(val => { // Don't allow duplicated additon
                return val.includes(stat);
            })) {
                this._source.splice(1, 0, stat);
                this._curLine++;
            }
        } else {
            this.throwErr('error', 'UnsupportedDefaultVal');
        }
    }

    insertIntoSetup() {
        let pinStat = '';
        switch (this._funcName) {
            case 'digitalRead': pinStat = `pinMode(${this._pinNum}, INPUT);`; break;
            case 'analogWrite':
            case 'digitalWrite':
            case 'tone':
                pinStat = `pinMode(${this._pinNum}, OUTPUT);`; break;
            case 'myServo.write': pinStat = `myServo.attach(${this._pinNum}, 500, 2500);`; break;
            case 'myStepper.step':
                if (this._pramVal && this._pramVal.length > 4) {
                    pinStat = `myStepper.setSpeed(${this._pramVal[4]});`;
                }
                break;
            case 'distance': pinStat = `pinMode(${this._pinNum}, OUTPUT);\n\tpinMode(${this._pinNum2}, INPUT);`; break;
            case 'lcdObj->init':
                pinStat = "lcdObj = new LCDI2C_RussianLatin(findI2CAddress(), 16, 2);\n    lcdObj->init();\n    lcdObj->backlight();\n    lcdObj->clear();";
                break;
            case 'getMPUValue':
                pinStat = "Wire.begin();\n    Wire.beginTransmission(MPU_ADDR);\n    Wire.write(0x6B);\n    Wire.write(0);\n    if (Wire.endTransmission(true) == 0) {\n        Wire.beginTransmission(MPU_ADDR);\n        Wire.write(0x1A);\n        Wire.write(0x03);\n        Wire.endTransmission(true);\n    }";
                break;
        }

        if (!pinStat) {
            return;
        }

        if (!this._source.find(val => { // Don't allow duplicated addition
            return val.includes(pinStat);
        })) {
            let idx = this._source.indexOf('void setup() {');
            this._source.splice(++idx, 0, pinStat); // At nextline of the start of the setup()
            this._curLine++;
        }
    }

    AddUserFunc(stat) {
        if (!this._source.find(val => { // Don't allow duplicated additon
            return val.includes(stat);
        })) {
            let idx = this._source.lastIndexOf('}\n'); // At the end of the loop()
            this._source.splice(++idx, 0, stat);
            this._source.splice(++idx, 0, ''); // Add a blank line
        }
    }

    indent() {
        let tabCnt = 1;

        return this._source.map((val, idx, arr) => {
            const trimmed = val.trim();
            const prevVal = idx > 0 ? arr[idx - 1] : '';

            if (
                val.includes('//') ||
                val.includes('#include') ||
                (!val.includes('for') && !val.includes('print') && (val.includes('int') || val.includes('float') || val.includes('double') || val.includes('long'))) ||
                val.includes('setup()') ||
                val.includes('loop()') ||
                val.includes('int distance()') || // ultrasonic
                val.includes('int translateIR()') || // irremote
                val.includes('void') ||
                val === '}\n' // The end of the default func
            ) {
                if (val.includes('void') || val.includes('setup()') || val.includes('loop()') || val === '}\n') {
                    tabCnt = 1;
                }
                return val;
            }

            // If the overlapped, add one more indentation
            if (
                !(val === '}' || val.includes('else')) &&
                (prevVal.includes('if') || prevVal.includes('else') || prevVal.includes('for') || prevVal.includes('while')) &&
                !prevVal.trim().endsWith('{')
            ) {
                tabCnt++;
            } else if (
                (val === '}' || val.includes('else')) &&
                !(prevVal.includes('if') || prevVal.includes('else') || prevVal.includes('for') || prevVal.includes('while'))
            ) {
                tabCnt--;
            }

            let result = '';
            for (let i = 0; i < tabCnt; i++) {
                result += '\t';
            }
            result += val;

            if (trimmed.endsWith('{')) {
                tabCnt++;
            }

            return result;
        });
    }

    Block(block) {
        if (!block || !(block instanceof Entry.Block) ||
            block.data.type === 'when_run_button_click' // Skip start block
        ) {
            return '';
        }

        this._funcName = '';
        this._pinNum = -1;
        this._pinNum2 = -1;
        this._pinNum3 = -1;
        this._pinNum4 = -1;
        this._pramVal = [];

        // One more check in low level
        if (Entry.TextCodingUtil.hasUnSupportedBlkInAr(block)) {
            if (this._hasRootFunc) { // Unsupported block in the user defined func
                this.throwErr('error', 'UnsupportedBlkInFunc', block);
            } else {
                this.throwErr('error', 'UnsupportedBlk', block);
            }
        }

        !block._schema && block.loadSchema();

        // User defined function
        if (this.isFunc(block)) {
            if (!this.funcDefMap[block.data.type]) {
                this._rootFuncId = block.data.type;
                const wasRoot = this._hasRootFunc;
                const def = this.makeFuncDef(block, wasRoot);
                this.funcDefMap[block.data.type] = def;
                if (!wasRoot) {
                    this.AddUserFunc(def);
                }
                this._hasRootFunc = false;
            }
            if (this.isRegisteredFunc(block)) {
                this.funcSyntax = this.makeFuncSyntax(block);
            }
        }

        // Currently Not supported if the func has a argument
        if (this.funcSyntax.includes('%')) {
            this.throwErr('error', 'UnsupportedBlk', block);
        }

        const val = this.getValueFromParam(block);
        val.length && (this._pramVal = val);

        if (this.isRegisteredFunc(block)) {
            let syntax = this.makeFuncSyntax(block);
            this._pramVal.forEach((v, i) => {
                const quotedV = this._wrapQuote(v);
                syntax = syntax.replace(`%${i + 1}`, quotedV);
            });
            return syntax;
        }

        if (
            block.type === 'number' ||
            block.type === 'text' ||
            block.type === 'get_variable' ||
            block.type === 'arduino_text' || // Value for analogWrite
            block.type === 'arduino_get_port_number' || // Digital port
            block.type === 'arduino_get_pwm_port_number' || // PWM port
            block.type === 'arduino_get_sensor_number' || // Port for analogRead
            block.type === 'arduino_get_digital_toggle' ||
            block.type === 'arduino_ext_analog_list' ||
            block.type === 'arduino_nano_ext_analog_list' ||
            block.type === 'ITPLE_analog_list' ||
            block.type === 'arduino_ext_octave_list' ||
            block.type === 'arduino_nano_ext_octave_list' ||
            block.type === 'arduino_ext_tone_list' ||
            block.type === 'arduino_nano_ext_tone_list' ||
            block.type === 'arduino_ext_lcd_row_list' ||
            block.type === 'arduino_nano_ext_lcd_row_list' ||
            block.type === 'arduino_ext_lcd_column_list' ||
            block.type === 'arduino_nano_ext_lcd_column_list'
        ) {
            // Even usage of variable in the block without setting initial value(set_variable)
            // Declare the variable at global area, But in case of normal, just return with param value
            if (block.type === 'get_variable') {
                this.insertIntoGlobal(block.type);
            }
            return val[0];

        } else if (
            block.type === '_if' ||
            block.type === 'if_else'
        ) {
            return `if (${val.pop()}) {`;
        } else {
            return this.createSource(block);
        }

    };

    getValueFromParam(block) {
        let rtn = [];

        if (block._schema.class === 'variable' || block._schema.class === 'local_variable') {
            const menuName = block._schema.class === 'variable' ? 'variables' : 'func_variables';
            const paramId = block.data.params[0];
            let name = Entry.TextCodingUtil.dropdownDynamicIdToNameConvertor(paramId, menuName);

            if (!name) {
                if (block._schema.class === 'variable') {
                    this.throwErr('error', Lang.TextCoding.message_conv_no_variable, block);
                } else {
                    name = 'result';
                }
            }
            rtn.push('__' + name.replace(/self\./g, ''));
        }

        block.data.params.forEach((param, index) => {
            if (param instanceof Entry.Block) {
                rtn.push(this.Block(param));
            } else if (param !== undefined && param !== null && block._schema.class !== 'variable' && block._schema.class !== 'local_variable') {
                rtn.push(param);
            }
        });
        return rtn;
    }

    createSource(block) {
        let value = 0, value2 = 0, value3 = 0, on_off = '';
        let stat = '', operator = '';

        if (block.type.indexOf('stringParam') > -1 || block.type.indexOf('booleanParam') > -1) {
            return this._funcParamMap.get(block.data.type) || block.data.type;
        }

        switch (block.type) {
            case 'repeat_inf':
                if (
                    block.thread.parent.type === 'repeat_basic' ||
                    block.thread.parent.type === '_if' ||
                    block.thread.parent.type === 'if_else'
                ) {
                    stat = block._schema.syntax.ar[0].syntax;
                } else {
                    this._isInRepeat = true;
                }
                break;

            case 'repeat_basic':
                value = this._writeInt(this._pramVal[0]);
                this.isNumberOver1(value, block);

                stat = `for (int ${this._iterVar} = 0; ${this._iterVar} < ${value}; ${this._iterVar}++) {`;
                break;

            case 'stop_repeat':
                stat = 'break;'
                break;

            case 'wait_second':
                value = this._num(this._pramVal[0]);
                this.errChkTime(value, block);

                stat = `delay(${value * 1000});`;
                break;

            case 'boolean_basic_operator':
                value = this._wrapQuote(this._pramVal[0]);
                value2 = this._wrapQuote(this._pramVal[2]);

                switch (this._pramVal[1]) {
                    case 'EQUAL':
                        operator = ' == ';
                        break;
                    case 'NOT_EQUAL':
                        operator = ' != ';
                        break;
                    case 'GREATER':
                        operator = ' > ';
                        break;
                    case 'LESS':
                        operator = ' < ';
                        break;
                    case 'GREATER_OR_EQUAL':
                        operator = ' >= ';
                        break;
                    case 'LESS_OR_EQUAL':
                        operator = ' <= ';
                        break;
                }

                const isStrLiteral = (v) => typeof v === 'string' && (v.startsWith('"') || v.startsWith("'"));
                const isVarOrParam = (v) => typeof v === 'string' && (v.startsWith('__') || /^param\d+$/.test(v));
                const isHardwareExpr = (v) => typeof v === 'string' && (v.includes('(') && !v.startsWith('String('));

                const isNumeric1 = Entry.Utils.isNumber(value) || isHardwareExpr(value);
                const isNumeric2 = Entry.Utils.isNumber(value2) || isHardwareExpr(value2);

                if (isNumeric1 && isNumeric2) {
                    // Both are numeric (literals or hardware calls), safe for direct comparison
                    stat = value + operator + value2;
                } else if (!isNumeric1 && !isNumeric2) {
                    // Both are likely strings
                    stat = value + operator + value2;
                } else {
                    // Mixed case: one side is numeric, the other is a variable/param.
                    const processMixed = (v) => {
                        if (Entry.Utils.isNumber(v)) return `"${v}"`;
                        if (isHardwareExpr(v)) return `String(${v})`;
                        return v;
                    };
                    const v1 = (isNumeric1 && !isVarOrParam(value)) ? processMixed(value) : value;
                    const v2 = (isNumeric2 && !isVarOrParam(value2)) ? processMixed(value2) : value2;
                    stat = v1 + operator + v2;
                }
                break;

            case 'boolean_not':
                stat = '!(' + this._pramVal[0] + ')';
                break;

            case 'boolean_and_or':
                switch (this._pramVal[1]) {
                    case 'AND':
                        operator = ' && ';
                        break;
                    case 'OR':
                        operator = ' || ';
                        break;
                }
                stat = this._pramVal[0] + operator + this._pramVal[2];
                break;

            case 'quotient_and_mod':
                value = this._wrapQuote(this._pramVal[0]);
                value2 = this._wrapQuote(this._pramVal[1]);

                switch (this._pramVal[2]) {
                    case 'QUOTIENT':
                        operator = ' / ';
                        break;
                    case 'MOD':
                        operator = ' % ';
                        break;
                }

                stat = value + operator + value2;
                break;

            case 'combine_something':
                value = this._pramVal[0].toString();
                if (value.includes('__') || value.includes('(')) { // If variable, wrap it by String()
                    value = 'String(' + value + ')';
                } else { // Wrap first string by String() to meet C++ syntax
                    value = 'String("' + value + '")';
                }
                value2 = this._pramVal[1].toString();
                if (value2.includes('__') || value2.includes('(')) { // If variable, wrap it by String()
                    value2 = 'String(' + value2 + ')';
                } else {
                    value2 = '"' + value2 + '"';
                }
                stat = '(' + value + ' + ' + value2 + ')';
                break;

            case 'calc_basic':
                value = this._wrapQuote(this._pramVal[0]);
                value2 = this._wrapQuote(this._pramVal[2]);

                switch (this._pramVal[1]) {
                    case 'PLUS':
                        operator = ' + ';
                        break;
                    case 'MINUS':
                        operator = ' - ';
                        break;
                    case 'MULTI':
                        operator = ' * ';
                        break;
                    case 'DIVIDE':
                        operator = ' / ';
                        break;
                }

                stat = '(' + value + operator + value2 + ')';
                break;
            case 'calc_rand':
                value = this._wrapQuote(this._pramVal[0]);
                value2 = this._wrapQuote(this._pramVal[1]);

                // The 2nd parameter of random func doesn't include as max value itself
                if (Entry.Utils.isNumber(value2)) {
                    value2 = (Number(value2) + 1).toString();
                } else {
                    value2 = `(${value2} + 1)`;
                }
                stat = `random(${value}, ${value2})`;
                break;
            case 'arduino_toggle_led': // digitalWrite
            case 'arduino_ext_toggle_led':
            case 'arduino_nano_ext_toggle_led':
            case 'arduino_nano_ext_set_led':
            case 'arduino_nano_ext_set_output':
            case 'ITPLE_toggle_led':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);

                on_off = this._pramVal[1] === 'on' ? 'HIGH' : 'LOW';
                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', on_off);
                break;

            case 'ITPLE_set_motor_direction':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);

                on_off = this._pramVal[1] === '0' ? 'LOW' : 'HIGH';
                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', on_off);
                break;

            case 'arduino_nano_ext_set_led_pwm':
                stat = block._schema.syntax.ar[0].syntax;
                value = this._pramVal[0];
                stat = stat.replace('%1', value);
                break;

            case 'arduino_nano_ext_set_motor':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = 'setMotor';
                value = this._pramVal[0]; // motor
                value2 = this._pramVal[1]; // dir
                value3 = this._pramVal[2]; // speed
                stat = stat.replace('%1', value);
                stat = stat.replace('%2', value2);
                stat = stat.replace('%3', value3);

                this.AddUserFunc(
                    `void setMotor(int motor, String dir, int speed) {
    int p1, p2;
    if (motor == 0) {
        setMotor(1, dir, speed);
        setMotor(2, dir, speed);
        return;
    }
    if (motor == 1) {
        p1 = 5; p2 = 9;
    } else {
        p1 = 6; p2 = 10;
    }
    pinMode(p1, OUTPUT);
    pinMode(p2, OUTPUT);
    if (dir == "fw") {
        analogWrite(p1, speed);
        analogWrite(p2, 0);
    } else {
        analogWrite(p1, 0);
        analogWrite(p2, speed);
    }
}`
                    , block);
                break;

            case 'arduino_nano_ext_stop_motor':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = 'stopMotor';
                value = this._pramVal[0];
                stat = stat.replace('%1', value);

                this.AddUserFunc(
                    `void stopMotor(int motor) {
    if (motor == 0) {
        stopMotor(1);
        stopMotor(2);
        return;
    }
    int p1 = (motor == 1) ? 5 : 6;
    int p2 = (motor == 1) ? 9 : 10;
    analogWrite(p1, 0);
    analogWrite(p2, 0);
}`
                    , block);
                break;

            case 'arduino_toggle_pwm': // pwm(anlogWrite)
            case 'arduino_ext_digital_pwm':
            case 'arduino_nano_ext_digital_pwm':
            case 'ITPLE_digital_pwm':
            case 'ITPLE_set_motor_speed_old':
            case 'ITPLE_set_motor_speed_new':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                value = this._pramVal[1];
                if (Entry.Utils.isNumber(value)) {
                    if (value < 0) { // min is 0
                        this.throwErr('error', 'MinusInputVal', block);
                    } else if (value > 255) { // max is 255
                        this.throwErr('warn', 'ExcessiveInputVal', block);
                        value = 255;
                    }
                }

                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', value);
                break;

            case 'arduino_get_digital_value': // digitalRead
            case 'arduino_ext_get_digital':
            case 'arduino_nano_ext_get_digital':
            case 'ITPLE_get_digital':
            case 'ITPLE_get_digital_value':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);

                stat = stat.replace('%1', this._pinNum);
                break;

            case 'arduino_nano_ext_get_joystick_button':
                stat = block._schema.syntax.ar[0].syntax;
                break;

            case 'arduino_get_number_sensor_value': // analogRead
            case 'arduino_ext_get_analog_value':
            case 'arduino_nano_ext_get_sensor_value':
            case 'arduino_nano_ext_get_infrared_value':
            case 'arduino_nano_ext_get_joystick_value':
            case 'arduino_nano_ext_get_potentiometer':
            case 'ITPLE_get_analog_value':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = this.extractNum(this._pramVal[0]); // A1 -> 1
                if ((this._pinNum < 0)) { // min is 0
                    this.throwErr('error', 'MinusInputVal', block);
                }

                stat = stat.replace('%1', this._pinNum);
                break;

            case 'arduino_nano_ext_is_sensor_value_compare':
                stat = block._schema.syntax.ar[0].syntax;
                stat = stat.replace('%1', this._pramVal[0]);
                stat = stat.replace('%2', this._pramVal[1]);
                stat = stat.replace('%3', this._pramVal[2]);
                break;

            case 'arduino_convert_scale': // map
            case 'arduino_ext_get_analog_value_map':
            case 'arduino_nano_ext_get_analog_value_map':
            case 'ITPLE_value_mapping':
                stat = block._schema.syntax.ar[0].syntax;
                if (Entry.Utils.isNumber(this._pramVal[0])) {
                    this.throwErr('error', 'WrongInputVal', block);
                }
                if ((this._pramVal[1] < 0) || (this._pramVal[3] < 0)) { // min is 0
                    this.throwErr('error', 'MinusInputVal', block);
                }

                stat = stat.replace('%1', this._pramVal[0]);
                stat = stat.replace('%2', this._pramVal[1]);
                stat = stat.replace('%3', this._pramVal[2]);
                stat = stat.replace('%4', this._pramVal[3]);
                stat = stat.replace('%5', this._pramVal[4]);
                break;

            case 'arduino_ext_set_tone': // tone
            case 'arduino_nano_ext_set_tone': // tone
            case 'arduino_nano_ext_set_buzzer': // tone
            case 'ITPLE_set_tone':
                const octave_tone_hz = [
                    [0, 32.7, 34.6, 36.7, 38.9, 41.2, 43.7, 46.2, 49.0, 51.9, 55.0, 58.3, 61.7], // 1octave
                    [0, 65.4, 69.3, 73.4, 77.8, 82.4, 87.3, 92.5, 98.0, 103.8, 110.0, 116.5, 123.5],
                    [0, 130.8, 138.6, 146.9, 155.6, 164.8, 174.6, 185.0, 196.0, 207.7, 220.0, 233.1, 246.9],
                    [0, 261.6, 277.2, 293.7, 311.1, 329.6, 349.2, 370.0, 392.0, 415.3, 440.0, 466.2, 493.9],
                    [0, 523.3, 554.4, 587.3, 622.3, 659.3, 698.5, 740.0, 784.0, 830.6, 880.0, 932.3, 987.8],
                    [0, 1046.5, 1108.7, 1174.7, 1244.5, 1318.5, 1396.9, 1480.0, 1568.0, 1661.2, 1760.0, 1864.7, 1975.5],
                ];
                const charToIdx = {
                    '0': 0, C: 1, CS: 2, D: 3, DS: 4, E: 5, F: 6, FS: 7, G: 8, GS: 9, A: 10, AS: 11, B: 12
                }
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];

                if (block.type === 'arduino_nano_ext_set_buzzer') {
                    this._pinNum = 7;
                    value2 = this._pramVal[1]; // NOTE
                    value = this._num(this._pramVal[0]); // OCTAVE
                    value3 = this._num(this._pramVal[2]); // DURATION
                } else {
                    this._pinNum = this._num(this._pramVal[0]); // Arr to Number
                    value2 = this._pramVal[1]; // tone
                    value = this._num(this._pramVal[2]); // octave
                    value3 = this._num(this._pramVal[3]); // timer
                }

                this.errChkPinNum(this._pinNum, block);
                if (typeof value2 != 'string') { // Tone should be string
                    this.throwErr('error', 'WrongInputVal', block);
                }
                this.isNumberOver1(value, block);
                if (value > 6) { // max is 6
                    this.throwErr('warn', 'ExcessiveInputVal', block);
                    value = 6;
                }
                this.errChkTime(value3, block);

                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', octave_tone_hz[value - 1][charToIdx[value2]]);
                stat = stat.replace('%3', value3 * 1000);
                if (value2 == '0') {
                    stat = `noTone(${this._pinNum});`;
                }
                stat = stat + ` delay(${value3} * 1000);`;
                break;

            case 'arduino_ext_get_ultrasonic_value':
            case 'arduino_nano_ext_get_ultrasonic_value':
            case 'ITPLE_get_ultrasonic_value':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = this._num(this._pramVal[0]); // trig
                this.errChkPinNum(this._pinNum, block);
                this._pinNum2 = this._num(this._pramVal[1]); // echo
                this.errChkPinNum(this._pinNum2, block);

                // Don't fix the tab spaces in the distance func below
                this.insertIntoSrc(
                    `int distance() {
    digitalWrite(${this._pinNum}, LOW);
    delayMicroseconds(2);

    digitalWrite(${this._pinNum}, HIGH);
    delayMicroseconds(10);
    digitalWrite(${this._pinNum}, LOW);
    long duration = pulseIn(${this._pinNum2}, HIGH);

    int distance = (duration/2) * 0.034;
    return distance;
}`
                    , block);
                break;

            case 'arduino_nano_ext_get_ultrasonic_one_pin':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = 'getDistance';
                this._pinNum = this._num(this._pramVal[0]);
                this.errChkPinNum(this._pinNum, block);
                stat = stat.replace('%1', this._pinNum);

                this.AddUserFunc(
                    `int getDistance(int pin) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
    delayMicroseconds(2);
    digitalWrite(pin, HIGH);
    delayMicroseconds(10);
    digitalWrite(pin, LOW);
    pinMode(pin, INPUT);

    long duration = pulseIn(pin, HIGH);
    if (duration == 0 || duration > 30000) return 0;
    
    return duration / 58;
}`
                    , block);
                break;

            case 'arduino_nano_ext_get_sound_sensor':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = 'getSoundLevel';
                value = this._pramVal[0]; // port (0, 1, 2)
                // A0-A7 are usually defined as 14-21, but analogRead(0) works.
                // However, to be safe and consistent with IN1, IN2, IN3 labeling:
                stat = stat.replace('%1', value);

                this.AddUserFunc(
                    `int getSoundLevel(int pin) {
    unsigned long startMillis = millis();
    unsigned int signalMax = 0;
    unsigned int signalMin = 1024;

    while (millis() - startMillis < 50) {
        int sample = analogRead(pin);
        if (sample < 1024) {
            if (sample > signalMax) signalMax = sample;
            else if (sample < signalMin) signalMin = sample;
        }
    }
    
    return signalMax - signalMin;
}`
                    , block);
                break;

            case 'arduino_ext_set_servo':
            case 'ITPLE_set_servo':
            case 'arduino_nano_ext_set_servo':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = this._num(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                value = this._num(this._pramVal[1]);
                stat = stat.replace('%1', value);
                break;

            case 'arduino_ext_set_stepper':
            case 'arduino_nano_ext_set_stepper':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = this._num(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                this._pinNum2 = this._num(this._pramVal[1]); // Arr to Number
                this.errChkPinNum(this._pinNum2, block);
                this._pinNum3 = this._num(this._pramVal[2]); // Arr to Number
                this.errChkPinNum(this._pinNum3, block);
                this._pinNum4 = this._num(this._pramVal[3]); // Arr to Number
                this.errChkPinNum(this._pinNum4, block);
                value = this._num(this._pramVal[5]);
                stat = stat.replace('%1', value);
                break;

            case 'arduino_ext_set_temp_humi_init':
            case 'arduino_nano_ext_set_temp_humi_init':
            case 'arduino_ext_set_irremote_init':
            case 'arduino_nano_ext_set_irremote_init':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = this._num(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                value = this._num(this._pramVal[1]);
                stat = stat.replace('%1', value);
                break;

            case 'arduino_ext_get_temp_value':
            case 'arduino_nano_ext_get_temp_value':
            case 'arduino_ext_get_humi_value':
            case 'arduino_nano_ext_get_humi_value':
            case 'arduino_ext_set_lcd_init':
            case 'arduino_nano_ext_set_lcd_init':
            case 'arduino_ext_set_lcd_clear':
            case 'arduino_nano_ext_set_lcd_clear':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                break;

            case 'arduino_ext_get_irremote_value':
            case 'arduino_nano_ext_get_irremote_value':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];

                // Don't fix the tab spaces in the distance func below
                this.insertIntoSrc(
                    `int translateIR() {
    int value = -1;
    
    if (irrecv.decode(&results)) {
      switch(results.value) {
      case 0xFF6897:  
        value = 0;
        break;
      case 0xFF30CF:  
        value = 1;
        break;
      case 0xFF18E7:  
        value = 2;
        break;
      case 0xFF7A85:  
        value = 3;
        break;
      case 0xFF10EF:  
        value = 4;
        break;
      case 0xFF38C7:  
        value = 5;
        break;
      case 0xFF5AA5:  
        value = 6;
        break;
      case 0xFF42BD:  
        value = 7;
        break;
      case 0xFF4AB5:  
        value = 8;
        break;
      case 0xFF52AD:  
        value = 9;
        break;
      }
    }
  
    irrecv.resume();
    return value;
}`
                    , block);
                break;

            case 'arduino_ext_set_lcd_print':
            case 'arduino_nano_ext_set_lcd_print':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                value = this._num(this._pramVal[0]);
                if (Entry.Utils.isNumber(value)) {
                    if (value < 0) { // min is 0
                        this.throwErr('error', 'MinusInputVal', block);
                    } else if (value > 1) { // max is 1
                        this.throwErr('warn', 'ExcessiveInputVal', block);
                        value = 1;
                    }
                }
                value2 = this._num(this._pramVal[1]);
                if (Entry.Utils.isNumber(value2)) {
                    if (value2 < 0) { // min is 0
                        this.throwErr('error', 'MinusInputVal', block);
                    } else if (value2 > 15) { // max is 15
                        this.throwErr('warn', 'ExcessiveInputVal', block);
                        value2 = 15;
                    }
                }
                value3 = this._pramVal[2]; // text
                if (Entry.Utils.isNumber(value3)) {
                    value3 = value3.toString();
                }

                stat = stat.replace('%1', this._pramVal[0]);
                stat = stat.replace('%2', this._pramVal[1]);
                if (value3.includes('(') || value3.includes('__')) {
                    stat += `\n \tlcdObj->print(${value3});`;
                } else {
                    stat += `\n \tlcdObj->print("${value3}");`;
                }
                break;

            case 'arduino_nano_ext_get_mpu6050_value':
            // case 'arduino_nano_ext_get_mpu_temp':
            case 'arduino_nano_ext_get_mpu_angle':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = 'getMPUValue';
                if (this._pramVal[0]) stat = stat.replace('%1', this._pramVal[0]);
                if (this._pramVal[1]) stat = stat.replace('%2', this._pramVal[1]);

                this.AddUserFunc(
                    `float getMPUValue(String key) {
    Wire.beginTransmission(MPU_ADDR);
    if (Wire.endTransmission() != 0) return 0;
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(true);
    Wire.requestFrom(MPU_ADDR, 14);

    if (Wire.available() >= 14) {
        int16_t ax = Wire.read() << 8 | Wire.read();
        int16_t ay = Wire.read() << 8 | Wire.read();
        int16_t az = Wire.read() << 8 | Wire.read();
        Wire.read(); Wire.read(); // temperature (unused)
        int16_t gx = Wire.read() << 8 | Wire.read();
        int16_t gy = Wire.read() << 8 | Wire.read();
        int16_t gz = Wire.read() << 8 | Wire.read();

        if (key == "accelX") return ax;
        if (key == "accelY") return ay;
        if (key == "accelZ") return az;
        if (key == "gyroX") return gx;
        if (key == "gyroY") return gy;
        if (key == "gyroZ") return gz;
        // if (key == "temp") return (tmp / 340.0) + 36.53;

        float roll = atan2((float)ay, (float)az) * 57.29578;
        float pitch = atan2(-(float)ax, sqrt((float)ay * ay + (float)az * az)) * 57.29578;
        unsigned long now = millis();
        if (lastMpuTime > 0) {
            float dt = (now - lastMpuTime) / 1000.0;
            if (dt > 0 && dt < 0.2) mpuYaw += (gz / 131.0) * dt;
        }
        lastMpuTime = now;

        if (key == "roll") return (roll < 0 ? roll + 360 : roll);
        if (key == "pitch") return (pitch < 0 ? pitch + 360 : pitch);
        if (key == "yaw") {
            float yaw = fmod(mpuYaw, 360.0);
            return (yaw < 0 ? yaw + 360 : yaw);
        }
    }
    return 0;
}`
                );
                break;

            case 'set_variable':
            case 'set_func_variable':
                stat = block._schema.syntax.ar[0].syntax;
                stat = stat.replace('%1', this._pramVal[0]);
                value = this._wrapQuote(this._pramVal[1]);
                stat = stat.replace('%2', value);
                if (!stat.endsWith(';')) stat += ';';
                break;

            case 'get_func_variable':
                stat = this._pramVal[0];
                break;

            case 'change_variable':
                stat = block._schema.syntax.ar[0].syntax;
                stat = stat.replace('%1', this._pramVal[0]);
                stat = stat.replace('%2', this._wrapQuote(this._pramVal[1]));
                if (!stat.endsWith(';')) stat += ';';
                break;

            case 'stop_object':
                if (this._pramVal[0] === 'thisThread') {
                    if (this._isCurrentFuncValue) {
                        stat = 'return __result;';
                    } else {
                        stat = 'return;';
                    }
                }
                break;
        }

        if (block.type.includes('func_')) { // User defined function
            this.insertIntoSrc(this.funcDefMap[block.data.type], block, true);
            stat = this.funcSyntax;
        }

        this.insertIntoSetup(); // Frist, Setup the pin mode in case of Digital
        return stat;
    }

    throwErr(type, msg, block) {
        if (type === 'error') {
            const error = new Error();
            error.type = type;
            error.msg = msg;
            error.block = block;
            throw error;
        } else if (type === 'warn') {
            switch (msg) {
                case 'ExcessiveInputVal':
                    if (this._hasRootFunc) {
                        Entry.toast.success(Lang.TextCoding.title_converting, Lang.TextCoding.warn_exceed_max_value_in_func);
                    } else {
                        Entry.toast.success(Lang.TextCoding.title_converting, Lang.TextCoding.warn_exceed_max_value);
                        block && Entry.getMainWS() && Entry.getMainWS().board.activateBlock(block);
                    }
                    break;
            }
        }
    }

    extractNum(val) {
        if (typeof val === 'string') {
            if (val.includes('param')) return val;
            return Number(val.replace(/[^0-9]/g, ''));
        } else if (typeof val === 'number') {
            return val;
        } else {
            return false;
        }
    }

    errChkPinNum(value, block) {
        if (typeof value === 'string' && value.includes('param')) return;
        if (isNaN(value)) { // If not number
            this.throwErr('error', 'WrongInputVal', block);
        }
        if (value < 0) { // min is 0
            this.throwErr('error', 'MinusInputVal', block);
        }
    }

    errChkTime(value, block) {
        if (typeof value === 'string' && value.includes('param')) return;
        if (isNaN(value)) { // If not number
            this.throwErr('error', 'WrongInputVal', block);
        } else if (value <= 0) { // min is 1
            this.throwErr('error', 'MinusInputVal', block);
        }
    }

    isNumberOver1(value, block) {
        if (typeof value === 'string' && value.includes('param')) return;
        if (isNaN(value)) { // In case the value is not a number
            this.throwErr('error', 'WrongInputVal', block);
        }
        if (value <= 0) { // min is 1
            this.throwErr('error', 'MinusInputVal', block);
        }
    }

    isFunc(block) {
        if (!block || !block.data || !block.data.type) {
            return false;
        }

        const tokens = block.data.type.split('_');
        const prefix = tokens[0];

        return prefix === 'func';
    }

    /**
     * 워크스페이스에 실제로 등록되어있는 함수인지 확인한다.
     * @param block
     * @returns {boolean}
     */
    isRegisteredFunc(block) {
        const tokens = block.data.type.split('_');
        const funcId = tokens[1];
        return !!Entry.variableContainer.functions_[funcId];
    }

    /**
     * functionTemplate 에서 C++에서 표기될 함수를 만들어낸다.
     * ex) 함수 %1 %2 %3 + %3 이 Indicator 인 경우 => 함수(%1, %2)
     * @param funcBlock{Block} 함수 블록
     * @return {string} C++ 함수 호출 syntax
     */
    makeFuncSyntax(funcBlock) {
        let schemaTemplate = '';

        if (funcBlock) {
            if (funcBlock._schema) {
                if (funcBlock._schema.template) {
                    schemaTemplate = funcBlock._schema.template.trim();
                }
            } else if (this._hasRootFunc) {
                const rootFunc = Entry.block[this._rootFuncId];
                schemaTemplate = rootFunc.block.template;
            }
        }

        const templateParams = schemaTemplate.trim().match(/%\d/gim);
        templateParams.pop(); // pop() 이유는 맨 마지막 템플릿은 Indicator 로 판단할 것이기 때문이다.

        return Entry.TextCodingUtil.getFunctionNameFromTemplate(schemaTemplate)
            .trim()
            .concat(`(${templateParams.join(',')});`);
    }

    makeFuncDef(funcBlock, isExpression) {
        if (!this.isRegisteredFunc(funcBlock)) {
            return;
        }

        let result = '';
        const func = this.getFuncInfo(funcBlock);

        if (func) {
            result += func.name;
        } else {
            return;
        }

        let paramResult = '';
        if (func.params && func.params.length !== 0) {
            paramResult = func.params.join(', ').trim();
        }
        result = result
            .concat('(')
            .concat(paramResult)
            .concat(')');

        if (isExpression) {
            // 선언된 함수 사용하는 블록의 경우
            const expBlockComment = funcBlock.getCommentValue();
            if (expBlockComment || expBlockComment === '') {
                result += ` // ${expBlockComment}`;
            }
            return result;
        } else {
            // 함수 선언 중인 경우
            this._hasRootFunc = true;
            const defBlock = func.defBlock;
            const isValue = defBlock && (defBlock.type === 'function_create_value' || defBlock.type === 'function_create_boolean_value');
            this._isCurrentFuncValue = isValue;

            let returnType = 'void';
            if (isValue) {
                returnType = defBlock.type === 'function_create_boolean_value' ? 'boolean' : 'String';
            }

            result = `${returnType} ${result}`;
            result = result.concat(' {');
            if (func.comment || func.comment === '') {
                result += ` // ${func.comment}`;
            }
            result += '\n';

            let stmtResult = '';
            // Local variables declaration
            if (func.localVariables && func.localVariables.length) {
                func.localVariables.forEach(lv => {
                    stmtResult += `String __${lv.name} = "0";\n`;
                });
            }

            const that = this;
            const processBlocks = (blocks, depth) => {
                let res = '';
                if (!blocks) return res;
                const indent = Array(depth).fill('\t').join('');
                blocks.forEach((block) => {
                    if (that.isFunc(block)) {
                        res += that.makeFuncDef(block, true).concat('\n');
                    } else {
                        const bStat = that.Block(block);
                        if (bStat) {
                            const trimmed = bStat.trim();
                            res += indent + trimmed;
                            if (
                                !trimmed.endsWith(';') &&
                                !trimmed.endsWith('}') &&
                                !trimmed.endsWith('{') &&
                                !trimmed.endsWith('\n')
                            ) {
                                res += ';';
                            }
                            res += '\n';
                        }
                        if (block.statements && block.statements.length) {
                            block.statements.forEach((stmt, idx) => {
                                res += processBlocks(stmt.getBlocks(), depth + 1);
                                if (idx === block.statements.length - 2) {
                                    res += indent + '} else {\n';
                                }
                                if (idx === block.statements.length - 1) {
                                    res += indent + '}\n';
                                }
                            });
                        }
                    }
                });
                return res;
            };

            stmtResult += processBlocks(func.statements, 0);

            if (isValue) {
                const returnValue = this._wrapQuote(this.Block(defBlock.data.params[3]));
                stmtResult += `return ${returnValue};\n`;
            }

            const indentedResult = Entry.TextCodingUtil.indent(stmtResult);
            result += indentedResult.concat('\n');
            result = result.concat('}');

            this._isCurrentFuncValue = false;
            return result.trim();
        }
    }

    _num(val) {
        if (typeof val === 'string' && val.includes('param')) {
            return `(${val}.toDouble())`;
        }
        return isNaN(Number(val)) ? val : Number(val);
    }

    _writeInt(val) {
        if (typeof val === 'string' && val.includes('param')) {
            return `(${val}.toInt())`;
        }
        return isNaN(Number(val)) ? val : Number(val);
    }

    _wrapQuote(val) {
        if (typeof val !== 'string' || val === '') {
            return val;
        }

        if (
            Entry.Utils.isNumber(val) ||
            val.includes('__') ||
            val.includes('(') ||
            /^param\d+$/.test(val) ||
            /Param_/.test(val) ||
            val === 'true' ||
            val === 'false' ||
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'")) ||
            val === 'HIGH' ||
            val === 'LOW' ||
            val === 'INPUT' ||
            val === 'OUTPUT' ||
            val === 'INPUT_PULLUP'
        ) {
            return val;
        }

        return `"${val}"`;
    }

    getFuncInfo(funcBlock) {
        const result = {};
        const funcId = funcBlock.getFuncId();

        const func = funcId && Entry.variableContainer.getFunction(funcId);
        if (!func) {
            return null;
        }

        const funcName = Entry.TextCodingUtil.getFunctionNameFromTemplate(func.block.template);

        Entry.TextCodingUtil.initQueue();

        const funcContents = func.content
            .getEventMap('funcDef')[0]
            .getThread()
            .getBlocks();
        const statements = func.content
            .getEventMap('funcDef')[0]
            .getStatements()
            .getBlocks();
        statements.forEach((s) => funcContents.push(s));
        const defBlock = funcContents.shift();

        const funcComment = defBlock.getCommentValue();

        Entry.TextCodingUtil.gatherFuncDefParam(defBlock.getParam(0));

        const that = this;
        const funcParams = [];

        if (!this._hasRootFunc) {
            const funcDefParams = [];
            let param;
            while ((param = Entry.TextCodingUtil._funcParamQ.dequeue())) {
                funcDefParams.push(param);
            }

            funcDefParams.forEach((value, index) => {
                if (/(string|boolean)Param/.test(value)) {
                    index += 1;
                    const name = `param${index}`;
                    const type = value.includes('string') ? 'String' : 'boolean';
                    funcParams.push(name);
                    that._funcParamMap.put(value, name);
                    that._funcParamTypeMap.put(name, type);
                }
            });
        } else {
            funcBlock.params
                .filter((p) => p instanceof Entry.Block)
                .forEach((p) => {
                    let paramText = that.Block(p);
                    if (!paramText) {
                        return;
                    }
                    paramText = that._funcParamMap.get(paramText) || paramText;
                    funcParams.push(paramText);
                });
        }

        Entry.TextCodingUtil.clearQueue();

        if (funcName) {
            result.name = funcName;
        }
        if (funcComment || funcComment === '') {
            result.comment = funcComment;
        }
        if (funcParams.length !== 0) {
            result.params = funcParams.map(p => {
                const type = this._funcParamTypeMap.get(p) || 'String';
                return `${type} ${p}`;
            });
        }
        if (funcContents.length !== 0) {
            result.statements = funcContents;
        }
        result.defBlock = defBlock;
        result.localVariables = func.localVariables || [];

        return result;
    }
};