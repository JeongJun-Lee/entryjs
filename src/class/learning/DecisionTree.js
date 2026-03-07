import * as tf from '@tensorflow/tfjs';
import _floor from 'lodash/floor';
import _max from 'lodash/max';
import _sum from 'lodash/sum';
import _mean from 'lodash/mean';
import _toNumber from 'lodash/toNumber';
import _isNaN from 'lodash/isNaN';
import LearningBase from './LearningBase';
import { DecisionTreeClassifier as DTClassifier } from 'ml-cart';
import Utils from './Utils';
import Chart from './Chart';

export const classes = [
    'ai_learning_train',
    'ai_learning_decisiontree',
    'decisiontree_attr_1',
    'decisiontree_attr_2',
    'decisiontree_attr_3',
    'decisiontree_attr_4',
    'decisiontree_attr_5',
    'decisiontree_attr_6',
];

class DecisionTree extends LearningBase {
    type = 'decisiontree';

    init({ name, url, result, table, trainParam, modelId, loadModel }) {
        this.name = name;
        this.trainParam = trainParam;
        this.result = result;
        this.table = table;
        this.loadModel = loadModel;
        this.trainCallback = (value) => {
            this.view.setValue(value);
        };
        this.trained = true;
        this.attrLength = table?.select?.[0]?.length || 0;

        this.fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.predictFields = table?.select?.[1]?.map((index) => table?.fields[index]);
        if (this.url !== url || this.modelId !== modelId) {
            this.load(url, modelId);
            this.url = url;
            this.modelId = modelId;
        }
        if (!Utils.isWebGlSupport()) {
            tf.setBackend('cpu');
        }
    }

    generateTree() {
        const { graphData, fields = [], valueMap = {} } = this.result;
        try {
            let titleText = '결정 트리';
            if (typeof Lang !== 'undefined') {
                const aiLang = Lang.AiLearning || {};
                const template = Lang.template || {};
                titleText = template.learning_title_decisiontree_str || aiLang.tree_title || aiLang.tree || titleText;
            }

            this.tree = new Chart(
                {
                    source: {
                        graphData: graphData || {},
                        fields: fields,
                        valueMap: valueMap,
                        yes: typeof Lang !== 'undefined' ? (Lang.AiLearning?.yes || '예') : '예',
                        no: typeof Lang !== 'undefined' ? (Lang.AiLearning?.no || '아니오') : '아니오',
                    },
                    title: titleText,
                },
                'tree'
            );
        } catch (e) {
            console.error('DecisionTree: Failed to generate tree chart:', e);
        }
    }

    openChart() {
        if (!this.tree) {
            this.generateTree();
        } else {
            const { graphData, fields = [], valueMap = {} } = this.result || {};
            let titleText = '결정 트리';
            if (typeof Lang !== 'undefined') {
                const aiLang = Lang.AiLearning || {};
                const template = Lang.template || {};
                titleText = template.learning_title_decisiontree_str || aiLang.tree_title || aiLang.tree || titleText;
            }
            if (this.tree.load && graphData) {
                this.tree.load({
                    source: {
                        graphData,
                        fields: fields,
                        valueMap,
                        yes: typeof Lang !== 'undefined' ? (Lang.AiLearning?.yes || '예') : '예',
                        no: typeof Lang !== 'undefined' ? (Lang.AiLearning?.no || '아니오') : '아니오',
                    },
                    title: titleText
                });
            }
            this.tree.show();
        }
    }

    closeChart() {
        this.tree?.hide();
    }

    destroy() {
        if (this.tree) {
            this.tree.destroy();
            this.tree = null;
        }
        super.destroy();
    }

