import * as tf from '@tensorflow/tfjs';
export const classes = ['ai_learning_speech'];

class Classification {
    _type = null;
    _url = '';
    _labels = [];
    _recordTime = 2000;
    _result = [];
    _isPredicting = false;
    _audioCtx = null;
    _recognizer = null;

    constructor({ url, labels, type, recordTime, modelArtifacts }) {
        this._type = type;
        this._url = url;
        this._labels = labels;
        this._recordTime = recordTime;
        // Store the load promise so predict() can await it if called before loading completes
        this._loadPromise = this.load(url, modelArtifacts);
    }

    get labels() {
        return this._labels;
    }

    getResult(index) {
        const result = this._result || [];
        const defaultResult = { probability: 0, className: '' };
        if (index !== undefined && index > -1) {
            return (
                result.find(({ className }) => className === this._labels[index]) || defaultResult
            );
        }
        return result[0] || defaultResult;
    }

    unbanBlocks(blockMenu) {
        blockMenu.unbanClass(`ai_learning_classification`);
        if (this._type) {
            blockMenu.unbanClass(`ai_learning_${this._type}`);
        }
    }

    openInputPopup() {
        Entry.dispatchEvent('openMLInputPopup', {
            type: this._type,
            recordTime: this._recordTime,
            predict: async (data) => {
                this._result = await this.predict(data);
            },
            url: this._url,
            labels: this._labels,
            setResult: (result) => {
                this._result = result;
            },
        });
    }

    async namePredictions(logits) {
        if (!logits) return [];
        const values = Array.from(await logits.data());
        return values
            .map((probability, index) => ({
                className: this._labels[index] || index,
                probability,
            }))
            .sort((a, b) => b.probability - a.probability);
    }

    async startPredict() {
        if (this._isPredicting || !this.isLoaded) return;
        this._isPredicting = true;

        const speechCommands = window.speechCommands;
        if (!speechCommands || !speechCommands.create) {
            console.warn('SpeechClassification: speechCommands not found on window');
            this._isPredicting = false;
            return;
        }

        // Robust offline model loading for workspace blocks
        // Since this part of the app can use file:// directly, we point to the absolute path
        const basePath = Entry.isOffline 
            ? `${window.remote.app.getAppPath()}/src/renderer/resources/lib/tensorflow/models/speech-commands/`
            : '../../renderer/resources/lib/tensorflow/models/speech-commands/';
        
        // Clean up base path for absolute resolution
        let absoluteBasePath = basePath;
        if (Entry.isOffline) {
            if (process.platform === 'win32' && absoluteBasePath.startsWith('/')) {
                absoluteBasePath = absoluteBasePath.substring(1);
            }
        }

        // Use dummy http://localhost URLs to force BROWSER mode (fetch)
        const modelUrl = 'http://localhost/model.json';
        const metadataUrl = 'http://localhost/metadata.json';

        // Shim fetch for the workspace context
        if (!window.__originalFetch) {
            window.__originalFetch = window.fetch;
            window.fetch = async function(url, options) {
                const urlStr = typeof url === 'string' ? url : (url.url || '');
                if (urlStr.includes('http://localhost/')) {
                    const fileName = urlStr.split('/').pop();
                    try {
                        const fs = window.remote ? window.remote.require('fs') : window.__require('fs');
                        const path = window.remote ? window.remote.require('path') : window.__require('path');
                        
                        let filePath = `${absoluteBasePath}${fileName}`;
                        // Ensure path is absolute and clean
                        if (Entry.isOffline && !path.isAbsolute(filePath)) {
                            filePath = path.join(absoluteBasePath, fileName);
                        }

                        const buffer = fs.readFileSync(filePath);
                        const isJson = fileName.endsWith('.json');
                        return new Response(buffer, {
                            status: 200,
                            headers: { 'Content-Type': isJson ? 'application/json' : 'application/octet-stream' }
                        });
                    } catch (e) {
                        console.error('Workspace Fetch shim failed:', e);
                    }
                }
                return window.__originalFetch(url, options);
            };
        }

        console.log('SpeechClassification: Initializing recognizer with', modelUrl);
        
        const recognizer = speechCommands.create(
            'BROWSER_FFT',
            null,
            modelUrl,
            metadataUrl
        );

        try {
            await recognizer.ensureModelLoaded();
            this._recognizer = recognizer;
        } catch (e) {
            console.error('SpeechClassification: Failed to handle model loading', e);
            this._isPredicting = false;
            return;
        }

        const predictLoop = async () => {
            if (!this._isPredicting) return;
                try {
                const { spectrogram } = await recognizer.recognize({ includeHead: false, includeSpectrogram: true });
                if (!spectrogram) return;

                const tensor = tf.tidy(() => {
                    return tf.tensor(spectrogram.data).reshape([1, 43, 232, 1]);
                });
                
                const logits = this.model.predict(tensor);
                this._result = await this.namePredictions(logits);
                console.log('Workspace prediction result:', this._result);
                
                tensor.dispose();
                logits.dispose();
            } catch (e) {
                console.error('SpeechClassification predict loop error:', e);
            }
            if (this._isPredicting) {
                requestAnimationFrame(predictLoop);
            }
        };
        predictLoop();
    }

    stopPredict() {
        this._isPredicting = false;
        this._result = [];
        if (this._recognizer) {
            this._recognizer.stopListening().catch(() => {});
            this._recognizer = null;
        }
    }

    async predict(input) {
        if (!input) {
            return [];
        }
        // Wait for model loading if still in progress (constructor calls load() without await)
        if (!this.model && this._loadPromise) {
            await this._loadPromise;
        }
        if (!this.model) {
            console.warn('SpeechClassification.predict: model not loaded yet.');
            return [];
        }
        // Accept either a raw spectrogram object { data: Float32Array, frameSize: number }
        // (sent from the Data Input popup) or a pre-built TF tensor.
        let tensor = input;
        let createdTensor = false;
        if (input.data && input.frameSize) {
            const { data, frameSize } = input;
            const numFrames = data.length / frameSize;
            tensor = tf.tensor4d(data, [1, numFrames, frameSize, 1]);
            createdTensor = true;
        }
        const logits = this.model.predict(tensor);
        const result = await this.namePredictions(logits);
        if (createdTensor) tensor.dispose();
        logits.dispose();
        return result;
    }


    async load(url, modelArtifacts) {
        if (modelArtifacts && modelArtifacts.modelTopology && modelArtifacts.weightDataBase64) {
            try {
                const binaryString = atob(modelArtifacts.weightDataBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const weightData = bytes.buffer;

                this.model = await tf.loadLayersModel(tf.io.fromMemory(
                    modelArtifacts.modelTopology,
                    modelArtifacts.weightSpecs,
                    weightData
                ));
                this.isLoaded = true;
                return;
            } catch (e) {
                console.error('SpeechClassification: Failed to load from memory artifacts', e);
            }
        }

        if (!url) {
            console.warn('SpeechClassification: No model URL provided.');
            this.isLoaded = true;
            return;
        }

        try {
            this.model = await tf.loadLayersModel(url);
            this.isLoaded = true;
        } catch (e) {
            console.error('SpeechClassification: Failed to load model from URL', e);
            this.isLoaded = true;
        }
    }

    async reload(url) {
        try {
            this.model = await tf.loadLayersModel(url || this._url);
            this.isLoaded = true;
        } catch (e) {
            console.error('SpeechClassification: Failed to reload model', e);
        }
    }
}

export default Classification;
