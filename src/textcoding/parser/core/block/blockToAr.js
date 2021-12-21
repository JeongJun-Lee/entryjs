/*
 * Convert code blocks to Arduino code for upload to HW
 */
'use strict';

Entry.BlockToArParser = class {
    constructor() {
        this._type = 'BlockToArParser';
        this.init();
    }

    init() {
        this._iterVar = 'x';
        this._source =  ['// Created by Entry\n', 'void setup() {', '}\n', 'void loop() {', '}\n'];
        this._curLine = this._source.length - 1; // the end of the source
        this._funcName = '';
        this._pinNum = -1;
        this._pinNum2 = -1;
        this._pinNum3 = -1;
        this._pinNum4 = -1;
        this._pramVal = [];
        this._isInRepeat = false;
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
    };

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
    };

    // If possilbe, find at early stage
    isUnsupportedBlkInTopLvl(blocks) {
        // Check variable error
        const err = Entry.TextCodingUtil.validateVariableAndListToPython() ||
                        Entry.TextCodingUtil.validateFunctionToPython();
        if (err) {
            this.throwErr('error', err.message);
        }

        blocks.forEach((block) => {
            if (Entry.TextCodingUtil.hasUnSupportedBlkInAr(block)) {
                this.throwErr('error', 'UnsupportedBlk', block);
            }
        });
    }

    insertIntoSrc(stat, block) {
        if (block && (
            block._schema.class === 'variable' ||
            block.type === 'arduino_ext_set_servo' ||
            block.type === 'arduino_ext_set_stepper' ||
            block.type === 'arduino_ext_get_ultrasonic_value'
        )) {
            this.insertIntoGlobal(block.type); 
        }

        this.insertIntoSetup(); // Frist, Setup the pin mode in case of Digital

        // UerFunc for Ultrasonic after loop()
        if (block && block.type === 'arduino_ext_get_ultrasonic_value') {
            this.AddUserFunc(stat);

        } else {   
            // In the setup();
            if (!this._isInRepeat) { // If the block is Not in the repeat, locate it in the setup();
                let idx = this._source.indexOf('}\n'); // At the end of the setup()
                this._source.splice(idx, 0, stat); 

            } else { // In the loop()
                this._source.splice(this._curLine, 0, stat);
            }
            this._curLine++;
        }

        // init
        this._funcName = '';
        this._pinNum = -1;
        this._pinNum2 = -1;
        this._pinNum3 = -1;
        this._pinNum4 = -1;
    }

    insertIntoGlobal(blockType) {
        let stat = '';
        if (blockType === 'arduino_ext_set_servo') {
            stat = '#include <Servo.h>\nServo myServo;\n'
        } else if (blockType === 'arduino_ext_set_stepper') {
            stat = '#include <Stepper.h>\n'
        } else if (blockType === 'arduino_ext_get_ultrasonic_value') {
            stat = `int trig = ${this._pinNum};\nint echo = ${this._pinNum2};\n`;
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
                pinStat = `pinMode(${this._pinNum}, OUTPUT);`; break;
            case 'myServo.write': pinStat = `myServo.attach(${this._pinNum});`; break;
            case 'myStepper.step': pinStat = `Stepper myStepper(2048, ${this._pinNum}, ${this._pinNum2}, ${this._pinNum3}, ${this._pinNum4});\n\tmyStepper.setSpeed(${this._pramVal[4]});`; break;
            case 'distance': pinStat = `pinMode(${this._pinNum}, OUTPUT);\n\tpinMode(${this._pinNum2}, INPUT);`; break;
        }

        if (!this._source.find(val => { // Don't allow duplicated additon
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
        }
    }

    indent() {
        let tabCnt = 1, prevVal = '';

        return this._source.map((val) => {
            if (
                val.includes('//') || 
                val.includes('#include') || 
                (!val.includes('for') && val.includes('int')) || 
                val.includes('float') || 
                val.includes('setup()') || 
                val.includes('loop()') || 
                val.includes('int distance()') ||  // ultrasonic
                val === '}\n' // The end of the default func
            ) {
                prevVal = val;
                return val;
            }

            // If the overlapped, add one more indentation
            if (!(val === '}' || val.includes('else')) &&
                (prevVal.includes('if') || prevVal.includes('else') || prevVal.includes('for') || prevVal.includes('while'))
            ) {
                tabCnt++;
            } else if ((val === '}' || val.includes('else')) && 
                !(prevVal.includes('if') || prevVal.includes('else') || prevVal.includes('for') || prevVal.includes('while'))
            ) {
                tabCnt--;
            } 

            for (let i = 0; i < tabCnt; i++) {
                val = '\t' + val;
            }

            prevVal = val;
            return val;
        });
    }

    Block(block) {
        if (!block || !(block instanceof Entry.Block) ||
            block.data.type === 'when_run_button_click' // Skip start block
        ) {
            return '';
        }

        // One more check in low level
        if (Entry.TextCodingUtil.hasUnSupportedBlkInAr(block)) {
            this.throwErr('error', 'UnsupportedBlk', block);
        }

        !block._schema && block.loadSchema();
        const val = this.getValueFromParam(block);
        val.length && (this._pramVal = val);

        if (
            block.type === 'number' ||
            block.type === 'text' ||
            block.type === 'get_variable' ||
            block.type === 'arduino_text' ||                 // Value for analogWrite
            block.type === 'arduino_get_port_number' ||      // Digital port
            block.type === 'arduino_get_pwm_port_number' ||  // PWM port
            block.type === 'arduino_get_sensor_number' ||    // Port for analogRead
            block.type === 'arduino_get_digital_toggle' ||
            block.type === 'arduino_ext_analog_list' ||
            block.type === 'arduino_ext_octave_list' ||
            block.type === 'arduino_ext_tone_list'
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
            return val.pop(); // Just return the value gotten by specific block with _if
        } else {
            return this.createSource(block);
        }
        
    };

    getValueFromParam(block) {
        let rtn = [];

        if (block._schema.class === 'variable') {
            const param = block._schema.params[0].options.filter((option => {
                return option[1] === block.data.params[0];
            }));
            if (!param.length) {
                this.throwErr('error', Lang.TextCoding.message_conv_no_variable, block);
            } else {
                rtn.push(param[0][0]);
            }
        }

        block.data.params.forEach(param => {
            if (param instanceof Entry.Block) {
                rtn.push(this.Block(param));
            } else if (param && block._schema.class !== 'variable') { // Skip if param is from 'variable'
                rtn.push(param);
            }
        });
        return rtn;
    }

    createSource(block) {
        let value = 0, value2 = 0, value3 = 0, on_off = '';
        let stat = '', operator = '';

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
                value = Number(this._pramVal); // Arr to Number
                this.isNumberOver1(value, block);

                stat = `for (int ${this._iterVar} = 0; ${this._iterVar} < ${value}; ${this._iterVar}++) {`;
                // this._iterVar = String.fromCharCode(this._iterVar.charCodeAt(0) + 1); // Move iterVar to the next
                break;

            case 'stop_repeat':
                stat = 'break;'
                break;

            case 'wait_second':
                value = Number(this._pramVal); // String to Number
                this.errChkTime(value, block);

                stat = `delay(${value*1000});`;
                break;
                
            case 'boolean_basic_operator':
                value = Number(this._pramVal[0]); // String to Number
                if (isNaN(value)) { // In case the value is not a number
                    value = this._pramVal[0];
                }
                value2 = Number(this._pramVal[2]); // String to Number
                if (isNaN(value2)) { // In case the value is not a number
                    value2 = this._pramVal[2];
                }

                switch (this._pramVal[1]) {
                    case 'EQUAL':
                        operator = ' == ';
                        break;
                    case 'NOT_EQUAL':
                        operator =  ' != ';
                        break;
                    case 'GREATER':
                        operator =  ' > ';
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

                stat = value + operator + value2;
                stat = `if (${stat}) {`;
                break;

            case 'arduino_toggle_led': // digitalWrite
            case 'arduino_ext_toggle_led':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);

                on_off = this._pramVal[1] === 'on' ? 'HIGH' : 'LOW';
                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', on_off);
                break;

            case 'arduino_toggle_pwm': // pwm(anlogWrite)
            case 'arduino_ext_digital_pwm':
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
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                
                stat = `if (${stat}) {`;
                stat = stat.replace('%1', this._pinNum);
                break;

            case 'arduino_get_number_sensor_value': // analogRead
            case 'arduino_ext_get_analog_value':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = this.extractNum(this._pramVal[0]); // A1 -> 1
                if ((this._pinNum < 0)) { // min is 0
                    this.throwErr('error', 'MinusInputVal', block);
                }

                stat = stat.replace('%1', this._pinNum);
                break;

            case 'arduino_convert_scale': // map
            case 'arduino_ext_get_analog_value_map':
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

            case 'arduino_ext_set_tone': //tone
                const octave_tone_hz = [
                    [0, 32.7, 34.6, 36.7, 38.9, 41.2, 43.7, 46.2, 49.0, 51.9, 55.0, 58.3, 61.7], // 1octave
                    [0, 65.4, 69.3, 73.4, 77.8, 82.4, 87.3, 92.5, 98.0, 103.8, 110.0, 116.5, 123.5],
                    [0, 130.8, 138.6, 146.9, 155.6, 164.8, 174.6, 185.0, 196.0, 207.7, 220.0, 233.1, 246.9],
                    [0, 261.6, 277.2, 293.7, 311.1, 329.6, 349.2, 370.0, 392.0, 415.3, 440.0, 466.2, 493.9],
                    [0, 523.3, 554.4, 587.3, 622.3, 659.3, 698.5, 740.0, 784.0, 830.6, 880.0, 932.3, 987.8],
                    [0, 1046.5, 1108.7, 1174.7, 1244.5, 1318.5, 1396.9, 1480.0, 1568.0, 1661.2, 1760.0, 1864.7, 1975.5],
                ];
                const charToIdx = {
                    '0': 0, C: 1, CS: 2, D: 3, DS: 4, E: 5, F: 6, FS: 7, G:8, GS: 9, A: 10, AS: 11, B: 12
                }
                stat = block._schema.syntax.ar[0].syntax; 
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                value2 = this._pramVal[1]; // tone
                if (Entry.Utils.isNumber(value2)) { // Tone should be string
                    this.throwErr('error', 'WrongInputVal', block);
                }
                value = this._pramVal[2]; // octave
                this.isNumberOver1(value, block);
                if (value > 6) { // max is 6
                    this.throwErr('warn', 'ExcessiveInputVal', block);
                    value = 6;
                }
                value3 = this._pramVal[3]; // timer
                this.errChkTime(value, block);

                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', octave_tone_hz[value-1][charToIdx[value2]]);
                stat = stat + ` delay(${value3 * 1000});`
                break;

            case 'arduino_ext_get_ultrasonic_value':
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // trig
                this.errChkPinNum(this._pinNum, block);
                this._pinNum2 = Number(this._pramVal[1]); // echo
                this.errChkPinNum(this._pinNum2, block);
                
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

            case 'arduino_ext_set_servo':
                stat = block._schema.syntax.ar[0].syntax; 
                this._funcName = 'myServo.write';
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                value = this._pramVal[1]; 
                stat = stat.replace('%1', value);
                break;

            case 'arduino_ext_set_stepper':
                stat = block._schema.syntax.ar[0].syntax; 
                this._funcName = 'myStepper.step';
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                this._pinNum2 = Number(this._pramVal[1]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                this._pinNum3 = Number(this._pramVal[2]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                this._pinNum4 = Number(this._pramVal[3]); // Arr to Number
                this.errChkPinNum(this._pinNum, block);
                value = this._pramVal[5]; 
                stat = stat.replace('%1', value);
                break;

            case 'set_variable':
                stat = block._schema.syntax.ar[0].syntax;
                stat = stat.replace('%1', this._pramVal[0]);
                stat = stat.replace('%2', this._pramVal[1]); 
                break;

            case 'change_variable':
                stat = block._schema.syntax.ar[0].syntax;
                stat = stat.replace('%1', this._pramVal[0]);
                stat = stat.replace('%2', this._pramVal[1]); 
                break;
        }

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
                    Entry.toast.success(Lang.TextCoding.title_converting, Lang.TextCoding.warn_exceed_max_value);
                    break;
            }
            block && Entry.getMainWS() && Entry.getMainWS().board.activateBlock(block);
        }
    }

    extractNum(val) {
        if (typeof val === 'string') {
            return Number(val.replace(/[^0-9]/g, ''));
        } else if (typeof val === 'number') {
            return val;
        } else {
            return false;
        }
    }

    errChkPinNum(pinNum, block) {
        if (isNaN(pinNum)) { // In case the value is not a number
            this.throwErr('error', 'WrongInputVal', block);
        }
        if (pinNum < 0) { // min is 0
            this.throwErr('error', 'MinusInputVal', block);
        }
    }

    errChkTime(value, block) {
        if (isNaN(value)) { // If not number
            this.throwErr('error', 'WrongInputVal', block);
        } else if (value <= 0) { // min is 1
            this.throwErr('error', 'MinusInputVal', block);
        }
    }

    isNumberOver1(value, block) {
        if (isNaN(value)) { // In case the value is not a number
            this.throwErr('error', 'WrongInputVal', block);
        }
        if (value <= 0) { // min is 1
            this.throwErr('error', 'MinusInputVal', block);
        }
    }
};