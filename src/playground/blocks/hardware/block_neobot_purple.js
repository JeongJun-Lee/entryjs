'use strict';

Entry.NeobotPurple = {
    id: '5.5',
    name: 'neosoco',
    url: 'http://www.neobot.co.kr',
    imageName: 'neobot_purple.png',
    title: {
        ko: '네오쏘코',
        en: 'NEO SoCo',
        uz: 'NEO SoCo',
        ru: 'NEO SoCo'
    },
    LOCAL_MAP: ['IN1', 'IN2', 'IN3', 'IR', 'BAT'],
    REMOTE_MAP: ['OUT1', 'OUT2', 'OUT3', 'DCR', 'DCL', 'SND', 'FND', 'OPT'],
    setZero: function() {
        for (var port in Entry.NeobotPurple.REMOTE_MAP) {
            Entry.hw.sendQueue[Entry.NeobotPurple.REMOTE_MAP[port]] = 0;
        }
        Entry.hw.update();
    },
    monitorTemplate: {
        imgPath: 'hw/neobot_purple.png',
        width: 700,
        height: 700,
        listPorts: {
            IR: { name: 'IR', type: 'input', pos: { x: 0, y: 0 } },
            BAT: { name: 'BAT', type: 'input', pos: { x: 0, y: 0 } },
            SND: { name: 'SND', type: 'output', pos: { x: 0, y: 0 } },
            FND: { name: 'FND', type: 'output', pos: { x: 0, y: 0 } },
        },
        ports: {
            IN1: { name: 'IN1', type: 'input', pos: { x: 270, y: 170 } },
            IN2: { name: 'IN2', type: 'input', pos: { x: 325, y: 170 } },
            IN3: { name: 'IN3', type: 'input', pos: { x: 325, y: 530 } },
            DCL: { name: 'L-Motor', type: 'output', pos: { x: 270, y: 530 } },
            DCR: { name: 'R-Motor', type: 'output', pos: { x: 435, y: 530 } },
            OUT1: { name: 'OUT1', type: 'output', pos: { x: 380, y: 170 } },
            OUT2: { name: 'OUT2', type: 'output', pos: { x: 435, y: 170 } },
            OUT3: { name: 'OUT3', type: 'output', pos: { x: 380, y: 530 } },
        },
        mode: 'both',
    },
    log_to_console: false,
};

