'use strict';

const { monitorTemplate } = require("./block_arduino");

Entry.ArduinoNanoExt = {
    id: ['1.13', '1.64', '1.10', '1A.1'],
    name: 'ArduinoNanoExt',
    url: 'http://www.arduino.cc/',
    imageName: 'rauf_nano.png',
    title: {
        ko: 'Rauf 나노보드',
        en: 'Rauf NanoBoard',
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
        ALIVE: 0,
        DIGITAL: 1,
        ANALOG: 2,
        PWM: 3,
        SERVO_PIN: 4,
        TONE: 5,
        PULSEIN: 6,
        ULTRASONIC: 7,
        TIMER: 8,
        STEPPER: 9,
        DHTINIT: 10,  //a
        DHTTEMP: 11,  //b
        DHTHUMI: 12,  //c
        IRRINIT: 13,  //d
        IRREMOTE: 14,  //e
        LCD_INIT: 15,  //f
        LCD_PRINT: 16,  //g
        LCD_CLEAR: 17,  //h
        MPU: 18,
        MOTOR: 19,
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
        TIME_100ms: 1000,
    },
    BlockState: {},
    monitorTemplate: {
        imgPath: 'hw/rauf_nano.png',
        width: 605,
        height: 434,
        listPorts: {
            'accelX': { name: 'accelX', type: 'input', pos: { x: 0, y: 0 } },
            'accelY': { name: 'accelY', type: 'input', pos: { x: 0, y: 0 } },
            'accelZ': { name: 'accelZ', type: 'input', pos: { x: 0, y: 0 } },
            'gyroX': { name: 'gyroX', type: 'input', pos: { x: 0, y: 0 } },
            'gyroY': { name: 'gyroY', type: 'input', pos: { x: 0, y: 0 } },
            'gyroZ': { name: 'gyroZ', type: 'input', pos: { x: 0, y: 0 } },
        },
        ports: {
            'a0': { name: 'IN1', type: 'input', pos: { x: 130, y: 280 } },
            'a1': { name: 'IN2', type: 'input', pos: { x: 130, y: 325 } },
            'a2': { name: 'IN3', type: 'input', pos: { x: 130, y: 370 } },
            'a3': { name: 'Pot', type: 'input', pos: { x: 310, y: 350 } },
            'a6': { name: 'JoyX', type: 'input', pos: { x: 480, y: 325 } },
            'a7': { name: 'JoyY', type: 'input', pos: { x: 480, y: 375 } },
            '11': { name: 'OUT1', type: 'output', pos: { x: 130, y: 60 } },
            '12': { name: 'OUT2', type: 'output', pos: { x: 130, y: 105 } },
            '13': { name: 'OUT3', type: 'output', pos: { x: 130, y: 150 } },
            '4': { name: 'LED R', type: 'output', pos: { x: 310, y: 145 } },
            '3': { name: 'LED Y', type: 'output', pos: { x: 310, y: 200 } },
            '2': { name: 'LED G', type: 'output', pos: { x: 310, y: 255 } },
            '7': { name: 'Buzzer', type: 'output', pos: { x: 420, y: 165 } },
            '5': { name: 'Motor1', type: 'output', pos: { x: 535, y: 65 } },
            '6': { name: 'Motor2', type: 'output', pos: { x: 535, y: 120 } },
        },
        mode: 'both',
    },
};

