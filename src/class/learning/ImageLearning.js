import * as tf from '@tensorflow/tfjs';
import VideoUtils from '@entrylabs/legacy-video';
import MediaPipeUtils from '../../util/mediaPipeUtils';
const mediaPipeUtils = MediaPipeUtils.getInstance();
export const classes = [
    'ai_learning_image'
];
const SCALAR_VALUE = 127.5;
const SIZE = 224;
class ImageLearning {
    #type = null;
    #url = '';
    #labels = [];
    #popup = null;
    #result = [];
    #axis = 0;
    #isPredicting = false;
    #captureCanvas;
    #captureTimeoutClear;
    #mobilenetModel = null; // For offline head models that need MobileNet feature extraction
    #isOfflineHead = false;
    constructor({ url, labels, type, modelArtifacts }) {
        this.#type = type;
        this.#url = url;
        this.#labels = labels;
        this.load(url, modelArtifacts);
        Entry.addEventListener('stop', () => {
            this.#result = [];
            this.#isPredicting = false;
        });
        if (!isWebGlSupport()) {
            tf.setBackend('cpu');
        }
    }

    getResult(indexOrName) {
        const result = this.#result.length ? this.#result : this.#popup?.result || [];
        const defaultResult = { probability: 0, className: '' };
        if (indexOrName !== undefined && indexOrName !== null) {
            const label = this.#labels[indexOrName] || indexOrName;
            return (
                result.find(({ className }) => String(className) === String(label)) || defaultResult
            );
        }
        return result[0] || defaultResult;
    }

    unbanBlocks(blockMenu) {
        blockMenu.unbanClass(`ai_learning_classification`);
        if (this.#type) {
            blockMenu.unbanClass(`ai_learning_${this.#type}`);
        }
    }

    openInputPopup() {
        Entry.dispatchEvent('openMLInputPopup', {
            type: 'image',
            predict: async (canvas) => {
                this.#result = await this.predict(canvas);
                return this.#result;
            },
            url: this.#url,
            labels: this.#labels,
            setResult: (result) => {
                this.#result = result;
            },
        });
    }