Entry.NeobotPurple.setLanguage = function() {
    return {
        ko: {
            template: {
                // sensor
                neobot_purple_sensor_value: '%1',
                neobot_purple_sensor_convert_scale: '%1 %2 ~ %3 를 %4 ~ %5 으로 변환',

                // decision
                neobot_purple_decision_sensor_is_over: '%1 %2 %3',
                neobot_purple_decision_equal_with_sensor: '%1 컬러가 %2',
                neobot_purple_decision_sensor_angle: '%1 각도 %2 %3',

                // remote
                neobot_purple_remote_button: '리모컨 버튼 %1 을 누름',

                // LED
                // neobot_purple_arg_led_duration: '%1',
                neobot_purple_led_on: 'LED 켜기   %1 %2 %3 %4',
                neobot_purple_output_led_off: '%1 LED 끄기 %2',
                neobot_purple_led_brightness_with_sensor: '%1 로 %2 LED 제어 %3',
                neobot_purple_color_led_on: '%1 컬러LED 켜기   R %2 G %3 B %4 %5',

                // output
                neobot_purple_set_output: '%1 에 %2 값 출력하기 %3',

                // motor
                neobot_purple_robot: '로봇 %1 %2',
                neobot_purple_motor_start: '모터 회전하기   %1 %2 %3 %4 %5',
                neobot_purple_motor_stop: '%1 모터 멈추기 %2',
                // neobot_purple_arg_motor_speed: '%1',
                // neobot_purple_arg_motor_duration: '%1',

                // melody
                neobot_purple_play_note_for: '버저 울리기   옥타브: %2 음: %1 길이: %3 %4',
                neobot_purple_melody_play_with_sensor: '%1 센서로 버저 울리기 %2',
                neobot_purple_melody_stop: '버저 멈추기 %1',

                // servo
                // get_servo_degree: '%1',
                neobot_purple_servo_init: '%1 서보모터 리셋 %2',
                neobot_purple_servo_rotate: '서보모터 회전하기   %1 %2 %3 %4',
                neobot_purple_servo_stop: '%1 서보모터 멈추기 %2',
                neobot_purple_servo_change_degree: '서보모터 각도 바꾸기   %1 %2 %3 %4 %5',
            },
            Blocks: {
                //for dropdown
                neobot_purple_port_1: 'IN1',
                neobot_purple_port_2: 'IN2',
                neobot_purple_port_3: 'IN3',
                neobot_purple_port_4: 'IN4',
                neobot_purple_port_12: 'IN1 & IN2',
                neobot_purple_port_bat: '배터리',
                neobot_purple_port_remot: '리모컨',
                neobot_purple_color_white: '흰색',
                neobot_purple_color_red: '빨강',
                neobot_purple_color_yellow: '노랑',
                neobot_purple_color_green: '녹색',
                neobot_purple_color_blue: '파랑',
                neobot_purple_direction_forward: '앞으로',
                neobot_purple_direction_backward: '뒤로',
                neobot_purple_sound_silent: '무음',
                neobot_purple_sound_do: '도',
                neobot_purple_sound_do_shop: '도#',
                neobot_purple_sound_re: '레',
                neobot_purple_sound_re_shop: '레#',
                neobot_purple_sound_mi: '미',
                neobot_purple_sound_fa: '파',
                neobot_purple_sound_fa_shop: '파#',
                neobot_purple_sound_so: '솔',
                neobot_purple_sound_so_shop: '솔#',
                neobot_purple_sound_la: '라',
                neobot_purple_sound_la_shop: '라#',
                neobot_purple_sound_ti: '시',
                neobot_purple_sound_half_note: '2분 음표',
                neobot_purple_sound_quarter_note: '4분 음표',
                neobot_purple_sound_eighth_note: '8분 음표',
                neobot_purple_sound_sixteenth_note: '16분 음표',
                neobot_purple_sensor_infrared: '적외선센서',
                neobot_purple_sensor_light: '빛센서',
                neobot_purple_sensor_sound: '소리센서',
                neobot_purple_compare_symbol1: '＝',
                neobot_purple_compare_symbol2: '＞',
                neobot_purple_compare_symbol3: '＜',
                neobot_purple_compare_symbol4: '≥',
                neobot_purple_compare_symbol5: '≤',
                neobot_purple_remote_btn_a: 'A',
                neobot_purple_remote_btn_b: 'B',
                neobot_purple_remote_btn_c: 'C',
                neobot_purple_remote_btn_d: 'D',
                neobot_purple_remote_btn_1: '1',
                neobot_purple_remote_btn_2: '2',
                neobot_purple_remote_btn_3: '3',
                neobot_purple_remote_btn_4: '4',
                neobot_purple_remote_btn_up: '▲',
                neobot_purple_remote_btn_down: '▼',
                neobot_purple_remote_btn_left: '◀',
                neobot_purple_remote_btn_right: '▶',
                neobot_purple_duration_cont: '계속',
                neobot_purple_duration_1s: '1초',
                neobot_purple_duration_2s: '2초',
                neobot_purple_duration_3s: '3초',
                neobot_purple_duration_4s: '4초',
                neobot_purple_duration_5s: '5초',
                neobot_purple_duration_6s: '6초',
                neobot_purple_duration_7s: '7초',
                neobot_purple_duration_8s: '8초',
                neobot_purple_duration_9s: '9초',
                neobot_purple_motor_both: '양쪽',
                neobot_purple_motor_left: '왼쪽',
                neobot_purple_motor_right: '오른쪽',
                neobot_purple_motor_move_forward: '전진',
                neobot_purple_motor_move_backward: '후진',
                neobot_purple_motor_move_left: '좌회전',
                neobot_purple_motor_move_right: '우회전',
                neobot_purple_motor_move_stop: '정지',

                neobot_purple_servo_dir_1: '정방향',
                neobot_purple_servo_dir_2: '역방향',

                neobot_purple_percent_10: '10%속도',
                neobot_purple_percent_20: '20%속도',
                neobot_purple_percent_30: '30%속도',
                neobot_purple_percent_40: '40%속도',
                neobot_purple_percent_50: '50%속도',
                neobot_purple_percent_60: '60%속도',
                neobot_purple_percent_70: '70%속도',
                neobot_purple_percent_80: '80%속도',
                neobot_purple_percent_90: '90%속도',
                neobot_purple_percent_100: '100%속도',

                neobot_purple_angle_0: '0도',
                neobot_purple_angle_5: '5도',
                neobot_purple_angle_10: '10도',
                neobot_purple_angle_15: '15도',
                neobot_purple_angle_20: '20도',
                neobot_purple_angle_25: '25도',
                neobot_purple_angle_30: '30도',
                neobot_purple_angle_35: '35도',
                neobot_purple_angle_40: '40도',
                neobot_purple_angle_45: '45도',
                neobot_purple_angle_50: '50도',
                neobot_purple_angle_55: '55도',
                neobot_purple_angle_60: '60도',
                neobot_purple_angle_65: '65도',
                neobot_purple_angle_70: '70도',
                neobot_purple_angle_75: '75도',
                neobot_purple_angle_80: '80도',
                neobot_purple_angle_85: '85도',
                neobot_purple_angle_90: '90도',
                neobot_purple_angle_95: '95도',
                neobot_purple_angle_100: '100도',
                neobot_purple_angle_105: '105도',
                neobot_purple_angle_110: '110도',
                neobot_purple_angle_115: '115도',
                neobot_purple_angle_120: '120도',
                neobot_purple_angle_125: '125도',
                neobot_purple_angle_130: '130도',
                neobot_purple_angle_135: '135도',
                neobot_purple_angle_140: '140도',
                neobot_purple_angle_145: '145도',
                neobot_purple_angle_150: '150도',
                neobot_purple_angle_155: '155도',
                neobot_purple_angle_160: '160도',
                neobot_purple_angle_165: '165도',
                neobot_purple_angle_170: '170도',
                neobot_purple_angle_175: '175도',
                neobot_purple_angle_180: '180도',

                neobot_purple_out_all: '모든',
                neobot_purple_direction_left: '왼쪽으로',
                neobot_purple_direction_right: '오른쪽으로',
            },
        },
        en: {
            // en.js에 작성하던 내용
            template: {
                // sensor
                neobot_purple_sensor_value: '%1',
                neobot_purple_sensor_convert_scale: '%1 \'s changed value   range: %2 ~ %3 conversion: %4 ~ %5',

                // decision
                neobot_purple_decision_sensor_is_over: '%1 %2 %3',
                neobot_purple_decision_equal_with_sensor: '%1 \'s color is %2',
                neobot_purple_decision_sensor_angle: '%1 angle %2 %3',

                // remote
                neobot_purple_remote_button: 'pressing button %1 of remote controller',

                // LED
                // neobot_purple_arg_led_duration: '%1',
                neobot_purple_led_on: 'Turn on the LED    %1 %2 %3 %4',
                neobot_purple_output_led_off: 'Turn off the %1 LED %2',
                neobot_purple_led_brightness_with_sensor: 'Control %2 LED\'s brightness with %1 sensor %3',
                neobot_purple_color_led_on: 'Turn on the %1 color LED   R %2 G %3 B %4 %5',

                // output
                neobot_purple_set_output: 'Output %2 value to %1 port %3',

                // motor
                neobot_purple_robot: 'Robot %1 %2',
                neobot_purple_motor_start: 'Motor operation   %1 %2 %3 %4 %5',
                neobot_purple_motor_stop: 'Stop the %1 motor(s) %2',
                // neobot_purple_arg_motor_speed: '%1',
                // neobot_purple_arg_motor_duration: '%1',

                // melody
                neobot_purple_play_note_for: 'Buzzer   octave: %1 scale: %2 note: %3 %4',
                neobot_purple_melody_play_with_sensor: 'Buzzer rings by %1 sensor value %2',
                neobot_purple_melody_stop: 'Stop the buzzer %1',

                // servo
                neobot_purple_servo_init: 'Reset the %1 servo motor %2',
                neobot_purple_servo_rotate: 'Rotate the servo motor   %1 %2 %3 %4',
                neobot_purple_servo_stop: 'Stop the %1 servo motor %2',
                neobot_purple_servo_change_degree: 'Change servo angle   %1 %2 %3 %4 %5',
            },
            Blocks: {
                //for dropdown
                neobot_purple_port_1: 'IN1',
                neobot_purple_port_2: 'IN2',
                neobot_purple_port_3: 'IN3',
                neobot_purple_port_4: 'IN4',
                neobot_purple_port_12: 'IN1 & IN2',
                neobot_purple_port_bat: 'battery',
                neobot_purple_port_remot: 'remote',
                neobot_purple_color_white: 'white',
                neobot_purple_color_red: 'red',
                neobot_purple_color_yellow: 'yellow',
                neobot_purple_color_green: 'green',
                neobot_purple_color_blue: 'blue',
                neobot_purple_direction_forward: 'forward',
                neobot_purple_direction_backward: 'backward',
                neobot_purple_sound_silent: 'silent',
                neobot_purple_sound_do: 'Do',
                neobot_purple_sound_do_shop: 'Do#',
                neobot_purple_sound_re: 'Re',
                neobot_purple_sound_re_shop: 'Re#',
                neobot_purple_sound_mi: 'Mi',
                neobot_purple_sound_fa: 'Fa',
                neobot_purple_sound_fa_shop: 'Fa#',
                neobot_purple_sound_so: 'So',
                neobot_purple_sound_so_shop: 'So#',
                neobot_purple_sound_la: 'La',
                neobot_purple_sound_la_shop: 'La#',
                neobot_purple_sound_ti: 'Si',
                neobot_purple_sound_half_note: 'a half note',
                neobot_purple_sound_quarter_note: 'a quarter note',
                neobot_purple_sound_eighth_note: 'a eighth note',
                neobot_purple_sound_sixteenth_note: 'a sixteenth note',
                neobot_purple_sensor_infrared: 'IR sensor',
                neobot_purple_sensor_light: 'light sensor',
                neobot_purple_sensor_sound: 'sound sensor',
                neobot_purple_compare_symbol1: '＝',
                neobot_purple_compare_symbol2: '＞',
                neobot_purple_compare_symbol3: '＜',
                neobot_purple_compare_symbol4: '≥',
                neobot_purple_compare_symbol5: '≤',
                neobot_purple_remote_btn_a: 'A',
                neobot_purple_remote_btn_b: 'B',
                neobot_purple_remote_btn_c: 'C',
                neobot_purple_remote_btn_d: 'D',
                neobot_purple_remote_btn_1: '1',
                neobot_purple_remote_btn_2: '2',
                neobot_purple_remote_btn_3: '3',
                neobot_purple_remote_btn_4: '4',
                neobot_purple_remote_btn_up: '▲',
                neobot_purple_remote_btn_down: '▼',
                neobot_purple_remote_btn_left: '◀',
                neobot_purple_remote_btn_right: '▶',
                neobot_purple_duration_cont: 'constantly',
                neobot_purple_duration_1s: '1 second',
                neobot_purple_duration_2s: '2 seconds',
                neobot_purple_duration_3s: '3 seconds',
                neobot_purple_duration_4s: '4 seconds',
                neobot_purple_duration_5s: '5 seconds',
                neobot_purple_duration_6s: '6 seconds',
                neobot_purple_duration_7s: '7 seconds',
                neobot_purple_duration_8s: '8 seconds',
                neobot_purple_duration_9s: '9 seconds',
                neobot_purple_motor_both: 'both',
                neobot_purple_motor_left: 'left',
                neobot_purple_motor_right: 'right',
                neobot_purple_motor_move_forward: 'go forward',
                neobot_purple_motor_move_backward: 'go backward',
                neobot_purple_motor_move_left: 'turn Left',
                neobot_purple_motor_move_right: 'turn Right',
                neobot_purple_motor_move_stop: 'stop',

                neobot_purple_servo_dir_1: 'forward',
                neobot_purple_servo_dir_2: 'backward',

                neobot_purple_percent_10: '10% speed',
                neobot_purple_percent_20: '20% speed',
                neobot_purple_percent_30: '30% speed',
                neobot_purple_percent_40: '40% speed',
                neobot_purple_percent_50: '50% speed',
                neobot_purple_percent_60: '60% speed',
                neobot_purple_percent_70: '70% speed',
                neobot_purple_percent_80: '80% speed',
                neobot_purple_percent_90: '90% speed',
                neobot_purple_percent_100: '100% speed',

                neobot_purple_angle_0: '0 degree',
                neobot_purple_angle_5: '5 degrees',
                neobot_purple_angle_10: '10 degrees',
                neobot_purple_angle_15: '15 degrees',
                neobot_purple_angle_20: '20 degrees',
                neobot_purple_angle_25: '25 degrees',
                neobot_purple_angle_30: '30 degrees',
                neobot_purple_angle_35: '35 degrees',
                neobot_purple_angle_40: '40 degrees',
                neobot_purple_angle_45: '45 degrees',
                neobot_purple_angle_50: '50 degrees',
                neobot_purple_angle_55: '55 degrees',
                neobot_purple_angle_60: '60 degrees',
                neobot_purple_angle_65: '65 degrees',
                neobot_purple_angle_70: '70 degrees',
                neobot_purple_angle_75: '75 degrees',
                neobot_purple_angle_80: '80 degrees',
                neobot_purple_angle_85: '85 degrees',
                neobot_purple_angle_90: '90 degrees',
                neobot_purple_angle_95: '95 degrees',
                neobot_purple_angle_100: '100 degrees',
                neobot_purple_angle_105: '105 degrees',
                neobot_purple_angle_110: '110 degrees',
                neobot_purple_angle_115: '115 degrees',
                neobot_purple_angle_120: '120 degrees',
                neobot_purple_angle_125: '125 degrees',
                neobot_purple_angle_130: '130 degrees',
                neobot_purple_angle_135: '135 degrees',
                neobot_purple_angle_140: '140 degrees',
                neobot_purple_angle_145: '145 degrees',
                neobot_purple_angle_150: '150 degrees',
                neobot_purple_angle_155: '155 degrees',
                neobot_purple_angle_160: '160 degrees',
                neobot_purple_angle_165: '165 degrees',
                neobot_purple_angle_170: '170 degrees',
                neobot_purple_angle_175: '175 degrees',
                neobot_purple_angle_180: '180degrees',

                neobot_purple_out_all: 'ALL',
                neobot_purple_direction_left: 'to the left',
                neobot_purple_direction_right: 'to the right',
            },
        },
        uz: {
            template: {
                // sensor
                neobot_purple_sensor_value: '%1', 
                neobot_purple_sensor_convert_scale: "%1 %2 ~ %3ni %4 ~ %5ga o'zgartirish", 

                // decision
                neobot_purple_decision_sensor_is_over: '%1 %2 %3',
                neobot_purple_decision_equal_with_sensor: '%1 rangi %2',
                neobot_purple_decision_sensor_angle: '%1 gradusi %2 %3',

                // remote
                neobot_purple_remote_button: 'Teleboshqarishning tugumasi %1 ni bosgan',

                // LED
                // neobot_purple_arg_led_duration: '%1',
                neobot_purple_led_on: 'LED yoqish: %1 %2 %3 %4',
                neobot_purple_output_led_off: "%1 LEDni o'chirish %2",
                neobot_purple_led_brightness_with_sensor: "%1 dan %2 LEDni boshqarish %3",
                neobot_purple_color_led_on: '%1 rangli LEDni yoqish: R %2 G %3 B %4 %5',

                // output
                neobot_purple_set_output: '%1 ga %2 qiymatini chiqarish %3',

                // motor
                neobot_purple_robot: 'Robot %1 %2',
                neobot_purple_motor_start: 'Motorni aylantirish: %1 %2 %3 %4 %5',
                neobot_purple_motor_stop: "%1 motorini to'xtatish %2",
                // neobot_purple_arg_motor_speed: '%1',
                // neobot_purple_arg_motor_duration: '%1',

                // melody
                neobot_purple_play_note_for: "Buzzer yangrash: %2 Oktava, %1 Tovush, %3 O'lchov %4",
                neobot_purple_melody_play_with_sensor: '%1 sensoridan buzzerni yangrash %2',
                neobot_purple_melody_stop: "Buzzerni to'xtatish %1",

                // servo
                // get_servo_degree: '%1',
                neobot_purple_servo_init: '%1 servo motorini nolga sozlash %2',
                neobot_purple_servo_rotate: 'Servo motorni aylantirish: %1 %2 %3 %4',
                neobot_purple_servo_stop: "%1 servo motorini to'xtatish %2",
                neobot_purple_servo_change_degree: "Servo motor gradusini o'zgartirish: %2 %3 %4 %1 %5",
            },
            Blocks: {
                //for dropdown
                neobot_purple_port_1: 'IN1',
                neobot_purple_port_2: 'IN2',
                neobot_purple_port_3: 'IN3',
                neobot_purple_port_4: 'IN4',
                neobot_purple_port_12: 'IN1 & IN2',
                neobot_purple_port_bat: 'Batareya',
                neobot_purple_port_remot: 'Teleboshqarish',
                neobot_purple_color_white: 'Oq',
                neobot_purple_color_red: 'Qizil',
                neobot_purple_color_yellow: 'Sariq',
                neobot_purple_color_green: 'Yasil',
                neobot_purple_color_blue: "Ko'k",
                neobot_purple_direction_forward: "Tog'ri",
                neobot_purple_direction_backward: 'Orqa',
                neobot_purple_sound_silent: 'Ovozsiz',
                neobot_purple_sound_do: 'Do',
                neobot_purple_sound_do_shop: 'Do#',
                neobot_purple_sound_re: 'Re',
                neobot_purple_sound_re_shop: 'Re#',
                neobot_purple_sound_mi: 'Mi',
                neobot_purple_sound_fa: 'Fa',
                neobot_purple_sound_fa_shop: 'Fa#',
                neobot_purple_sound_so: 'Sol',
                neobot_purple_sound_so_shop: 'Sol#',
                neobot_purple_sound_la: 'Lya',
                neobot_purple_sound_la_shop: 'Lya#',
                neobot_purple_sound_ti: 'Si',
                neobot_purple_sound_half_note: 'Yarim',
                neobot_purple_sound_quarter_note: 'Chorak',
                neobot_purple_sound_eighth_note: '1/8',
                neobot_purple_sound_sixteenth_note: '1/16',
                neobot_purple_sensor_infrared: 'IR sensor',
                neobot_purple_sensor_light: 'nur sensor',
                neobot_purple_sensor_sound: 'ovoz sensor',
                neobot_purple_compare_symbol1: '＝',
                neobot_purple_compare_symbol2: '＞',
                neobot_purple_compare_symbol3: '＜',
                neobot_purple_compare_symbol4: '≥',
                neobot_purple_compare_symbol5: '≤',
                neobot_purple_remote_btn_a: 'A',
                neobot_purple_remote_btn_b: 'B',
                neobot_purple_remote_btn_c: 'C',
                neobot_purple_remote_btn_d: 'D',
                neobot_purple_remote_btn_1: '1',
                neobot_purple_remote_btn_2: '2',
                neobot_purple_remote_btn_3: '3',
                neobot_purple_remote_btn_4: '4',
                neobot_purple_remote_btn_up: '▲',
                neobot_purple_remote_btn_down: '▼',
                neobot_purple_remote_btn_left: '◀',
                neobot_purple_remote_btn_right: '▶',
                neobot_purple_duration_cont: 'Davom etish',
                neobot_purple_duration_1s: '1 soniya',
                neobot_purple_duration_2s: '2 soniya',
                neobot_purple_duration_3s: '3 soniya',
                neobot_purple_duration_4s: '4 soniya',
                neobot_purple_duration_5s: '5 soniya',
                neobot_purple_duration_6s: '6 soniya',
                neobot_purple_duration_7s: '7 soniya',
                neobot_purple_duration_8s: '8 soniya',
                neobot_purple_duration_9s: '9 soniya',
                neobot_purple_motor_both: 'Ikkala',
                neobot_purple_motor_left: "Chap",
                neobot_purple_motor_right: "O'ng",
                neobot_purple_motor_move_forward: "to'g'riga yurish",
                neobot_purple_motor_move_backward: "orqaga yurish",
                neobot_purple_motor_move_left: 'chapga birilish',
                neobot_purple_motor_move_right: "o'nga birilish",
                neobot_purple_motor_move_stop: "to'xtatish",

                neobot_purple_servo_dir_1: "To'g'ri tomoni",
                neobot_purple_servo_dir_2: 'Qarish tomoni',
                
                neobot_purple_percent_10: '10% tezlik',
                neobot_purple_percent_20: '20% tezlik',
                neobot_purple_percent_30: '30% tezlik',
                neobot_purple_percent_40: '40% tezlik',
                neobot_purple_percent_50: '50% tezlik',
                neobot_purple_percent_60: '60% tezlik',
                neobot_purple_percent_70: '70% tezlik',
                neobot_purple_percent_80: '80% tezlik',
                neobot_purple_percent_90: '90% tezlik',
                neobot_purple_percent_100: '100% tezlik',

                neobot_purple_angle_0: '0 gradus',
                neobot_purple_angle_5: '5 gradus',
                neobot_purple_angle_10: '10 gradus',
                neobot_purple_angle_15: '15 gradus',
                neobot_purple_angle_20: '20 gradus',
                neobot_purple_angle_25: '25 gradus',
                neobot_purple_angle_30: '30 gradus',
                neobot_purple_angle_35: '35 gradus',
                neobot_purple_angle_40: '40 gradus',
                neobot_purple_angle_45: '45 gradus',
                neobot_purple_angle_50: '50 gradus',
                neobot_purple_angle_55: '55 gradus',
                neobot_purple_angle_60: '60 gradus',
                neobot_purple_angle_65: '65 gradus',
                neobot_purple_angle_70: '70 gradus',
                neobot_purple_angle_75: '75 gradus',
                neobot_purple_angle_80: '80 gradus',
                neobot_purple_angle_85: '85 gradus',
                neobot_purple_angle_90: '90 gradus',
                neobot_purple_angle_95: '95 gradus',
                neobot_purple_angle_100: '100 gradus',
                neobot_purple_angle_105: '105 gradus',
                neobot_purple_angle_110: '110 gradus',
                neobot_purple_angle_115: '115 gradus',
                neobot_purple_angle_120: '120 gradus',
                neobot_purple_angle_125: '125 gradus',
                neobot_purple_angle_130: '130 gradus',
                neobot_purple_angle_135: '135 gradus',
                neobot_purple_angle_140: '140 gradus',
                neobot_purple_angle_145: '145 gradus',
                neobot_purple_angle_150: '150 gradus',
                neobot_purple_angle_155: '155 gradus',
                neobot_purple_angle_160: '160 gradus',
                neobot_purple_angle_165: '165 gradus',
                neobot_purple_angle_170: '170 gradus',
                neobot_purple_angle_175: '175 gradus',
                neobot_purple_angle_180: '180 gradus',

                neobot_purple_out_all: 'Hammasi',
                neobot_purple_direction_left: 'Chap',
                neobot_purple_direction_right: "O'ng",
            },
        }, 
        ru: {
            template: {
                // sensor
                neobot_purple_sensor_value: '%1', 
                neobot_purple_sensor_convert_scale: "%1 %2 ~ %3 поменять на %4 ~ %5", 

                // decision
                neobot_purple_decision_sensor_is_over: '%1 %2 %3',
                neobot_purple_decision_equal_with_sensor: 'цвет %1 %2',
                neobot_purple_decision_sensor_angle: 'градус %1  %2 %3',

                // remote
                neobot_purple_remote_button: 'Нажатие кнопки %1 на пульта упровления',

                // LED
                // neobot_purple_arg_led_duration: '%1',
                neobot_purple_led_on: 'Включить LED %1 %2 %3 %4',
                neobot_purple_output_led_off: "Выключить LED %1 %2",
                neobot_purple_led_brightness_with_sensor: "Контролировать яркость LED %2 с помощью сенсора %1 %3",
                neobot_purple_color_led_on: 'Включить цветовой LED  %1  R %2 G %3 B %4 %5',

                // output
                neobot_purple_set_output: 'Вывести значение %2 на порт %1 %3',

                // motor
                neobot_purple_robot: 'Робот %1 %2',
                neobot_purple_motor_start: 'Запустит мотор: %1 %2 %3 %4 %5',
                neobot_purple_motor_stop: "Остановить %1 мотор(а) %2",
                // neobot_purple_arg_motor_speed: '%1',
                // neobot_purple_arg_motor_duration: '%1',

                // melody
                neobot_purple_play_note_for: "Диапазон частот пищалки: %1 диапазон нот: %2 нотa: %3 %4",
                neobot_purple_melody_play_with_sensor: 'Пищалка активируется по значению датчика  %1 %2',
                neobot_purple_melody_stop: "Остоновить пищалку %1",

                // servo
                // get_servo_degree: '%1',
                neobot_purple_servo_init: 'Перезагрузить %1 сервомотор %2',
                neobot_purple_servo_rotate: 'Повернуть servo мотор: %1 %2 %3 %4',
                neobot_purple_servo_stop: "Остоновить %1 сервомотор %2",
                neobot_purple_servo_change_degree: "Изменить угол %1 сервомотора: %2 %3 на %4 %5",
            },
            Blocks: {
                //for dropdown
                neobot_purple_port_1: 'IN1',
                neobot_purple_port_2: 'IN2',
                neobot_purple_port_3: 'IN3',
                neobot_purple_port_4: 'IN4',
                neobot_purple_port_12: 'IN1 & IN2',
                neobot_purple_port_bat: 'Батарея',
                neobot_purple_port_remot: 'Пульт упуправления',
                neobot_purple_color_white: 'Белый',
                neobot_purple_color_red: 'Красный',
                neobot_purple_color_yellow: 'Жёлтый',
                neobot_purple_color_green: 'Зелёный',
                neobot_purple_color_blue: "Синий",
                neobot_purple_direction_forward: "Вперёд",
                neobot_purple_direction_backward: 'Назад',
                neobot_purple_sound_silent: 'Беззвучный',
                neobot_purple_sound_do: 'До',
                neobot_purple_sound_do_shop: 'До#',
                neobot_purple_sound_re: 'Ре',
                neobot_purple_sound_re_shop: 'Ре#',
                neobot_purple_sound_mi: 'Ми',
                neobot_purple_sound_fa: 'Фа',
                neobot_purple_sound_fa_shop: 'Фа#',
                neobot_purple_sound_so: 'Соль',
                neobot_purple_sound_so_shop: 'Соль#',
                neobot_purple_sound_la: 'Ля',
                neobot_purple_sound_la_shop: 'Ля#',
                neobot_purple_sound_ti: 'Си',
                neobot_purple_sound_half_note: 'Половинная нота',
                neobot_purple_sound_quarter_note: 'Четвертная нота',
                neobot_purple_sound_eighth_note: '1/8 нота',
                neobot_purple_sound_sixteenth_note: '1/16 нота',
                neobot_purple_sensor_infrared: 'Инфракрасный сенсор',
                neobot_purple_sensor_light: 'Световой сенсор',
                neobot_purple_sensor_sound: 'Звуковой сенсор',
                neobot_purple_compare_symbol1: '＝',
                neobot_purple_compare_symbol2: '＞',
                neobot_purple_compare_symbol3: '＜',
                neobot_purple_compare_symbol4: '≥',
                neobot_purple_compare_symbol5: '≤',
                neobot_purple_remote_btn_a: 'A',
                neobot_purple_remote_btn_b: 'B',
                neobot_purple_remote_btn_c: 'C',
                neobot_purple_remote_btn_d: 'D',
                neobot_purple_remote_btn_1: '1',
                neobot_purple_remote_btn_2: '2',
                neobot_purple_remote_btn_3: '3',
                neobot_purple_remote_btn_4: '4',
                neobot_purple_remote_btn_up: '▲',
                neobot_purple_remote_btn_down: '▼',
                neobot_purple_remote_btn_left: '◀',
                neobot_purple_remote_btn_right: '▶',
                neobot_purple_duration_cont: 'Постоянно',
                neobot_purple_duration_1s: '1 секунда',
                neobot_purple_duration_2s: '2 секунды',
                neobot_purple_duration_3s: '3 секунды',
                neobot_purple_duration_4s: '4 секунды',
                neobot_purple_duration_5s: '5 секунд',
                neobot_purple_duration_6s: '6 секунд',
                neobot_purple_duration_7s: '7 секунд',
                neobot_purple_duration_8s: '8 секунд',
                neobot_purple_duration_9s: '9 секунд',
                neobot_purple_motor_both: 'Оба',
                neobot_purple_motor_left: "Левый",
                neobot_purple_motor_right: "Правый",
                neobot_purple_motor_move_forward: "Идти вперед",
                neobot_purple_motor_move_backward: "Идти назад",
                neobot_purple_motor_move_left: 'Повернуть налево',
                neobot_purple_motor_move_right: "Повернуть направо",
                neobot_purple_motor_move_stop: "Стоп",

                neobot_purple_servo_dir_1: "По часовой ",
                neobot_purple_servo_dir_2: 'Против часовой',
                
                neobot_purple_percent_10: '10% скорость',
                neobot_purple_percent_20: '20% скорость',
                neobot_purple_percent_30: '30% скорость',
                neobot_purple_percent_40: '40% скорость',
                neobot_purple_percent_50: '50% скорость',
                neobot_purple_percent_60: '60% скорость',
                neobot_purple_percent_70: '70% скорость',
                neobot_purple_percent_80: '80% скорость',
                neobot_purple_percent_90: '90% скорость',
                neobot_purple_percent_100: '100% скорость',

                neobot_purple_angle_0: '0 градусов',
                neobot_purple_angle_5: '5 градусов',
                neobot_purple_angle_10: '10 градусов',
                neobot_purple_angle_15: '15 градусов',
                neobot_purple_angle_20: '20 градусов',
                neobot_purple_angle_25: '25 градусов',
                neobot_purple_angle_30: '30 градусов',
                neobot_purple_angle_35: '35 градусов',
                neobot_purple_angle_40: '40 градусов',
                neobot_purple_angle_45: '45 градусов',
                neobot_purple_angle_45: '45 градусов',
                neobot_purple_angle_45: '45 градусов',
                neobot_purple_angle_45: '45 градусов',
                neobot_purple_angle_50: '50 градусов',
                neobot_purple_angle_55: '55 градусов',
                neobot_purple_angle_60: '60 градусов',
                neobot_purple_angle_65: '65 градусов',
                neobot_purple_angle_70: '70 градусов',
                neobot_purple_angle_75: '75 градусов',
                neobot_purple_angle_80: '80 градусов',
                neobot_purple_angle_85: '85 градусов',
                neobot_purple_angle_90: '90 градусов',
                neobot_purple_angle_95: '95 градусов',
                neobot_purple_angle_100: '100 градусов',
                neobot_purple_angle_105: '105 градусов',
                neobot_purple_angle_110: '110 градусов',
                neobot_purple_angle_115: '115 градусов',
                neobot_purple_angle_120: '120 градусов',
                neobot_purple_angle_125: '125 градусов',
                neobot_purple_angle_130: '130 градусов',
                neobot_purple_angle_135: '135 градусов',
                neobot_purple_angle_140: '140 градусов',
                neobot_purple_angle_145: '145 градусов',
                neobot_purple_angle_150: '150 градусов',
                neobot_purple_angle_155: '155 градусов',
                neobot_purple_angle_160: '160 градусов',
                neobot_purple_angle_165: '165 градусов',
                neobot_purple_angle_170: '170 градусов',
                neobot_purple_angle_175: '175 градусов',
                neobot_purple_angle_180: '180 градусов',

                neobot_purple_out_all: 'Все',
                neobot_purple_direction_left: 'Налево',
                neobot_purple_direction_right: "Направо",
            },
        }, //
    };
};

