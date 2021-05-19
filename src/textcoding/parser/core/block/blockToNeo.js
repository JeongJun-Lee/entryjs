/*
 * Convert code blocks of NeoSoco to protocal for upload to HW
 */
'use strict';

Entry.BlockToNeoParser = class {
    constructor() {
        this._type = 'BlockToNeoParser';
        this._cmd = [];
        this._pramVal = [];
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

        let results = 0;
        this._cmd.length && (this._cmd.length = 0); // init
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

        console.log(results);
        // Make one array before return
        results = results.reduce((prev, curr) => prev.concat(curr));
        results = [0xAA, 0xAA, 0xAA, 0x01, 0x01, 0x02].concat(results); // Add data start frame
        results = results.concat([0xAA, 0xAA, 0xAA, 0x01, 0x02, 0x03]); // Add data end frame 

        return results;
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
                if (Entry.TextCodingUtil.hasUnSupportedBlkInNeo(block)) {
                    this.throwErr('error', 'UnsupportedBlk', block);
                } else {
                    const val = this.Block(block);
                    if (val) {
                        this._cmd.push(val);
                    }
                }

                // Handle blocks in loop or condition block
                if (block.statements.length) {
                    block.statements.forEach((stmt, idx) => {
                        this.Thread(stmt);

                        // In case of if-else, add middle frame
                        if (idx === block.statements.length - 2) {
                            this.addMiddleFrame(stmt.parent.type);
                        }

                        // When escape loop or condition, add closed frame
                        if (idx === block.statements.length - 1) {
                            this.addClosedFrame(stmt.parent.type);
                        }
                    });
                }
            });
        }
        return this._cmd;
    }

    // If possilbe, find at early stage
    isUnsupportedBlkInTopLvl(blocks) {
        blocks.forEach((block) => {
            if (Entry.TextCodingUtil.hasUnSupportedBlkInNeo(block)) {
                this.throwErr('error', 'UnsupportedBlk', block);
            }
        });
    }

    Block(block) {
        if (!block || !(block instanceof Entry.Block) ||
            block.data.type === 'when_run_button_click' // Skip start block
        ) {
            return '';
        }

        // One more check in low level
        if (Entry.TextCodingUtil.hasUnSupportedBlkInNeo(block)) {
            this.throwErr('error', 'UnsupportedBlk', block);
        }

        !block._schema && block.loadSchema();
        const val = this.getValueFromParam(block);
        val.length && (this._pramVal = val);

        if (
            block.type === 'number' ||
            block.type === 'text' ||
            block.type === 'neobot_purple_arg_led_duration' ||
            block.type === 'neobot_purple_sensor_value' ||
            block.type === 'neobot_purple_arg_motor_speed' ||
            block.type === 'neobot_purple_arg_motor_duration' ||
            block.type === 'get_servo_degree'
        ) {
            return val[0]; // value is in the array
        } else if (
            block.type === '_if' ||
            block.type === 'if_else' ||
            block.type === 'wait_until_true'
        ) {
            return val.pop(); // Just return the value gotten by specific block with _if
        } else {
            return this.createDataFrame(block);
        }
    }

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

    createDataFrame(block) {
        let cmd = [];
        let duration = 0, bright = 0;
        let port = 0, operator = 0, value = 0, cPort = 0;
        let octave = 0, note = 0;
        let direction = 0, motor = 0, speed = 0, degree = 0;
        let RGB = {red: '', green: '', blue: ''};
        let idx = 1;

        switch (block.type) {
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

                cmd = [0x01, 0x01, value, 0x00, 0x00];
                break;

            case 'repeat_inf':
                cmd = [0x01, 0x01, 0xFF, 0x00, 0x00];
                break;

            case 'repeat_stop':
                cmd = [0x01, 0x00, 0x00, 0x00, 0x00];
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
                    cmd = [0x08, value, 0x00, 0x00, 0x00];
                } else { // Float
                    value = value.toFixed(2);
                    if (value > 9.9) { // max is 9.9
                        this.throwErr('warn', 'ExcessiveInputVal', block);
                        value = 9.9;
                    }
                    cmd = [0x08, 0x00, value * 10, 0x00, 0x00];
                }
                break;

            case 'neobot_purple_decision_sensor_is_over':
            case 'neobot_purple_decision_sensor_angle':
                if (this.isNeoSensorPortBlk(block.params[2])) { // IN1~3 vs IN1~3
                    if (this._pramVal[0] === 'IN12') { // Only IN1~3 is allowed
                        this.throwErr('error', 'WrongInputVal', block);
                    } else {
                        port = this.extractNum(this._pramVal[0]);
                    }
                } else { // IN1~3 vs value
                    if (this._pramVal[0] === 'IN12') {
                        port = 4;
                    } else {
                        port = this.extractNum(this._pramVal[0]);
                    }
                }

                switch (this._pramVal[1]) {
                    case '>':
                        operator = 1;
                        break;
                    case '>=':
                        operator = 2;
                        break;
                    case '=':
                        operator = 3;
                        break;
                    case '<=':
                        operator = 4;
                        break;
                    case '<':
                        operator = 5;
                        break;
                }

                value = Number(this._pramVal[2]);
                if (isNaN(value)) { // IN1~3
                    cPort = this.extractNum(this._pramVal[2]);
                    if (!cPort) { // IR, BAT
                        this.throwErr('error', 'WrongInputVal', block);
                    }
                } else if (value > 255) { // max is 255
                    this.throwErr('warn', 'ExcessiveInputVal', block);
                    value = 255;
                }

                if (this.getParentBlk(block) === '_if' || this.getParentBlk(block) === 'if_else') {
                    if (cPort) { // Comparison between ports
                        cmd = [0x02, 0x04, port, operator, cPort];
                    } else { 
                        cmd = [0x02, 0x02, port, operator, value];
                    }
                } else if (this.getParentBlk(block) === 'wait_until_true') {
                    if (cPort) { // Comparison between ports
                        cmd = [0x02, 0x06, port, operator, cPort];
                    } else { 
                        cmd = [0x02, 0x03, port, operator, value];
                    }
                }
                break;

            case 'neobot_purple_decision_equal_with_sensor':
                port = this.extractNum(this._pramVal[0]);
                switch (this._pramVal[1]) {
                    case 0: // White color
                        value = 200;
                        break;
                    case 1: // Red
                        value = 20;
                        break;
                    case 2: // Yellow
                        value = 40;
                        break;
                    case 3: // Green
                        value = 120;
                        break;
                    case 4: // Blue
                        value = 160;
                        break;
                }
                cmd = [0x02, 0x02, port, 0x06, value];
                break;

            case 'neobot_purple_remote_button':
                value = Number(this._pramVal[0]);
                if (this.getParentBlk(block) === '_if' || this.getParentBlk(block) === 'if_else') {
                    cmd = [0x03, 0x01, value, 0x01, 0x00];
                } else if (this.getParentBlk(block) === 'wait_until_true') {
                    cmd = [0x03, 0x03, value, 0x00, 0x00];
                }
                break;

            case 'neobot_purple_led_on':
                if (this._pramVal[0] === 'ALL') {
                    port = 0xFF;
                } else {
                    port = this.extractNum(this._pramVal[0]);
                }

                bright = Number(this._pramVal[1]); // String to Number
                cmd = [0x04, port, bright, 0x00, 0x01];

                // duration is not actual parameter in led block, but for now, suppor it
                if (this._pramVal[2] !== '계속') { // Not 계속
                    duration = Number(this._pramVal[2]); // String to Number
                    if (isNaN(duration)) { // IN1~3, BAT, IR
                        this.throwErr('error', 'WrongInputVal', block);
                    }
                }
                break;

            case 'neobot_purple_led_brightness_with_sensor':
                value = this.extractNum(this._pramVal[0]); // IN1~3
                if (this._pramVal[1] === 'ALL') {
                    port = 0xFF;
                } else {
                    port = this.extractNum(this._pramVal[1]);
                }
                cmd = [0x04, port, value + 100, 0x00, 0x01]; // IN1~3 should 101~103
                break;

            case 'neobot_purple_color_led_on':
                if (this._pramVal[0] === 'ALL') {
                    port = 0xFF;
                } else {
                    port = this.extractNum(this._pramVal[0]);
                }

                for (const key in RGB) {
                    RGB[key] = Number(this._pramVal[idx]);
                    if (isNaN(RGB[key])) { // IN1~3
                        RGB[key] = this.extractNum(this._pramVal[idx]);
                        if (!RGB[key]) { // IR, BAT
                            this.throwErr('error', 'WrongInputVal', block);
                        } else {
                            RGB[key] = RGB[key] + 100;
                        }
                    } else {
                        if (RGB[key] > 255) {
                            this.throwErr('warn', 'ExcessiveInputVal', block);
                            RGB[key] = 255;
                        } else if (RGB[key] < 0) {
                            this.throwErr('error', 'WrongInputVal', block);
                        }
                    }
                    idx++;
                }
                cmd = [0x04, port, RGB['red'], RGB['green'], RGB['blue']];
                break;

            case 'neobot_purple_output_led_off':
                if (this._pramVal[0] === 'ALL') {
                    this._pramVal[0] = 0xFF;
                } else {
                    this._pramVal[0] = this.extractNum(this._pramVal[0]);
                }
                cmd = [0x04, this._pramVal[0], 0x00, 0x00, 0x00];
                break;

            case 'neobot_purple_robot':
                direction = Number(this._pramVal[0]);
                if (direction === 5) { // Stop
                    cmd = [0x05, 0x00, 0x00, 0x00, 0xFF];
                } else {
                    cmd = [0x05, direction, 100, 0xFF, 0xFF];
                }
                break;

            case 'neobot_purple_motor_start':
                motor = Number(this._pramVal[0]);
                switch (motor) {
                    case 1: // Both
                        motor = 0xFF;
                        break;

                    case 2: // Left
                    case 3: // Right
                        motor = motor - 1; // Left should be 1
                        break;
                }

                direction = Number(this._pramVal[1]);

                speed = this.extractNum(this._pramVal[2]);
                if (!Entry.Utils.isNumber(this._pramVal[2]) && speed < 4) { // IN1~3 will be 1~3
                    speed = speed + 100; // IN1~3 should 101~103
                }

                if (this._pramVal[3] === '계속') {
                    duration = 0xFF;
                } else {
                    duration = Number(this._pramVal[3]);
                }

                // Not allow IN1~3, BAT, IR in duration and BAT, IR in speed
                if (isNaN(duration) || isNaN(speed)) {
                    this.throwErr('error', 'WrongInputVal', block);
                }

                cmd = [0x05, direction, speed, duration, motor];
                break;

            case 'neobot_purple_motor_stop':
                motor = Number(this._pramVal[0]);
                switch (motor) {
                    case 1: // Both
                        motor = 0xFF;
                        break;

                    case 2: // Left
                    case 3: // Right 
                        motor = motor - 1; // Left should be 1
                        break;
                }
                cmd = [0x05, 0x00, 0x00, 0x00, motor];
                break;

            case 'neobot_purple_play_note_for':
                octave = Number(this._pramVal[0]);
                note = Number(this._pramVal[1]);
                duration = Number(this._pramVal[2]);
                cmd = [0x09, octave, note, duration, 0x00];
                break;

            case 'neobot_purple_melody_play_with_sensor':
                port = this.extractNum(this._pramVal[0]);
                cmd = [0x09, 0x00, 0x00, 0x00, port];
                break;

            case 'neobot_purple_melody_stop':
                cmd = [0x09, 0x00, 0x00, 0x00, 0x00];
                break;

            case 'neobot_purple_servo_init':
                if (this._pramVal[0] === 'ALL') {
                    port = 0xFF;
                } else {
                    port = this.extractNum(this._pramVal[0]);
                }
                cmd = [0x07, port, 0x00, 0x00, 0xBA];
                break;

            case 'neobot_purple_servo_rotate':
                if (this._pramVal[0] === 'ALL') {
                    port = 0xFF;
                } else {
                    port = this.extractNum(this._pramVal[0]);
                }

                direction = Number(this._pramVal[1]);

                speed = Number(this._pramVal[2]);
                if (isNaN(speed)) { // IN1~3 could not be converted to number
                    speed = this.extractNum(this._pramVal[2]);
                    speed = speed + 100; // IN1~3 should 101~103
                }

                cmd = [0x07, port, direction, speed, 0xFF];
                break;

            case 'neobot_purple_servo_stop':
                if (this._pramVal[0] === 'ALL') {
                    port = 0xFF;
                } else {
                    port = this.extractNum(this._pramVal[0]);
                }
                cmd = [0x07, port, 0x00, 0x00, 0xFE];
                break;

            case 'neobot_purple_servo_change_degree':
                if (this._pramVal[1] === 'ALL') {
                    port = 0xFF;
                } else {
                    port = this.extractNum(this._pramVal[1]);
                }

                direction = Number(this._pramVal[2]);

                speed = Number(this._pramVal[3]);
                if (isNaN(speed)) { // IN1~3 could not be converted to number
                    speed = this.extractNum(this._pramVal[3]);
                    speed = speed + 100; // IN1~3 should 101~103
                }

                if ( // Not allow wrong val in switched block
                    this._pramVal[0] === 'BAT' ||
                    this._pramVal[0] === 'IR' ||
                    this._pramVal[0] === 'ALL' ||
                    this._pramVal[0] === '계속'
                ) { 
                    this.throwErr('error', 'WrongInputVal', block);
                }

                degree = Number(this._pramVal[0]);
                if (degree > 180) {
                    this.throwErr('warn', 'ExcessiveInputVal', block);
                    degree = 180;
                }

                if (isNaN(degree)) { // IN1~3 could not be converted to number
                    degree = this.extractNum(this._pramVal[0]);
                    degree = degree + 200; // IN1~3 should 201~203
                }

                cmd = [0x07, port, direction, speed, degree];
                break;

            default:
                console.log('There is the missed block type in blockToNeo!: ', block.type);
                this.throwErr('error', 'MinusInputVal', block);
                break;
        }

        cmd = this.addHeader(cmd);
        cmd.push(this.addCheckSum(cmd));

        // This if part would be temporary by future upgrade
        // Since the HW doen't support the duration param, handle it manually
        if (block.type === 'neobot_purple_led_on' && duration) {
            this._pramVal = duration;
            const waitCmd = this.createDataFrame({type: 'wait_second'});
            this._pramVal = ['ALL'];
            const ledOffCmd = this.createDataFrame({type: 'neobot_purple_output_led_off'});
            cmd = cmd.concat(waitCmd).concat(ledOffCmd);
        }

        this._pramVal = 0; // init since it's used
        return cmd;
    }

    getParentBlk(block) {
        return block.thread._parent._block.type;
    }

    isNeoSensorPortBlk(block) {
        return (block instanceof Entry.Block) && block.type === 'neobot_purple_sensor_value';
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

    strToHex(str) {
        return parseInt(str.toString(16), 16);
    }

    addHeader(cmd) {
        const header = [0xAA, 0xAA, 0xAA, 0x02];
        return header.concat(cmd); // Add header
    }

    addCheckSum(cmd) {
        // Strip header and accumulate to the end
        return cmd.slice(3).reduce((prev, curr) => prev + curr, 0, 3) & 0xFF;;
    }

    addClosedFrame(type) { // Add closed frame for loop or condition block
        let cmd = 0;
        switch (type) {
            case 'repeat_basic':
            case 'repeat_inf':
                cmd = [0x01, 0xFF, 0x00, 0x00, 0x00];
                break;
            case '_if':
            case 'if_else':
                cmd = [0x02, 0xFF, 0x00, 0x00, 0x00];
                break;
        }

        cmd = this.addHeader(cmd);
        cmd.push(this.addCheckSum(cmd));
        this._cmd.push(cmd);
    }

    addMiddleFrame(type) { // Add middle frame for if-else condition block
        let cmd = 0;
        switch (type) {
            case 'if_else':
                cmd = [0x02, 0x00, 0x00, 0x00, 0x00];
                break;
        }

        cmd = this.addHeader(cmd);
        cmd.push(this.addCheckSum(cmd));
        this._cmd.push(cmd);
    }
};