    async train() {
        this.setTable();
        this.trained = false;
        this.result = null;
        if (this.tree) {
            this.tree.destroy();
            this.tree = null;
        }
        this.trainCallback(1);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const {
            testRate = 0.2,
            maxDepth = 3,
            minNumSamples = 3,
            gainThreshold = 0.01,
        } = this.trainParam || {};

        if (maxDepth < 2) {
            Entry.toast.alert(
                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                '트리의 최대 깊이는 2 이상으로 입력해 주세요.'
            );
            return;
        }


        const { trainX, trainY, testArr, select, fields, valueMap, numClass } = getData(
            testRate,
            this.table
        );
        this.valueMap = valueMap;

        // V22: Robust fields resolution logic for retraining loaded models where this.table.fields might be missing/stripped
        let parsedFields = fields;
        if ((!parsedFields || parsedFields.every(f => typeof f === 'undefined' || f === null)) && this.result && this.result.fields) {
            // Fallback to the saved outcome's fields if data retrieval provided blanks
            parsedFields = this.result.fields;
        } else if (parsedFields) {
            // Safely stringify objects or provide "Col N" generic names
            parsedFields = parsedFields.map((f, idx) => {
                if (typeof f === 'object' && f !== null) return f.name || JSON.stringify(f);
                if (f === undefined || f === null) return `Col ${select[0][idx]}`;
                return String(f);
            });
        }

        this.model = createModel(maxDepth, minNumSamples, gainThreshold);
        this.model?.train(trainX, trainY);

        const { confusionMatrix, score } = evaluate(this.model, testArr, numClass);
        this.trained = true;
        this.trainCallback(100);
        const { accuracy, f1, precision, recall } = score;

        const modelJson = this.model.toJSON();
        let rootNode = modelJson && modelJson.root;
        if (rootNode) {
            rootNode = JSON.parse(JSON.stringify(rootNode));
            traverse(rootNode, numClass, parsedFields, this.valueMap);
        }
        this.result = {
            graphData: rootNode,
            select,
            fields: parsedFields,
            confusionMatrix,
            accuracy,
            f1,
            valueMap: this.valueMap,
            numClass,
            precision,
            recall,
        };
    }

    async load(url, modelId) {
        let data;
        if (typeof modelId === 'object' && modelId !== null) {
            data = { model: modelId, result: this.result };
        } else if (typeof url === 'object' && url !== null) {
            data = { model: url, result: this.result };
        } else {
            data = await this.loadModel({ url, modelId });
        }
        if (!data) return;
        const { model, result } = data;
        let graphData = null;
        if (model && model.root) {
            try {
                graphData = JSON.parse(JSON.stringify(model.root));
                const numClass = result?.numClass || (result?.valueMap ? Object.keys(result.valueMap).length : 1);
                const fields = result?.fields || (this.table ? this.table.select[0].map(i => this.table.fields[i]) : []);
                const valueMap = result?.valueMap || {};
                traverse(graphData, numClass, fields, valueMap);
            } catch (e) {
                console.error('DecisionTree load traverse failed:', e);
            }
        }
        try {
            if (model && model.root) {
                // Ensure ml-cart correctly reconstitutes distributions into Matrix objects
                const fixModelForLoad = (node) => {
                    if (!node) return;
                    if (node.distribution !== undefined) {
                        if (node.distribution && node.distribution.data) {
                            node.distribution = node.distribution.data;
                        } else if (typeof node.distribution === 'object' && !Array.isArray(node.distribution)) {
                            node.distribution = [Object.values(node.distribution)];
                        }
                    }
                    if (node.left) fixModelForLoad(node.left);
                    if (node.right) fixModelForLoad(node.right);
                };
                fixModelForLoad(model.root);

                this.model = DTClassifier.load(model);
            }
        } catch (e) {
            console.error('DecisionTree model load failed:', e);
        }
        this.valueMap = result?.valueMap;
        this.result = { ...result, graphData };
        this.trained = true;
    }

    async predict(array) {
        if (!this.model) {
            const msg = (typeof Lang !== 'undefined' && Lang.AiLearning?.model_status_3) || '아직 로딩된 모델이 없습니다.';
            throw new Error(msg);
        }
        const preds = this.model.predict([array]);
        this.predictResult = preds.map((target) => ({
            className: this.valueMap[target + 1] || target,
            probability: 1,
        }));
    }
}

export default DecisionTree;

function createModel(maxDepth, minNumSamples, gainThreshold) {
    return new DTClassifier({
        gainFunction: 'gini',
        maxDepth,
        minNumSamples,
        gainThreshold: gainThreshold !== undefined ? gainThreshold : 0.01,
    });
}

function getData(testRate, data) {
    const tempMap = {};
    const tempMapCount = {};
    const { select, data: table, id: tableId } = data;
    let dataFields = data.fields;

    // V23: Restore fallback for default sample data (test_table_1) if fields are lost
    if ((!dataFields || dataFields.length === 0) && tableId === 'test_table_1') {
        const def = typeof Lang !== 'undefined' && Lang.AiLearningTree ? Lang.AiLearningTree : null;
        dataFields = [
            (def && def.sample_field_1) || '꽃받침 길이',
            (def && def.sample_field_2) || '꽃받침 너비',
            (def && def.sample_field_3) || '꽃잎 길이',
            (def && def.sample_field_4) || '꽃잎 너비',
            (def && def.sample_field_5) || '품종'
        ];
    }

    const [attr, predict] = select;
    const filtered = table.filter(row => {
        const label = row[predict[0]];
        return label !== undefined && label !== null && String(label).trim() !== '';
    });
    const dataArray = filtered.map(row => ({
        x: attr.map(i => parseFloat(row[i]) || 0),
        y: Utils.stringToNumber(predict[0], row[predict[0]], tempMap, tempMapCount) - 1,
    }));
    const [train, test] = sliceArray(dataArray, testRate);
    const mappedFields = attr.map(i => dataFields && dataFields[i] ? dataFields[i] : undefined);

    return {
        trainX: train.map(v => v.x),
        trainY: train.map(v => v.y),
        testArr: test,
        select,
        fields: mappedFields,
        valueMap: Object.fromEntries(Object.entries(tempMap[predict[0]] || {}).map(([k, v]) => [v, k])),
        numClass: tempMapCount[predict[0]] || 1,
    };
}