Entry.NeobotPurple.blockMenuBlocks = [
    // sensor
    'neobot_purple_sensor_value',
    'neobot_purple_sensor_convert_scale',

    // decision
    'neobot_purple_decision_sensor_is_over',
    'neobot_purple_decision_equal_with_sensor',
    'neobot_purple_decision_sensor_angle',

    // remote
    'neobot_purple_remote_button',

    // led
    'neobot_purple_led_on',
    'neobot_purple_led_brightness_with_sensor',
    'neobot_purple_color_led_on',
    'neobot_purple_output_led_off',

    // output
    'neobot_purple_set_output',

    //  motor
    'neobot_purple_robot',
    'neobot_purple_motor_start',
    'neobot_purple_motor_stop',

    // melody
    'neobot_purple_play_note_for',
    'neobot_purple_melody_play_with_sensor',
    'neobot_purple_melody_stop',

    // servo
    'neobot_purple_servo_init',
    'neobot_purple_servo_rotate',
    'neobot_purple_servo_stop',
    'neobot_purple_servo_change_degree',
];

Entry.NeobotPurple.getBlocks = function() {
    return {
        /*************************
         * class neobot_purple_sensor
         *************************/
        neobot_purple_sensor_value: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                        [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                        [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                        [Lang.Blocks.neobot_purple_port_remot, 'IR'],
                        [Lang.Blocks.neobot_purple_port_bat, 'BAT'],
                    ],
                    value: 'IN1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'neobot_purple_sensor_value',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'neobot_purple_sensor',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                return Entry.hw.portData[port];
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.get_value(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                                    [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                                    [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                                    [Lang.Blocks.neobot_purple_port_remot, 'IR'],
                                    [Lang.Blocks.neobot_purple_port_bat, 'BAT'],
                                ],
                                value: 'IN1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            }
                        ]
                    }
                ]
            }
        },

        neobot_purple_sensor_convert_scale: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic_string_field',
            fontColor: '#fff',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                        [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                        [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                    ],
                    value: 'IN1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
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
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'number',
                        params: ['0'],
                    },
                    {
                        type: 'number',
                        params: ['255'],
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
                type: 'neobot_purple_sensor_convert_scale',
            },
            paramsKeyMap: {
                PORT: 0,
                OMIN: 1,
                OMAX: 2,
                MIN: 3,
                MAX: 4,
            },
            class: 'neobot_purple_sensor',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT');
                var value = Entry.hw.portData[port];
                var omin = script.getNumberValue('OMIN', script);
                var omax = script.getNumberValue('OMAX', script);
                var min = script.getNumberValue('MIN', script);
                var max = script.getNumberValue('MAX', script);

                if (omin > omax) {
                    var temp = omin;
                    omin = omax;
                    omax = temp;
                }

                if (min > max) {
                    var temp = min;
                    min = max;
                    max = temp;
                }

                value -= omin;
                value = value * ((max - min) / (omax - omin));
                value += min;
                value = Math.min(max, value);
                value = Math.max(min, value);

                return Math.round(value);
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.convert_scale(%1, %2, %3 %4, %5)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                                    [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                                    [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                                ],
                                value: 'IN1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
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
                        ]
                    }
                ]
            }
        },

        /*************************
         * class neobot_purple_decision
         *************************/
        neobot_purple_decision_sensor_is_over: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                        [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                        [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                        [Lang.Blocks.neobot_purple_port_12, 'IN12'],
                    ],
                    value: 'IN1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_compare_symbol1, '='],
                        [Lang.Blocks.neobot_purple_compare_symbol2, '>'],
                        [Lang.Blocks.neobot_purple_compare_symbol3, '<'],
                        [Lang.Blocks.neobot_purple_compare_symbol4, '>='],
                        [Lang.Blocks.neobot_purple_compare_symbol5, '<='],
                    ],
                    value: '>',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Block',
                    accept: 'string',
                },
            ],
            events: {},
            def: {
                params: [null, null, 10],
                type: 'neobot_purple_decision_sensor_is_over',
            },
            paramsKeyMap: {
                SENSOR: 0,
                SYMBOL: 1,
                VALUE: 2,
            },
            class: 'neobot_purple_decision',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                const sensorTemp = script.getStringField('SENSOR');
                const symbol = script.getStringField('SYMBOL');
                const value = Entry.parseNumber(script.getStringValue('VALUE'));

                if (sensorTemp == 'IN12') {
                    const sensor1 = Entry.hw.portData['IN1'];
                    const sensor2 = Entry.hw.portData['IN2'];
                    if (symbol == '=') {
                        return sensor1 == value && sensor2 == value;
                    } else if (symbol == '>') {
                        return sensor1 > value && sensor2 > value;
                    } else if (symbol == '<') {
                        return sensor1 < value && sensor2 < value;
                    } else if (symbol == '>=') {
                        return sensor1 >= value && sensor2 >= value;
                    } else if (symbol == '<=') {
                        return sensor1 <= value && sensor2 <= value;
                    }
                } else {
                    const sensor = Entry.hw.portData[sensorTemp];
                    if (symbol == '=') {
                        if (sensor == value) return true;
                        else return false;
                    } else if (symbol == '>') {
                        if (sensor > value) return true;
                        else return false;
                    } else if (symbol == '<') {
                        if (sensor < value) return true;
                        else return false;
                    } else if (symbol == '>=') {
                        if (sensor >= value) return true;
                        else return false;
                    } else if (symbol == '<=') {
                        if (sensor <= value) return true;
                        else return false;
                    }
                }
                return false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.compare_value(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                                    [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                                    [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                                    [Lang.Blocks.neobot_purple_port_12, 'IN12'],
                                ],
                                value: 'IN1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_compare_symbol1, '='],
                                    [Lang.Blocks.neobot_purple_compare_symbol2, '>'],
                                    [Lang.Blocks.neobot_purple_compare_symbol3, '<'],
                                    [Lang.Blocks.neobot_purple_compare_symbol4, '>='],
                                    [Lang.Blocks.neobot_purple_compare_symbol5, '<='],
                                ],
                                value: '>',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ]
                    }
                ]
            }
        },

        neobot_purple_decision_equal_with_sensor: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#ffffff',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                        [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                        [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                    ],
                    value: 'IN1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_color_white, 'white'],
                        [Lang.Blocks.neobot_purple_color_red, 'red'],
                        [Lang.Blocks.neobot_purple_color_yellow, 'yellow'],
                        [Lang.Blocks.neobot_purple_color_green, 'green'],
                        [Lang.Blocks.neobot_purple_color_blue, 'blue'],
                    ],
                    value: 'white',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null, null],
                type: 'neobot_purple_decision_equal_with_sensor',
            },
            paramsKeyMap: {
                SENSOR: 0,
                COLOR: 1,
            },
            class: 'neobot_purple_decision',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                var sensorTemp = script.getStringField('SENSOR');
                var sensor = Entry.hw.portData[sensorTemp];
                var color = script.getNumberField('COLOR');

                if (sensor >= 10 && sensor <= 50) {
                    if (color == 'white') return true;
                    else return false;
                } else if (sensor >= 51 && sensor <= 90) {
                    if (color == 'red') return true;
                    else return false;
                } else if (sensor >= 91 && sensor <= 130) {
                    if (color == 'yellow') return true;
                    else return false;
                } else if (sensor >= 131 && sensor <= 170) {
                    if (color == 'green') return true;
                    else return false;
                } else if (sensor >= 171 && sensor <= 210) {
                    if (color == 'blue') return true;
                    else return false;
                }
                return false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.check_color(%1, %2)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                                    [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                                    [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                                ],
                                value: 'IN1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_color_white, 'white'],
                                    [Lang.Blocks.neobot_purple_color_red, 'red'],
                                    [Lang.Blocks.neobot_purple_color_yellow, 'yellow'],
                                    [Lang.Blocks.neobot_purple_color_green, 'green'],
                                    [Lang.Blocks.neobot_purple_color_blue, 'blue'],
                                ],
                                value: 'white',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                        ]
                    }
                ]
            }
        },

        neobot_purple_decision_sensor_angle: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#FFFFFF',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                        [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                        [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                    ],
                    value: 'IN1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_compare_symbol1, '='],
                        [Lang.Blocks.neobot_purple_compare_symbol2, '>'],
                        [Lang.Blocks.neobot_purple_compare_symbol3, '<'],
                        [Lang.Blocks.neobot_purple_compare_symbol4, '>='],
                        [Lang.Blocks.neobot_purple_compare_symbol5, '<='],
                    ],
                    value: '>',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_angle_0, '0'],
                        [Lang.Blocks.neobot_purple_angle_10, '10'],
                        [Lang.Blocks.neobot_purple_angle_20, '20'],
                        [Lang.Blocks.neobot_purple_angle_30, '30'],
                        [Lang.Blocks.neobot_purple_angle_40, '40'],
                        [Lang.Blocks.neobot_purple_angle_50, '50'],
                        [Lang.Blocks.neobot_purple_angle_60, '60'],
                        [Lang.Blocks.neobot_purple_angle_70, '70'],
                        [Lang.Blocks.neobot_purple_angle_80, '80'],
                        [Lang.Blocks.neobot_purple_angle_90, '90'],
                        [Lang.Blocks.neobot_purple_angle_100, '100'],
                        [Lang.Blocks.neobot_purple_angle_110, '110'],
                        [Lang.Blocks.neobot_purple_angle_120, '120'],
                        [Lang.Blocks.neobot_purple_angle_130, '130'],
                        [Lang.Blocks.neobot_purple_angle_140, '140'],
                        [Lang.Blocks.neobot_purple_angle_150, '150'],
                        [Lang.Blocks.neobot_purple_angle_160, '160'],
                        [Lang.Blocks.neobot_purple_angle_170, '170'],
                        [Lang.Blocks.neobot_purple_angle_180, '180'],
                    ],
                    value: '90',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null, null, null],
                type: 'neobot_purple_decision_sensor_angle',
            },
            paramsKeyMap: {
                SENSOR: 0,
                SYMBOL: 1,
                VALUE: 2,
            },
            class: 'neobot_purple_decision',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                var sensorTemp = script.getStringField('SENSOR');
                var sensor = Entry.hw.portData[sensorTemp];
                var symbol = script.getStringField('SYMBOL');
                var value = Entry.parseNumber(script.getStringValue('VALUE'));

                if (symbol == '=') {
                    if (sensor == value) return true;
                    else return false;
                } else if (symbol == '>') {
                    if (sensor > value) return true;
                    else return false;
                } else if (symbol == '<') {
                    if (sensor < value) return true;
                    else return false;
                } else if (symbol == '>=') {
                    if (sensor >= value) return true;
                    else return false;
                } else if (symbol == '<=') {
                    if (sensor <= value) return true;
                    else return false;
                }
                return false;
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.compare_angle(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                                    [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                                    [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                                ],
                                value: 'IN1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_compare_symbol1, '='],
                                    [Lang.Blocks.neobot_purple_compare_symbol2, '>'],
                                    [Lang.Blocks.neobot_purple_compare_symbol3, '<'],
                                    [Lang.Blocks.neobot_purple_compare_symbol4, '>='],
                                    [Lang.Blocks.neobot_purple_compare_symbol5, '<='],
                                ],
                                value: '>',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_angle_0, '0'],
                                    [Lang.Blocks.neobot_purple_angle_10, '10'],
                                    [Lang.Blocks.neobot_purple_angle_20, '20'],
                                    [Lang.Blocks.neobot_purple_angle_30, '30'],
                                    [Lang.Blocks.neobot_purple_angle_40, '40'],
                                    [Lang.Blocks.neobot_purple_angle_50, '50'],
                                    [Lang.Blocks.neobot_purple_angle_60, '60'],
                                    [Lang.Blocks.neobot_purple_angle_70, '70'],
                                    [Lang.Blocks.neobot_purple_angle_80, '80'],
                                    [Lang.Blocks.neobot_purple_angle_90, '90'],
                                    [Lang.Blocks.neobot_purple_angle_100, '100'],
                                    [Lang.Blocks.neobot_purple_angle_110, '110'],
                                    [Lang.Blocks.neobot_purple_angle_120, '120'],
                                    [Lang.Blocks.neobot_purple_angle_130, '130'],
                                    [Lang.Blocks.neobot_purple_angle_140, '140'],
                                    [Lang.Blocks.neobot_purple_angle_150, '150'],
                                    [Lang.Blocks.neobot_purple_angle_160, '160'],
                                    [Lang.Blocks.neobot_purple_angle_170, '170'],
                                    [Lang.Blocks.neobot_purple_angle_180, '180'],
                                ],
                                value: '90',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            }
                        ]
                    }
                ]
            }
        },

        /*************************
         * class neobot_purple_remote
         *************************/
        neobot_purple_remote_button: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            fontColor: '#FFFFFF',
            skeleton: 'basic_boolean_field',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_remote_btn_1, '1'],
                        [Lang.Blocks.neobot_purple_remote_btn_2, '2'],
                        [Lang.Blocks.neobot_purple_remote_btn_3, '3'],
                        [Lang.Blocks.neobot_purple_remote_btn_4, '4'],
                        [Lang.Blocks.neobot_purple_remote_btn_up, 'up'],
                        [Lang.Blocks.neobot_purple_remote_btn_down, 'down'],
                        [Lang.Blocks.neobot_purple_remote_btn_left, 'left'],
                        [Lang.Blocks.neobot_purple_remote_btn_right, 'right'],
                    ],
                    value: '1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
            ],
            events: {},
            def: {
                params: [null],
                type: 'neobot_purple_remote_button',
            },
            paramsKeyMap: {
                KEY: 0,
            },
            class: 'neobot_purple_remote',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                var key_cvt = {
                    'up': 1,
                    'down': 2,
                    'left': 3,
                    'right': 4,
                    '1': 10,
                    '2': 11,
                    '3': 12,
                    '4': 13,
                };
                var key = key_cvt[script.getStringValue('KEY', script)];
                var value = Entry.hw.portData['IR'];
                
                if (key == value) {
                    return true;
                } else {
                    return false;
                }
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.remote_button(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_remote_btn_1, '1'],
                                    [Lang.Blocks.neobot_purple_remote_btn_2, '2'],
                                    [Lang.Blocks.neobot_purple_remote_btn_3, '3'],
                                    [Lang.Blocks.neobot_purple_remote_btn_4, '4'],
                                    [Lang.Blocks.neobot_purple_remote_btn_up, 'up'],
                                    [Lang.Blocks.neobot_purple_remote_btn_down, 'down'],
                                    [Lang.Blocks.neobot_purple_remote_btn_left, 'left'],
                                    [Lang.Blocks.neobot_purple_remote_btn_right, 'right'],
                                ],
                                value: '1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            }
                        ]
                    }
                ]
            }
        },

        /*************************
         * class neobot_purple_led
         *************************/
        neobot_purple_led_on: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['100%', '100'],
                        ['90%', '90'],
                        ['80%', '80'],
                        ['70%', '70'],
                        ['60%', '60'],
                        ['50%', '50'],
                        ['40%', '40'],
                        ['30%', '30'],
                        ['20%', '20'],
                        ['10%', '10'],
                    ],
                    value: '100',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                // {
                //     type: 'Block',
                //     accept: 'string',
                //     defaultType: 'number',
                // },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_duration_cont, '-1'],
                        [Lang.Blocks.neobot_purple_duration_1s, '1'],
                        [Lang.Blocks.neobot_purple_duration_2s, '2'],
                        [Lang.Blocks.neobot_purple_duration_3s, '3'],
                        [Lang.Blocks.neobot_purple_duration_4s, '4'],
                        [Lang.Blocks.neobot_purple_duration_5s, '5'],
                        [Lang.Blocks.neobot_purple_duration_6s, '6'],
                        [Lang.Blocks.neobot_purple_duration_7s, '7'],
                        [Lang.Blocks.neobot_purple_duration_8s, '8'],
                        [Lang.Blocks.neobot_purple_duration_9s, '9'],
                    ],
                    value: '-1',
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
            events: {},
            def: {
                params: [
                    null,
                    // null,
                    // {
                    //     type: 'neobot_purple_arg_led_duration',
                    //     id: 'm311',
                    // },
                    // null,
                ],
                type: 'neobot_purple_led_on',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
                DURATION: 2,
            },
            class: 'neobot_purple_led',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                let bright_cvt = {
                    100: 255,
                    90: 230,
                    80: 204,
                    70: 179,
                    60: 153,
                    50: 128,
                    40: 102,
                    30: 77,
                    20: 51,
                    10: 26,
                };

                if (!script.isStart) {
                    const port = script.getStringField('PORT', script);
                    const value = bright_cvt[script.getNumberField('VALUE', script)];
                    const duration = script.getStringValue('DURATION', script);

                    if (Entry.NeobotPurple.log_to_console) {
                        Entry.console.print('=== neobot_purple_led_on ===', 'speak');
                        Entry.console.print('port : ' + port, 'speak');
                        Entry.console.print('brightness : ' + value, 'speak');
                        Entry.console.print('duration : ' + duration, 'speak');
                        Entry.console.print('==========================', 'speak');
                    }

                    if ((Entry.parseNumber(duration) == 0)) { // To block a short flash
                        return script.callReturn();
                    }

                    if (port == 'ALL') {
                        Entry.hw.sendQueue['OUT1'] = value;
                        Entry.hw.sendQueue['OUT2'] = value;
                        Entry.hw.sendQueue['OUT3'] = value;
                    } else {
                        Entry.hw.sendQueue[port] = value;
                    }

                    if (Entry.parseNumber(duration) < 0) {
                        return script.callReturn();
                    }

                    const durationValue = Entry.parseNumber(duration);
                    script.isStart = true;
                    script.timeFlag = 1;
                    setTimeout(function() {
                        if (port == 'ALL') {
                            Entry.hw.sendQueue['OUT1'] = 0;
                            Entry.hw.sendQueue['OUT2'] = 0;
                            Entry.hw.sendQueue['OUT3'] = 0;
                        } else {
                            Entry.hw.sendQueue[port] = 0;
                        }
                        if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_led_on : 0', 'speak');
                        script.timeFlag = 0;
                    }, durationValue * 1000);
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
                        syntax: 'Neosoco.led_on(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['100%', '100'],
                                    ['90%', '90'],
                                    ['80%', '80'],
                                    ['70%', '70'],
                                    ['60%', '60'],
                                    ['50%', '50'],
                                    ['40%', '40'],
                                    ['30%', '30'],
                                    ['20%', '20'],
                                    ['10%', '10'],
                                ],
                                value: '100',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            // {
                            //     type: 'Block',
                            //     accept: 'string',
                            //     defaultType: 'number',
                            // },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_duration_cont, '-1'],
                                    [Lang.Blocks.neobot_purple_duration_1s, '1'],
                                    [Lang.Blocks.neobot_purple_duration_2s, '2'],
                                    [Lang.Blocks.neobot_purple_duration_3s, '3'],
                                    [Lang.Blocks.neobot_purple_duration_4s, '4'],
                                    [Lang.Blocks.neobot_purple_duration_5s, '5'],
                                    [Lang.Blocks.neobot_purple_duration_6s, '6'],
                                    [Lang.Blocks.neobot_purple_duration_7s, '7'],
                                    [Lang.Blocks.neobot_purple_duration_8s, '8'],
                                    [Lang.Blocks.neobot_purple_duration_9s, '9'],
                                ],
                                value: '-1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringOrNumberByValue,
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_output_led_off: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
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
            events: {},
            def: {
                params: [null, null],
                type: 'neobot_purple_output_led_off',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'neobot_purple_led',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                const port = script.getStringField('PORT', script);

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_output_led_off ===', 'speak');
                    Entry.console.print('port : ' + port, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                if (port == 'ALL') {
                    Entry.hw.sendQueue['OUT1'] = 0;
                    Entry.hw.sendQueue['OUT2'] = 0;
                    Entry.hw.sendQueue['OUT3'] = 0;
                } else {
                    Entry.hw.sendQueue[port] = 0;
                }
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.led_off(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_led_brightness_with_sensor: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['IN1', 'IN1'],
                        ['IN2', 'IN2'],
                        ['IN3', 'IN3'],
                    ],
                    value: 'IN1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
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
            events: {},
            def: {
                params: [null, null, null],
                type: 'neobot_purple_led_brightness_with_sensor',
            },
            paramsKeyMap: {
                IN: 0,
                OUT: 1,
            },
            class: 'neobot_purple_led',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                const inPort = script.getStringField('IN', script);
                const outPort = script.getStringField('OUT', script);
                let value = Entry.hw.portData[inPort];

                // edited 210421, IN 값 0~100 을 0~255로 변경, 센서 100 이상은 최대값으로 처리함.
                value = Math.max(value, 0);
                value = Math.min(value, 100);
                value = Math.ceil(value / 100 * 255);

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_led_brightness_with_sensor ===', 'speak');
                    Entry.console.print('out port : ' + outPort, 'speak');
                    Entry.console.print('in port : ' + inPort, 'speak');
                    Entry.console.print('sensor value : ' + Entry.hw.portData[inPort], 'speak');
                    Entry.console.print('output value : ' + value, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                if (outPort == 'ALL') {
                    Entry.hw.sendQueue['OUT1'] = value;
                    Entry.hw.sendQueue['OUT2'] = value;
                    Entry.hw.sendQueue['OUT3'] = value;
                } else {
                    Entry.hw.sendQueue[outPort] = value;
                }
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.led_by_port(%1, %2)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['IN1', 'IN1'],
                                    ['IN2', 'IN2'],
                                    ['IN3', 'IN3'],
                                ],
                                value: 'IN1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_color_led_on: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
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
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    {
                        type: 'number',
                        params: ['255'],
                    },
                    {
                        type: 'number',
                        params: ['255'],
                    },
                    {
                        type: 'number',
                        params: ['255'],
                    },
                    null,
                ],
                type: 'neobot_purple_color_led_on',
            },
            paramsKeyMap: {
                PORT: 0,
                RED: 1,
                GREEN: 2,
                BLUE: 3,
            },
            class: 'neobot_purple_led',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                if (!script.isStart) {
                    const port = script.getStringField('PORT');
                    let red = script.getNumberValue('RED');
                    let green = script.getNumberValue('GREEN');
                    let blue = script.getNumberValue('BLUE');

                    let out1 = false;
                    let out2 = false;
                    let out3 = false;
                    if (port == 'ALL') {
                        out1 = true;
                        out2 = true;
                        out3 = true;
                    } else {
                        out1 = port == 'OUT1';
                        out2 = port == 'OUT2';
                        out3 = port == 'OUT3';
                    }

                    red = Math.max(red, 1);
                    red = Math.min(red, 251);
                    green = Math.max(green, 1);
                    green = Math.min(green, 251);
                    blue = Math.max(blue, 1);
                    blue = Math.min(blue, 251);

                    if (Entry.NeobotPurple.log_to_console) {
                        Entry.console.print('=== neobot_purple_color_led_on ===', 'speak');
                        Entry.console.print('port : ' + port, 'speak');
                        Entry.console.print('red : ' + red, 'speak');
                        Entry.console.print('green : ' + green, 'speak');
                        Entry.console.print('blue : ' + blue, 'speak');
                        Entry.console.print('==========================', 'speak');
                    }

                    const valRed = 252;
                    const valGreen = 253;
                    const valBlue = 254;
                    const valAccept = 255;

                    script.isStart = true;
                    script.timeFlag = 1;

                    if (out1) Entry.hw.sendQueue['OUT1'] = valRed;
                    if (out2) Entry.hw.sendQueue['OUT2'] = valRed;
                    if (out3) Entry.hw.sendQueue['OUT3'] = valRed;
                    if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_color_led_on : ' + valRed, 'speak');
                    setTimeout(function() { // set red
                        if (out1) Entry.hw.sendQueue['OUT1'] = red;
                        if (out2) Entry.hw.sendQueue['OUT2'] = red;
                        if (out3) Entry.hw.sendQueue['OUT3'] = red;
                        if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_color_led_on : ' + red, 'speak');
                        setTimeout(function() { // choose green
                            if (out1) Entry.hw.sendQueue['OUT1'] = valGreen;
                            if (out2) Entry.hw.sendQueue['OUT2'] = valGreen;
                            if (out3) Entry.hw.sendQueue['OUT3'] = valGreen;
                            if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_color_led_on : ' + valGreen, 'speak');
                            setTimeout(function() { // set green
                                if (out1) Entry.hw.sendQueue['OUT1'] = green;
                                if (out2) Entry.hw.sendQueue['OUT2'] = green;
                                if (out3) Entry.hw.sendQueue['OUT3'] = green;
                                if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_color_led_on : ' + green, 'speak');
                                setTimeout(function() { // choose blue
                                    if (out1) Entry.hw.sendQueue['OUT1'] = valBlue;
                                    if (out2) Entry.hw.sendQueue['OUT2'] = valBlue;
                                    if (out3) Entry.hw.sendQueue['OUT3'] = valBlue;
                                    if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_color_led_on : ' + valBlue, 'speak');
                                    setTimeout(function() { // set blue
                                        if (out1) Entry.hw.sendQueue['OUT1'] = blue;
                                        if (out2) Entry.hw.sendQueue['OUT2'] = blue;
                                        if (out3) Entry.hw.sendQueue['OUT3'] = blue;
                                        if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_color_led_on : ' + blue, 'speak');
                                        setTimeout(function() { // accept
                                            if (out1) Entry.hw.sendQueue['OUT1'] = valAccept;
                                            if (out2) Entry.hw.sendQueue['OUT2'] = valAccept;
                                            if (out3) Entry.hw.sendQueue['OUT3'] = valAccept;
                                            if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_color_led_on : ' + valAccept, 'speak');
                                            setTimeout(function() { // final delay
                                                script.timeFlag = 0;
                                            }, 200);
                                        }, 200);
                                    }, 200);
                                }, 200);
                            }, 200);
                        }, 200);
                    }, 200);
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
                        syntax: 'Neosoco.color_led_on(%1, %2, %3, %4)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
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
                        ]
                    }
                ]
            },
        },

        /*************************
         * class neobot_purple_output
         *************************/
        neobot_purple_set_output: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
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
                    null,
                    {
                        type: 'number',
                        params: ['255'],
                    },
                    null,
                ],
                type: 'neobot_purple_set_output',
            },
            paramsKeyMap: {
                PORT: 0,
                VALUE: 1,
            },
            class: 'neobot_purple_output',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                var port = script.getStringField('PORT', script);
                var value = script.getNumberValue('VALUE', script);
                if (value < 0) {
                    value = 0;
                } else if (value > 255) {
                    value = 255;
                }

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_set_output ===', 'speak');
                    Entry.console.print('port : ' + port, 'speak');
                    Entry.console.print('value : ' + value, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                if (port == 'ALL') {
                    Entry.hw.sendQueue['OUT1'] = value;
                    Entry.hw.sendQueue['OUT2'] = value;
                    Entry.hw.sendQueue['OUT3'] = value;
                } else {
                    Entry.hw.sendQueue[port] = value;
                }
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.set_value(%1, %2)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Block',
                                accept: 'string',
                            },
                        ]
                    }
                ]
            },
        },

        /*************************
         * class neobot_purple_motor
         *************************/
        neobot_purple_robot: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_motor_move_forward, 'forward'],
                        [Lang.Blocks.neobot_purple_motor_move_backward, 'backward'],
                        [Lang.Blocks.neobot_purple_motor_move_left, 'left'],
                        [Lang.Blocks.neobot_purple_motor_move_right, 'right'],
                        [Lang.Blocks.neobot_purple_motor_move_stop, 'stop'],
                    ],
                    value: 'forward',
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
            events: {},
            def: {
                params: [
                    null,
                    null,
                ],
                type: 'neobot_purple_robot',
            },
            paramsKeyMap: {
                MOVE: 0,
            },
            class: 'neobot_purple_motor',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                const move = script.getStringField('MOVE');
                let leftValue;
                let rightValue;
                switch (move) {
                    case 'forward':
                        leftValue = 0x10 + 10;
                        rightValue = 0x10 + 10;
                        break;
                    case 'backward':
                        leftValue = 0x20 + 10;
                        rightValue = 0x20 + 10;
                        break;
                    case 'left':
                        leftValue = 0x20 + 5;
                        rightValue = 0x10 + 5;
                        break;
                    case 'right':
                        leftValue = 0x10 + 5;
                        rightValue = 0x20 + 5;
                        break;
                    case 'stop':
                        leftValue = 0;
                        rightValue = 0;
                        break;
                }

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_robot ===', 'speak');
                    Entry.console.print('move : ' + move, 'speak');
                    Entry.console.print('left value : ' + leftValue, 'speak');
                    Entry.console.print('right value : ' + rightValue, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                Entry.hw.sendQueue['DCL'] = leftValue;
                Entry.hw.sendQueue['DCR'] = rightValue;
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.motor_move(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_motor_move_forward, 'forward'],
                                    [Lang.Blocks.neobot_purple_motor_move_backward, 'backward'],
                                    [Lang.Blocks.neobot_purple_motor_move_left, 'left'],
                                    [Lang.Blocks.neobot_purple_motor_move_right, 'right'],
                                    [Lang.Blocks.neobot_purple_motor_move_stop, 'stop'],
                                ],
                                value: 'forward',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_motor_start: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_motor_both, 'both'],
                        [Lang.Blocks.neobot_purple_motor_left, 'left'],
                        [Lang.Blocks.neobot_purple_motor_right, 'right'],
                    ],
                    value: 'both',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_direction_forward, 'forward'],
                        [Lang.Blocks.neobot_purple_direction_backward, 'backward'],
                        [Lang.Blocks.neobot_purple_direction_left, 'left'],
                        [Lang.Blocks.neobot_purple_direction_right, 'right'],
                    ],
                    value: 'forward',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['IN1', 'IN1'],
                        ['IN2', 'IN2'],
                        ['IN3', 'IN3'],
                        ['100%', '100'],
                        ['90%', '90'],
                        ['80%', '80'],
                        ['70%', '70'],
                        ['60%', '60'],
                        ['50%', '50'],
                        ['40%', '40'],
                        ['30%', '30'],
                        ['20%', '20'],
                        ['10%', '10'],
                    ],
                    value: '100',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_duration_cont, '-1'],
                        [Lang.Blocks.neobot_purple_duration_1s, '1'],
                        [Lang.Blocks.neobot_purple_duration_2s, '2'],
                        [Lang.Blocks.neobot_purple_duration_3s, '3'],
                        [Lang.Blocks.neobot_purple_duration_4s, '4'],
                        [Lang.Blocks.neobot_purple_duration_5s, '5'],
                        [Lang.Blocks.neobot_purple_duration_6s, '6'],
                        [Lang.Blocks.neobot_purple_duration_7s, '7'],
                        [Lang.Blocks.neobot_purple_duration_8s, '8'],
                        [Lang.Blocks.neobot_purple_duration_9s, '9'],
                    ],
                    value: '-1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                // {
                //     type: 'Block',
                //     accept: 'string',
                //     defaultType: 'number',
                // },
                // {
                //     type: 'Block',
                //     accept: 'string',
                //     defaultType: 'number',
                // },
                {
                    type: 'Indicator',
                    img: 'block_icon/hardware_icon.svg',
                    size: 12,
                },
            ],
            events: {},
            def: {
                params: [
                    null,
                    // null,
                    // {
                    //     type: 'neobot_purple_arg_motor_speed',
                    //     id: 'm411',
                    // },
                    // {
                    //     type: 'neobot_purple_arg_motor_duration',
                    //     id: 'm412',
                    // },
                    // null,
                ],
                type: 'neobot_purple_motor_start',
            },
            paramsKeyMap: {
                MOTOR: 0,
                DIRECTION: 1,
                SPEED: 2,
                DURATION: 3,
            },
            class: 'neobot_purple_motor',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                if (!script.isStart) {
                    const motor = script.getStringField('MOTOR', script);
                    const direction = script.getStringField('DIRECTION', script);
                    const speed = script.getStringValue('SPEED', script);
                    const duration = script.getStringValue('DURATION', script);

                    if (Entry.parseNumber(duration) == 0) {
                        return script.callReturn();
                    }

                    let moveLeft = false;
                    let moveRight = false;
                    if (motor == 'both') {
                        moveLeft = true;
                        moveRight = true;
                    } else if (motor == 'left') {
                        moveLeft = true;
                    } else {
                        moveRight = true;
                    }

                    let leftDirectionValue;
                    let rightDirectionValue;
                    if (direction == 'forward') {
                        leftDirectionValue = 0x10;
                        rightDirectionValue = 0x10;
                    } else if (direction == 'backward') {
                        leftDirectionValue = 0x20;
                        rightDirectionValue = 0x20;
                    } else if (direction == 'left') {
                        leftDirectionValue = 0x20;
                        rightDirectionValue = 0x10;
                    } else {
                        leftDirectionValue = 0x10;
                        rightDirectionValue = 0x20;
                    }

                    // edited 210421, 0~100 을 0~15로 변환, 100 이상은 최대값(15)으로 처리함.
                    let speedValue = 0;
                    if (Entry.Utils.isNumber(speed)) {
                        speedValue = Entry.parseNumber(speed);
                    } else {
                        speedValue = Entry.hw.portData[speed];
                    }
                    speedValue = Math.max(speedValue, 0);
                    speedValue = Math.min(speedValue, 100);
                    speedValue = Math.ceil(speedValue / 100 * 15);

                    const leftOutValue = leftDirectionValue + speedValue;
                    const rightOutValue = rightDirectionValue + speedValue;

                    if (Entry.NeobotPurple.log_to_console) {
                        Entry.console.print('=== neobot_purple_motor_start ===', 'speak');
                        Entry.console.print('motor : ' + motor, 'speak');
                        Entry.console.print('direction : ' + direction, 'speak');
                        Entry.console.print('speed : ' + speed, 'speak');
                        Entry.console.print('duration : ' + duration, 'speak');
                        Entry.console.print('left direction value : ' + leftDirectionValue, 'speak');
                        Entry.console.print('right direction value : ' + rightDirectionValue, 'speak');
                        Entry.console.print('speed value : ' + speedValue, 'speak');
                        Entry.console.print('left output value : ' + leftOutValue, 'speak');
                        Entry.console.print('right output value : ' + rightOutValue, 'speak');
                        Entry.console.print('==========================', 'speak');
                    }

                    if (moveLeft) {
                        Entry.hw.sendQueue['DCL'] = leftOutValue;
                    }
                    if (moveRight) {
                        Entry.hw.sendQueue['DCR'] = rightOutValue;
                    }

                    if (duration < 0) {
                        return script.callReturn();
                    }

                    const durationValue = Entry.parseNumber(duration);
                    script.isStart = true;
                    script.timeFlag = 1;
                    setTimeout(function() {
                        Entry.hw.sendQueue['DCL'] = 0;
                        Entry.hw.sendQueue['DCR'] = 0;
                        if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_motor_start : 0', 'speak');
                        script.timeFlag = 0;
                    }, durationValue * 1000);
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
                        syntax: 'Neosoco.motor_rotate(%1, %2, %3, %4)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_motor_both, 'both'],
                                    [Lang.Blocks.neobot_purple_motor_left, 'left'],
                                    [Lang.Blocks.neobot_purple_motor_right, 'right'],
                                ],
                                value: 'both',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_direction_forward, 'forward'],
                                    [Lang.Blocks.neobot_purple_direction_backward, 'backward'],
                                    [Lang.Blocks.neobot_purple_direction_left, 'left'],
                                    [Lang.Blocks.neobot_purple_direction_right, 'right'],
                                ],
                                value: 'forward',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['IN1', 'IN1'],
                                    ['IN2', 'IN2'],
                                    ['IN3', 'IN3'],
                                    ['100%', '100'],
                                    ['90%', '90'],
                                    ['80%', '80'],
                                    ['70%', '70'],
                                    ['60%', '60'],
                                    ['50%', '50'],
                                    ['40%', '40'],
                                    ['30%', '30'],
                                    ['20%', '20'],
                                    ['10%', '10'],
                                ],
                                value: '100',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_duration_cont, '-1'],
                                    [Lang.Blocks.neobot_purple_duration_1s, '1'],
                                    [Lang.Blocks.neobot_purple_duration_2s, '2'],
                                    [Lang.Blocks.neobot_purple_duration_3s, '3'],
                                    [Lang.Blocks.neobot_purple_duration_4s, '4'],
                                    [Lang.Blocks.neobot_purple_duration_5s, '5'],
                                    [Lang.Blocks.neobot_purple_duration_6s, '6'],
                                    [Lang.Blocks.neobot_purple_duration_7s, '7'],
                                    [Lang.Blocks.neobot_purple_duration_8s, '8'],
                                    [Lang.Blocks.neobot_purple_duration_9s, '9'],
                                ],
                                value: '-1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringOrNumberByValue,
                            },
                            // {
                            //     type: 'Block',
                            //     accept: 'string',
                            //     defaultType: 'number',
                            // },
                            // {
                            //     type: 'Block',
                            //     accept: 'string',
                            //     defaultType: 'number',
                            // },
                        ]
                    }
                ]
            },
        },

        neobot_purple_motor_stop: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_motor_both, 'both'],
                        [Lang.Blocks.neobot_purple_motor_left, 'left'],
                        [Lang.Blocks.neobot_purple_motor_right, 'right'],
                    ],
                    value: 'both',
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
            events: {},
            def: {
                params: [
                    null, null,
                ],
                type: 'neobot_purple_motor_stop',
            },
            paramsKeyMap: {
                MOTOR: 0,
            },
            class: 'neobot_purple_motor',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                const motor = script.getStringField('MOTOR');

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_motor_stop ===', 'speak');
                    Entry.console.print('motor : ' + motor, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                if (motor == 'both') {
                    Entry.hw.sendQueue['DCL'] = 0;
                    Entry.hw.sendQueue['DCR'] = 0;
                } else if (motor == 'left') {
                    Entry.hw.sendQueue['DCL'] = 0;
                } else {
                    Entry.hw.sendQueue['DCR'] = 0;
                }
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.motor_stop(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_motor_both, 'both'],
                                    [Lang.Blocks.neobot_purple_motor_left, 'left'],
                                    [Lang.Blocks.neobot_purple_motor_right, 'right'],
                                ],
                                value: 'both',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                        ]
                    }
                ]
            },
        },

        /*************************
         * class neobot_purple_melody
         *************************/
        neobot_purple_play_note_for: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_sound_silent, '0'],
                        [Lang.Blocks.neobot_purple_sound_do, 'c'],
                        [Lang.Blocks.neobot_purple_sound_do_shop, 'c#'],
                        [Lang.Blocks.neobot_purple_sound_re, 'd'],
                        [Lang.Blocks.neobot_purple_sound_re_shop, 'd#'],
                        [Lang.Blocks.neobot_purple_sound_mi, 'e'],
                        [Lang.Blocks.neobot_purple_sound_fa, 'f'],
                        [Lang.Blocks.neobot_purple_sound_fa_shop, 'f#'],
                        [Lang.Blocks.neobot_purple_sound_so, 'g'],
                        [Lang.Blocks.neobot_purple_sound_so_shop, 'g#'],
                        [Lang.Blocks.neobot_purple_sound_la, 'a'],
                        [Lang.Blocks.neobot_purple_sound_la_shop, 'a#'],
                        [Lang.Blocks.neobot_purple_sound_ti, 'b'],
                    ],
                    value: '0',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
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
                    value: '0',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_sound_half_note, '2'],
                        [Lang.Blocks.neobot_purple_sound_quarter_note, '4'],
                        [Lang.Blocks.neobot_purple_sound_eighth_note, '8'],
                        [Lang.Blocks.neobot_purple_sound_sixteenth_note, '16'],
                    ],
                    value: '2',
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
            events: {},
            def: {
                params: ['c', '3', '4', null],
                type: 'neobot_purple_play_note_for',
            },
            paramsKeyMap: {
                NOTE: 0,
                OCTAVE: 1,
                DURATION: 2,
            },
            class: 'neobot_purple_melody',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                if (!script.isStart) {
                    let octave_cvt = {
                        '1': 0,
                        '2': 1,
                        '3': 2,
                        '4': 3,
                        '5': 4,
                        '6': 5,
                    };
                    let note_cvt = {
                        'c': 1,
                        'c#': 2,
                        'd': 3,
                        'd#': 4,
                        'e': 5,
                        'f': 6,
                        'f#': 7,
                        'g': 8,
                        'g#': 9,
                        'a': 10,
                        'a#': 11,
                        'b': 12,
                    };
                    const note = note_cvt[script.getStringField('NOTE', script)];
                    const octave = octave_cvt[script.getStringField('OCTAVE', script)];
                    const duration = script.getNumberField('DURATION', script);
                    let value = note > 0 ? note + 12 * octave : 0;

                    value = Math.min(value, 72);

                    if (Entry.NeobotPurple.log_to_console) {
                        Entry.console.print('=== neobot_purple_play_note_for ===', 'speak');
                        Entry.console.print('note : ' + note, 'speak');
                        Entry.console.print('octave : ' + octave, 'speak');
                        Entry.console.print('duration : ' + duration, 'speak');
                        Entry.console.print('value : ' + value, 'speak');
                        Entry.console.print('==========================', 'speak');
                    }

                    script.isStart = true;
                    script.timeFlag = 1;

                    Entry.hw.sendQueue['SND'] = value;
                    setTimeout(function() {
                        Entry.hw.sendQueue['SND'] = 0;
                        if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_play_note_for : 0', 'speak');
                        script.timeFlag = 0;
                    }, 1 / duration * 2000);
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
                        syntax: 'Neosoco.buzzer(%2, %1, %3)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_sound_silent, '0'],
                                    [Lang.Blocks.neobot_purple_sound_do, 'c'],
                                    [Lang.Blocks.neobot_purple_sound_do_shop, 'c#'],
                                    [Lang.Blocks.neobot_purple_sound_re, 'd'],
                                    [Lang.Blocks.neobot_purple_sound_re_shop, 'd#'],
                                    [Lang.Blocks.neobot_purple_sound_mi, 'e'],
                                    [Lang.Blocks.neobot_purple_sound_fa, 'f'],
                                    [Lang.Blocks.neobot_purple_sound_fa_shop, 'f#'],
                                    [Lang.Blocks.neobot_purple_sound_so, 'g'],
                                    [Lang.Blocks.neobot_purple_sound_so_shop, 'g#'],
                                    [Lang.Blocks.neobot_purple_sound_la, 'a'],
                                    [Lang.Blocks.neobot_purple_sound_la_shop, 'a#'],
                                    [Lang.Blocks.neobot_purple_sound_ti, 'b'],
                                ],
                                value: 'c',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
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
                                value: '3',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_sound_half_note, '2'],
                                    [Lang.Blocks.neobot_purple_sound_quarter_note, '4'],
                                    [Lang.Blocks.neobot_purple_sound_eighth_note, '8'],
                                    [Lang.Blocks.neobot_purple_sound_sixteenth_note, '16'],
                                ],
                                value: '4',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_melody_play_with_sensor: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                        [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                        [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                    ],
                    value: 'IN1',
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
            events: {},
            def: {
                params: [
                    null, null,
                ],
                type: 'neobot_purple_melody_play_with_sensor',
            },
            paramsKeyMap: {
                INPUT: 0,
            },
            class: 'neobot_purple_melody',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                const input = script.getStringField('INPUT');
                let value = Entry.hw.portData[input];

                // edited 210421, 0~100 을 0~65로 변환, 100 이상은 최대값으로 처리함.
                value = Math.max(value, 0);
                value = Math.min(value, 100);
                value = Math.ceil(value / 100 * 65);

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_melody_play_with_sensor ===', 'speak');
                    Entry.console.print('input : ' + input, 'speak');
                    Entry.console.print('value : ' + value, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                Entry.hw.sendQueue['SND'] = value;
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.buzzer_by_port(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                                    [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                                    [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                                ],
                                value: 'IN1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_melody_stop: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
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
                    null,
                ],
                type: 'neobot_purple_melody_stop',
            },
            paramsKeyMap: {},
            class: 'neobot_purple_melody',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_melody_stop ===', 'speak');
                    Entry.console.print('value : 0', 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                Entry.hw.sendQueue['SND'] = 0;
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.buzzer_stop()'
                    }
                ]
            },
        },

        /*************************
         * class neobot_purple_servo
         *************************/
        neobot_purple_servo_init: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
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
            events: {},
            def: {
                params: [
                    null,
                    null,
                ],
                type: 'neobot_purple_servo_init',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'neobot_purple_servo',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                if (!script.isStart) {
                    const port = script.getStringField('PORT', script);
                    const resetValue = 186;
                    const initValue = 1;

                    if (Entry.NeobotPurple.log_to_console) {
                        Entry.console.print('=== neobot_purple_servo_init ===', 'speak');
                        Entry.console.print('port : ' + port, 'speak');
                        Entry.console.print('==========================', 'speak');
                    }

                    let out1 = port == 'OUT1';
                    let out2 = port == 'OUT2';
                    let out3 = port == 'OUT3';
                    if (port == 'ALL') {
                        out1 = true;
                        out2 = true;
                        out3 = true;
                    }

                    script.isStart = true;
                    script.timeFlag = 1;

                    if (out1) Entry.hw.sendQueue['OUT1'] = resetValue;
                    if (out2) Entry.hw.sendQueue['OUT2'] = resetValue;
                    if (out3) Entry.hw.sendQueue['OUT3'] = resetValue;
                    if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_servo_init : ' + resetValue, 'speak');
                    setTimeout(function() {
                        if (out1) Entry.hw.sendQueue['OUT1'] = initValue;
                        if (out2) Entry.hw.sendQueue['OUT2'] = initValue;
                        if (out3) Entry.hw.sendQueue['OUT3'] = initValue;
                        if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_servo_init : ' + initValue, 'speak');
                        setTimeout(function() {
                            script.timeFlag = 0;
                        }, 100);
                    }, 200);

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
                        syntax: 'Neosoco.servo_reset_degree(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_servo_rotate: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_servo_dir_1, 'forward'],
                        [Lang.Blocks.neobot_purple_servo_dir_2, 'backward'],
                    ],
                    value: 'forward',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['IN1', 'IN1'],
                        ['IN2', 'IN2'],
                        ['IN3', 'IN3'],
                        ['0%', 0],
                        ['10%', 10],
                        ['20%', 20],
                        ['30%', 30],
                        ['40%', 40],
                        ['50%', 50],
                        ['60%', 60],
                        ['70%', 70],
                        ['80%', 80],
                        ['90%', 90],
                        ['100%', 100],
                    ],
                    value: 50,
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
            events: {},
            def: {
                params: [
                    null,
                    null,
                    null,
                    null,
                ],
                type: 'neobot_purple_servo_rotate',
            },
            paramsKeyMap: {
                PORT: 0,
                DIRECTION: 1,
                SPEED: 2,
            },
            class: 'neobot_purple_servo',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                let dir_cvt = {
                    'forward': 1,
                    'backward': 2,
                };
                const port = script.getStringField('PORT', script);
                const direction = dir_cvt[script.getStringField('DIRECTION')];
                const speed = script.getStringField('SPEED');

                let directionValue = 192; // 정방향
                if (direction == 2) {
                    directionValue = 208; // 역방향
                }
                let speedValue;
                if (Entry.Utils.isNumber(speed)) {
                    speedValue = Entry.parseNumber(speed);
                } else {
                    speedValue = Entry.hw.portData[speed];
                }

                // edited 210421, 0~100 을 0~10 으로 변환
                speedValue = Math.max(speedValue, 0);
                speedValue = Math.min(speedValue, 100);
                speedValue = Math.ceil(speedValue / 10);

                let outValue = directionValue + speedValue;
                if (outValue == directionValue) {
                    outValue = 254;
                } else {
                    outValue = outValue - 1;
                }

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_servo_rotate ===');
                    Entry.console.print('port : ' + port, 'speak');
                    Entry.console.print('direction : ' + direction, 'speak');
                    Entry.console.print('speed : ' + speed, 'speak');
                    Entry.console.print('direction value : ' + directionValue, 'speak');
                    Entry.console.print('speed value : ' + speedValue, 'speak');
                    Entry.console.print('output value : ' + outValue, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                if (port == 'ALL') {
                    Entry.hw.sendQueue['OUT1'] = outValue;
                    Entry.hw.sendQueue['OUT2'] = outValue;
                    Entry.hw.sendQueue['OUT3'] = outValue;
                } else {
                    Entry.hw.sendQueue[port] = outValue;
                }
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.servo_rotate(%1, %2, %3)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_servo_dir_1, 'forward'],
                                    [Lang.Blocks.neobot_purple_servo_dir_2, 'backward'],
                                ],
                                value: 'forward',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['IN1', 'IN1'],
                                    ['IN2', 'IN2'],
                                    ['IN3', 'IN3'],
                                    ['0%', 0],
                                    ['10%', 10],
                                    ['20%', 20],
                                    ['30%', 30],
                                    ['40%', 40],
                                    ['50%', 50],
                                    ['60%', 60],
                                    ['70%', 70],
                                    ['80%', 80],
                                    ['90%', 90],
                                    ['100%', 100],
                                ],
                                value: 50,
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                        ]
                    }
                ]
            },
        },
        neobot_purple_servo_stop: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
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
            events: {},
            def: {
                params: [
                    null,
                    null,
                ],
                type: 'neobot_purple_servo_stop',
            },
            paramsKeyMap: {
                PORT: 0,
            },
            class: 'neobot_purple_servo',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                const port = script.getStringField('PORT', script);
                let outValue = 254;

                if (Entry.NeobotPurple.log_to_console) {
                    Entry.console.print('=== neobot_purple_servo_stop ===', 'speak');
                    Entry.console.print('port : ' + port, 'speak');
                    Entry.console.print('output value: ' + outValue, 'speak');
                    Entry.console.print('==========================', 'speak');
                }

                if (port == 'ALL') {
                    Entry.hw.sendQueue['OUT1'] = outValue;
                    Entry.hw.sendQueue['OUT2'] = outValue;
                    Entry.hw.sendQueue['OUT3'] = outValue;
                } else {
                    Entry.hw.sendQueue[port] = outValue;
                }
                return script.callReturn();
            },
            syntax: {
                js: [],
                py: [
                    {
                        syntax: 'Neosoco.servo_stop(%1)',
                        blockType: 'param',
                        textParams: [
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue,
                            },
                        ]
                    }
                ]
            },
        },

        neobot_purple_servo_change_degree: {
            color: EntryStatic.colorSet.block.default.HARDWARE,
            outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
            skeleton: 'basic',
            statements: [],
            params: [
                // {
                //     type: 'Block',
                //     accept: 'string',
                // },
                {
                    type: 'Dropdown',
                    options: [
                        ['OUT1', 'OUT1'],
                        ['OUT2', 'OUT2'],
                        ['OUT3', 'OUT3'],
                        [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                    ],
                    value: 'OUT1',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_servo_dir_1, 'forward'],
                        [Lang.Blocks.neobot_purple_servo_dir_2, 'backward'],
                    ],
                    value: 'forward',
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        ['IN1', 'IN1'],
                        ['IN2', 'IN2'],
                        ['IN3', 'IN3'],
                        ['0%', 0],
                        ['10%', 10],
                        ['20%', 20],
                        ['30%', 30],
                        ['40%', 40],
                        ['50%', 50],
                        ['60%', 60],
                        ['70%', 70],
                        ['80%', 80],
                        ['90%', 90],
                        ['100%', 100],
                    ],
                    value: 50,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                    arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                },
                {
                    type: 'Dropdown',
                    options: [
                        [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                        [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                        [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                        [Lang.Blocks.neobot_purple_angle_0, '0'],
                        [Lang.Blocks.neobot_purple_angle_5, '5'],
                        [Lang.Blocks.neobot_purple_angle_10, '10'],
                        [Lang.Blocks.neobot_purple_angle_15, '15'],
                        [Lang.Blocks.neobot_purple_angle_20, '20'],
                        [Lang.Blocks.neobot_purple_angle_25, '25'],
                        [Lang.Blocks.neobot_purple_angle_30, '30'],
                        [Lang.Blocks.neobot_purple_angle_35, '35'],
                        [Lang.Blocks.neobot_purple_angle_40, '40'],
                        [Lang.Blocks.neobot_purple_angle_45, '45'],
                        [Lang.Blocks.neobot_purple_angle_50, '50'],
                        [Lang.Blocks.neobot_purple_angle_55, '55'],
                        [Lang.Blocks.neobot_purple_angle_60, '60'],
                        [Lang.Blocks.neobot_purple_angle_65, '65'],
                        [Lang.Blocks.neobot_purple_angle_70, '70'],
                        [Lang.Blocks.neobot_purple_angle_75, '75'],
                        [Lang.Blocks.neobot_purple_angle_80, '80'],
                        [Lang.Blocks.neobot_purple_angle_85, '85'],
                        [Lang.Blocks.neobot_purple_angle_90, '90'],
                        [Lang.Blocks.neobot_purple_angle_95, '95'],
                        [Lang.Blocks.neobot_purple_angle_100, '100'],
                        [Lang.Blocks.neobot_purple_angle_105, '105'],
                        [Lang.Blocks.neobot_purple_angle_110, '110'],
                        [Lang.Blocks.neobot_purple_angle_115, '115'],
                        [Lang.Blocks.neobot_purple_angle_120, '120'],
                        [Lang.Blocks.neobot_purple_angle_125, '125'],
                        [Lang.Blocks.neobot_purple_angle_130, '130'],
                        [Lang.Blocks.neobot_purple_angle_135, '135'],
                        [Lang.Blocks.neobot_purple_angle_140, '140'],
                        [Lang.Blocks.neobot_purple_angle_145, '145'],
                        [Lang.Blocks.neobot_purple_angle_150, '150'],
                        [Lang.Blocks.neobot_purple_angle_155, '155'],
                        [Lang.Blocks.neobot_purple_angle_160, '160'],
                        [Lang.Blocks.neobot_purple_angle_165, '165'],
                        [Lang.Blocks.neobot_purple_angle_170, '170'],
                        [Lang.Blocks.neobot_purple_angle_175, '175'],
                        [Lang.Blocks.neobot_purple_angle_180, '180'],
                    ],
                    value: '90',
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
            events: {},
            def: {
                params: [
                    // {
                    //     type: 'get_servo_degree',
                    //     id: 'm211',
                    // },
                    // null,
                    // null,
                    // null,
                    null,
                ],
                type: 'neobot_purple_servo_change_degree',
            },
            paramsKeyMap: {
                DEGREE: 3,
                PORT: 0,
                DIRECTION: 1,
                SPEED: 2,
            },
            class: 'neobot_purple_servo',
            isNotFor: ['neosoco'],
            func: function(sprite, script) {
                if (!script.isStart) {
                    let dir_cvt = {
                        'forward': 1,
                        'backward': 2,
                    };
                    const port = script.getStringField('PORT', script);
                    const direction = dir_cvt[script.getStringValue('DIRECTION')];
                    const speed = script.getStringValue('SPEED');
                    const degree = script.getStringValue('DEGREE');

                    let out1 = port == 'OUT1';
                    let out2 = port == 'OUT2';
                    let out3 = port == 'OUT3';
                    if (port == 'ALL') {
                        out1 = true;
                        out2 = true;
                        out3 = true;
                    }

                    let directionValue = 188;
                    if (direction == 2) {
                        directionValue = 189;
                    }

                    let speedValue;
                    if (Entry.Utils.isNumber(speed)) {
                        speedValue = Entry.parseNumber(speed);
                    } else {
                        speedValue = Entry.hw.portData[speed];
                    }

                    // edited 210421, 0~100 을 240~250 으로 변환
                    speedValue = Math.max(speedValue, 0);
                    speedValue = Math.min(speedValue, 100);
                    speedValue = Math.ceil(speedValue / 10) + 240;

                    let degreeValue;
                    if (Entry.Utils.isNumber(degree)) {
                        degreeValue = Entry.parseNumber(degree);
                    } else {
                        if (degree == 'IN1' || degree == 'IN2' || degree == 'IN3') {
                            degreeValue = Entry.hw.portData[degree];
                        } else {
                            degreeValue = 0;
                        }
                    }
                    // edited 210421, 별도의 변환없이 그대로 사용함
                    degreeValue = Math.max(degreeValue, 0);
                    degreeValue = Math.min(degreeValue, 180);
                    degreeValue = degreeValue + 1;

                    if (Entry.NeobotPurple.log_to_console) {
                        Entry.console.print('=== neobot_purple_servo_change_degree ===', 'speak');
                        Entry.console.print('port : ' + port, 'speak');
                        Entry.console.print('direction : ' + direction, 'speak');
                        Entry.console.print('speed : ' + speed, 'speak');
                        Entry.console.print('degree : ' + degree, 'speak');
                        Entry.console.print('directionValue : ' + directionValue, 'speak');
                        Entry.console.print('speedValue : ' + speedValue, 'speak');
                        Entry.console.print('degreeValue : ' + degreeValue, 'speak');
                        Entry.console.print('==========================', 'speak');
                    }

                    script.isStart = true;
                    script.timeFlag = 1;

                    // direction
                    if (out1) Entry.hw.sendQueue['OUT1'] = directionValue;
                    if (out2) Entry.hw.sendQueue['OUT2'] = directionValue;
                    if (out3) Entry.hw.sendQueue['OUT3'] = directionValue;
                    if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_servo_change_degree : ' + directionValue, 'speak');
                    setTimeout(function() { // speed
                        if (out1) Entry.hw.sendQueue['OUT1'] = speedValue;
                        if (out2) Entry.hw.sendQueue['OUT2'] = speedValue;
                        if (out3) Entry.hw.sendQueue['OUT3'] = speedValue;
                        if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_servo_change_degree : ' + speedValue, 'speak');
                        setTimeout(function() { // degree
                            if (out1) Entry.hw.sendQueue['OUT1'] = degreeValue;
                            if (out2) Entry.hw.sendQueue['OUT2'] = degreeValue;
                            if (out3) Entry.hw.sendQueue['OUT3'] = degreeValue;
                            if (Entry.NeobotPurple.log_to_console) Entry.console.print('neobot_purple_servo_change_degree : ' + degreeValue, 'speak');
                            setTimeout(function() { // final delay
                                script.timeFlag = 0;
                            }, 200);
                        }, 200);
                    }, 200);

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
                        syntax: 'Neosoco.servo_rotate_by_degree(%1, %2, %3, %4)',
                        blockType: 'param',
                        textParams: [
                            // {
                            //     type: 'Block',
                            //     accept: 'string',
                            // },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['OUT1', 'OUT1'],
                                    ['OUT2', 'OUT2'],
                                    ['OUT3', 'OUT3'],
                                    [Lang.Blocks.neobot_purple_out_all, 'ALL'],
                                ],
                                value: 'OUT1',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_servo_dir_1, 'forward'],
                                    [Lang.Blocks.neobot_purple_servo_dir_2, 'backward'],
                                ],
                                value: 'forward',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    ['IN1', 'IN1'],
                                    ['IN2', 'IN2'],
                                    ['IN3', 'IN3'],
                                    ['0%', 0],
                                    ['10%', 10],
                                    ['20%', 20],
                                    ['30%', 30],
                                    ['40%', 40],
                                    ['50%', 50],
                                    ['60%', 60],
                                    ['70%', 70],
                                    ['80%', 80],
                                    ['90%', 90],
                                    ['100%', 100],
                                ],
                                value: 50,
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                            {
                                type: 'Dropdown',
                                options: [
                                    [Lang.Blocks.neobot_purple_port_1, 'IN1'],
                                    [Lang.Blocks.neobot_purple_port_2, 'IN2'],
                                    [Lang.Blocks.neobot_purple_port_3, 'IN3'],
                                    [Lang.Blocks.neobot_purple_angle_0, '0'],
                                    [Lang.Blocks.neobot_purple_angle_5, '5'],
                                    [Lang.Blocks.neobot_purple_angle_10, '10'],
                                    [Lang.Blocks.neobot_purple_angle_15, '15'],
                                    [Lang.Blocks.neobot_purple_angle_20, '20'],
                                    [Lang.Blocks.neobot_purple_angle_25, '25'],
                                    [Lang.Blocks.neobot_purple_angle_30, '30'],
                                    [Lang.Blocks.neobot_purple_angle_35, '35'],
                                    [Lang.Blocks.neobot_purple_angle_40, '40'],
                                    [Lang.Blocks.neobot_purple_angle_45, '45'],
                                    [Lang.Blocks.neobot_purple_angle_50, '50'],
                                    [Lang.Blocks.neobot_purple_angle_55, '55'],
                                    [Lang.Blocks.neobot_purple_angle_60, '60'],
                                    [Lang.Blocks.neobot_purple_angle_65, '65'],
                                    [Lang.Blocks.neobot_purple_angle_70, '70'],
                                    [Lang.Blocks.neobot_purple_angle_75, '75'],
                                    [Lang.Blocks.neobot_purple_angle_80, '80'],
                                    [Lang.Blocks.neobot_purple_angle_85, '85'],
                                    [Lang.Blocks.neobot_purple_angle_90, '90'],
                                    [Lang.Blocks.neobot_purple_angle_95, '95'],
                                    [Lang.Blocks.neobot_purple_angle_100, '100'],
                                    [Lang.Blocks.neobot_purple_angle_105, '105'],
                                    [Lang.Blocks.neobot_purple_angle_110, '110'],
                                    [Lang.Blocks.neobot_purple_angle_115, '115'],
                                    [Lang.Blocks.neobot_purple_angle_120, '120'],
                                    [Lang.Blocks.neobot_purple_angle_125, '125'],
                                    [Lang.Blocks.neobot_purple_angle_130, '130'],
                                    [Lang.Blocks.neobot_purple_angle_135, '135'],
                                    [Lang.Blocks.neobot_purple_angle_140, '140'],
                                    [Lang.Blocks.neobot_purple_angle_145, '145'],
                                    [Lang.Blocks.neobot_purple_angle_150, '150'],
                                    [Lang.Blocks.neobot_purple_angle_155, '155'],
                                    [Lang.Blocks.neobot_purple_angle_160, '160'],
                                    [Lang.Blocks.neobot_purple_angle_165, '165'],
                                    [Lang.Blocks.neobot_purple_angle_170, '170'],
                                    [Lang.Blocks.neobot_purple_angle_175, '175'],
                                    [Lang.Blocks.neobot_purple_angle_180, '180'],
                                ],
                                value: '90',
                                fontSize: 11,
                                bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
                                arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
                                converter: Entry.block.converters.returnStringValue
                            },
                        ]
                    }
                ]
            },
        },

        /*****************
         * ARG Blocks
         *****************/
        // neobot_purple_arg_led_duration: {
        //     color: EntryStatic.colorSet.block.default.HARDWARE,
        //     outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
        //     skeleton: 'basic_string_field',
        //     statements: [],
        //     params: [
        //         {
        //             type: 'Dropdown',
        //             options: [
        //                 [Lang.Blocks.neobot_purple_duration_cont, '계속'],
        //                 [Lang.Blocks.neobot_purple_duration_1s, '1'],
        //                 [Lang.Blocks.neobot_purple_duration_2s, '2'],
        //                 [Lang.Blocks.neobot_purple_duration_3s, '3'],
        //                 [Lang.Blocks.neobot_purple_duration_4s, '4'],
        //                 [Lang.Blocks.neobot_purple_duration_5s, '5'],
        //                 [Lang.Blocks.neobot_purple_duration_6s, '6'],
        //                 [Lang.Blocks.neobot_purple_duration_7s, '7'],
        //                 [Lang.Blocks.neobot_purple_duration_8s, '8'],
        //                 [Lang.Blocks.neobot_purple_duration_9s, '9'],
        //             ],
        //             value: '계속',
        //             fontSize: 11,
        //             bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
        //             arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
        //         },
        //     ],
        //     events: {},
        //     def: {
        //         params: [null],
        //     },
        //     paramsKeyMap: {
        //         VALUE: 0,
        //     },
        //     class: 'neobot_purple_led',
        //     isNotFor: ['neosoco'],
        //     func: function(sprite, script) {
        //         return script.getStringField('VALUE');
        //     },
        // },

        // neobot_purple_arg_motor_speed: {
        //     color: EntryStatic.colorSet.block.default.HARDWARE,
        //     outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
        //     skeleton: 'basic_string_field',
        //     statements: [],
        //     params: [
        //         {
        //             type: 'Dropdown',
        //             options: [
        //                 ['IN1', 'IN1'],
        //                 ['IN2', 'IN2'],
        //                 ['IN3', 'IN3'],
        //                 ['100%', 100],
        //                 ['90%', 90],
        //                 ['80%', 80],
        //                 ['70%', 70],
        //                 ['60%', 60],
        //                 ['50%', 50],
        //                 ['40%', 40],
        //                 ['30%', 30],
        //                 ['20%', 20],
        //                 ['10%', 10],
        //                 ['0%', 0],
        //             ],
        //             value: 100,
        //             fontSize: 11,
        //             bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
        //             arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
        //         },
        //     ],
        //     events: {},
        //     def: {
        //         params: [null],
        //     },
        //     paramsKeyMap: {
        //         VALUE: 0,
        //     },
        //     class: 'neobot_purple_motor',
        //     isNotFor: ['neosoco'],
        //     func: function(sprite, script) {
        //         return script.getStringField('VALUE');
        //     },
        // },

        // neobot_purple_arg_motor_duration: {
        //     color: EntryStatic.colorSet.block.default.HARDWARE,
        //     outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
        //     skeleton: 'basic_string_field',
        //     statements: [],
        //     params: [
        //         {
        //             type: 'Dropdown',
        //             options: [
        //                 [Lang.Blocks.neobot_purple_duration_cont, '계속'],
        //                 [Lang.Blocks.neobot_purple_duration_1s, '1'],
        //                 [Lang.Blocks.neobot_purple_duration_2s, '2'],
        //                 [Lang.Blocks.neobot_purple_duration_3s, '3'],
        //                 [Lang.Blocks.neobot_purple_duration_4s, '4'],
        //                 [Lang.Blocks.neobot_purple_duration_5s, '5'],
        //                 [Lang.Blocks.neobot_purple_duration_6s, '6'],
        //                 [Lang.Blocks.neobot_purple_duration_7s, '7'],
        //                 [Lang.Blocks.neobot_purple_duration_8s, '8'],
        //                 [Lang.Blocks.neobot_purple_duration_9s, '9'],
        //             ],
        //             value: '계속',
        //             fontSize: 11,
        //             bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
        //             arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
        //         },
        //     ],
        //     events: {},
        //     def: {
        //         params: [null],
        //     },
        //     paramsKeyMap: {
        //         VALUE: 0,
        //     },
        //     class: 'neobot_purple_motor',
        //     isNotFor: ['neosoco'],
        //     func: function(sprite, script) {
        //         return script.getStringField('VALUE');
        //     },
        // },

        // get_servo_degree: {
        //     color: EntryStatic.colorSet.block.default.HARDWARE,
        //     outerLine: EntryStatic.colorSet.block.darken.HARDWARE,
        //     skeleton: 'basic_string_field',
        //     statements: [],
        //     params: [
        //         {
        //             type: 'Dropdown',
        //             options: [
        //                 [Lang.Blocks.neobot_purple_port_1, 'IN1'],
        //                 [Lang.Blocks.neobot_purple_port_2, 'IN2'],
        //                 [Lang.Blocks.neobot_purple_port_3, 'IN3'],
        //                 [Lang.Blocks.neobot_purple_angle_0, '0'],
        //                 [Lang.Blocks.neobot_purple_angle_5, '5'],
        //                 [Lang.Blocks.neobot_purple_angle_10, '10'],
        //                 [Lang.Blocks.neobot_purple_angle_15, '15'],
        //                 [Lang.Blocks.neobot_purple_angle_20, '20'],
        //                 [Lang.Blocks.neobot_purple_angle_25, '25'],
        //                 [Lang.Blocks.neobot_purple_angle_30, '30'],
        //                 [Lang.Blocks.neobot_purple_angle_35, '35'],
        //                 [Lang.Blocks.neobot_purple_angle_40, '40'],
        //                 [Lang.Blocks.neobot_purple_angle_45, '45'],
        //                 [Lang.Blocks.neobot_purple_angle_50, '50'],
        //                 [Lang.Blocks.neobot_purple_angle_55, '55'],
        //                 [Lang.Blocks.neobot_purple_angle_60, '60'],
        //                 [Lang.Blocks.neobot_purple_angle_65, '65'],
        //                 [Lang.Blocks.neobot_purple_angle_70, '70'],
        //                 [Lang.Blocks.neobot_purple_angle_75, '75'],
        //                 [Lang.Blocks.neobot_purple_angle_80, '80'],
        //                 [Lang.Blocks.neobot_purple_angle_85, '85'],
        //                 [Lang.Blocks.neobot_purple_angle_90, '90'],
        //                 [Lang.Blocks.neobot_purple_angle_95, '95'],
        //                 [Lang.Blocks.neobot_purple_angle_100, '100'],
        //                 [Lang.Blocks.neobot_purple_angle_105, '105'],
        //                 [Lang.Blocks.neobot_purple_angle_110, '110'],
        //                 [Lang.Blocks.neobot_purple_angle_115, '115'],
        //                 [Lang.Blocks.neobot_purple_angle_120, '120'],
        //                 [Lang.Blocks.neobot_purple_angle_125, '125'],
        //                 [Lang.Blocks.neobot_purple_angle_130, '130'],
        //                 [Lang.Blocks.neobot_purple_angle_135, '135'],
        //                 [Lang.Blocks.neobot_purple_angle_140, '140'],
        //                 [Lang.Blocks.neobot_purple_angle_145, '145'],
        //                 [Lang.Blocks.neobot_purple_angle_150, '150'],
        //                 [Lang.Blocks.neobot_purple_angle_155, '155'],
        //                 [Lang.Blocks.neobot_purple_angle_160, '160'],
        //                 [Lang.Blocks.neobot_purple_angle_165, '165'],
        //                 [Lang.Blocks.neobot_purple_angle_170, '170'],
        //                 [Lang.Blocks.neobot_purple_angle_175, '175'],
        //                 [Lang.Blocks.neobot_purple_angle_180, '180'],
        //             ],
        //             value: '90',
        //             fontSize: 11,
        //             bgColor: EntryStatic.colorSet.block.darken.HARDWARE,
        //             arrowColor: EntryStatic.colorSet.arrow.default.HARDWARE,
        //         },
        //     ],
        //     events: {},
        //     def: {
        //         params: [null],
        //     },
        //     paramsKeyMap: {
        //         VALUE: 0,
        //     },
        //     class: 'neobot_purple_servo',
        //     isNotFor: ['neosoco'],
        //     func: function(sprite, script) {
        //         return script.getStringField('VALUE');
        //     },
        // },
    };
};

module.exports = Entry.NeobotPurple;
