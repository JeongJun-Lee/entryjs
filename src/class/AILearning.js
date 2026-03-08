import TextLearning, { classes as TextClasses } from './learning/TextLearning';
import Cluster, { classes as ClusterClasses } from './learning/Cluster';
import Regression, { classes as RegressionClasses } from './learning/Regression';
import ImageLearning, { classes as ImageClasses } from './learning/ImageLearning';
import SpeechClassification, { classes as SpeechClasses } from './learning/SpeechClassification';
import NumberClassification, {
    classes as NumberClassificationClasses,
} from './learning/NumberClassification';
import DecisionTree, { classes as DecisionTreeClasses } from './learning/DecisionTree';
import LogisticRegression, {
    classes as LogisticRegressionClasses,
} from './learning/LogisticRegression';
import Svm, { classes as SvmClasses } from './learning/Svm';
import DataTable from './DataTable';

import blockAiLearning from '../playground/blocks/block_ai_learning';
import blockAiLearningKnn from '../playground/blocks/block_ai_learning_knn';
import blockAiLearningCluster from '../playground/blocks/block_ai_learning_cluster';
import blockAiLearningRegression from '../playground/blocks/block_ai_learning_regression';
// eslint-disable-next-line max-len
import blockAiLearningLogisticRegression from '../playground/blocks/block_ai_learning_logistic_regression';
import blockAiLearningDecisiontree from '../playground/blocks/block_ai_learning_decisiontree';
import blockAiLearningSvm from '../playground/blocks/block_ai_learning_svm';
import blockAiUtilizeMediaPipe from '../playground/blocks/block_ai_utilize_media_pipe';
import InputPopup from './learning/InputPopup';
import _isEmpty from 'lodash/isEmpty';

Entry.MlPopup = InputPopup;
const basicBlockList = [
    blockAiLearning,
    blockAiLearningKnn,
    blockAiLearningCluster,
    blockAiLearningRegression,
    blockAiLearningLogisticRegression,
    blockAiLearningDecisiontree,
    blockAiLearningSvm,
    blockAiUtilizeMediaPipe,
];

const banClasses = [
    ...ClusterClasses,
    ...RegressionClasses,
    ...TextClasses,
    ...ImageClasses,
    ...SpeechClasses,
    ...NumberClassificationClasses,
    ...DecisionTreeClasses,
    ...LogisticRegressionClasses,
    ...SvmClasses,
    'core_attr_1',
    'core_attr_2',
    'core_attr_3',
    'core_attr_4',
    'core_attr_5',
    'core_attr_6',
    'core_attr_7',
    'core_attr_8',
    'core_attr_9',
    'core_attr_10',
    'core_attr_11',
    'core_attr_12',
];

export default class AILearning {
    #playground;
    #categoryName = 'ai_learning';
    #labels = [];
    #url;
    #type;
    #oid;
    #modelId;
    isLoaded = false;
    isLoading = false;
    result = [];
    isEnable;
    #recordTime = 2000;
    #module = null;
    #tableData = null;
    #dataApi = undefined;
    #modelArtifacts = null;

    constructor(playground, isEnable = true) {
        this.#playground = playground;
        this.isEnable = isEnable;
    }

    get labels() {
        return this.#labels;
    }

    init() {
        const blockObject = {};
        basicBlockList.forEach((value) => {
            if ('getBlocks' in value) {
                Object.assign(blockObject, value.getBlocks());
            }
        });
        Entry.block = Object.assign(Entry.block, blockObject);
    }

    setDataApi(api) {
        this.#dataApi = api;
    }

    removeAllBlocks() {
        const utilizeBlock = [];
        Object.values(Entry.ALL_AI_UTILIZE_BLOCK_LIST)
            .map((x) => Object.keys(x.getBlocks()))
            .forEach((category) => {
                category.forEach((block) => {
                    utilizeBlock.push(block);
                });
            });

        const { blocks } = EntryStatic.getAllBlocks().find(
            ({ category }) => category === 'ai_utilize'
        );
        blocks
            .filter((x) => !utilizeBlock.includes(x))
            .forEach((blockType) => {
                Entry.Utils.removeBlockByType(blockType);
            });
        this.banBlocks();
        this.destroy();
    }

