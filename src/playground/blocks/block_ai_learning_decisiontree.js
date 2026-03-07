import { createParamBlock, DropDownDynamicGenerator } from './block_ai_learning';

module.exports = {
    getBlocks() {
        return {
            learning_title_decisiontree: {
                skeleton: 'basic_text',
                color: EntryStatic.colorSet.common.TRANSPARENT,
                params: [
                    {
                        type: 'Text',
                        text: Lang.template.learning_title_decisiontree_str,
                        color: EntryStatic.colorSet.common.TEXT,
                        align: 'center',
                    },
                ],
                def: {
                    type: 'learning_title_decisiontree',
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_decisiontree'],
                events: {},
            },
            set_decisiontree_option: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.train_param_minNumSamples, 'minNumSamples'],
                            [Lang.AiLearning.train_param_maxDepth, 'maxDepth'],
                            [Lang.AiLearning.train_param_gainThreshold, 'gainThreshold'],
                        ],
                        value: 'minNumSamples',
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
                    params: ['minNumSamples', 3],
                    type: 'set_decisiontree_option',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_decisiontree_option',
                },
                paramsKeyMap: {
                    OPTION: 0,
                    VALUE: 1,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_decisiontree'],
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

                    if (option === 'maxDepth' && value < 2) {
                        Entry.toast.alert(
                            typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                            typeof Lang !== 'undefined' && Lang.AiLearning?.max_depth_error
                                ? Lang.AiLearning.max_depth_error
                                : '트리의 최대 깊이는 2 이상으로 입력해 주세요.'
                        );
                        Entry.engine.toggleStop();
                        return script.callReturn();
                    }
                    if (option === 'minNumSamples') {
                        if (value < 2) {
                            Entry.toast.alert(
                                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                                typeof Lang !== 'undefined' && Lang.AiLearning?.min_samples_error_under
                                    ? Lang.AiLearning.min_samples_error_under
                                    : '노드의 최소 데이터 수는 2 이상으로 입력해 주세요.'
                            );
                            Entry.engine.toggleStop();
                            return script.callReturn();
                        }

                        const table = Entry.aiLearning?.getTableData?.();
                        const trainDataLength = table?.data?.length || 0;
                        if (trainDataLength > 0 && value > trainDataLength) {
                            const errorMsg = typeof Lang !== 'undefined' && Lang.AiLearning?.min_samples_error
                                ? Lang.AiLearning.min_samples_error.replace('%d', trainDataLength)
                                : `노드의 최소 데이터 수는 전체 학습 데이터 수(${trainDataLength})보다 작거나 같아야 합니다.`;
                            Entry.toast.alert(
                                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                                errorMsg
                            );
                            Entry.engine.toggleStop();
                            return script.callReturn();
                        }
                    }

                    Entry.aiLearning.setTrainOption(option, parseFloat(value));
                    return script.callReturn();
                },
                syntax: {
                    js: [],
                    py: [],
                },
            },
            set_decisiontree_tree: {
                color: EntryStatic.colorSet.block.default.AI_LEARNING,
                outerLine: EntryStatic.colorSet.block.darken.AI_LEARNING,
                skeleton: 'basic',
                statements: [],
                params: [
                    {
                        type: 'Dropdown',
                        options: [
                            [Lang.AiLearning.open, 'open'],
                            [Lang.AiLearning.close, 'close'],
                        ],
                        value: 'open',
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
                    params: ['open', null],
                    type: 'set_decisiontree_tree',
                },
                pyHelpDef: {
                    params: [],
                    type: 'set_decisiontree_tree',
                },
                paramsKeyMap: {
                    VISIBLE: 0,
                },
                class: 'ai_learning',
                isNotFor: ['ai_learning_decisiontree'],
                async func(sprite, script) {
                    if (!Entry.aiLearning.isTrained()) {
                        Entry.Utils.stopProjectWithToast(script, 'IncompatibleError', {
                            toast:
                                typeof Lang !== 'undefined' && Lang.AiLearning?.no_model_error
                                    ? Lang.AiLearning.no_model_error
                                    : '학습된 모델이 없습니다. 학습 창에서 다시 학습시켜 주세요.',
                        });
                        return script.callReturn();
                    }
                    const visible = script.getField('VISIBLE');
                    Entry.aiLearning.setChartVisible(visible === 'open');
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
