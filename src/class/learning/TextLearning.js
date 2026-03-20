import Bayes, { fromJson } from './bayes';
import * as Khaiii from 'khaiii';

export const classes = [
    'ai_learning_classification',
    'ai_learning_text'
];

const KhaiiModule = {
    isInitialized: false,
    module: undefined,
    async load(resourceRoot = `${Entry.Utils.getEntryjsPath()}/extern/khaiii`) {
        if (this.isInitialized) {
            return;
        }
        this.module = await Khaiii.initialize({
            resourceProvider: 'webfs',
            resourceRoot,
        });
        this.isInitialized = true;
    },
};

class TextNaiveBaye {
    _type = 'text';
    _url = '';
    _labels = [];
    _result = [];
    _loadModel;

    constructor({ url, labels, modelId, loadModel }) {
        this._url = url;
        this._labels = labels;
        this._loadModel = loadModel;
        this.classifier = new Bayes({
            tokenizer: this.tokenizer,
        });
        if (url || modelId) {
            this.load(url, modelId);
        }
    }

    get labels() {
        return this._labels;
    }

    unbanBlocks(blockMenu) {
        blockMenu.unbanClass(`ai_learning_classification`);
        blockMenu.unbanClass(`ai_learning_text`);
    }

    isAvailable() {
        if (!this.isLoaded) {
            throw new Error('ai learning text model load error');
        }
        return true;
    }

    getResult(indexOrName) {
        const result = this._result || [];
        const defaultResult = { probability: 0, className: '' };
        if (indexOrName !== undefined && indexOrName !== null) {
            const label = this._labels[indexOrName] || indexOrName;
            return (
                result.find(({ className }) => String(className) === String(label)) || defaultResult
            );
        }
        return result[0] || defaultResult;
    }

    openInputPopup() {
        const isAvailable = this.isAvailable();
        if (!isAvailable) {
            return;
        }
        Entry.dispatchEvent('openMLInputPopup', {
            type: this._type,
            predict: async (data) => {
                this._result = await this.predict(data);
                return this._result;
            },
            url: this._url,
            labels: this._labels,
            setResult: (result) => {
                this._result = result;
            },
        });
    }

    tokenizer = async (text) => {
        if (!text) {
            return [];
        }
        try {
            if (!KhaiiModule.module) {
                await KhaiiModule.load();
            }
            const analized = KhaiiModule.module.analyze(text); // 형태소 분석 진행
            const filtered = analized
                .map((wordInfo) =>
                    wordInfo.morphs
                        .filter((morph) => {
                            const category = morph.tag.charAt(0);
                            return category === 'V' || category === 'N' || category === 'S';
                        })
                        .map((morph) => morph.lex)
                )
                .flat();
            return filtered;
        } catch (e) {
            // Fallback for non-Korean languages or if Khaiii fails to load/parse
            return text.split(/\s+/).filter(w => w.length > 0);
        }
    };

    async predict(textData) {
        if (!this.classifier) {
            return [];
        }
        this._result = await this.classifier.categorize(textData);
        return this._result;
    }

    async load(urlOrData, modelId) {
        let data;
        if (typeof urlOrData === 'object' && urlOrData !== null) {
            data = urlOrData;
        } else if (this._loadModel && typeof this._loadModel === 'function') {
            data = await this._loadModel({ url: urlOrData, modelId });
        }
        if (!data) {
            return;
        }
        const classifier = fromJson(typeof data === 'string' ? data : JSON.stringify(data));
        if (classifier) {
            this.classifier = classifier;
            this.classifier.tokenizer = this.tokenizer;
            this.isLoaded = true;
        }
    }

    isTrained() {
        return !!this.isLoaded && !!this.classifier;
    }
}

export default TextNaiveBaye;
