import * as tf from '@tensorflow/tfjs';
import _floor from 'lodash/floor';
import _max from 'lodash/max';
import Chart from './Chart';
import _sum from 'lodash/sum';
import _mean from 'lodash/mean';
import _toNumber from 'lodash/toNumber';
import _isNaN from 'lodash/isNaN';
import LearningBase from './LearningBase';
import Utils from './Utils';

export const classes = [
    'ai_learning_train',
    'ai_learning_regression',
    'regression_attr_1',
    'regression_attr_2',
    'regression_attr_3',
    'regression_attr_4',
    'regression_attr_5',
    'regression_attr_6',
    'regression_attr_7',
    'regression_attr_8',
    'regression_attr_9',
    'regression_attr_10',
    'regression_attr_11',
    'regression_attr_12',
    'ai_learning_train_chart',
];

class Regression extends LearningBase {
    type = 'regression';

    init({ name, url, result, table, trainParam, model }) {
        this.name = name;
        this.trainParam = trainParam || {};
        // Preserve trained result across stop-event re-init.
        // The 'stop' event calls init() with stale constructor params;
        // if we already have a trained result (with graphData), keep it intact.
        if (!this.result?.graphData) {
            this.result = result || {};
            this.attrValueMaps = result?.attrValueMaps || {};
        }
        this.table = table;
        this.trainCallback = (value) => {
            this.view.setValue(value);
        };
        this.trained = true;

        this.attrLength = table?.select?.[0]?.length || 0;
        if (this.attrLength === 1) {
            this.chartEnable = true;
        }
        if (this.model) {
            // Already loaded or trained
        } else if (model && typeof model === 'object') {
            this.load(model);
        } else if (this.url !== url) {
            this.load(url);
            this.url = url;
        }

        this.fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.predictFields = table?.select?.[1]?.map((index) => table?.fields[index]);

        if (!Utils.isWebGlSupport()) {
            tf.setBackend('cpu');
        }
    }

    generateChart() {
        this.chart = new Chart({
            source: this.chartData,
            title: Lang.AiLearning.chart_title,
            description: `
                ${this.fields.map(
                (field, index) =>
                    `<em>${Lang.AiLearning.model_attr_str} ${index + 1}</em>: ${field}`
            )}
                <em>${Lang.AiLearning.predict}</em>${this.predictFields[0]}<em>${Lang.AiLearning.equation
                }</em>${this.result.equation}
            `,
        });
    }

    async train() {
        try {
            this.setTable();
            this.trained = false;
            let currentEpoch = 0;
            let percent = 0;
            this.trainCallback(1);
            const { inputs, outputs, attrValueMaps } = convertToTfData(this.table, this.trainParam);
            const { model, trainHistory, a, b, graphData = [], rsquared, normResult } = await train(
                inputs,
                outputs,
                this.trainParam,
                undefined,
                () => {
                    currentEpoch = currentEpoch + 1;
                    percent = _floor((currentEpoch / this.trainParam.epochs) * 100);
                    this.trainCallback(Math.min(percent, 100));
                }
            );
            this.model = model;
            const { acc = [] } = trainHistory?.history || {};
            const accuracy = _max(acc) || 0;
            const graphPoints = (graphData.originalPoints || []).slice(0, 1000);
            if (inputs.length == 1) {
                graphData.predictedPoints.map(({ x, y }, i) => {
                    let index = graphPoints.sort((a, b) => a.x - b.x).findIndex((p) => p.x >= x);
                    if (index < 0 && i > 0) {
                        index = graphPoints.length - 1;
                    }
                    if (graphPoints[index]) {
                        graphPoints[index].equation = y;
                    }
                });
            }
            this.result = {
                graphData: graphPoints,
                accuracy,
                normResult,
                rsquared,
                equation: `Y = ${a
                    .map((a, i) => `${addSign(a)}X<sub>${i + 1}</sub>`)
                    .join('')} ${addSign(b)}`,
                attrValueMaps,
            };
            this.attrValueMaps = attrValueMaps;
            this.attrLength = inputs.length;
            this.updateFields();
            this.trained = true;
            this.chart?.load({
                source: this.chartData,
                description: `
                    ${this.fields.map(
                    (field, index) =>
                        `<em>${Lang.AiLearning.model_attr_str} ${index + 1}</em> ${field}`
                )}
                    <em>${Lang.AiLearning.predict}</em> ${this.predictFields[0]}<em>${Lang.AiLearning.equation
                    }</em>${this.result.equation}
                `,
            });
        } catch (e) {
            console.log('train error', e);
        }
    }