function sliceArray(arr, rate) {
    Utils.shuffle(arr);
    const num = Math.floor(arr.length * rate);
    return [arr.slice(num), arr.slice(0, num)];
}

function evaluate(model, test, numClass) {
    const xs = test.map(d => d.x);
    const ys = test.map(d => d.y);
    const preds = model.predict(xs);
    const matrix = Array(numClass).fill(0).map(() => Array(numClass).fill(0));
    preds.forEach((p, i) => matrix[ys[i]][p]++);
    return { confusionMatrix: matrix, score: Utils.getScores(matrix, numClass) };
}

function traverse(node, numClass, fields, valueMap) {
    if (!node) return;

    // V20 Ultimate internal detection
    const hasL = node.left && typeof node.left === 'object' && Object.keys(node.left).length > 0;
    const hasR = node.right && typeof node.right === 'object' && Object.keys(node.right).length > 0;
    const isLeafNode = !hasL && !hasR;

    if (!isLeafNode) {
        node.isLeaf = false;

        let feat = fields[node.splitColumn];
        if (typeof feat === 'object' && feat !== null) {
            feat = feat.name || JSON.stringify(feat);
        } else if (feat === undefined) {
            feat = `Col ${node.splitColumn}`;
        }
        node.featureName = feat;
    } else {
        node.isLeaf = true;
        let p = -1;

        const findP = (n) => {
            if (!n) return -1;

            // Priority 1: Known prediction fields from various ml-cart versions
            const pKeys = ['classification', 'prediction', 'predictedClass', 'label', 'value', 'classIndex', 'class'];
            for (const k of pKeys) {
                if (n[k] !== undefined && n[k] !== null && !isNaN(Number(n[k]))) {
                    return Math.floor(Number(n[k]));
                }
            }

            // Priority 2: Distribution analysis (Matrix or Array)
            let d = n.distribution || n.yields || n.yield || n.counts || n.data;
            if (d !== undefined && d !== null) {
                if (d.data) d = d.data;
                while (Array.isArray(d) && d.length === 1) d = d[0];

                if (typeof d === 'number' && !isNaN(d)) return Math.floor(d);

                if (typeof d === 'object') {
                    let best = -1;
                    let max = -Infinity;
                    // Handle sparse object { "0": 0.1, "1": 0.9 } or Array [0.1, 0.9]
                    const items = Array.isArray(d) ? d.map((v, i) => [i, v]) : Object.entries(d);
                    for (const [k, v] of items) {
                        const prob = Number(v);
                        if (!isNaN(prob) && prob > max) {
                            max = prob;
                            best = Number(k);
                        }
                    }
                    if (best !== -1) return best;
                }
            }

            // Priority 3: Last ditch - search for any numeric property not belonging to metadata
            const metadata = [
                'splitColumn', 'splitValue', 'gain', 'id', 'index', 'isLeaf',
                'minNumSamples', 'maxDepth', 'numberSamples', 'gainThreshold',
                'splitFunction', 'kind'
            ];
            for (const [k, v] of Object.entries(n)) {
                if (!metadata.includes(k) && typeof v === 'number' && !isNaN(v)) {
                    return Math.floor(v);
                }
            }
            return -1;
        };

        p = findP(node);

        if (p !== -1) {
            // Robust lookup for valueMap (1-indexed vs 0-indexed)
            let label = valueMap[p + 1] || valueMap[String(p + 1)];
            if (label === undefined) {
                label = valueMap[p] || valueMap[String(p)];
            }

            if (label !== undefined && label !== null && String(label).trim() !== '') {
                node.predictionLabel = String(label).trim();
            } else {
                node.predictionLabel = `Class ${p}`;
            }
        } else {
            // If all else fails, use a generic classification label instead of "Unknown"
            // This case should be extremely rare with the new findP logic.
            node.predictionLabel = (typeof Lang !== 'undefined' && Lang.AiLearning?.class_default) || 'Classification';
        }
    }
    if (node.left) traverse(node.left, numClass, fields, valueMap);
    if (node.right) traverse(node.right, numClass, fields, valueMap);
}
