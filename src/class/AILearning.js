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
    'ai_learning_classification',
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
    'video',
    'video_legacy',
    'ai_utilize_video',
];

export default class AILearning {
    _playground;
    _categoryName = 'ai_learning';
    _labels = [];
    _url;
    _type;
    _oid;
    _modelId;
    isLoaded = false;
    isLoading = false;
    result = [];
    isEnable;
    _recordTime = 2000;
    _module = null;
    _tableData = null;
    _dataApi = undefined;
    _modelArtifacts = null;

    constructor(playground, isEnable = true) {
        this._playground = playground;
        this.isEnable = isEnable;
    }

    get labels() {
        return this._labels;
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
        this._dataApi = api;
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
        this._modelId = undefined;
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
            modelPath = await this._dataApi?.getModelDownloadUrl(url) || url;
        } catch (e) {
            modelPath = url;
        }

        if (!this.isEnable || !isActive) {
            return;
        }

        // Type normalization for robustness between different naming conventions
        let type = this._type;
        const typeMap = {
            'decisiontree': 'decisionTree',
            'logistic_regression': 'logisticRegression'
        };
        if (type && typeMap[type.toLowerCase()]) {
            type = typeMap[type.toLowerCase()];
        }

        const name = this.name;
        const recordTime = this._recordTime;

        if (type === 'text') {
            this._module = new TextLearning({
                url: modelPath,
                labels: this._labels,
                type,
                modelId: this._modelId,
                loadModel: this._dataApi?.loadModel,
            });
        } else if (type === 'number') {
            this._tableData = tableData || createDataTable(classes, name);
            this._module = new NumberClassification({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this._tableData,
                model,
                loadModel: this._dataApi?.loadModel,
            });
            this._labels = this._module.getLabels();
        } else if (type === 'cluster') {
            this._tableData = tableData || createDataTable(classes, name);
            this._module = new Cluster({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this._tableData,
                model,
            });
        } else if (type === 'regression') {
            this._tableData = tableData || createDataTable(classes, name);
            this._module = new Regression({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this._tableData,
                model,
            });
        } else if (type === 'image') {
            this._module = new ImageLearning({
                url: modelPath,
                labels: this._labels,
                type,
                modelArtifacts: this._modelArtifacts,
            });
        } else if (type === 'speech') {
            this._module = new SpeechClassification({
                url: modelPath,
                labels: this._labels,
                type,
                recordTime,
            });
        } else if (type === 'logisticRegression') {
            this._tableData = tableData || createDataTable(classes, name);
            this._module = new LogisticRegression({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this._tableData,
                model,
            });
        } else if (type === 'decisionTree') {
            this._tableData = tableData || createDataTable(classes, name);
            this._module = new DecisionTree({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this._tableData,
                model,
                loadModel: this._dataApi?.loadModel,
            });
        } else if (type === 'svm') {
            this._tableData = tableData || createDataTable(classes, name);
            this._module = new Svm({
                name,
                result: this.result,
                url: modelPath,
                trainParam,
                table: this._tableData,
                model,
                loadModel: this._dataApi?.loadModel,
            });
        }

        if (this._module) {
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

        this._labels = labels || classes.map(({ name }) => name);
        this._type = type;
        this._url = url;
        this._oid = _id;
        this.name = name;
        this._modelId = model || id;
        this._recordTime = recordTime;
        this.result = result;
        this._tableData = tableData;
        this._modelArtifacts = modelArtifacts || null;

        // Ensure isEnable is true if we are loading a model
        this.isEnable = true;

        await this.loadModel({
            url: this._url,
            trainParam,
            tableData: this._tableData,
            isActive,
            classes,
            model: this._modelId,
        });

        if (this._module && result) {
            // Only set module.result if the module's own load() didn't already
            // process and set it (with _addFeatureNames / traverse annotations).
            // Otherwise we'd overwrite the processed graphData with raw saved data.
            if (!this._module.result?.graphData) {
                this._module.result = result;
            }
            if (this._module.load && typeof model === 'object') {
                await this._module.load(model);
            }
        }
        this.unbanBlocks();
        if (this._playground) {
            this._playground.reloadPlayground();
        }
    }

