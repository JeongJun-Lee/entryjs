import LearningView from './LearningView';
import DataTable from '../DataTable';

type Table = {
    id: string;
    fieldsInfo: Array<any>;
    fields: Array<string>;
    data: Array<any>;
    select: [Array<number>, Array<number>];
};
class LearningBase {
    type = 'base';
    attrLength = 0;
    name: string = '';
    view?: LearningView = null;
    trained: boolean = false;
    chartEnable: boolean = false;
    fields: Array<String> = [];
    predictFields: Array<String> = [];
    result = {};
    loadModel: () => {};
    table: Table;
    trainParam: any = null;
    trainCallback: (value: any) => void;

    chart: any = null;
    predictResult: any = null;

    constructor(params: any = {}) {
        this.view = new LearningView({ name: params.name || '', status: 0 });
        // 정지시 data 초기화.
        Entry.addEventListener('stop', () => {
            this.init({ ...params });
        });
        this.init({ ...params });
    }

    init({ name, result, table, trainParam }: any) {
        this.name = name;
        this.trainParam = trainParam;
        this.result = result;
        this.table = table;
        this.trainCallback = (value: any) => {
            this.view.setValue(value);
        };
        this.trained = true;
        this.attrLength = table?.select?.[0]?.length || 0;
        if (this.attrLength === 2) {
            this.chartEnable = true;
        }
        this.fields = table?.select?.[0]?.map((index: number) => table?.fields[index]);
    }

    isTrained() {
        return this.trained;
    }

    setTable() {
        const tableSource = DataTable.getSource(this.table.id);
        if (!tableSource) {
            return;
        }
        let data = [];
        if (tableSource.rows && Array.isArray(tableSource.rows)) data = tableSource.rows;
        else if (tableSource.origin && Array.isArray(tableSource.origin)) data = tableSource.origin;
        else if (tableSource.data && Array.isArray(tableSource.data)) {
            if (tableSource.data.length > 0 && tableSource.data[0].value) data = tableSource.data.map(r => r.value);
            else data = tableSource.data;
        }

        let fields = tableSource.fields || [];
        if (typeof tableSource.toJSON === 'function') {
            const json = tableSource.toJSON();
            fields = json.fields || fields;
            if (data.length === 0) {
                if (json.origin) data = json.origin;
                else if (json.data) {
                    if (json.data.length > 0 && json.data[0].value) data = json.data.map(r => r.value);
                    else data = json.data;
                }
            }
        }

        const sourceLength = fields.length;
        const [attr, predict] = this.table.select || [[], []];
        const maxIndex = Math.max(...attr, ...predict);

        if (maxIndex >= sourceLength && this.table.id !== 'test_table_1') {
            Entry.toast.alert(Lang.Msgs.warn, Lang.AiLearning.train_param_error);
            throw Error(Lang.AiLearning.train_param_error);
        }
        this.table.data = data;
        this.table.fields = fields;
    }

    destroy() {
        this.view.destroy();
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    setVisible(visible: boolean) {
        this.view.setVisible(visible);
    }

    unbanBlocks(blockMenu: any) {
        blockMenu.unbanClass(`ai_learning_train`);
        blockMenu.unbanClass(`ai_learning_${this.type}`);
        blockMenu.unbanClass(`${this.type}_attr_${this.attrLength}`);
        blockMenu.unbanClass(`core_attr_${this.attrLength}`);
        if (this.chartEnable) {
            blockMenu.unbanClass('ai_learning_train_chart');
        }
    }

    openChart() {
        if (!this.chartEnable) {
            return;
        }
        if (!this.chart) {
            this.generateChart();
        } else {
            this.chart.load({
                type: this.chartType,
                title: this.getChartTitle(),
                source: this.getTrainResult(),
            });
            this.chart.show();
        }
    }

    closeChart() {
        this.chart?.hide();
    }

    setTrainOption(type: string, value: any) {
        this.trainParam = {
            ...this.trainParam,
            [type]: value,
        };
    }

    getTrainOption() {
        return this.trainParam;
    }

    getTrainResult() {
        return this.result;
    }

    getResult() {
        return this.predictResult;
    }

    generateChart() {
        throw new Error('Method not implemented.');
    }

    train() {
        throw new Error('Method not implemented.');
    }

    load() {
        throw new Error('Method not implemented.');
    }

    predict() {
        throw new Error('Method not implemented.');
    }
}

export default LearningBase;