    async load(url) {
        try {
            let model;
            if (typeof url === 'object' && url !== null) {
                model = await tf.loadLayersModel({ load: () => Promise.resolve(url) });
            } else {
                model = await tf.loadLayersModel(url);
            }
            const modelData = new Promise((resolve) =>
                model.save({
                    save: (data) => {
                        const layers = data?.modelTopology?.config?.layers;
                        if (Array.isArray(layers)) {
                            data.modelTopology.config.layers.forEach((layer) => {
                                if (layer?.config?.name) {
                                    layer.config.name = `${layer.config.name}_ws`;
                                }
                            });
                        }
                        if (Array.isArray(data.weightSpecs)) {
                            data.weightSpecs.forEach((spec) => {
                                const splits = spec.name.split('/');
                                splits[0] = `${splits[0]}_ws`;
                                spec.name = splits.join('/');
                            });
                        }
                        resolve(data);
                    },
                })
            );
            this.model = await tf.loadLayersModel({ load: () => modelData });
            model.dispose();
        } catch (e) {
            console.error('Regression model load failed:', e);
            Entry.toast.alert(
                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                typeof Lang !== 'undefined' && Lang.AiLearning?.load_error
                    ? Lang.AiLearning.load_error
                    : '모델을 불러오는 중 오류가 발생했습니다. 다시 학습시켜 주세요.'
            );
        }
    }

    convertNomalResult() {
        const { inputMin, inputMax, outputMax, outputMin } = this.result.normResult;
        if (!Array.isArray(inputMin)) {
            return this.result.normResult;
        }
        return {
            inputMin: tf.tensor1d(inputMin),
            inputMax: tf.tensor1d(inputMax),
            outputMax: tf.tensor1d(outputMax),
            outputMin: tf.tensor1d(outputMin),
        };
    }

    updateFields() {
        this.fields = this.table?.select?.[0]?.map((index) => this.table?.fields[index]);
        this.predictFields = this.table?.select?.[1]?.map((index) => this.table?.fields[index]);
    }
    async predict(data) {
        tf.engine().startScope();
        const { inputMin, inputMax, outputMax, outputMin } = this.convertNomalResult();
        const result = tf.tidy(() => {
            let convertedData;
            const attrFiltered = this.table?.select?.[0] || [];
            const encodedArray = (Array.isArray(data) ? data : [data]).map((val, index) => {
                const originalIndex = attrFiltered[index];
                const num = parseFloat(val);
                if (!_isNaN(num)) {
                    return num;
                }
                const map = this.attrValueMaps?.[originalIndex];
                if (map) {
                    const trimmedValue = typeof val === 'string' ? val.trim() : val;
                    return map[trimmedValue] || 0;
                }
                return 0;
            });

            if (Array.isArray(data)) {
                convertedData = tf.tensor2d([encodedArray]);
            } else {
                convertedData = tf.tensor1d(encodedArray);
            }
            convertedData = convertedData.sub(inputMin).div(inputMax.sub(inputMin));
            const preds = this.model
                .predict(convertedData)
                .mul(outputMax.sub(outputMin))
                .add(outputMin);
            const [result] = preds.dataSync();
            this.predictResult = _floor(result, 2);
            preds.dispose();
            return this.predictResult;
        });
        tf.engine().endScope();
        return result;
    }

    get chartData() {
        return {
            data: {
                json: this.result.graphData,
                keys: { value: ['equation', 'y'], x: 'x' },
                types: {
                    y: 'scatter',
                    equation: 'line',
                },
            },
            options: {
                legend: {
                    show: false,
                },
                tooltip: {
                    contents: (data) => {
                        const [{ x, value, id }] = data;
                        return `
                            <div class="chart_handle_wrapper">
                                ${this.fields[0]}: ${x}, ${this.predictFields[0]}: ${value}
                            <div>
                        `;
                    },
                },
                line: {
                    connectNull: true,
                    point: false,
                },
                axis: {
                    x: {
                        tick: {
                            fit: false,
                            count: 15,
                        },
                    },
                },
                grid: {
                    x: {
                        show: true,
                    },
                    y: {
                        show: true,
                    },
                },
            },
        };
    }
    isTrained() {
        return this.trained && !!this.model;
    }
}

export default Regression;

function addSign(x) {
    return x < 0 ? x : `+${x}`;
}

function convertToTfData(data, trainParam) {
    const { select = [[0], [1]], data: table } = data;
    const [attr, predict] = select;
    const { epochs = 1, batchSize = 1 } = trainParam;
    const filtered = table.filter((row) => {
        const hasLabel = predict.every((i) => {
            const val = row[i];
            return val !== undefined && val !== null && String(val).trim() !== '';
        });
        const hasAttrs = attr.every((i) => {
            const val = row[i];
            return val !== undefined && val !== null && String(val).trim() !== '';
        });
        return hasLabel && hasAttrs;
    });
    const totalDataSize = Math.ceil(filtered.length / batchSize) * epochs;
    const ATTR_STR2NUM_MAP = {};
    const ATTR_STR2NUM_MAP_COUNT = {};
    const result = filtered.reduce(
        (accumulator, row) => {
            const { inputs = [], outputs = [] } = accumulator;
            return {
                inputs: attr.map((i, idx) => {
                    const arr = inputs[idx] || [];
                    const val = row[i];
                    const num = parseFloat(val);
                    const encodedVal = !_isNaN(num)
                        ? num
                        : Utils.stringToNumber(i, val, ATTR_STR2NUM_MAP, ATTR_STR2NUM_MAP_COUNT);
                    return [...arr, encodedVal];
                }),
                outputs: predict.map((i, idx) => {
                    const arr = outputs[idx] || [];
                    return [...arr, parseFloat(row[i]) || 0];
                }),
                totalDataSize,
            };
        },
        { inputs: [], outputs: [] }
    );
    return {
        ...result,
        attrValueMaps: ATTR_STR2NUM_MAP,
    };
}

