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
    'decisiontree_attr_7',
    'decisiontree_attr_8',
    'decisiontree_attr_9',
    'decisiontree_attr_10',
    'decisiontree_attr_11',
    'decisiontree_attr_12',
];

class DecisionTree extends LearningBase {
    type = 'decisiontree';

    init({ name, url, result, table, trainParam, model, loadModel }) {
        this.name = name;
        this.trainParam = trainParam || {};

        // ── Preserve trained state across stop-event re-init ──
        // The 'stop' event in LearningBase calls init() with the STALE original
        // params captured in the constructor closure.  If we already have a trained
        // model and result with graphData, we must keep them — NOT overwrite them.
        // NOTE: We cannot reconstruct this.model from graphData because graphData
        // has been post-processed by traverse() / _addFeatureNames() and no longer
        // has the 'kind' property that DTClassifier.load() / TreeNode requires.
        const hasCurrentModel = !!this.model;
        const hasCurrentTrainedResult = this.result && this.result.graphData && this.result.fields;

        if (hasCurrentTrainedResult) {
            // Keep this.result as-is (already trained / loaded).
        } else {
            this.result = result || {};
        }

        this.table = table;
        this.loadModel = loadModel;
        this.trainCallback = (value) => {
            this.view.setValue(value);
        };
        this.trained = true;
        this.attrLength = table?.select?.[0]?.length || 0;
        this.updateFields();

        this.fields = table?.select?.[0]?.map((index) => table?.fields[index]);
        this.predictFields = table?.select?.[1]?.map((index) => table?.fields[index]);

        if (hasCurrentModel) {
            // Model already exists from train() or a previous load().
            // Keep this.model, this.valueMap, this.attrValueMaps exactly as they are.
            // Do NOT call this.load(url) — that would fetch the old server model
            // and overwrite everything.
        } else if (model && typeof model === 'object') {
            this._sanitizeModelForLoad(model);
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
        if (!this.result) {
            return;
        }
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
        // Always destroy and recreate the chart so the visualization
        // always reflects the current this.result.graphData.
        // (Tree.setData() from @entrylabs/tool may not reliably re-render.)
        if (this.tree) {
            this.tree.destroy();
            this.tree = null;
        }
        this.generateTree();
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
        this.model = null;
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

        const dataRes = getData(testRate, this.table);
        console.log('DecisionTree getData Result:', dataRes);
        const {
            trainX,
            trainY,
            testArr,
            select,
            fields,
            valueMap,
            numClass,
            hasMissing,
            attrValueMaps,
        } = dataRes;

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
        this.valueMap = {};
        Object.entries(valueMap).forEach(([key, value]) => {
            this.valueMap[value - 1] = key; // DTClassifier uses 0-indexed classes
        });
        this.model = createModel(maxDepth, minNumSamples, gainThreshold);
        this.model?.train(trainX, trainY);

        const { confusionMatrix, score } = evaluate(this.model, testArr, numClass);
        this.trained = true;
        this.trainCallback(100);
        const { accuracy, f1, precision, recall } = score;

        const rootNode = this.model.toJSON().root;
        this._addFeatureNames(rootNode, fields);
        traverse(rootNode, numClass, fields, this.valueMap);

        this.result = {
            graphData: rootNode,
            select,
            fields,
            confusionMatrix,
            accuracy,
            f1,
            valueMap: this.valueMap,
            attrValueMaps,
            numClass,
            precision,
            recall,
        };

        this.attrLength = select[0].length;
        this.updateFields();
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
        if (model && model.root) {
            try {
                let fields = result?.fields;
                if (!fields && this.table) {
                    const [attr, predict] = this.table.select || [[], []];
                    let attrFiltered;
                    if (attr && attr.length > 0) {
                        attrFiltered = [...attr];
                    } else {
                        const predictSet = new Set(predict);
                        attrFiltered = (this.table.fields || []).map((_, i) => i).filter((i) => !predictSet.has(i));
                    }
                    fields = attrFiltered.map((i) => this.table.fields[i]);
                }
                this._graphDataFields = fields;
            } catch (e) {
                console.error('DecisionTree load fields fallback failed:', e);
            }
        }
        try {
            if (model && model.root) {
                this._sanitizeModelForLoad(model);
                this.model = DTClassifier.load(model);
            }
        } catch (e) {
            console.error('DecisionTree model load failed:', e);
            Entry.toast.alert(
                typeof Lang !== 'undefined' ? (Lang.Msgs?.warn || '경고') : '경고',
                typeof Lang !== 'undefined' && Lang.AiLearning?.load_error
                    ? Lang.AiLearning.load_error
                    : '모델을 불러오는 중 오류가 발생했습니다. 다시 학습시켜 주세요.'
            );
        }
        this.valueMap = result?.valueMap || {};
        this.attrValueMaps = result?.attrValueMaps || {};

        const rootNode = this.model?.toJSON().root;
        if (rootNode) {
            const finalFields = result?.fields || this._graphDataFields || [];
            this._addFeatureNames(rootNode, finalFields);
            traverse(rootNode, result?.numClass, finalFields, this.valueMap || {});
        }

        this.result = {
            ...result,
            select: result?.select || this.table?.select,
            attrValueMaps: this.attrValueMaps,
            // Always use the newly-processed rootNode (with _addFeatureNames /
            // traverse annotations) so the tree visualization renders correctly.
            graphData: rootNode || result?.graphData,
        };
        if (this.result?.select?.[0]) {
            this.attrLength = this.result.select[0].length;
            this.updateFields();
        }
    }

    _addFeatureNames(node, fields) {
        if (!node) return;
        if (node.splitColumn !== undefined && node.splitColumn !== null) {
            node.featureName = fields && fields[node.splitColumn] ? fields[node.splitColumn] : `Feature ${node.splitColumn}`;
        }
        if (node.left) this._addFeatureNames(node.left, fields);
        if (node.right) this._addFeatureNames(node.right, fields);
    }

    _sanitizeModelForLoad(model) {
        if (!model || !model.root) return;

        // Ensure ml-cart correctly reconstitutes distributions into Matrix objects
        const fixModelForLoad = (node) => {
            if (!node) return;
            if (node.distribution !== undefined && node.distribution !== null) {
                let dist = node.distribution;

                if (typeof dist === 'number') {
                    // Regression leaf, do nothing
                } else {
                    // Classification leaf
                    if (typeof dist === 'object' && dist !== null && 'data' in dist) {
                        dist = dist.data;
                    }

                    if (Array.isArray(dist) || ArrayBuffer.isView(dist)) {
                        // Check if 1D array of numbers
                        if (dist.length > 0 && typeof dist[0] !== 'object') {
                            dist = [dist];
                        }
                    } else if (typeof dist === 'object' && dist !== null) {
                        // Sparse object
                        dist = [Object.values(dist)];
                    } else {
                        dist = [];
                    }

                    const normalizedDist = [];
                    for (let i = 0; i < dist.length; i++) {
                        let row = dist[i];
                        if (typeof row === 'object' && row !== null && 'length' in row) {
                            const newRow = [];
                            for (let j = 0; j < row.length; j++) {
                                const n = parseFloat(row[j]);
                                newRow.push(isNaN(n) ? 0 : n);
                            }
                            normalizedDist.push(newRow);
                        } else {
                            const n = parseFloat(row);
                            normalizedDist.push([isNaN(n) ? 0 : n]);
                        }
                    }

                    if (normalizedDist.length === 0) {
                        normalizedDist.push([0]);
                    }

                    node.distribution = normalizedDist;
                }
            }
            if (node.left) fixModelForLoad(node.left);
            if (node.right) fixModelForLoad(node.right);
        };
        fixModelForLoad(model.root);
    }

    async predict(array) {
        console.log('DecisionTree Predict State:', {
            result: this.result,
            table: this.table,
            attrValueMaps: this.attrValueMaps,
        });
        if (!this.model) {
            const msg = (typeof Lang !== 'undefined' && Lang.AiLearning?.model_status_3) || '아직 로딩된 모델이 없습니다.';
            throw new Error(msg);
        }
        let attrFiltered = this.result?.select?.[0];
        if (!attrFiltered || attrFiltered.length === 0) {
            console.warn('DecisionTree predict: attrFiltered is empty, reconstructing from table...');
            const [attr, predict] = this.table?.select || [[], []];
            if (attr && attr.length > 0) {
                attrFiltered = [...attr];
            } else {
                const predictSet = new Set(predict);
                attrFiltered = (this.table?.fields || []).map((_, i) => i).filter((i) => !predictSet.has(i));
            }
        }
        if (!attrFiltered || attrFiltered.length === 0) {
            attrFiltered = [];
        }
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
        console.log('DecisionTree Predict Input:', {
            array,
            attrFiltered,
            attrValueMaps: this.attrValueMaps,
            encodedArray,
        });

        let preds;
        try {
            preds = this.model.predict(xs);
            console.log('DecisionTree Predict Output (model.predict):', preds);
        } catch (e) {
            preds = this._predictFallback(xs);
            console.log('DecisionTree Predict Output (fallback):', preds);
        }
        this.predictResult = preds.map((target) => {
            let className = getLabelFromValueMap(target, this.valueMap);
            if (className === `Class ${target}`) className = target;

            return {
                className,
                probability: 1,
            };
        });
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
                // handle matrix typed array
                arr = Array.from(dist.data);
            }
            if (!Array.isArray(arr)) return 0;
            let maxIdx = 0;
            let maxVal = -Infinity;
            for (let i = 0; i < arr.length; i++) {
                // If it is an array of arrays like [[0, 1]], we need to extract the value
                const v = Array.isArray(arr[i]) ? arr[i][0] : arr[i];
                if (v > maxVal) { maxVal = v; maxIdx = i; }
            }
            return maxIdx;
        });
    }
    updateFields() {
        this.fields = this.table?.select?.[0]?.map((index) => this.table?.fields[index]);
        this.predictFields = this.table?.select?.[1]?.map((index) => this.table?.fields[index]);
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
    console.log('DecisionTree getData details:', {
        select,
        attr,
        predict,
        attrFiltered,
    });

    const ATTR_STR2NUM_MAP = {};
    const ATTR_STR2NUM_MAP_COUNT = {};

    const hasMissing = table.some(
        (row) =>
            attrFiltered.some((selected) => {
                const val = row[selected];
                return val === undefined || val === null || String(val).trim() === '';
            }) ||
            row[predict[0]] === undefined ||
            row[predict[0]] === null ||
            row[predict[0]] === ''
    );

    const filtered = table.filter(
        (row) =>
            !attrFiltered.some((selected) => {
                const val = row[selected];
                return val === undefined || val === null || String(val).trim() === '';
            }) &&
            row[predict[0]] !== undefined &&
            row[predict[0]] !== null &&
            row[predict[0]] !== ''
    );
    const dataArray = filtered
        .map((row) => ({
            x: attrFiltered.map((i) => {
                const val = row[i];
                const num = parseFloat(val);
                if (!_isNaN(num)) {
                    return num;
                }
                return Utils.stringToNumber(i, val, ATTR_STR2NUM_MAP, ATTR_STR2NUM_MAP_COUNT);
            }),
            y: Utils.stringToNumber(predict[0], row[predict[0]], tempMap, tempMapCount),
        }))
        .map((row) => ({
            x: row.x,
            y: row.y - 1,
        }));
    const [train, test] = sliceArray(dataArray, testRate);
    const mappedFields = attrFiltered.map((i) => (dataFields && dataFields[i] ? dataFields[i] : undefined));

    return {
        trainX: train.map((v) => v.x),
        trainY: train.map((v) => v.y),
        testArr: test,
        select: [attrFiltered, predict],
        fields: mappedFields,
        valueMap: { ...tempMap[predict[0]] },
        attrValueMaps: ATTR_STR2NUM_MAP,
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

function getLabelFromValueMap(p, valueMap) {
    if (!valueMap || Object.keys(valueMap).length === 0) return `Class ${p}`;
    const entries = Object.entries(valueMap);
    const isLabelToIndex = entries.length > 0 && entries.every(([k, v]) => typeof v === 'number' && Number.isInteger(v) && v >= 1);
    if (isLabelToIndex) {
        const targetIndex = p + 1;
        for (const [key, value] of entries) {
            if (value === targetIndex) return key;
        }
    }
    const isZeroBased = valueMap[0] !== undefined || valueMap['0'] !== undefined;
    if (isZeroBased) {
        let label = valueMap[p] !== undefined ? valueMap[p] : valueMap[String(p)];
        if (label !== undefined && label !== null && String(label).trim() !== '') return String(label).trim();
    } else {
        let label = valueMap[p + 1] !== undefined ? valueMap[p + 1] : valueMap[String(p + 1)];
        if (label !== undefined && label !== null && String(label).trim() !== '') return String(label).trim();
    }
    return `Class ${p}`;
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

                    // ml-cart 2.0.0+ distributions are often arrays where index = class and value = count.
                    // e.g., distribution: [[0, 1]] means 0 of class 0, and 1 of class 1
                    let items;
                    if (Array.isArray(d)) {
                        items = d.map((v, i) => [i, v]);
                    } else {
                        items = Object.entries(d);
                    }

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
            node.predictionLabel = getLabelFromValueMap(p, valueMap);
        } else {
            // If all else fails, use a generic classification label instead of "Unknown"
            // This case should be extremely rare with the new findP logic.
            node.predictionLabel = (typeof Lang !== 'undefined' && Lang.AiLearning?.class_default) || 'Classification';
        }
    }
    if (node.left) traverse(node.left, numClass, fields, valueMap);
    if (node.right) traverse(node.right, numClass, fields, valueMap);
}
