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

    init({ name, url, result, table, trainParam, model }) {
        this.name = name;
        this.trainParam = trainParam || {};
        this.result = result || {};
        this.table = table;
        this.loadModel = loadModel;
        this.trainCallback = (value) => {
            this.view.setValue(value);
        };
        this.trained = true;
        this.attrLength = table?.select?.[0]?.length || 0;

        this.fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.predictFields = table?.select?.[1]?.map((index) => table?.fields[index]);
        if (model) {
            this.model = DTClassifier.load(model);
            this.valueMap = result?.valueMap;
        } else if (url) {
            this.load(`/uploads/${url}/model.json`);
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
        // 트리가 가로로 많이 길어질 수 있으므로 모달 최소 너비 확장
        requestAnimationFrame(() => {
            const modalEl = document.querySelector('.entry-learning-chart .entry-modal, .entry-learning-chart [class*="modal"], .entry-learning-chart > div');
            if (modalEl) {
                modalEl.style.minWidth = '1100px';
                modalEl.style.width = 'auto';
                modalEl.style.maxWidth = '90vw';
            }
        });
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
        try {
            this.setTable();
        } catch (e) {
            return;
        }
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
            maxDepth = 5,
            minNumSamples = 3,
            gainThreshold = 0.01,
            epochs = 1,
            batchSize = 1,
        } = this.trainParam;

        if (maxDepth < 2) {
            Entry.toast.alert(
                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                '트리의 최대 깊이는 2 이상으로 입력해 주세요.'
            );
            return;
        }

        const { trainX, trainY, testArr, select, fields, valueMap, numClass, hasMissing } = getData(
            testRate,
            this.table
        );

        if (hasMissing) {
            this.trainCallback(0);
            Entry.toast.alert(
                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                '결측치가 존재하여 학습을 중단합니다. 결측치를 처리한 후에 재학습을 진행하세요.'
            );
            return;
        }
        this.valueMap = Object.fromEntries(
            Object.entries(valueMap).map(([key, value]) => [value, key])
        );
        this.model = createModel(maxDepth, minNumSamples, gainThreshold);
        this.model?.train(trainX, trainY);

        const { confusionMatrix, score } = evaluate(this.model, testArr, numClass);
        this.trained = true;
        this.trainCallback(100);
        const { accuracy, f1, precision, recall } = score;

        const rootNode = this.model.toJSON().root;
        this._addFeatureNames(rootNode, fields, select[0]);

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

        const rootNode = this.model?.toJSON().root;
        if (rootNode) {
            this._addFeatureNames(rootNode, result?.fields, result?.select?.[0] || []);
        }

        this.result = {
            ...result,
            graphData: rootNode,
        };
    }

    _addFeatureNames(node, fields, attrFiltered) {
        if (!node) return;
        if (node.splitColumn !== undefined && node.splitColumn !== null) {
            const originalIndex = attrFiltered[node.splitColumn] !== undefined ? attrFiltered[node.splitColumn] : node.splitColumn;
            node.featureName = fields && fields[originalIndex] ? fields[originalIndex] : `Feature ${node.splitColumn}`;
        }
        if (node.left) this._addFeatureNames(node.left, fields, attrFiltered);
        if (node.right) this._addFeatureNames(node.right, fields, attrFiltered);
    }

    async predict(array) {
        if (!this.model) {
            const msg = (typeof Lang !== 'undefined' && Lang.AiLearning?.model_status_3) || '아직 로딩된 모델이 없습니다.';
            throw new Error(msg);
        }
        const xs = [array];
        // ml-cart 내부 버그 방어: classify()가 Matrix가 아닌 배열을 반환할 수 있음
        let preds;
        try {
            preds = this.model.predict(xs);
        } catch (e) {
            // maxRowIndex 등 Matrix 메서드 미지원 시 직접 argmax 계산
            preds = this._predictFallback(xs);
        }
        this.predictResult = preds.map((target) => ({
            className: this.valueMap[target + 1] || target,
            probability: 1,
        }));
    }

    _predictFallback(xs) {
        return xs.map((row) => {
            const dist = this.model.root.classify(row);
            if (!dist) return 0;
            // Matrix 객체인 경우 maxRowIndex 메서드 사용
            if (typeof dist.maxRowIndex === 'function') {
                return dist.maxRowIndex(0)[1];
            }
            // ml-matrix Matrix 내부 data 배열 접근 (dist.data = [[v0, v1, ...]])
            let arr = dist;
            if (dist.data && Array.isArray(dist.data)) {
                arr = dist.data[0];
            } else if (dist.data && !Array.isArray(dist.data)) {
                arr = Array.from(dist.data);
            }
            if (!Array.isArray(arr)) return 0;
            let maxIdx = 0;
            let maxVal = -Infinity;
            for (let i = 0; i < arr.length; i++) {
                const v = typeof arr[i] === 'object' ? arr[i][0] : arr[i];
                if (v > maxVal) { maxVal = v; maxIdx = i; }
            }
            return maxIdx;
        });
    }
    isTrained() {
        return this.trained && !!this.model;
    }
}

export default DecisionTree;

function createModel(maxDepth, minNumSamples, gainThreshold) {
    return new DTClassifier({
        gainFunction: 'gini',
        maxDepth,
        minNumSamples,
        gainThreshold,
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
    // predict 컬럼이 attr에 포함되면 label leakage 발생 → 강제 제외
    const predictSet = new Set(predict);
    const attrFiltered = attr.filter((i) => !predictSet.has(i));

    const hasMissing = table.some(
        (row) => attrFiltered.some((selected) => _isNaN(_toNumber(row[selected]))) ||
            row[predict[0]] === undefined || row[predict[0]] === null || row[predict[0]] === ''
    );

    const filtered = table.filter(
        (row) => !attrFiltered.some((selected) => _isNaN(_toNumber(row[selected]))) &&
            row[predict[0]] !== undefined && row[predict[0]] !== null && row[predict[0]] !== ''
    );
    const dataArray = filtered
        .map((row) => ({
            x: attrFiltered.map((i) => parseFloat(row[i]) || 0),
            y: Utils.stringToNumber(predict[0], row[predict[0]], tempMap, tempMapCount),
        }))
        .map((row) => ({
            x: row.x,
            y: row.y - 1,
        }));
    const [train, test] = sliceArray(dataArray, testRate);
    const mappedFields = attr.map(i => dataFields && dataFields[i] ? dataFields[i] : undefined);

    return {
        trainX: train.map(v => v.x),
        trainY: train.map(v => v.y),
        testArr: test,
        select: [attrFiltered, predict],
        fields,
        valueMap: { ...tempMap[predict[0]] },
        numClass: tempMapCount[predict[0]] || 1,
        hasMissing,
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
