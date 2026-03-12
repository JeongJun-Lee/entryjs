import LearningBase from './LearningBase';
import _floor from 'lodash/floor';
import _max from 'lodash/max';
import _sum from 'lodash/sum';
import _mean from 'lodash/mean';
import _toNumber from 'lodash/toNumber';
import _isNaN from 'lodash/isNaN';
import Utils from './Utils';
const SVM = require('libsvm-js/asm');

export const classes = [
    'ai_learning_train',
    'ai_learning_svm',
    'svm_attr_1',
    'svm_attr_2',
    'svm_attr_3',
    'svm_attr_4',
    'svm_attr_5',
    'svm_attr_6',
    'svm_attr_7',
    'svm_attr_8',
    'svm_attr_9',
    'svm_attr_10',
    'svm_attr_11',
    'svm_attr_12',
];

export const KERNEL_STRING_TYPE = {
    LINEAR: 'linear',
    POLYNOMIAL: 'polynomial',
    RBF: 'rbf',
};

export const OPTION_DEFAULT_VALUE = {
    epochs: 30,
    batchSize: 16,
    k: 4,
    initialCentroids: 'kmpp',
    neighbors: 10,
    validationRate: 0.25,
    C: 0.00001,
    degree: 3,
    gamma: 1,
};

class Svm extends LearningBase {
    type = 'svm';

    init({ name, url, result, table, trainParam, model, loadModel }) {
        this.name = name;
        this.trainParam = trainParam || {};
        // Preserve trained result across stop-event re-init.
        // The 'stop' event calls init() with stale constructor params;
        // if we already have a trained result, keep it intact.
        if (!this.result?.fields) {
            this.result = result || {};
        }
        this.table = table;
        this.loadModel = loadModel;
        this.trainCallback = (value) => {
            this.view.setValue(value);
        };
        // train 확인 필요
        this.trained = true;
        this.chartEnable = false;
        this.attrLength = table?.select?.[0]?.length || 0;

        this.fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.predictFields = table?.select?.[1]?.map((index) => table?.fields[index]);
        if (this.url !== url || this.modelId !== model) {
            this.load(url, model);
            this.url = url;
            this.modelId = model;
        }
    }

    checkTrainOptionValidation() {
        const { kernel, C, degree, gamma } = this.trainParam;
        if (!kernel || !C || !degree || !gamma) {
            throw new Error("can't train: trainOptions contain undefined");
        }
        switch (kernel) {
            case KERNEL_STRING_TYPE.LINEAR:
                if (
                    degree !== OPTION_DEFAULT_VALUE.degree ||
                    gamma !== OPTION_DEFAULT_VALUE.gamma
                ) {
                    throw new Error(
                        `can't train: invalid kernelOption. kernel type ${KERNEL_STRING_TYPE.LINEAR}`
                    );
                }
                break;
            case KERNEL_STRING_TYPE.POLYNOMIAL:
                if (gamma !== OPTION_DEFAULT_VALUE.gamma) {
                    throw new Error(
                        `can't train: invalid kernelOption. kernel type ${KERNEL_STRING_TYPE.POLYNOMIAL}`
                    );
                }
                break;
            case KERNEL_STRING_TYPE.RBF:
                if (degree !== OPTION_DEFAULT_VALUE.degree) {
                    throw new Error(
                        `can't train: invalid kernelOption. kernel type ${KERNEL_STRING_TYPE.RBF}`
                    );
                }
                break;
            default:
        }
    }

    async train() {
        this.trained = false;
        try {
            this.setTable();
        } catch (e) {
            return;
        }
        this.trained = false;
        this.model = null;
        this.trainCallback(1);
        this.checkTrainOptionValidation();
        const { testRate = 0.2, C, kernel, degree, gamma } = this.trainParam;
        const {
            trainX,
            trainY,
            testArr,
            select,
            fields,
            PREDICT_STR2NUM_MAP,
            numClass,
            hasMissing,
            attrValueMaps,
        } = this.getData(testRate, this.table);

        if (hasMissing) {
            this.trainCallback(0);
            const msg = typeof Lang !== 'undefined' && Lang.AiLearning?.missing_value_error
                ? Lang.AiLearning.missing_value_error
                : '결측치가 존재하여 학습을 중단합니다. 결측치를 처리한 후에 재학습을 진행하세요.';
            Entry.toast.alert(
                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                msg
            );
            throw new Error(msg);
        }
        const svmTrainOption = {
            kernel,
            C,
            degree,
            gamma,
        };

        this.predictValueMap = Object.fromEntries(
            Object.entries(PREDICT_STR2NUM_MAP).map(([key, value]) => [value, key])
        );
        this.trainCallback(30);

        this.model = createModel();
        trainModel(this.model, trainX, trainY, svmTrainOption);
        this.trainCallback(80);

        const { confusionMatrix, score } = this.evaluate(this.model, testArr, numClass);

        const { accuracy, f1, precision, recall } = score;

        this.trainCallback(100);
        this.trained = true;
        this.result = {
            select,
            fields,
            confusionMatrix,
            accuracy,
            f1,
            valueMap: this.predictValueMap,
            attrValueMaps,
            precision,
            recall,
        };
        this.attrLength = select[0].length;
        this.updateFields();
        this.trained = true;
    }

