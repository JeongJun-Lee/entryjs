'use strict';

const { monitorTemplate } = require("./block_arduino");

Entry.ArduinoExt = {
    id: '1.9',
    name: 'ArduinoExt',
    url: 'http://www.arduino.cc/',
    imageName: 'arduinoExt.png',
    title: {
        ko: '아두이노 Uno 확장모드',
        en: 'ArduinoExt Uno',
    },
    setZero() {
        if (!Entry.hw.sendQueue.SET) {
            Entry.hw.sendQueue = {
                GET: {},
                SET: {},
            };
        } else {
            const keySet = Object.keys(Entry.hw.sendQueue.SET);
            keySet.forEach((key) => {
                Entry.hw.sendQueue.SET[key].data = 0;
                Entry.hw.sendQueue.SET[key].time = new Date().getTime();
            });

            // For legacy port writing
            for (const val in monitorTemplate.listPorts) {
                const cvt = Number(val);
                if (!isNaN(cvt)) Entry.hw.sendQueue[cvt] = 0;
            }
        }
        Entry.hw.update();
    },
    sensorTypes: {
        ALIVE:      0,
        DIGITAL:    1,
        ANALOG:     2,
        PWM:        3,
        SERVO_PIN:  4,
        TONE:       5,
        PULSEIN:    6,
        ULTRASONIC: 7,
        TIMER:      8,
        STEPPER:    9,
        DHTINIT:   10,  //a
        DHTTEMP:   11,  //b
        DHTHUMI:   12,  //c
        IRRINIT:   13,  //d
        IRREMOTE:  14,  //e
        LCD_INIT:  15,  //f
        LCD_PRINT: 16,  //g
        LCD_CLEAR: 17,  //h

    },
    toneTable: {
        '0': 0,
        C: 1,
        CS: 2,
        D: 3,
        DS: 4,
        E: 5,
        F: 6,
        FS: 7,
        G: 8,
        GS: 9,
        A: 10,
        AS: 11,
        B: 12,
    },
    toneMap: {
        '1': [33, 65, 131, 262, 523, 1046, 2093, 4186],
        '2': [35, 69, 139, 277, 554, 1109, 2217, 4435],
        '3': [37, 73, 147, 294, 587, 1175, 2349, 4699],
        '4': [39, 78, 156, 311, 622, 1245, 2849, 4978],
        '5': [41, 82, 165, 330, 659, 1319, 2637, 5274],
        '6': [44, 87, 175, 349, 698, 1397, 2794, 5588],
        '7': [46, 92, 185, 370, 740, 1480, 2960, 5920],
        '8': [49, 98, 196, 392, 784, 1568, 3136, 6272],
        '9': [52, 104, 208, 415, 831, 1661, 3322, 6645],
        '10': [55, 110, 220, 440, 880, 1760, 3520, 7040],
        '11': [58, 117, 233, 466, 932, 1865, 3729, 7459],
        '12': [62, 123, 247, 494, 988, 1976, 3951, 7902],
    },
    highList: ['high', '1', 'on'],
    lowList: ['low', '0', 'off'],
    duration: {
        TIME_1ms: 1,
        TIME_5ms: 5,
        TIME_10ms: 10,
        TIME_20ms: 20,
        TIME_50ms: 50,
        TIME_100ms: 100,
        TIME_200ms: 200, 
        TIME_500ms: 500,    
        TIME_600ms: 600,   
    },
    BlockState: {},
    monitorTemplate: {
        imgPath: 'hw/arduino.png',
        width: 605,
        height: 434,
        listPorts: {
            '2': {
                name: `${Lang.Hw.port_en} 2 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '3': {
                name: `${Lang.Hw.port_en} 3 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '4': {
                name: `${Lang.Hw.port_en} 4 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '5': {
                name: `${Lang.Hw.port_en} 5 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '6': {
                name: `${Lang.Hw.port_en} 6 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '7': {
                name: `${Lang.Hw.port_en} 7 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '8': {
                name: `${Lang.Hw.port_en} 8 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '9': {
                name: `${Lang.Hw.port_en} 9 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '10': {
                name: `${Lang.Hw.port_en} 10 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '11': {
                name: `${Lang.Hw.port_en} 11 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '12': {
                name: `${Lang.Hw.port_en} 12 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            '13': {
                name: `${Lang.Hw.port_en} 13 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            a0: {
                name: `${Lang.Hw.port_en} A0 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            a1: {
                name: `${Lang.Hw.port_en} A1 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            a2: {
                name: `${Lang.Hw.port_en} A2 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            a3: {
                name: `${Lang.Hw.port_en} A3 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            a4: {
                name: `${Lang.Hw.port_en} A4 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
            a5: {
                name: `${Lang.Hw.port_en} A5 ${Lang.Hw.port_ko}`,
                type: 'input',
                pos: { x: 0, y: 0 },
            },
        },
        mode: 'both',
  },
};

Entry.ArduinoExt.setLanguage = function() {
    return {
        ko: {
            template: {
                arduino_ext_get_analog_value: '아날로그 %1 번 센서값',
                arduino_ext_get_analog_value_map: '%1 의 범위를 %2 ~ %3 에서 %4 ~ %5 로 바꾼값',
                arduino_ext_get_ultrasonic_value: '울트라소닉 Trig %1 Echo %2 센서값',
                arduino_ext_toggle_led: '디지털 %1 번 핀 %2 %3',
                arduino_ext_digital_pwm: '디지털 %1 번 핀을 %2 (으)로 정하기 %3',
                arduino_ext_set_tone: '디지털 %1 번 핀의 버저를 %2 %3 음으로 %4 초 연주하기 %5',
                arduino_ext_set_servo: '디지털 %1 번 핀의 서보모터를 %2 의 각도로 정하기 %3',
                arduino_ext_get_digital: '디지털 %1 번 센서값',
                arduino_ext_set_temp_humi_init: "디지털 %1 번 핀에 연결된 온습도센서 사용하기 %2",
                arduino_ext_get_temp_value: '온습도센서 온도값',
                arduino_ext_get_humi_value: '온습도센서 습도값',
                arduino_ext_set_stepper: '디지털 %1 %2 %3 %4 번 핀의 스텝모터를 %5 RPM으로 %6 스텝 이동하기 %7',
                arduino_ext_set_irremote_init: "디지털 %1 번 핀에 연결된 적외선 수신기 사용하기 %2",
                arduino_ext_get_irremote_value: '수신된 적외선 신호값',
                arduino_ext_set_lcd_init: 'LCD 초기화 하기 %1',
                arduino_ext_set_lcd_print: 'LCD %1 줄 %2 칸에 %3 을 쓰기 %4',
                arduino_ext_set_lcd_clear: 'LCD 화면 지우기 %1',
            },
        },
        en: {
            template: {
                arduino_ext_get_analog_value: 'Analog %1 Sensor value',
                arduino_ext_get_analog_value_map: 'Map Value %1 %2 ~ %3 to %4 ~ %5',
                arduino_ext_get_ultrasonic_value: 'Read ultrasonic sensor trig pin %1 echo pin %2',
                arduino_ext_toggle_led: 'Digital %1 Pin %2 %3',
                arduino_ext_digital_pwm: 'Digital %1 Pin %2 %3',
                arduino_ext_set_tone: 'Play tone pin %1 on note %2 octave %3 beat %4 %5',
                arduino_ext_set_servo: 'Set servo pin %1 angle as %2 %3',
                arduino_ext_get_digital: 'Digital %1 Sensor value',
                arduino_ext_set_temp_humi_init: "Init temp-humid pin %1 %2",
                arduino_ext_get_temp_value: 'Temp sensor value',
                arduino_ext_get_humi_value: 'Humidity sensor value',
                arduino_ext_set_stepper: 'Set stepper pin %1 %2 %3 %4 RPM as %5 and steps as %6 %7',
                arduino_ext_set_irremote_init: "Init IR receiver pin %1  %2",
                arduino_ext_get_irremote_value: 'Received IR signal value',
                arduino_ext_set_lcd_init: 'Init LCD screen %1',
                arduino_ext_set_lcd_print: 'Write %3 on %1 line %2 column of LCD %4',
                arduino_ext_set_lcd_clear: 'Clear LCD screen %1',
            },
        },
        uz: {
          template: {
                arduino_ext_get_analog_value: "Analog %1 pin sensor qiymati",
                arduino_ext_get_analog_value_map: "%1ning doirasini %2 ~ %3 dan %4 ~ %5 ga o'zgartirgan qiymati",
                arduino_ext_get_ultrasonic_value: "Ultrasonik sensor trig %1 eko %2 sensor qiymati",
                arduino_ext_toggle_led: "Raqamli %1 pinini %2 %3",
                arduino_ext_digital_pwm: "PWM %1 pinini %2 ga solzash %3",
                arduino_ext_set_tone: "Raqamli %1 pinni buzzerni %2 %3 oktavada %4 soniya yangrash %5",
                arduino_ext_set_servo: "Raqamli %1 pinning servo motorini %2 gradusiga sozlash %3",
                arduino_ext_get_digital: "Raqamli %1 pin sensor qiymati",
                arduino_ext_set_temp_humi_init: "Harorat-namlik sensorni %1 pindan foydalanish %2",
                arduino_ext_get_temp_value: 'Harorat sensor qiymati',
                arduino_ext_get_humi_value: 'Namlik sensor qiymati',
                arduino_ext_set_stepper: "Raqamli %1 %2 %3 %4 pinning stepper motorini %5 RPMdan %6 qadam ko'chirish %7",
                arduino_ext_set_irremote_init: "Pult signali qabul qiluvchini %1 pindan foydalanish %2",
                arduino_ext_get_irremote_value: 'Pultdan bosilgan raqam',
                arduino_ext_set_lcd_init: 'LCDni qaytadan tiklash %1',
                arduino_ext_set_lcd_print: 'LCDning %1 -qatorida %2 -ustuniga %3 yozish %4',
                arduino_ext_set_lcd_clear: 'LCD ekranni tozalash %1',
          },
        },
        ru: {
            template: {
                arduino_ext_get_analog_value: "Аналоговое значение датчика %1",
                arduino_ext_get_analog_value_map: "Изменить диапазон %1 с %2 на %3, на %4 и на %5.",
                arduino_ext_get_ultrasonic_value: "Чтение триггерного пина ультразвукового датчика %1, эхо-пина %2",
                arduino_ext_toggle_led: "Цифровой пин %1 %2 %3",
                arduino_ext_digital_pwm: "Установить цифровой вывод %1 на %2 %3",
                arduino_ext_set_tone: "Включите пищалку на цифровом выводе %1 звуковым сигналом %2 %3 в течение %4 секунд %5",
                arduino_ext_set_servo: "Установить сервомотор %1 на угол %2 %3.",
                arduino_ext_get_digital: "Цифровое значение датчика %1",
                arduino_ext_set_temp_humi_init: "Инициализация датчика температуры и влажности, подключенного к цифровому выводу %1 %2",
                arduino_ext_get_temp_value: 'Значение температуры датчика температуры',
                arduino_ext_get_humi_value: 'Значение влажности датчика влажности',
                arduino_ext_set_stepper: "Установить шаговый пин %1 %2 %3 %4 об/мин как %5 и шаги как %6 %7",
                arduino_ext_set_irremote_init: "Инициализировать пин ИК-приемника %1 %2",
                arduino_ext_get_irremote_value: 'Полученное значение ИК-сигнала',
                arduino_ext_set_lcd_init: 'LCD 초기화 하기',
                arduino_ext_set_lcd_print: 'LCD %1 줄 %2 칸에 %3 을 쓰기 %4',
                arduino_ext_set_lcd_clear: 'LCD 화면 지우기 %1',
            },
          },
    };
};

Entry.ArduinoExt.blockMenuBlocks = [
    'arduino_ext_get_analog_value',
    'arduino_ext_get_analog_value_map',
    'arduino_ext_get_digital',
    'arduino_ext_toggle_led',
    'arduino_ext_digital_pwm',
    'arduino_ext_get_ultrasonic_value',
    'arduino_ext_set_tone',
    'arduino_ext_set_servo',
    'arduino_ext_set_stepper',
    'arduino_ext_set_temp_humi_init',
    'arduino_ext_get_temp_value',
    'arduino_ext_get_humi_value',
    'arduino_ext_set_irremote_init',
    'arduino_ext_get_irremote_value',
    'arduino_ext_set_lcd_init',
    'arduino_ext_set_lcd_print',
    'arduino_ext_set_lcd_clear',
];

//region arduinoExt 아두이노 확장모드
Entry.ArduinoExt.getBlocks = function() {
    return {
        arduino_ext_analog_list: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['A0', '0'],
                        ['A1', '1'],
                        ['A2', '2'],
                        ['A3', '3'],
                        ['A4', '4'],
                        ['A5', '5'],
                    ],
                    value: '0',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                PORT: 0,
            },
            func(sprite, script) {
                return script.getField('PORT');
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: '%1',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['A0', '0'],
                                    ['A1', '1'],
                                    ['A2', '2'],
                                    ['A3', '3'],
                                    ['A4', '4'],
                                    ['A5', '5'],
                                ],
                                value: '0',
                                fontSize: 11,
                                converter: Entry.block.converters.returnStringKey,
                                codeMap: 'Entry.CodeMap.Arduino.arduino_ext_analog_list[0]',
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                            },
                        ],
                        keyOption: 'arduino_ext_analog_list',
                    },
                ],
            },
        },
        arduino_ext_get_analog_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_analog_list',
                    },
                ],
                type: 'arduino_ext_get_analog_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ArduinoExtGet',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                let port = script.getValue('PORT', script);
                if (!Entry.hw.sendQueue.GET) {
                    Entry.hw.sendQueue.GET = {};
                }
                Entry.hw.sendQueue.GET[Entry.ArduinoExt.sensorTypes.ANALOG] = {
                    port,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData[`a${port}`];
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.analogRead(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'analogRead(%1)'}]
            },
        },
        arduino_ext_get_analog_value_map: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_get_analog_value',
                        params: [
                            {
                                type: 'arduino_ext_analog_list',
                            },
                        ],
                    },
                    {
                        type: 'number',
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['1023'],
                    },
                    {
                        type: 'number',
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['100'],
                    },
                ],
                type: 'arduino_ext_get_analog_value_map',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE2: 1,
                VALUE3: 2,
                VALUE4: 3,
                VALUE5: 4,
            },
            class: 'ArduinoExtGet',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                let result = script.getValue('PORT', script);
                const ANALOG = Entry.hw.portData.ANALOG;
                let value2 = script.getNumberValue('VALUE2', script);
                let value3 = script.getNumberValue('VALUE3', script);
                let value4 = script.getNumberValue('VALUE4', script);
                let value5 = script.getNumberValue('VALUE5', script);
                const stringValue4 = script.getValue('VALUE4', script);
                const stringValue5 = script.getValue('VALUE5', script);
                let isFloat = false;

                if (
                    (Entry.Utils.isNumber(stringValue4) && stringValue4.indexOf('.') > -1) ||
                    (Entry.Utils.isNumber(stringValue5) && stringValue5.indexOf('.') > -1)
                ) {
                    isFloat = true;
                }

                if (value2 > value3) {
                    var swap = value2;
                    value2 = value3;
                    value3 = swap;
                }
                if (value4 > value5) {
                    var swap = value4;
                    value4 = value5;
                    value5 = swap;
                }
                result -= value2;
                result = result * ((value5 - value4) / (value3 - value2));
                result += value4;
                result = Math.min(value5, result);
                result = Math.max(value4, result);

                if (isFloat) {
                    result = Math.round(result * 100) / 100;
                } else {
                    result = Math.round(result);
                }

                return result;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.map(%1, %2, %3, %4, %5)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'map(%1, %2, %3, %4, %5)'}]
            },
        },
        arduino_ext_get_digital: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: [2],
                    },
                ],
                type: 'arduino_ext_get_digital',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'ArduinoExtGet',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const { hwModule = {} } = Entry.hw;
                const { name } = hwModule;
                if (name === 'ArduinoExt' || name === 'ArduinoNano') {
                    const port = script.getNumberValue('PORT', script);
                    if (!Entry.hw.sendQueue.GET) {
                        Entry.hw.sendQueue.GET = {};
                    }
                    Entry.hw.sendQueue.GET[Entry.ArduinoExt.sensorTypes.DIGITAL] = {
                        port,
                        time: new Date().getTime(),
                    };
                    return port ? Entry.hw.portData[port] : 0;
                } else {
                    return Entry.block.arduino_get_digital_value.func(sprite, script);
                }
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.digitalRead(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'digitalRead(%1)'}]
            },
        },
        arduino_ext_toggle_led: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: [3],
                    },
                    {
                        type: 'arduino_get_digital_toggle',
                        params: ['on'],
                    },
                    null,
                ],
                type: 'arduino_ext_toggle_led',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ArduinoExtGet',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const port = script.getNumberValue('PORT');
                let value = script.getValue('VALUE');

                if (typeof value === 'string') {
                    value = value.toLowerCase();
                }
                if (Entry.ArduinoExt.highList.indexOf(value) > -1) {
                    value = 255;
                } else if (Entry.ArduinoExt.lowList.indexOf(value) > -1) {
                    value = 0;
                } else {
                    throw new Error();
                }
                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                Entry.hw.sendQueue.SET[port] = {
                    type: Entry.ArduinoExt.sensorTypes.DIGITAL,
                    data: value,
                    time: new Date().getTime(),
                };
                // For legacy port writing
                Entry.hw.sendQueue[port] = value;
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.digitalWrite(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'digitalWrite(%1, %2);'}]
            },
        },
        arduino_ext_digital_pwm: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_pwm_port_number',
                    },
                    {
                        type: 'text',
                        params: ['255'],
                    },
                    null,
                ],
                type: 'arduino_ext_digital_pwm',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'ArduinoExtGet',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const port = script.getNumberValue('PORT');
                let value = script.getNumberValue('VALUE');
                value = Math.round(value);
                value = Math.max(value, 0);
                value = Math.min(value, 255);
                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                Entry.hw.sendQueue.SET[port] = {
                    type: Entry.ArduinoExt.sensorTypes.PWM,
                    data: value,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.analogWrite(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'analogWrite(%1, %2);'}]
            },
        },
        arduino_get_digital_toggle: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [[Lang.Blocks.ARDUINO_on, 'on'], [Lang.Blocks.ARDUINO_off, 'off']],
                    value: 'on',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                OPERATOR: 0,
            },
            func(sprite, script) {
                return script.getStringField('OPERATOR');
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: '%1',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.ARDUINO_on, 'on'],
                                    [Lang.Blocks.ARDUINO_off, 'off'],
                                ],
                                value: 'on',
                                fontSize: 11,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValueUpperCase,
                                codeMap: 'Entry.CodeMap.Arduino.arduino_get_digital_toggle[0]',
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                            },
                        ],
                        keyOption: 'arduino_get_digital_toggle',
                    },
                ],
            },
        },
        arduino_ext_get_ultrasonic_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: ['2'],
                    },
                    {
                        type: 'arduino_get_port_number',
                        params: ['4'],
                    },
                ],
                type: 'arduino_ext_get_ultrasonic_value',
            },
            paramsKeyMap: {
                PORT1: 0,
                PORT2: 1,
            },
            class: 'ultra_tone',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const port1 = script.getNumberValue('PORT1', script);
                const port2 = script.getNumberValue('PORT2', script);

                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                delete Entry.hw.sendQueue.SET[port1];
                delete Entry.hw.sendQueue.SET[port2];

                if (!Entry.hw.sendQueue.GET) {
                    Entry.hw.sendQueue.GET = {};
                }
                Entry.hw.sendQueue.GET[Entry.ArduinoExt.sensorTypes.ULTRASONIC] = {
                    port: [port1, port2],
                    time: new Date().getTime(),
                };
                return Entry.hw.portData.ULTRASONIC || 0;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.ultrasonicRead(%1, %2)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'distance()'}]
            },
        },
        arduino_ext_tone_list: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.silent, '0'],
                        [Lang.Blocks.do_name, 'C'],
                        [Lang.Blocks.do_sharp_name, 'CS'],
                        [Lang.Blocks.re_name, 'D'],
                        [Lang.Blocks.re_sharp_name, 'DS'],
                        [Lang.Blocks.mi_name, 'E'],
                        [Lang.Blocks.fa_name, 'F'],
                        [Lang.Blocks.fa_sharp_name, 'FS'],
                        [Lang.Blocks.sol_name, 'G'],
                        [Lang.Blocks.sol_sharp_name, 'GS'],
                        [Lang.Blocks.la_name, 'A'],
                        [Lang.Blocks.la_sharp_name, 'AS'],
                        [Lang.Blocks.si_name, 'B'],
                    ],
                    value: 'C',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                NOTE: 0,
            },
            func(sprite, script) {
                return script.getField('NOTE');
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: '%1',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.silent, '0'],
                                    [Lang.Blocks.do_name, 'C'],
                                    [Lang.Blocks.do_sharp_name, 'CS'],
                                    [Lang.Blocks.re_name, 'D'],
                                    [Lang.Blocks.re_sharp_name, 'DS'],
                                    [Lang.Blocks.mi_name, 'E'],
                                    [Lang.Blocks.fa_name, 'F'],
                                    [Lang.Blocks.fa_sharp_name, 'FS'],
                                    [Lang.Blocks.sol_name, 'G'],
                                    [Lang.Blocks.sol_sharp_name, 'GS'],
                                    [Lang.Blocks.la_name, 'A'],
                                    [Lang.Blocks.la_sharp_name, 'AS'],
                                    [Lang.Blocks.si_name, 'B'],
                                ],
                                value: 'C',
                                fontSize: 11,
                                converter: Entry.block.converters.returnStringValueUpperCase,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                            },
                        ],
                        keyOption: 'arduino_ext_tone_list',
                    },
                ],
            },
        },
        arduino_ext_tone_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_tone_list',
                    },
                ],
                type: 'arduino_ext_tone_value',
            },
            paramsKeyMap: {
                NOTE: 0,
            },
            func(sprite, script) {
                return script.getNumberValue('NOTE');
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: '%1',
                        keyOption: 'arduino_ext_tone_value',
                    },
                ],
            },
        },
        arduino_ext_octave_list: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'],
                        ['2', '2'],
                        ['3', '3'],
                        ['4', '4'],
                        ['5', '5'],
                        ['6', '6'],
                    ],
                    value: '4',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                OCTAVE: 0,
            },
            func(sprite, script) {
                return script.getField('OCTAVE');
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: '%1',
                        keyOption: 'arduino_ext_octave_list',
                    },
                ],
            },
        },
        arduino_ext_set_tone: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: [3],
                    },
                    {
                        type: 'arduino_ext_tone_list',
                    },
                    {
                        type: 'arduino_ext_octave_list',
                    },
                    {
                        type: 'text',
                        params: ['1'],
                    },
                    null,
                ],
                type: 'arduino_ext_set_tone',
            },
            paramsKeyMap: {
                PORT: 0,
                NOTE: 1,
                OCTAVE: 2,
                DURATION: 3,
            },
            class: 'ultra_tone',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const sq = Entry.hw.sendQueue;
                const port = script.getNumberValue('PORT', script);

                if (!script.isStart) {
                    let note = script.getValue('NOTE', script);
                    if (!Entry.Utils.isNumber(note)) {
                        note = Entry.ArduinoExt.toneTable[note];
                    }

                    if (note < 0) {
                        note = 0;
                    } else if (note > 12) {
                        note = 12;
                    }

                    let duration = script.getNumberValue('DURATION', script);

                    if (duration < 0) {
                        duration = 0;
                    }

                    if (!sq.SET) {
                        sq.SET = {};
                    }

                    if (duration === 0) {
                        sq.SET[port] = {
                            type: Entry.ArduinoExt.sensorTypes.TONE,
                            data: 0,
                            time: new Date().getTime(),
                        };
                        return script.callReturn();
                    }

                    let octave = script.getNumberValue('OCTAVE', script) - 1;
                    if (octave < 0) {
                        octave = 0;
                    } else if (octave > 5) {
                        octave = 5;
                    }

                    let value = 0;

                    if (note != 0) {
                        value = Entry.ArduinoExt.toneMap[note][octave];
                    }

                    duration = duration * 1000;
                    script.isStart = true;
                    script.timeFlag = 1;

                    sq.SET[port] = {
                        type: Entry.ArduinoExt.sensorTypes.TONE,
                        data: {
                            value,
                            duration,
                        },
                        time: new Date().getTime(),
                    };

                    setTimeout(() => {
                        script.timeFlag = 0;
                    }, duration + 32);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    delete script.timeFlag;
                    delete script.isStart;
                    sq.SET[port] = {
                        type: Entry.ArduinoExt.sensorTypes.TONE,
                        data: 0,
                        time: new Date().getTime(),
                    };
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.tone(%1, %2, %3, %4)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'tone(%1, %2, %3);'}]
            },
        },
        arduino_ext_set_servo: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: ['3'],
                    },
                    null,
                ],
                type: 'arduino_ext_set_servo',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'motor',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const sq = Entry.hw.sendQueue;
                const port = script.getNumberValue('PORT', script);
                let value = script.getNumberValue('VALUE', script);
                value = Math.min(180, value);
                value = Math.max(0, value);

                if (!sq.SET) {
                    sq.SET = {};
                }
                sq.SET[port] = {
                    type: Entry.ArduinoExt.sensorTypes.SERVO_PIN,
                    data: value,
                    time: new Date().getTime(),
                };

                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.servomotorWrite(%1, %2)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'myServo.write(%1);'}]
            },
        },
        arduino_ext_set_stepper: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: ['8'],
                    },
                    {
                        type: 'arduino_get_port_number',
                        params: ['10'],
                    },
                    {
                        type: 'arduino_get_port_number',
                        params: ['9'],
                    },
                    {
                        type: 'arduino_get_port_number',
                        params: ['11'],
                    },
                    {
                        type: 'text',
                        params: ['10'],
                    },
                    {
                        type: 'text',
                        params: ['2048'],
                    },
                    null,
                ],
                type: 'arduino_ext_set_stepper',
            },
            paramsKeyMap: {
                PORT1: 0,
                PORT2: 1,
                PORT3: 2,
                PORT4: 3,
                SPEED: 4,
                STEPS: 5,
            },
            class: 'motor',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const sq = Entry.hw.sendQueue;
                const port1 = script.getNumberValue('PORT1', script);
                const port2 = script.getNumberValue('PORT2', script);
                const port3 = script.getNumberValue('PORT3', script);
                const port4 = script.getNumberValue('PORT4', script);

                let speed = script.getNumberValue('SPEED', script);
                speed = Math.min(20, speed);
                speed = Math.max(0, speed);

                let steps = script.getNumberValue('STEPS', script);
                steps = Math.min(2048, steps);
                steps = Math.max(-2048, steps);

                if (!sq.SET) {
                    sq.SET = {};
                }
                sq.SET['14'] = {
                    type: Entry.ArduinoExt.sensorTypes.STEPPER,
                    data: {
                        port1,
                        port2,
                        port3,
                        port4,
                        speed,
                        steps
                    },
                    time: new Date().getTime(),
                };

                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.steppermotorWrite(%1, %2, %3, %4, %5, %6)',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'myStepper.step(%1);'}]
            },
        },
        arduino_ext_set_temp_humi_init: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: [3],
                    },
                ],
                type: 'arduino_ext_set_temp_humi_init',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'dht',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                var sq = Entry.hw.sendQueue;
                var port = script.getNumberValue('PORT', script);

				if (!script.isStart) 
                {
					if (!sq.SET) {
						sq.SET = {};
					}
					
					var duration = Entry.ArduinoExt.TIME_500ms;
                    script.isStart = true;
                    script.timeFlag = 1;
					
					sq.SET[port] = {
							type: Entry.ArduinoExt.sensorTypes.DHTINIT,
							data: port,
							time: new Date().getTime(),
					};
					setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration );
                    return script;
				}
				else if (script.timeFlag == 1)
                {
                    return script;
                }
                else 
                {
                    delete script.timeFlag;
                    delete script.isStart;

                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.dhtTempHumiInit(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'dht.begin();'}]
            },
        },
        arduino_ext_get_temp_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
					'0',
                ],
                type: 'arduino_ext_get_temp_value',
            },
            paramsKeyMap: {
                TEMP: 0,
            },
            class: 'dht',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const temp = script.getNumberValue('TEMP', script);

                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                delete Entry.hw.sendQueue.SET[temp];

                if (!Entry.hw.sendQueue.GET) {
                    Entry.hw.sendQueue.GET = {};
                }
				
                Entry.hw.sendQueue.GET[Entry.ArduinoExt.sensorTypes.DHTTEMP] = {
                    port: temp,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData.DHTTEMP || 0;
            },
            syntax: {
                js: [],
                py: [{syntax: 'ArduinoExt.temperatureRead()'}],
                ar: [{syntax: 'dht.readTemperature()'}]
            },
        },
		arduino_ext_get_humi_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
					'0',
                ],
                type: 'arduino_ext_get_humi_value',
            },
            paramsKeyMap: {
                HUMI: 0,
            },
            class: 'dht',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const humi = script.getNumberValue('HUMI', script);

                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                delete Entry.hw.sendQueue.SET[humi];

                if (!Entry.hw.sendQueue.GET) {
                    Entry.hw.sendQueue.GET = {};
                }
				
                Entry.hw.sendQueue.GET[Entry.ArduinoExt.sensorTypes.DHTHUMI] = {
                    port: humi,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData.DHTHUMI || 0;
            },
            syntax: {
                js: [],
                py: [{syntax: 'ArduinoExt.humidityRead()'}],
                ar: [{syntax: 'dht.readHumidity()'}]
            },
        },
        arduino_ext_set_irremote_init: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_get_port_number',
                        params: [3],
                    },
                ],
                type: 'arduino_ext_set_irremote_init',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'irremote',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                var sq = Entry.hw.sendQueue;
                var port = script.getNumberValue('PORT', script);

				if (!script.isStart) 
                {
					if (!sq.SET) {
						sq.SET = {};
					}
					
					var duration = Entry.ArduinoExt.TIME_500ms;
                    script.isStart = true;
                    script.timeFlag = 1;
					
					sq.SET[port] = {
							type: Entry.ArduinoExt.sensorTypes.IRRINIT,
							data: port,
							time: new Date().getTime(),
					};
					setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration );
                    return script;
				}
				else if (script.timeFlag == 1)
                {
                    return script;
                }
                else 
                {
                    delete script.timeFlag;
                    delete script.isStart;

                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'ArduinoExt.irRemoteInit(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    },
                ],
                ar: [{syntax: 'irrecv.enableIRIn();'}]
            },
        },
        arduino_ext_get_irremote_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
            ],
            events: {},
            def: {
                params: [
					'0',
                ],
                type: 'arduino_ext_get_irremote_value',
            },
            paramsKeyMap: {
                RECV: 0,
            },
            class: 'irremote',
            isNotFor: ['ArduinoExt'],
            func(sprite, script) {
                const recv = script.getNumberValue('RECV', script);

                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                delete Entry.hw.sendQueue.SET[recv];

                if (!Entry.hw.sendQueue.GET) {
                    Entry.hw.sendQueue.GET = {};
                }
				
                Entry.hw.sendQueue.GET[Entry.ArduinoExt.sensorTypes.IRREMOTE] = {
                    port: recv,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData.IRREMOTE || 0;
            },
            syntax: {
                js: [],
                py: [{syntax: 'ArduinoExt.irRecvRead()'}],
                ar: [{syntax: 'translateIR()'}]
            },
        },
        arduino_ext_lcd_column_list: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
			outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '0'],
                        ['2', '1'],
                        ['3', '2'],
                        ['4', '3'],
                        ['5', '4'],
                        ['6', '5'],
                        ['7', '6'],
                        ['8', '7'],
                        ['9', '8'],
                        ['10', '9'],
                        ['11', '10'],
                        ['12', '11'],
                        ['13', '12'],
                        ['14', '13'],
                        ['15', '14'],
                        ['16', '15'],
                    ],
                    value: '0',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                COLUMN: 0,
            },
            func: function(sprite, script) {
                return script.getStringField('COLUMN');
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: '%1',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['1', '0'],
                                    ['2', '1'],
                                    ['3', '2'],
                                    ['4', '3'],
                                    ['5', '4'],
                                    ['6', '5'],
                                    ['7', '6'],
                                    ['8', '7'],
                                    ['9', '8'],
                                    ['10', '9'],
                                    ['11', '10'],
                                    ['12', '11'],
                                    ['13', '12'],
                                    ['14', '13'],
                                    ['15', '14'],
                                    ['16', '15'],
                                ],
                                value: '3',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter:
                                    Entry.block.converters
                                        .returnStringOrNumberByValue,
                            },
                        ],
                    },
                ],
            },
        },
        arduino_ext_lcd_row_list: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
			outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            statements: [],
            template: '%1',
            params: [
                {
                    type: 'Dropdown',
                    options: [['1', '0'], ['2', '1']],
                    value: '0',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
            },
            paramsKeyMap: {
                ROW: 0,
            },
            func: function(sprite, script) {
                return script.getStringField('ROW');
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: '%1',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [['1', '0'], ['2', '1']],
                                value: '3',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter:
                                    Entry.block.converters
                                        .returnStringOrNumberByValue,
                            },
                        ],
                    },
                ],
            },
        },
		arduino_ext_set_lcd_init: 
        {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,	
			fontColor: '#fff',			
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                   null
                ],
                type: 'arduino_ext_set_lcd_init',
            },
            paramsKeyMap: {},
            class: 'lcd',
            isNotFor: ['ArduinoExt'],
            func: function(sprite, script) 
			{
                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                Entry.hw.sendQueue.SET[15] = {
                    type: Entry.ArduinoExt.sensorTypes.LCD_INIT,
                    data: 255,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
            syntax: { 
                js: [], 
                py: [{syntax: 'ArduinoExt.lcdInit()'}],
                ar: [{syntax: 'lcdObj->init();'}]
            },
        },	
        arduino_ext_set_lcd_print:
        {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,	
			fontColor: '#fff',			
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Block',
                    accept: 'string',
                },	
                {
                    type: 'Block',
                    accept: 'string',
                },	
                {
                    type: 'Block',
                    accept: 'string',
                },							
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    {
                        type: 'arduino_ext_lcd_row_list',
                    },
                    {
                        type: 'arduino_ext_lcd_column_list',
                    },
                    {
                        type: 'text',
                        params: ['Hello, Entry'],
                    },
                    null,
                ],
                type: 'arduino_ext_set_lcd_print',
            },
            paramsKeyMap: {
                ROW: 0,
                COLUMN: 1,
                TEXT: 2,
            },
            class: 'lcd',
            isNotFor: ['ArduinoExt'],
            func: function(sprite, script) {
                var sq = Entry.hw.sendQueue;
                var row = script.getNumberValue('ROW');
                var column = script.getNumberValue('COLUMN');
                if (column < 0) column = 0;
                if (column > 15) column = 15;
                if (row < 0) row = 0;
                if (row > 1) row = 1;
                var text = script.getValue('TEXT');

                // 아래코드에서 보조 변수들(script.isStart, script.timeFlag등)이 들어간 이유는 fps(초당프레임)를 위해서입니다.
                // 해당 코드가 없을 경우 최소 딜레이가 없기때문에 흐리게 나오는 문제가 발생합니다.
                if (!script.isStart) {
                    if (!sq['SET']) {
                        sq['SET'] = {};
                    }

                    script.isStart = true;
                    script.timeFlag = 1;
                    var fps = Entry.FPS || 60;
                    var timeValue = 60 / fps * 50;

                    sq['SET'][15] = {
                        type: Entry.ArduinoExt.sensorTypes.LCD_PRINT,
                        data: {
                            row,
                            column,
                            text,
                        },
                        time: new Date().getTime(),
                    };

                    setTimeout(function() {
                        script.timeFlag = 0;
                    }, timeValue);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    delete script.timeFlag;
                    delete script.isStart;
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            },
            syntax: { 
                js: [], 
                py: [
                    {
                        syntax: 'ArduinoExt.lcdPrint(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ],
                    }
                ],
                ar: [{syntax: 'lcdObj->setCursor(%1, %2);'}]
            },
        },
		arduino_ext_set_lcd_clear: 
        {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,	
			fontColor: '#fff',			
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                   null
                ],
                type: 'arduino_ext_set_lcd_clear',
            },
            paramsKeyMap: {},
            class: 'lcd',
            isNotFor: ['ArduinoExt'],
            func: function(sprite, script) 
			{
                if (!Entry.hw.sendQueue.SET) {
                    Entry.hw.sendQueue.SET = {};
                }
                Entry.hw.sendQueue.SET[15] = {
                    type: Entry.ArduinoExt.sensorTypes.LCD_CLEAR,
                    data: 255,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
            syntax: { 
                js: [], 
                py: [{syntax: 'ArduinoExt.lcdClear()'}],
                ar: [{syntax: 'lcdObj->clear();'}]
            },
        },
    };
};
//endregion arduinoExt 아두이노 확장모드

module.exports = Entry.ArduinoExt;