Entry.ArduinoNanoExt.setLanguage = function () {
    return {
        ko: {
            template: {
                // Header
                arduino_nano_ext_sensor_title: '센서',
                arduino_nano_ext_led_title: 'LED',
                arduino_nano_ext_buzzer_title: '버저',
                arduino_nano_ext_output_title: '출력',
                arduino_nano_ext_motor_title: '회전모터',

                // Sensor
                arduino_nano_ext_get_sensor_value: '%1 센서값',
                arduino_nano_ext_get_potentiometer: '가변저항 센서값',
                arduino_nano_ext_get_joystick_value: '조이스틱 %1 축 센서값',
                arduino_nano_ext_get_joystick_button: '조이스틱 버튼을 눌렀는가?',
                arduino_nano_ext_get_mpu6050_value: 'MPU6050 %1 축 %2 값',

                // LED
                arduino_nano_ext_set_led: '%1 LED %2 %3',

                // Buzzer
                arduino_nano_ext_set_buzzer: '버저를 %1 옥타브, %2 음으로 %3 초 연주하기 %4',
                arduino_nano_ext_stop_buzzer: '버저 멈추기 %1',

                // Output
                arduino_nano_ext_set_output: '%1 에 %2 값 출력하기 %3',

                // Motor
                arduino_nano_ext_set_motor: '%1 모터를 %2 방향 %3 속도로 %4 회전하기 %5',
                arduino_nano_ext_stop_motor: '%1 모터 멈추기 %2',
            },
            Blocks: {
                arduino_nano_ext_joystick_x: 'X',
                arduino_nano_ext_joystick_y: 'Y',
                arduino_nano_ext_motor1: '1번(왼쪽)',
                arduino_nano_ext_motor2: '2번(오른쪽)',
                arduino_nano_ext_motor_fw: '정',
                arduino_nano_ext_motor_bw: '역',
                arduino_nano_ext_led_green: '초록',
                arduino_nano_ext_led_yellow: '노랑',
                arduino_nano_ext_led_red: '빨강',
                arduino_nano_ext_mpu_accel: '가속도',
                arduino_nano_ext_mpu_gyro: '자이로',
                arduino_nano_ext_duration_cont: '계속',
                arduino_nano_ext_duration_1s: '1초',
                arduino_nano_ext_duration_2s: '2초',
                arduino_nano_ext_duration_3s: '3초',
                arduino_nano_ext_duration_4s: '4초',
                arduino_nano_ext_duration_5s: '5초',
                arduino_nano_ext_duration_6s: '6초',
                arduino_nano_ext_duration_7s: '7초',
                arduino_nano_ext_duration_8s: '8초',
                arduino_nano_ext_duration_9s: '9초',
            }
        },
        en: {
            template: {
                // Header
                arduino_nano_ext_sensor_title: 'Sensor',
                arduino_nano_ext_led_title: 'LED',
                arduino_nano_ext_buzzer_title: 'Buzzer',
                arduino_nano_ext_output_title: 'Output',
                arduino_nano_ext_motor_title: 'Motor',

                // Sensor
                arduino_nano_ext_get_sensor_value: '%1 sensor value',
                arduino_nano_ext_get_potentiometer: 'potentiometer value',
                arduino_nano_ext_get_joystick_value: 'joystick %1 axis value',
                arduino_nano_ext_get_joystick_button: 'is joystick button pressed?',
                arduino_nano_ext_get_mpu6050_value: 'MPU6050 %1 axis %2 value',

                // LED
                arduino_nano_ext_set_led: 'Set %1 LED %2 %3',

                // Buzzer
                arduino_nano_ext_set_buzzer: 'Play %1 octave, %2 note on buzzer for %3 sec %4',
                arduino_nano_ext_stop_buzzer: 'Stop buzzer %1',

                // Output
                arduino_nano_ext_set_output: 'Output %2 to %1 %3',

                // Motor
                arduino_nano_ext_set_motor: 'Set motor %1 direction %2 speed %3 for %4 %5',
                arduino_nano_ext_stop_motor: 'Stop motor %1 %2',
            },
            Blocks: {
                arduino_nano_ext_joystick_x: 'X',
                arduino_nano_ext_joystick_y: 'Y',
                arduino_nano_ext_motor1: '1(Left)',
                arduino_nano_ext_motor2: '2(Right)',
                arduino_nano_ext_motor_fw: 'FW',
                arduino_nano_ext_motor_bw: 'BW',
                arduino_nano_ext_led_green: 'Green',
                arduino_nano_ext_led_yellow: 'Yellow',
                arduino_nano_ext_led_red: 'Red',
                arduino_nano_ext_mpu_accel: 'Accel',
                arduino_nano_ext_mpu_gyro: 'Gyro',
                arduino_nano_ext_duration_cont: 'cont.',
                arduino_nano_ext_duration_1s: '1s',
                arduino_nano_ext_duration_2s: '2s',
                arduino_nano_ext_duration_3s: '3s',
                arduino_nano_ext_duration_4s: '4s',
                arduino_nano_ext_duration_5s: '5s',
                arduino_nano_ext_duration_6s: '6s',
                arduino_nano_ext_duration_7s: '7s',
                arduino_nano_ext_duration_8s: '8s',
                arduino_nano_ext_duration_9s: '9s',
            }
        },
        ru: {
            template: {
                // Header
                arduino_nano_ext_sensor_title: 'Сенсор',
                arduino_nano_ext_led_title: 'LED',
                arduino_nano_ext_buzzer_title: 'Пищалка',
                arduino_nano_ext_output_title: 'Вывод',
                arduino_nano_ext_motor_title: 'Мотор',

                // Sensor
                arduino_nano_ext_get_sensor_value: 'значение сенсора %1',
                arduino_nano_ext_get_potentiometer: 'значение потенциометра',
                arduino_nano_ext_get_joystick_value: 'значение оси %1 джойстика',
                arduino_nano_ext_get_joystick_button: 'нажата ли кнопка джойстика?',
                arduino_nano_ext_get_mpu6050_value: 'MPU6050 ось %1 %2 значение',

                // LED
                arduino_nano_ext_set_led: 'установить %1 LED %2 %3',

                // Buzzer
                arduino_nano_ext_set_buzzer: 'играть на пищалке %1 октаву, %2 ноту в течение %3 сек %4',
                arduino_nano_ext_stop_buzzer: 'остановить пищалку %1',

                // Output
                arduino_nano_ext_set_output: 'вывести значение %2 на %1 %3',

                // Motor
                arduino_nano_ext_set_motor: 'вращать мотор %1 направление %2 скорость %3 в течение %4 %5',
                arduino_nano_ext_stop_motor: 'остановить мотор %1 %2',
            },
            Blocks: {
                arduino_nano_ext_joystick_x: 'X',
                arduino_nano_ext_joystick_y: 'Y',
                arduino_nano_ext_motor1: '1(Левый)',
                arduino_nano_ext_motor2: '2(Правый)',
                arduino_nano_ext_motor_fw: 'Вперёд',
                arduino_nano_ext_motor_bw: 'Назад',
                arduino_nano_ext_led_green: 'Зелёный',
                arduino_nano_ext_led_yellow: 'Жёлтый',
                arduino_nano_ext_led_red: 'Красный',
                arduino_nano_ext_mpu_accel: 'Ускорение',
                arduino_nano_ext_mpu_gyro: 'Гироскоп',
                arduino_nano_ext_duration_cont: 'постоянно',
                arduino_nano_ext_duration_1s: '1 сек',
                arduino_nano_ext_duration_2s: '2 сек',
                arduino_nano_ext_duration_3s: '3 сек',
                arduino_nano_ext_duration_4s: '4 сек',
                arduino_nano_ext_duration_5s: '5 сек',
                arduino_nano_ext_duration_6s: '6 сек',
                arduino_nano_ext_duration_7s: '7 сек',
                arduino_nano_ext_duration_8s: '8 сек',
                arduino_nano_ext_duration_9s: '9 сек',
            }
        },
        uz: {
            template: {
                // Header
                arduino_nano_ext_sensor_title: 'Sensor',
                arduino_nano_ext_led_title: 'LED',
                arduino_nano_ext_buzzer_title: 'Buzzer',
                arduino_nano_ext_output_title: 'Chiqarish',
                arduino_nano_ext_motor_title: 'Motor',

                // Sensor
                arduino_nano_ext_get_sensor_value: '%1 sensor qiymati',
                arduino_nano_ext_get_potentiometer: 'potentiometr qiymati',
                arduino_nano_ext_get_joystick_value: 'joystick %1 o\'qi qiymati',
                arduino_nano_ext_get_joystick_button: 'joystick tugmasi bosildimi?',
                arduino_nano_ext_get_mpu6050_value: 'MPU6050 %1 o\'qi %2 qiymati',

                // LED
                arduino_nano_ext_set_led: '%1 LEDni %2 %3 holatga sozlash',

                // Buzzer
                arduino_nano_ext_set_buzzer: 'buzzerni %1 oktava, %2 nota bilan %3 soniya yangratish %4',
                arduino_nano_ext_stop_buzzer: 'buzzerni to\'xtatish %1',

                // Output
                arduino_nano_ext_set_output: '%1 ga %2 qiymatini chiqarish %3',

                // Motor
                arduino_nano_ext_set_motor: '%1 motorni %2 yo\'nalishi %3 tezligi bilan %4 davomida aylantirish %5',
                arduino_nano_ext_stop_motor: '%1 motorni to\'xtatish %2',
            },
            Blocks: {
                arduino_nano_ext_joystick_x: 'X',
                arduino_nano_ext_joystick_y: 'Y',
                arduino_nano_ext_motor1: '1(Chap)',
                arduino_nano_ext_motor2: '2(O\'ng)',
                arduino_nano_ext_motor_fw: 'To\'g\'ri',
                arduino_nano_ext_motor_bw: 'Orqa',
                arduino_nano_ext_led_green: 'Yashil',
                arduino_nano_ext_led_yellow: 'Sariq',
                arduino_nano_ext_led_red: 'Qizil',
                arduino_nano_ext_mpu_accel: 'Tezlanish',
                arduino_nano_ext_mpu_gyro: 'Giroскоп',
                arduino_nano_ext_duration_cont: 'davomli',
                arduino_nano_ext_duration_1s: '1 soniya',
                arduino_nano_ext_duration_2s: '2 soniya',
                arduino_nano_ext_duration_3s: '3 soniya',
                arduino_nano_ext_duration_4s: '4 soniya',
                arduino_nano_ext_duration_5s: '5 soniya',
                arduino_nano_ext_duration_6s: '6 soniya',
                arduino_nano_ext_duration_7s: '7 soniya',
                arduino_nano_ext_duration_8s: '8 soniya',
                arduino_nano_ext_duration_9s: '9 soniya',
            }
        },
    };
};

