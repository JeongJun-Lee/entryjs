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
        this._iterVar = 'i';
        this._source =  ['setup() {', '}\n', 'loop() {', '}'];
        this._curLine = this._source.length - 1; // the end of the source
        this._funcName = '';
        this._pinNum = -1;
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
                        this.insertIntoSrc(stat);
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
                        if (block.statements[idx].parent.type !== 'repeat_inf' && idx === block.statements.length - 1) {
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
        blocks.forEach((block) => {
            if (Entry.TextCodingUtil.hasUnSupportedBlkInAr(block)) {
                this.throwErr('error', 'UnsupportedBlk', block);
            }
        });
    }

    insertIntoSrc(stat) {        
        // Frist, Setup pin mode in case of Digital
        this.insertIntoSetup();

        // If the block is Not in the repeat, locate it in the setup();
        if (!this._isInRepeat) {
            let idx = this._source.indexOf('}\n'); // At the end of the setup()
            this._source.splice(idx, 0, stat); 
        } else { // In the loop()
            this._source.splice(this._curLine, 0, stat);
        }
        this._curLine++;

        // init
        this._funcName = '';
        this._pinNum = -1;
    }

    insertIntoSetup() {
        let pinStat = '';
        if (this._funcName === 'digitalRead') { 
            pinStat = `pinMode(${this._pinNum}, INPUT);`; 
        } else if (this._funcName === 'digitalWrite') { 
            pinStat = `pinMode(${this._pinNum}, OUTPUT);`;   
        }

        if (!this._source.find(val => { // Don't allow duplicated additon
            return val.includes(pinStat);
        })) {
            let idx = this._source.indexOf('setup() {'); // At the start of the setup()
            this._source.splice(++idx, 0, pinStat);
            this._curLine++;
        }
    }

    indent() {
        let tabCnt = 0;

        return this._source.map((val, idx) => {
            if (val.includes('{') && (val.includes('if') || val.includes('for') || val.includes('while'))) {
                tabCnt++;
            } 

            for (let i = 0; i < tabCnt; i++) {
                val = '\t' + val;
            }

            if (val.includes('}')) {
                tabCnt <= 0 ? tabCnt : tabCnt--;
            }
            
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
            block.type === 'arduino_text' ||                 // Value for AnalogWrite
            block.type === 'arduino_get_port_number' ||      // Digital port
            block.type === 'arduino_get_pwm_port_number' ||  // PWM port
            block.type === 'arduino_get_seonsor_number'      // Port for AnalogRead
        ) {
            return val[0]; // value is in the array
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
        block.data.params.forEach(param => {
            if (param instanceof Entry.Block) {
                rtn.push(this.Block(param));
            } else if (param) {
                rtn.push(param);
            }
        });
        return rtn;
    }

    createSource(block) {
        let value = 0, value2 = 0, on_off = '';
        let stat = '', operator = '';

        switch (block.type) {
            case 'repeat_inf':
                this._isInRepeat = true;
                break;

            case 'repeat_basic':
                value = Number(this._pramVal); // Arr to Number
                if (isNaN(value)) { // In case the value is not a number
                    this.throwErr('error', 'WrongInputVal', block);
                    break;
                }

                if (value > 99) { // max is 99
                    this.throwErr('warn', 'ExcessiveInputVal', block);
                    value = 99;
                } else if (value <= 0) { // min is 1
                    this.throwErr('error', 'MinusInputVal', block);
                }

                stat = `for (int ${this._iterVar} = 0; i < ${value}; ${this._iterVar}++) {`;
                // this._iterVar = String.fromCharCode(this._iterVar.charCodeAt(0) + 1); // Move iterVar to the next
                break;

            case 'repeat_while_true':
                break;

            case 'stop_repeat':
                stat = 'break;'
                break;

            case 'wait_second':
                value = Number(this._pramVal); // String to Number
                if (isNaN(value)) {
                    this.throwErr('error', 'WrongInputVal', block);
                    break;
                } else if (value <= 0) { // min is 1
                    this.throwErr('error', 'MinusInputVal', block);
                }

                if (Number.isInteger(value)) {
                    if (value > 99) { // max is 99
                        this.throwErr('warn', 'ExcessiveInputVal', block);
                        value = 99;
                    } 
                } else { // Float
                    value = value.toFixed(2);
                    if (value > 9.9) { // max is 9.9
                        this.throwErr('warn', 'ExcessiveInputVal', block);
                        value = 9.9;
                    }
                }
                stat = `delay(${value*1000});`; // Add indentation
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
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number

                on_off = this._pramVal[1] === 'on' ? 'HIGH' : 'LOW';
                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', on_off);
                break;

            case 'arduino_toggle_pwm': // pwm(digitalWrite)
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                value = this._pramVal[1];
                
                stat = stat.replace('%1', this._pinNum);
                stat = stat.replace('%2', value);
                break;

            case 'arduino_get_digital_value': // digitalRead
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                stat = `if (${stat}) {`;
                stat = stat.replace('%1', this._pinNum);
                break;    

            case 'arduino_get_number_sensor_value': // analogRead
                stat = block._schema.syntax.ar[0].syntax;
                this._funcName = stat.split('(')[0];
                this._pinNum = Number(this._pramVal[0]); // Arr to Number
                stat = stat.replace('%1', this._pinNum);
                break;

            case 'arduino_convert_scale': // map
                break;

            case 'set_variable':
                break;
            case 'change_variable':
                break;    
            case 'get_variable':
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
};