function convertToTensor(inputs, outputs) {
    return tf.tidy(() => {
        const inputTensor = tf.tensor2d(inputs).transpose();
        const outputTensor = tf.tensor2d(outputs).transpose();

        const inputMax = inputTensor.max(0);
        const inputMin = inputTensor.min(0);
        const outputMax = outputTensor.max(0);
        const outputMin = outputTensor.min(0);

        // (d - min) / (max - min)
        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
        const normalizedOutputs = outputTensor.sub(outputMin).div(outputMax.sub(outputMin));

        return {
            inputs: normalizedInputs,
            outputs: normalizedOutputs,
            inputMax,
            inputMin,
            outputMax,
            outputMin,
        };
    });
}

function createModel(inputShape) {
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [inputShape], units: 1, name: 'reg_dense_ws' }));
    return model;
}
async function trainModel(model, inputs, outputs, trainParam, onBatchEnd, onEpochEnd) {
    model.compile({
        optimizer: tf.train.adam(trainParam.learningRate),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse', 'acc', 'ce'],
    });

    return await model.fit(inputs, outputs, {
        batchSize: trainParam.batchSize,
        epochs: trainParam.epochs,
        shuffle: trainParam.shuffle,
        validationSplit: trainParam.validationRate,
        callbacks: {
            onBatchEnd,
            onEpochEnd,
        },
    });
}
const TEST_POINT_COUNT = 2;
function testModel(model, normalizationData) {
    const { inputMin, inputMax, outputMin, outputMax } = normalizationData;

    const [xs, preds] = tf.tidy(() => {
        const xs = tf.linspace(0, 1, TEST_POINT_COUNT);
        const preds = model.predict(xs.reshape([TEST_POINT_COUNT, 1]));

        // d * (max - min) + min
        const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin);
        // @ts-ignore
        const unNormPreds = preds.mul(outputMax.sub(outputMin)).add(outputMin);
        return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });
    return Array.from(xs).map((val, i) => ({
        x: val,
        y: preds[i],
    }));
}

function getR2Score(model, normResult, y) {
    const yData = y[0];
    const yHat = model
        .predict(normResult.inputs)
        .mul(normResult.outputMax.sub(normResult.outputMin))
        .add(normResult.outputMin)
        .dataSync();
    const yMean = yData.reduce((acc, cur) => acc + cur) / yData.length;

    const ssr = yHat
        .map((e, index) => (e - yData[index]) * (e - yData[index]))
        .reduce((acc, cur) => acc + cur);
    const sst = yData.map((e) => (e - yMean) * (e - yMean)).reduce((acc, cur) => acc + cur);
    const r2 = 1 - ssr / sst;

    return Math.max(r2, 0);
}

async function train(inputs, outputs, trainParam, onBatchEnd, onEpochEnd) {
    const normResult = convertToTensor(inputs, outputs);
    const model = createModel(inputs.length);
    const history = await trainModel(
        model,
        normResult.inputs,
        normResult.outputs,
        trainParam,
        onBatchEnd,
        onEpochEnd
    );

    // @ts-ignore
    const weight = model.layers[0].weights[0].val;
    // @ts-ignore
    const bias = model.layers[0].weights[1].val;

    const inputMin = normResult.inputMin;
    const inputMax = normResult.inputMax;
    const outputMin = normResult.outputMin;
    const outputMax = normResult.outputMax;

    const o = outputMax.sub(outputMin);
    const oi = o.div(inputMax.sub(inputMin));

    const a = oi.mul(weight.transpose());
    const b = bias
        .mul(o)
        .add(outputMin)
        .sub(a.matMul(inputMin.expandDims(0).transpose()));
    const r2 = getR2Score(model, normResult, outputs);
    const graphData = {
        originalPoints: [],
        predictedPoints: [],
    };
    if (inputs.length === 1) {
        graphData.originalPoints = inputs[0].map((e, i) => ({
            x: e,
            y: outputs[0][i],
        }));
        graphData.predictedPoints = testModel(model, normResult);
    }

    return {
        model,
        normResult,
        trainHistory: history,
        a: Array.from(a.dataSync()).map((x) => _floor(x, 2)),
        b: _floor(b.dataSync()[0], 2),
        rsquared: _floor(r2, 2),
        graphData,
    };
}