    removeLearningBlocks() {
        if (!this.isLoaded) {
            return;
        }
        this.#modelId = undefined;
        const { blocks } = EntryStatic.getAllBlocks().find(
            ({ category }) => category === 'ai_utilize'
        );
        blocks
            .filter((x) => Entry.block?.[x]?.class === 'ai_learning')
            .forEach((blockType) => {
                Entry.Utils.removeBlockByType(blockType);
            });
        this.banBlocks();
        this.destroy();
    }

    async loadModel({ url, trainParam, tableData, isActive, classes, model }) {
        let modelPath = '';
        try {
            modelPath = await this.#dataApi?.getModelDownloadUrl(url) || url;
        } catch (e) {
            modelPath = url;
        }

        if (!this.isEnable || !isActive) {
            return;
        }

        // Type normalization for robustness between different naming conventions
        let type = this.#type;
        const typeMap = {
            'decisiontree': 'decisionTree',
            'logistic_regression': 'logisticRegression'
        };
        if (type && typeMap[type.toLowerCase()]) {
            type = typeMap[type.toLowerCase()];
        }

        const name = this.name;
        const recordTime = this.#recordTime;

        if (type === 'text') {
            this.#module = new TextLearning({
                url: modelPath,
                labels: this.#labels,
                type,
                modelId: this.#modelId,
                loadModel: this.#dataApi?.loadModel,
            });
        } else if (type === 'number') {
            this.#tableData = tableData || createDataTable(classes, name);
            this.#module = new NumberClassification({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this.#tableData,
                model,
                loadModel: this.#dataApi?.loadModel,
            });
            this.#labels = this.#module.getLabels();
        } else if (type === 'cluster') {
            this.#tableData = tableData || createDataTable(classes, name);
            this.#module = new Cluster({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this.#tableData,
                model,
            });
        } else if (type === 'regression') {
            this.#tableData = tableData || createDataTable(classes, name);
            this.#module = new Regression({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this.#tableData,
                model,
            });
        } else if (type === 'image') {
            this.#module = new ImageLearning({
                url: modelPath,
                labels: this.#labels,
                type,
                modelArtifacts: this.#modelArtifacts,
            });
        } else if (type === 'speech') {
            this.#module = new SpeechClassification({
                url: modelPath,
                labels: this.#labels,
                type,
                recordTime,
            });
        } else if (type === 'logisticRegression') {
            this.#tableData = tableData || createDataTable(classes, name);
            this.#module = new LogisticRegression({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this.#tableData,
                model,
            });
        } else if (type === 'decisionTree') {
            this.#tableData = tableData || createDataTable(classes, name);
            this.#module = new DecisionTree({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this.#tableData,
                model,
                loadModel: this.#dataApi?.loadModel,
            });
        } else if (type === 'svm') {
            this.#tableData = tableData || createDataTable(classes, name);
            this.#module = new Svm({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this.#tableData,
                model,
                loadModel: this.#dataApi?.loadModel,
            });
        }

        if (this.#module) {
            this.unbanBlocks();
            this.isLoaded = true;
        }
    }
    async load(modelInfo) {
        const {
            labels,
            type,
            classes = [],
            model,
            id,
            url,
            _id,
            isActive = true,
            name,
            recordTime,
            trainParam,
            tableData,
            result,
            modelArtifacts,
        } = modelInfo || {};

        if (_isEmpty(modelInfo)) {
            console.warn('Empty modelInfo provided to AILearning.js');
            return;
        }

        // Offline integration: If we have the model data, we don't strictly need a dataApi.
        this.destroy();

        this.#labels = labels || classes.map(({ name }) => name);
        this.#type = type;
        this.#url = url;
        this.#oid = _id;
        this.name = name;
        this.#modelId = model || id;
        this.#recordTime = recordTime;
        this.result = result;
        this.#tableData = tableData;
        this.#modelArtifacts = modelArtifacts || null;

        // Ensure isEnable is true if we are loading a model
        this.isEnable = true;

        await this.loadModel({
            url: this.#url,
            trainParam,
            tableData: this.#tableData,
            isActive,
            classes,
            model: this.#modelId,
        });

        if (this.#module && result) {
            // Only set module.result if the module's own load() didn't already
            // process and set it (with _addFeatureNames / traverse annotations).
            // Otherwise we'd overwrite the processed graphData with raw saved data.
            if (!this.#module.result?.graphData) {
                this.#module.result = result;
            }
            if (this.#module.load && typeof model === 'object') {
                await this.#module.load(model);
            }
        }
        this.unbanBlocks();
        if (this.#playground) {
            this.#playground.reloadPlayground();
        }
    }

    async reload(url) {
        await this.#module?.reload?.(url);
    }

    openInputPopup() {
        this.#module?.openInputPopup?.();
    }

    async train() {
        if (this.#module && typeof this.#module.train === 'function') {
            await this.#module.train();
            this.unbanBlocks();
            if (this.#playground) {
                this.#playground.reloadPlayground();
            }
        }
    }

    isTrained() {
        return !!this.#module?.isTrained?.();
    }

    setTrainOption(type, value) {
        this.#module?.setTrainOption?.(type, value);
    }

    getTrainOption() {
        return this.#module?.getTrainOption?.();
    }

    getTableData() {
        return this.#tableData;
    }

    getTrainResult() {
        const res = this.#module?.getTrainResult?.() || this.result;
        console.log('getTrainResult() called, returning:', res);
        return res;
    }

    getPredictResult(index) {
        return this.#module?.getResult?.(index);
    }

    getId() {
        return this.#modelId;
    }

    setVisible(visible) {
        this.#module?.setVisible?.(visible);
    }

    setChartVisible(visible) {
        if (visible) {
            this.#module?.openChart?.();
        } else {
            this.#module?.closeChart?.();
        }
    }

    openManager() {
        if (this.isEnable) {
            Entry.dispatchEvent('openAIUtilizeTrainManager');
        } else {
            console.log('Disabled learning for offline');
        }
    }

    async predict(obj) {
        if (this.#module && this.#module.predict) {
            const predRes = await this.#module.predict(obj);
            if (predRes !== undefined) {
                this.result = predRes;
                return predRes;
            }
        }
        return [];
    }

    startPredict() {
        if (this.#module && this.#module.startPredict) {
            this.#module.startPredict();
        }
    }

    stopPredict() {
        if (this.#module && this.#module.stopPredict) {
            this.#module.stopPredict();
        }
    }

    unbanBlocks() {
        this.banBlocks();
        const blockMenu = getBlockMenu(this.#playground);
        if (blockMenu) {
            this.#module?.unbanBlocks?.(blockMenu);
        }
    }

    banBlocks() {
        const blockMenu = getBlockMenu(this.#playground);
        if (blockMenu) {
            banClasses.forEach((clazz) => {
                blockMenu.banClass(clazz);
            });
        }
    }

    destroy() {
        this.#labels = [];
        this.#url = null;
        this.#type = null;
        this.isLoading = false;
        this.result = [];
        this.isLoaded = false;
        this.#recordTime = 2000;
        this.#tableData = null;
        if (this.#module) {
            this.#module?.destroy?.();
            this.#module = null;
        }
    }

    toJSON() {
        if (!this.isLoaded) {
            return;
        }
        return {
            labels: this.#labels,
            url: this.#url,
            type: this.#type,
            id: this.#modelId,
            _id: this.#oid,
            recordTime: this.#recordTime,
            trainParam: this.getTrainOption(),
            result: this.getTrainResult(),
            tableData: this.#tableData,
        };
    }
}

function getBlockMenu(playground) {
    const { mainWorkspace } = playground;
    if (!mainWorkspace) {
        return;
    }

    const blockMenu = _.result(mainWorkspace, 'blockMenu');
    if (!blockMenu) {
        return;
    }
    return blockMenu;
}

function createDataTable(classes, name) {
    if (!classes.length) {
        return;
    }
    try {
        const [{ samples }] = classes;
        const [sample = {}] = samples || [];
        let data = sample.data;
        data.id = data.id || data._id;
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        if (data && data?.id && !DataTable.getSource(data?.id)) {
            DataTable.addSource(data, false);
        }
        return data;
    } catch (e) {
        console.log('set table error', e);
    }
}