    async load(url, model) {
        let data;
        if (typeof model === 'object' && model !== null) {
            data = { serializeModel: model, result: this.result };
        } else if (typeof url === 'object' && url !== null) {
            data = { serializeModel: url, result: this.result };
        } else {
            data = await this.loadModel({ url, modelId: model });
        }
        if (!data) {
            return;
        }
        const { serializeModel, result } = data;
        try {
            this.model = SVM.load(serializeModel);
        } catch (e) {
            console.error('Svm model load failed:', e);
            Entry.toast.alert(
                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                typeof Lang !== 'undefined' && Lang.AiLearning?.load_error
                    ? Lang.AiLearning.load_error
                    : '모델을 불러오는 중 오류가 발생했습니다. 다시 학습시켜 주세요.'
            );
        }
        this.valueMap = result?.valueMap;
        this.result = result;
        if (result?.select?.[0]) {
            this.attrLength = result.select[0].length;
            this.attrValueMaps = result.attrValueMaps || {};
            this.updateFields();
        }
        this.trained = true;
    }

    updateFields() {
        this.fields = this.table?.select?.[0]?.map((index) => this.table?.fields[index]);
        this.predictFields = this.table?.select?.[1]?.map((index) => this.table?.fields[index]);
    }

    // INFO: 예상치 전체를 가져옴. Deeplearning 레포의 predictArrays와 동일
    async predict(array) {
        if (!this.model) {
            throw new Error("can't predict: no model");
        }
        const attrFiltered = this.result?.select?.[0] || [];
        const encodedArray = array.map((val, index) => {
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

        const xs = [encodedArray];
        const preds = this.model.predict(xs);
        this.predictResult = preds.map((target) => ({
            className: this.valueMap[target + 1],
            probability: 1,
        }));
    }

    getData(testRate, data) {
        const STR2NUM_MAP = {};
        const STR2NUM_MAP_COUNT = {};
        const ATTR_STR2NUM_MAP = {};
        const ATTR_STR2NUM_MAP_COUNT = {};

        const { select = [[0], [1]], data: table, fields } = data;
        const [attr, predict] = select;
        const filtered = table.filter((row) => {
            const label = row[predict[0]];
            const hasLabel = label !== undefined && label !== null && String(label).trim() !== '';
            const hasAttrs = attr.every((i) => {
                const val = row[i];
                return val !== undefined && val !== null && String(val).trim() !== '';
            });
            return hasLabel && hasAttrs;
        });

        const hasMissing = table.some((row) => {
            const label = row[predict[0]];
            const hasLabel = label !== undefined && label !== null && String(label).trim() !== '';
            const hasAttrs = attr.every((i) => {
                const val = row[i];
                return val !== undefined && val !== null && String(val).trim() !== '';
            });
            return !hasLabel || !hasAttrs;
        });

        const dataArray = filtered
            .map((row) => ({
                x: attr.map((i) => {
                    const val = row[i];
                    const num = parseFloat(val);
                    if (!_isNaN(num)) {
                        return num;
                    }
                    return Utils.stringToNumber(i, val, ATTR_STR2NUM_MAP, ATTR_STR2NUM_MAP_COUNT);
                }),
                y: Utils.stringToNumber(
                    predict[0],
                    row[predict[0]],
                    STR2NUM_MAP,
                    STR2NUM_MAP_COUNT
                ),
            }))
            .map((row) => ({
                x: row.x,
                y: row.y - 1,
            }));
        const { trainArr, testArr } = this.sliceArray(dataArray, testRate);
        return {
            trainX: trainArr.map((v) => v.x),
            trainY: trainArr.map((v) => v.y),
            testArr,
            select,
            fields: attr.map((i) => fields[i]),
            PREDICT_STR2NUM_MAP: { ...STR2NUM_MAP[predict[0]] },
            attrValueMaps: ATTR_STR2NUM_MAP,
            numClass: STR2NUM_MAP_COUNT[predict[0]],
            hasMissing,
        };
    }

    sliceArray(dataArray, testRate) {
        Utils.shuffle(dataArray);
        const testNum = Math.floor(dataArray.length * testRate);
        const testArr = dataArray.slice(0, testNum);
        const trainArr = dataArray.slice(testNum, dataArray.length);
        return { trainArr, testArr };
    }

    evaluate(model, validateData, numClass) {
        const xs = validateData.map((data) => data.x);
        const ys = validateData.map((data) => data.y);
        const predictYs = model.predict(xs);
        const length = predictYs.length;

        const confusionMatrix = Array(numClass)
            .fill(0)
            .map(() => Array(numClass).fill(0));

        for (let idx = 0; idx < length; idx++) {
            confusionMatrix[ys[idx]][predictYs[idx]]++;
        }
        const score = Utils.getScores(confusionMatrix, numClass);
        return { confusionMatrix, score };
    }
    isTrained() {
        return this.trained && !!this.model;
    }
}

export default Svm;

function createModel() {
    return new SVM({ type: SVM.SVM_TYPES.C_SVC, probabilityEstimates: true });
}

function trainModel(model, samples, labels, svmTrainOption) {
    let kernelType;
    if (svmTrainOption.kernel === KERNEL_STRING_TYPE.LINEAR) {
        kernelType = SVM.KERNEL_TYPES.LINEAR;
    } else if (svmTrainOption.kernel === KERNEL_STRING_TYPE.POLYNOMIAL) {
        kernelType = SVM.KERNEL_TYPES.POLYNOMIAL;
    } else if (svmTrainOption.kernel === KERNEL_STRING_TYPE.RBF) {
        kernelType = SVM.KERNEL_TYPES.RBF;
    } else {
        throw new Error("can't create model: unexpected kernel type");
    }

    model.free();

    model.kernel = kernelType;
    model.cost = svmTrainOption.C;
    model.degree = svmTrainOption.degree;
    model.gamma = svmTrainOption.gamma;

    model.train(samples, labels);
}