    getVideo() {
        if (VideoUtils.isInitialized) {
            return VideoUtils.video;
        }
        if (mediaPipeUtils.isInitialized) {
            return mediaPipeUtils.video;
        }
        return null;
    }
    async startPredict() {
        if (!this.isLoaded || this.#isPredicting) {
            return false;
        }

        this.#isPredicting = true;
        if (!this.captureCanvas) {
            this.#captureCanvas = document.createElement('canvas');
            this.#captureCanvas.width = SIZE;
            this.#captureCanvas.height = SIZE;
        }

        this.#captureTimeoutClear = Entry.Utils.asyncAnimationFrame(async () => {
            const video = this.getVideo();
            if (!video) {
                return;
            }
            const context = this.#captureCanvas.getContext('2d');
            context.drawImage(video, 0, 0, SIZE, SIZE);

            this.#result = await this.predict(this.#captureCanvas);
        });

        return this.#result;
    }

    async predict(canvas) {
        if (!this.model) {
            console.warn("ImageLearning: Cannot predict without a loaded model.");
            return [];
        }
        tf.engine().startScope();

        let logits;
        if (this.#isOfflineHead && this.#mobilenetModel) {
            // Offline head model: MobileNet embedding → dense head
            // Normalize to [-1, 1] to match mobilenet.infer() preprocessing
            const pixelTensor = tf.browser.fromPixels(canvas)
                .resizeBilinear([224, 224])
                .toFloat()
                .div(tf.scalar(127.5))
                .sub(tf.scalar(1))
                .expandDims(0);
            const embedding = this.#inferMobileNet(pixelTensor);
            logits = this.model.predict(embedding);
            pixelTensor.dispose();
            embedding.dispose();
        } else {
            // Online full model: normalized pixels → full model
            const tensor = await this.preprocess(canvas);
            logits = this.model.predict(tensor);
        }

        const result = await this.namePredictions(logits);
        logits.dispose();
        tf.engine().endScope();
        return result;
    }

    stopPredict() {
        this.#result = [];
        this.#isPredicting = false;
        this.#captureTimeoutClear && this.#captureTimeoutClear();
    }

    async namePredictions(logits) {
        const values = Array.from(await logits.data());
        return values
            .map((probability, index) => ({
                className: this.#labels[index] || index,
                probability,
            }))
            .sort((a, b) => a.probability > b.probability ? -1 : a.probability < b.probability ? 1 : 0);
    }

    async preprocess(canvas) {
        return tf.tidy(() => {
            const offset = tf.scalar(SCALAR_VALUE);
            return tf.browser
                .fromPixels(canvas)
                .toFloat()
                .sub(offset)
                .div(offset)
                .expandDims(this.#axis);
        });
    }

    async load(url, modelArtifacts) {
        // Priority 1: Load from in-memory artifacts (offline training)
        if (modelArtifacts && modelArtifacts.modelTopology && modelArtifacts.weightDataBase64) {
            try {
                const weightData = base64ToArrayBuffer(modelArtifacts.weightDataBase64);
                this.model = await tf.loadLayersModel(tf.io.fromMemory(
                    modelArtifacts.modelTopology,
                    modelArtifacts.weightSpecs,
                    weightData
                ));
                this.isLoaded = true;
                this.#isOfflineHead = true;
                console.log('ImageLearning: Loaded head model from memory artifacts (offline).');

                // Load MobileNet as feature extractor for prediction
                await this.#loadMobileNet();
                return;
            } catch (e) {
                console.error('ImageLearning: Failed to load from memory artifacts', e);
            }
        }

        // Priority 2: Load from URL (online)
        if (!url) {
            console.warn('ImageLearning: No model URL provided. Using mock/offline mode.');
            this.isLoaded = true;
            return;
        }
        try {
            this.model = await tf.loadLayersModel(url);
            this.isLoaded = true;
        } catch (e) {
            console.error('ImageLearning: Failed to load model', e);
            this.isLoaded = true;
        }
    }

    async #loadMobileNet() {
        try {
            // Load MobileNet v1 as a GraphModel (TF Hub format)
            // In offline Electron, use local path
            const isOfflineApp = window.location.protocol === 'file:';
            let mobilenetUrl;
            if (isOfflineApp) {
                mobilenetUrl = '../../renderer/resources/lib/tensorflow/models/mobilenet/model.json';
            } else {
                mobilenetUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json';
            }

            // This is a GraphModel, not LayersModel
            this.#mobilenetModel = await tf.loadGraphModel(mobilenetUrl);
            console.log('ImageLearning: MobileNet GraphModel loaded for offline prediction.');
        } catch (e) {
            console.error('ImageLearning: Failed to load MobileNet for offline prediction', e);
            this.#isOfflineHead = false;
        }
    }

    // Mimic mobilenet.infer(img, embedding=true): returns [1, 1024] tensor
    #inferMobileNet(imgTensor) {
        // Possible node names for global average pooling output in MobileNet v1 TF Hub
        const CANDIDATE_NODES = [
            'module_apply_default/MobilenetV1/Logits/global_pool',
            'module_apply_default/MobilenetV1/MobilenetV1/global_pool',
        ];

        for (const nodeName of CANDIDATE_NODES) {
            try {
                const result = this.#mobilenetModel.execute(imgTensor, nodeName);
                // Shape is [1, 1, 1, 1024] from the Mean op, squeeze to [1, 1024]
                return result.reshape([1, 1024]);
            } catch (e) {
                // Try next candidate
            }
        }

        console.error('ImageLearning: No valid embedding node found in MobileNet');
        throw new Error('MobileNet embedding extraction failed');
    }

    isTrained() {
        return !!this.isLoaded && !!this.model;
    }
}

export default ImageLearning;

function isWebGlSupport() {
    try {
        const currentCanvas = document.createElement('canvas');
        return !!currentCanvas.getContext('webgl', { premultipliedalpha: false });
    } catch (e) {
        console.log('error', e);
        return false;
    }
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