    async reload(url) {
        await this._module?.reload?.(url);
    }

    openInputPopup() {
        this._module?.openInputPopup?.();
    }

    async train() {
        if (this._module && typeof this._module.train === 'function') {
            await this._module.train();
            this.unbanBlocks();
            if (this._playground) {
                this._playground.reloadPlayground();
            }
        }
    }

    isTrained() {
        return !!this._module?.isTrained?.();
    }

    setTrainOption(type, value) {
        this._module?.setTrainOption?.(type, value);
    }

    getTrainOption() {
        return this._module?.getTrainOption?.();
    }

    getTableData() {
        return this._tableData;
    }

    getTrainResult() {
        return this._module?.getTrainResult?.() || this.result;
    }

    getPredictResult(index) {
        return this._module?.getResult?.(index);
    }

    getId() {
        return this._modelId;
    }

    setVisible(visible) {
        this._module?.setVisible?.(visible);
    }

    setChartVisible(visible) {
        if (visible) {
            this._module?.openChart?.();
        } else {
            this._module?.closeChart?.();
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
        if (this._module && this._module.predict) {
            const predRes = await this._module.predict(obj);
            if (predRes !== undefined) {
                this.result = predRes;
                return predRes;
            }
        }
        return [];
    }

    startPredict() {
        if (this._module && this._module.startPredict) {
            this._module.startPredict();
        }
    }

    stopPredict() {
        if (this._module && this._module.stopPredict) {
            this._module.stopPredict();
        }
    }

    unbanBlocks() {
        this.banBlocks();
        const blockMenu = getBlockMenu(this._playground);
        if (blockMenu) {
            this._module?.unbanBlocks?.(blockMenu);
        }
    }

    banBlocks() {
        const blockMenu = getBlockMenu(this._playground);
        if (blockMenu) {
            banClasses.forEach((clazz) => {
                blockMenu.banClass(clazz, true);
            });

            // ImageLearning에서 개별적으로 unban/isNotFor 변경한 비디오 블록들 원복 및 ban 처리
            const videoBlockInfo = Entry.AI_UTILIZE_BLOCK?.video;
            if (videoBlockInfo && typeof videoBlockInfo.getBlocks === 'function') {
                const allBlocks = videoBlockInfo.getBlocks();
                Object.keys(allBlocks).forEach((block) => {
                    const blockInfo = Entry.block[block];
                    if (blockInfo) {
                        if (blockInfo._isNotFor) {
                            blockInfo.isNotFor = blockInfo._isNotFor;
                            delete blockInfo._isNotFor;
                        }
                        blockMenu.banClass(block, true);
                    }
                });
            }

            // 비디오 블록이 프로젝트에서 사용 중이 아니라면, 비디오 감지 확장 블록 자체를 제거
            if (
                this._type !== 'image' &&
                Entry.aiUtilize &&
                typeof Entry.aiUtilize.isActive === 'function' &&
                Entry.playground?.object
            ) {
                if (!Entry.aiUtilize.isActive('video')) {
                    Entry.aiUtilize.banAIUtilizeBlocks(['video']);
                }
            }
        }
    }

    destroy() {
        this._labels = [];
        this._url = null;
        this._type = null;
        this.isLoading = false;
        this.result = [];
        this.isLoaded = false;
        this._recordTime = 2000;
        this._tableData = null;
        if (this._module) {
            this._module?.destroy?.();
            this._module = null;
        }
    }

    toJSON() {
        if (!this.isLoaded) {
            return;
        }
        return {
            labels: this._labels,
            url: this._url,
            type: this._type,
            id: this._modelId,
            _id: this._oid,
            recordTime: this._recordTime,
            trainParam: this.getTrainOption(),
            result: this.getTrainResult(),
            tableData: this._tableData,
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
