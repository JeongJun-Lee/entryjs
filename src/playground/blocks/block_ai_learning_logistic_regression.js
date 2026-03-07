import { createParamBlock, DropDownDynamicGenerator } from './block_ai_learning';

module.exports = {
    getBlocks() {
        const probabilityBlocks = createParamBlock({
            type: 'logistic_regression',
            name: 'get_logistic_regression_probability',
            length: 6,
            createFunc: (paramsKeyMap) => async (sprite, script) => {
                if (!Entry.aiLearning.isTrained()) {
                    Entry.toast.alert(
                        typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                        typeof Lang !== 'undefined' && Lang.AiLearning?.no_model_error
                            ? Lang.AiLearning.no_model_error
                            : '학습된 모델이 없습니다. 학습 창에서 다시 학습시켜 주세요.'
                    );
                    Entry.engine.toggleStop();
                    return script.callReturn();
                }
                const keys = Object.keys(paramsKeyMap);
                const predictKey = keys.pop();
                const params = keys.map((key) => script.getNumberValue(key, script));
                const predict = script.getStringField(predictKey, script);
                await Entry.aiLearning.predict(params);
                const predictResult = Entry.aiLearning.getPredictResult();
                const result = predictResult.find((x) => x.className === predict);
                return result?.probability || 0;
            },
            params: [
                {
                    type: 'DropdownDynamic',
                    value: null,
                    menuName: DropDownDynamicGenerator.valueMap,
                    needDeepCopy: true,
                    fontSize: 11,
                    bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                    arrowColor: EntryStatic.colorSet.common.WHITE,
                    defaultValue: (value, options) => {
                        if (options[0] && options[0][1]) {
                            return options[0][1];
                        }
                        return value || 0;
                    },
                },
            ],
        });
        return {
            ...probabilityBlocks,
            learning_title_logistic_regression: {
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.learning_title_logistic_regression_str,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'learning_title_logistic_regression',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_logistic_regression'],
                events: {},
            },
            set_logistic_regression_option: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.train_param_learningRate, 'learningRate'],
                            [Lang.AiLearning.train_param_epochs, 'epochs'],
                            [Lang.AiLearning.train_param_validationRate, 'validationRate'],
                        ],
                        value: 'learningRate',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                    {
                        type: 'Block',
                        accept: 'string',
                        defaultType: 'number',
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/ai_utilize_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    type: 'set_logistic_regression_option',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_logistic_regression_option',
                },
                paramsKeyMap: {
                    OPTION: 0,
                    VALUE: 1,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_logistic_regression'],
                func(sprite, script) {
                    if (!Entry.aiLearning.isTrained()) {
                        Entry.Utils.stopProjectWithToast(script, 'IncompatibleError', {
                            toast:
                                typeof Lang !== 'undefined' && Lang.AiLearning?.no_model_error
                                    ? Lang.AiLearning.no_model_error
                                    : '학습된 모델이 없습니다. 학습 창에서 다시 학습시켜 주세요.',
                        });
                        return script.callReturn();
                    }
                    const option = script.getField('OPTION', script);
                    const value = script.getNumberValue('VALUE', script);

                    if (option === 'learningRate' && value <= 0) {
                        Entry.toast.alert(
                            typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                            typeof Lang !== 'undefined' && Lang.AiLearning?.learning_rate_error
                                ? Lang.AiLearning.learning_rate_error
                                : '학습률은 0보다 큰 값으로 입력해 주세요.'
                        );
                        Entry.engine.toggleStop();
                        return script.callReturn();
                    }
                    if (option === 'epochs' && value < 1) {
                        Entry.toast.alert(
                            typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                            typeof Lang !== 'undefined' && Lang.AiLearning?.epochs_error
                                ? Lang.AiLearning.epochs_error
                                : '학습 횟수는 1 이상의 정수로 입력해 주세요.'
                        );
                        Entry.engine.toggleStop();
                        return script.callReturn();
                    }
                    if (option === 'validationRate' && (value < 0.1 || value > 0.9)) {
                        Entry.toast.alert(
                            typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                            typeof Lang !== 'undefined' && Lang.AiLearning?.validation_rate_error
                                ? Lang.AiLearning.validation_rate_error
                                : '검증 데이터 비율은 0.1 ~ 0.9 사이의 값으로 입력해 주세요.'
                        );
                        Entry.engine.toggleStop();
                        return script.callReturn();
                    }

                    Entry.aiLearning.setTrainOption(option, parseFloat(value));
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            set_logistic_regression_optimizer: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.train_param_optimizer_adam, 'adam'],
                            [Lang.AiLearning.train_param_optimizer_sgd, 'sgd'],
                        ],
                        value: 'adam',
                        bgColor: EntryStatic.colorSet.block.darken.AI_LEARNING,
                        arrowColor: EntryStatic.colorSet.common.WHITE,
                    },
                    {
                        type: 'Indicator',
                        img: 'block_icon/ai_utilize_icon.svg',
                        size: 11,
                    },
                ],
                events: {},
                def: {
                    type: 'set_logistic_regression_optimizer',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_logistic_regression_optimizer',
                },
                paramsKeyMap: {
                    OPTIMIZER: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_logistic_regression'],
                func(sprite, script) {
                    if (!Entry.aiLearning.isTrained()) {
                        Entry.Utils.stopProjectWithToast(script, 'IncompatibleError', {
                            toast:
                                typeof Lang !== 'undefined' && Lang.AiLearning?.no_model_error
                                    ? Lang.AiLearning.no_model_error
                                    : '학습된 모델이 없습니다. 학습 창에서 다시 학습시켜 주세요.',
                        });
                        return script.callReturn();
                    }
                    const optimizer = script.getField('OPTIMIZER', script);
                    Entry.aiLearning.setTrainOption('optimizer', optimizer);
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
        };
    },
};