Entry.ArduinoNanoExt.blockMenuBlocks = [
    // sensor
    'arduino_nano_ext_sensor_title',
    'arduino_nano_ext_get_sensor_value',
    'arduino_nano_ext_get_potentiometer',
    'arduino_nano_ext_get_joystick_value',
    'arduino_nano_ext_get_joystick_button',
    'arduino_nano_ext_get_mpu6050_value',

    // led
    'arduino_nano_ext_led_title',
    'arduino_nano_ext_set_led',

    // motor
    'arduino_nano_ext_motor_title',
    'arduino_nano_ext_set_motor',
    'arduino_nano_ext_stop_motor',

    // buzzer
    'arduino_nano_ext_buzzer_title',
    'arduino_nano_ext_set_buzzer',
    'arduino_nano_ext_stop_buzzer',

    // output
    'arduino_nano_ext_output_title',
    'arduino_nano_ext_set_output',
];

//region arduinoNanoExt 아두이노 확장모드
Entry.ArduinoNanoExt.getBlocks = function () {
    return {
        // Headers
        arduino_nano_ext_sensor_title: {
            color: EntryStatic.colorSet.common.TRANSPARENT,
            fontColor: '#191970',
            skeleton: 'basic_text',
            skeletonOptions: {
                contentPos: { x: 5 },
            },
            params: [
                {
                    type: 'Text',
                    text: Lang.template.arduino_nano_ext_sensor_title,
                    color: '#191970',
                    align: 'left',
                },
            ],
            def: { type: 'arduino_nano_ext_sensor_title' },
            class: 'ArduinoNanoExtSensor',
            isNotFor: ['ArduinoNanoExt'],
            events: {},
        },
        arduino_nano_ext_led_title: {
            color: EntryStatic.colorSet.common.TRANSPARENT,
            fontColor: '#191970',
            skeleton: 'basic_text',
            skeletonOptions: {
                contentPos: { x: 5 },
            },
            params: [
                {
                    type: 'Text',
                    text: Lang.template.arduino_nano_ext_led_title,
                    color: '#191970',
                    align: 'left',
                },
            ],
            def: { type: 'arduino_nano_ext_led_title' },
            class: 'ArduinoNanoExtLed',
            isNotFor: ['ArduinoNanoExt'],
            events: {},
        },
        arduino_nano_ext_buzzer_title: {
            color: EntryStatic.colorSet.common.TRANSPARENT,
            fontColor: '#191970',
            skeleton: 'basic_text',
            skeletonOptions: {
                contentPos: { x: 5 },
            },
            params: [
                {
                    type: 'Text',
                    text: Lang.template.arduino_nano_ext_buzzer_title,
                    color: '#191970',
                    align: 'left',
                },
            ],
            def: { type: 'arduino_nano_ext_buzzer_title' },
            class: 'ArduinoNanoExtBuzzer',
            isNotFor: ['ArduinoNanoExt'],
            events: {},
        },
        arduino_nano_ext_output_title: {
            color: EntryStatic.colorSet.common.TRANSPARENT,
            fontColor: '#191970',
            skeleton: 'basic_text',
            skeletonOptions: {
                contentPos: { x: 5 },
            },
            params: [
                {
                    type: 'Text',
                    text: Lang.template.arduino_nano_ext_output_title,
                    color: '#191970',
                    align: 'left',
                },
            ],
            def: { type: 'arduino_nano_ext_output_title' },
            class: 'ArduinoNanoExtOutput',
            isNotFor: ['ArduinoNanoExt'],
            events: {},
        },
        arduino_nano_ext_motor_title: {
            color: EntryStatic.colorSet.common.TRANSPARENT,
            fontColor: '#191970',
            skeleton: 'basic_text',
            skeletonOptions: {
                contentPos: { x: 5 },
            },
            params: [
                {
                    type: 'Text',
                    text: Lang.template.arduino_nano_ext_motor_title,
                    color: '#191970',
                    align: 'left',
                },
            ],
            def: { type: 'arduino_nano_ext_motor_title' },
            class: 'ArduinoNanoExtMotor',
            isNotFor: ['ArduinoNanoExt'],
            events: {},
        },

        // Sensor blocks
        arduino_nano_ext_get_sensor_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['IN1', '0'],
                        ['IN2', '1'],
                        ['IN3', '2'],
                    ],
                    value: '0',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            def: { params: [null], type: 'arduino_nano_ext_get_sensor_value' },
            paramsKeyMap: { PORT: 0 },
            class: 'ArduinoNanoExtSensor',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const port = script.getField('PORT');
                if (!Entry.hw.sendQueue.GET) Entry.hw.sendQueue.GET = {};
                Entry.hw.sendQueue.GET[Entry.ArduinoNanoExt.sensorTypes.ANALOG] = {
                    port,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData[`a${port}`] || 0;
            },
        },
        arduino_nano_ext_get_potentiometer: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            params: [],
            def: { type: 'arduino_nano_ext_get_potentiometer' },
            class: 'ArduinoNanoExtSensor',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const port = '3'; // A3
                if (!Entry.hw.sendQueue.GET) Entry.hw.sendQueue.GET = {};
                Entry.hw.sendQueue.GET[Entry.ArduinoNanoExt.sensorTypes.ANALOG] = {
                    port,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData[`a${port}`] || 0;
            },
        },
        arduino_nano_ext_get_joystick_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.arduino_nano_ext_joystick_x, '6'],
                        [Lang.Blocks.arduino_nano_ext_joystick_y, '7'],
                    ],
                    value: '6',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            def: { params: [null], type: 'arduino_nano_ext_get_joystick_value' },
            paramsKeyMap: { AXIS: 0 },
            class: 'ArduinoNanoExtSensor',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const port = script.getField('AXIS');
                if (!Entry.hw.sendQueue.GET) Entry.hw.sendQueue.GET = {};
                Entry.hw.sendQueue.GET[Entry.ArduinoNanoExt.sensorTypes.ANALOG] = {
                    port,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData[`a${port}`] || 0;
            },
        },
        arduino_nano_ext_get_joystick_button: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_boolean_field',
            params: [],
            def: { type: 'arduino_nano_ext_get_joystick_button' },
            class: 'ArduinoNanoExtSensor',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const port = '8'; // D8
                if (!Entry.hw.sendQueue.GET) Entry.hw.sendQueue.GET = {};
                Entry.hw.sendQueue.GET[Entry.ArduinoNanoExt.sensorTypes.DIGITAL] = {
                    port,
                    time: new Date().getTime(),
                };
                return Entry.hw.portData[port] || 0;
            },
        },
        arduino_nano_ext_get_mpu6050_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#fff',
            skeleton: 'basic_string_field',
            params: [
                {
                    type: 'Dropdown',
                    options: [['X', 'X'], ['Y', 'Y'], ['Z', 'Z']],
                    value: 'X',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.arduino_nano_ext_mpu_accel, 'accel'],
                        [Lang.Blocks.arduino_nano_ext_mpu_gyro, 'gyro'],
                    ],
                    value: 'accel',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            def: { params: [null, null], type: 'arduino_nano_ext_get_mpu6050_value' },
            paramsKeyMap: { AXIS: 0, TYPE: 1 },
            class: 'ArduinoNanoExtSensor',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const axis = script.getField('AXIS');
                const type = script.getField('TYPE');
                const key = `${type}${axis}`; // accelX, gyroY etc.

                if (!Entry.hw.sendQueue.GET) Entry.hw.sendQueue.GET = {};
                Entry.hw.sendQueue.GET[Entry.ArduinoNanoExt.sensorTypes.MPU] = {
                    time: new Date().getTime(),
                };

                return Entry.hw.portData[key] || 0;
            },
        },

        // LED blocks
        arduino_nano_ext_set_led: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.arduino_nano_ext_led_green, '2'],
                        [Lang.Blocks.arduino_nano_ext_led_yellow, '3'],
                        [Lang.Blocks.arduino_nano_ext_led_red, '4'],
                    ],
                    value: '2',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.ARDUINO_on, 'on'],
                        [Lang.Blocks.ARDUINO_off, 'off'],
                    ],
                    value: 'on',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            def: { params: [null, null, null], type: 'arduino_nano_ext_set_led' },
            paramsKeyMap: { PORT: 0, VALUE: 1 },
            class: 'ArduinoNanoExtLed',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const port = script.getField('PORT');
                const value = script.getField('VALUE') === 'on' ? 255 : 0;
                if (!Entry.hw.sendQueue.SET) Entry.hw.sendQueue.SET = {};
                Entry.hw.sendQueue.SET[port] = {
                    type: Entry.ArduinoNanoExt.sensorTypes.DIGITAL,
                    data: value,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
        },

        // Motor blocks
        arduino_nano_ext_set_motor: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.arduino_nano_ext_motor1, '1'],
                        [Lang.Blocks.arduino_nano_ext_motor2, '2'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.arduino_nano_ext_motor_fw, 'fw'],
                        [Lang.Blocks.arduino_nano_ext_motor_bw, 'bw'],
                    ],
                    value: 'fw',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                    defaultType: 'number',
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.arduino_nano_ext_duration_cont, 'cont'],
                        [Lang.Blocks.arduino_nano_ext_duration_1s, '1'],
                        [Lang.Blocks.arduino_nano_ext_duration_2s, '2'],
                        [Lang.Blocks.arduino_nano_ext_duration_3s, '3'],
                        [Lang.Blocks.arduino_nano_ext_duration_4s, '4'],
                        [Lang.Blocks.arduino_nano_ext_duration_5s, '5'],
                        [Lang.Blocks.arduino_nano_ext_duration_6s, '6'],
                        [Lang.Blocks.arduino_nano_ext_duration_7s, '7'],
                        [Lang.Blocks.arduino_nano_ext_duration_8s, '8'],
                        [Lang.Blocks.arduino_nano_ext_duration_9s, '9'],
                    ],
                    value: 'cont',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            def: {
                params: [
                    null,
                    null,
                    { type: 'number', params: ['255'] },
                    null,
                    null
                ],
                type: 'arduino_nano_ext_set_motor',
            },
            paramsKeyMap: { MOTOR: 0, DIR: 1, SPEED: 2, DURATION: 3 },
            class: 'ArduinoNanoExtMotor',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                if (!script.isStart) {
                    const motor = script.getField('MOTOR');
                    const dir = script.getField('DIR');
                    let speed = script.getNumberValue('SPEED');
                    speed = Math.max(0, Math.min(255, speed));
                    let duration = script.getField('DURATION');

                    const dirValue = dir === 'fw' ? 0 : 1;
                    const combinedData = (dirValue << 8) | speed;

                    if (!Entry.hw.sendQueue.SET) Entry.hw.sendQueue.SET = {};
                    Entry.hw.sendQueue.SET[motor] = {
                        type: Entry.ArduinoNanoExt.sensorTypes.MOTOR,
                        data: combinedData,
                        time: new Date().getTime(),
                    };

                    if (duration !== 'cont' && !isNaN(duration) && Number(duration) > 0) {
                        script.isStart = true;
                        script.timeFlag = 1;
                        setTimeout(() => {
                            if (!Entry.hw.sendQueue.SET) Entry.hw.sendQueue.SET = {};
                            Entry.hw.sendQueue.SET[motor] = {
                                type: Entry.ArduinoNanoExt.sensorTypes.MOTOR,
                                data: 0,
                                time: new Date().getTime(),
                            };
                            script.timeFlag = 0;
                        }, Number(duration) * 1000);
                        return script;
                    } else {
                        return script.callReturn();
                    }
                } else if (script.timeFlag === 1) {
                    return script;
                } else {
                    delete script.isStart;
                    delete script.timeFlag;
                    return script.callReturn();
                }
            },
        },
        arduino_nano_ext_stop_motor: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.arduino_nano_ext_motor1, '1'],
                        [Lang.Blocks.arduino_nano_ext_motor2, '2'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            def: { params: [null, null], type: 'arduino_nano_ext_stop_motor' },
            paramsKeyMap: { MOTOR: 0 },
            class: 'ArduinoNanoExtMotor',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const motor = script.getField('MOTOR');
                if (!Entry.hw.sendQueue.SET) Entry.hw.sendQueue.SET = {};
                Entry.hw.sendQueue.SET[motor] = {
                    type: Entry.ArduinoNanoExt.sensorTypes.MOTOR,
                    data: 0,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
        },

        // Buzzer blocks
        arduino_nano_ext_set_buzzer: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
                        ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'],
                    ],
                    value: '4',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['무음', '0'], ['도', 'C'], ['도#', 'CS'], ['레', 'D'], ['레#', 'DS'],
                        ['미', 'E'], ['파', 'F'], ['파#', 'FS'], ['솔', 'G'], ['솔#', 'GS'],
                        ['라', 'A'], ['라#', 'AS'], ['시', 'B'],
                    ],
                    value: 'C',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
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
            def: {
                params: [null, null, { type: 'number', params: ['1'] }, null],
                type: 'arduino_nano_ext_set_buzzer',
            },
            paramsKeyMap: { OCTAVE: 0, NOTE: 1, DURATION: 2 },
            class: 'ArduinoNanoExtBuzzer',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                if (!script.isStart) {
                    const port = '7'; // D7
                    const octave = script.getField('OCTAVE');
                    const note = script.getField('NOTE');
                    const duration = script.getNumberValue('DURATION');

                    if (!Entry.hw.sendQueue.SET) Entry.hw.sendQueue.SET = {};

                    if (note === '0') {
                        Entry.hw.sendQueue.SET[port] = {
                            type: Entry.ArduinoNanoExt.sensorTypes.TONE,
                            data: 0,
                            time: new Date().getTime(),
                        };
                    } else {
                        Entry.hw.sendQueue.SET[port] = {
                            type: Entry.ArduinoNanoExt.sensorTypes.TONE,
                            data: {
                                value: Entry.ArduinoNanoExt.toneMap[Entry.ArduinoNanoExt.toneTable[note]][octave - 1],
                                duration: duration * 1000,
                            },
                            time: new Date().getTime(),
                        };
                    }

                    script.isStart = true;
                    script.timeFlag = 1;
                    setTimeout(() => {
                        script.timeFlag = 0;
                    }, duration * 1000);
                    return script;
                } else if (script.timeFlag === 1) {
                    return script;
                } else {
                    delete script.isStart;
                    delete script.timeFlag;
                    return script.callReturn();
                }
            },
        },
        arduino_nano_ext_stop_buzzer: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            params: [
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            def: { params: [null, null], type: 'arduino_nano_ext_stop_buzzer' },
            class: 'ArduinoNanoExtBuzzer',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const port = '7'; // D7
                if (!Entry.hw.sendQueue.SET) Entry.hw.sendQueue.SET = {};
                Entry.hw.sendQueue.SET[port] = {
                    type: Entry.ArduinoNanoExt.sensorTypes.TONE,
                    data: 0,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
        },

        // Output blocks
        arduino_nano_ext_set_output: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            params: [
                {
                    type: 'Dropdown',
                    options: [['OUT1', '11'], ['OUT2', '12'], ['OUT3', '13']],
                    value: '11',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
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
            def: {
                params: [null, { type: 'number', params: ['255'] }, null],
                type: 'arduino_nano_ext_set_output',
            },
            paramsKeyMap: { PORT: 0, VALUE: 1 },
            class: 'ArduinoNanoExtOutput',
            isNotFor: ['ArduinoNanoExt'],
            func(sprite, script) {
                const port = script.getField('PORT');
                let value = script.getNumberValue('VALUE');
                value = Math.max(0, Math.min(255, value));
                if (!Entry.hw.sendQueue.SET) Entry.hw.sendQueue.SET = {};
                Entry.hw.sendQueue.SET[port] = {
                    type: Entry.ArduinoNanoExt.sensorTypes.PWM,
                    data: value,
                    time: new Date().getTime(),
                };
                return script.callReturn();
            },
        },
    };
};

module.exports = Entry.ArduinoNanoExt;
