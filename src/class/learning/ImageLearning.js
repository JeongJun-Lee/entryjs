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
    _type = null;
    _url = '';
    _labels = [];
    _popup = null;
    _result = [];
    _axis = 0;
    _isPredicting = false;
    _captureCanvas;
    _captureTimeoutClear;
    _mobilenetModel = null; // For offline head models that need MobileNet feature extraction
    _isOfflineHead = false;
    constructor({ url, labels, type, modelArtifacts }) {
        this._type = type;
        this._url = url;
        this._labels = labels;
        this.load(url, modelArtifacts);
        Entry.addEventListener('stop', () => {
            this._result = [];
            this._isPredicting = false;
        });
        if (!isWebGlSupport()) {
            tf.setBackend('cpu');
        }
    }

    getResult(indexOrName) {
        const result = this._result.length ? this._result : this._popup?.result || [];
        const defaultResult = { probability: 0, className: '' };
        if (indexOrName !== undefined && indexOrName !== null) {
            const label = this._labels[indexOrName] || indexOrName;
            return (
                result.find(({ className }) => String(className) === String(label)) || defaultResult
            );
        }
        return result[0] || defaultResult;
    }

    unbanBlocks(blockMenu) {
        blockMenu.unbanClass(`ai_learning_classification`);
        if (this._type) {
            blockMenu.unbanClass(`ai_learning_${this._type}`);
        }
        if (this._type === 'image') {
            const hasVideoBlocks = Entry.aiUtilizeBlocks?.includes('video');
            if (!hasVideoBlocks) {
                Entry.aiUtilize?.addAIUtilizeBlocks(['video']);
            }
            // Limit shown video blocks
            const videoBlocks = [
                'video_title',
                'video_change_cam',
                'video_check_webcam',
                'video_draw_webcam',
                'video_set_camera_opacity_option',
                'video_flip_camera'
            ];
            const allBlocks = Entry.AI_UTILIZE_BLOCK.video.getBlocks();
            Object.keys(allBlocks).forEach(block => {
                const blockInfo = Entry.block[block];
                if (!blockInfo) return;
                
                if (!blockInfo._isNotFor) {
                    blockInfo._isNotFor = blockInfo.isNotFor;
                }

                if (videoBlocks.includes(block)) {
                    blockInfo.isNotFor = [block];
                    blockMenu.unbanClass(block);
                } else {
                    blockInfo.isNotFor = [block];
                    blockMenu.banClass(block);
                }
            });
            blockMenu.unbanClass('video');
        }
    }

    openInputPopup() {
        Entry.dispatchEvent('openMLInputPopup', {
            type: 'image',
            predict: async (canvas) => {
                this._result = await this.predict(canvas);
                return this._result;
            },
            url: this._url,
            labels: this._labels,
            setResult: (result) => {
                this._result = result;
            },
        });
    }

    getVideo() {
        if (VideoUtils.isInitialized) {
            return VideoUtils.video;
        }
        if (Entry.VideoUtils && Entry.VideoUtils.isInitialized) {
            return Entry.VideoUtils.video;
        }
        if (mediaPipeUtils.isInitialized) {
            return mediaPipeUtils.video;
        }
        return null;
    }
    async startPredict() {
        console.log('[ImageLearning] startPredict called. isLoaded:', this.isLoaded, 'isPredicting:', this._isPredicting);
        if (!this.isLoaded || this._isPredicting) {
            return false;
        }

        this._isPredicting = true;
        if (!this.captureCanvas) {
            this._captureCanvas = document.createElement('canvas');
            this._captureCanvas.width = SIZE;
            this._captureCanvas.height = SIZE;
        }

        const predictLoop = async () => {
            if (!this._isPredicting) {
                return;
            }
            const video = this.getVideo();
            if (!video) {
                this._captureTimeoutClear = requestAnimationFrame(predictLoop);
                return;
            }
            const context = this._captureCanvas.getContext('2d');
            context.drawImage(video, 0, 0, SIZE, SIZE);

            try {
                this._result = await this.predict(this._captureCanvas);
            } catch (err) {
                console.error('[ImageLearning] Prediction failed in loop:', err);
            }
            
            if (this._isPredicting) {
                this._captureTimeoutClear = requestAnimationFrame(predictLoop);
            }
        };

        predictLoop();

        return this._result;
    }

    async predict(canvas) {
        if (!this.model) {
            console.warn("ImageLearning: Cannot predict without a loaded model.");
            return [];
        }
        tf.engine().startScope();
        try {
            let logits;
            if (this._isOfflineHead && this._mobilenetModel) {
                // Offline head model: MobileNet embedding → dense head
                // Normalize to [-1, 1] to match mobilenet.infer() preprocessing
                const pixelTensor = tf.browser.fromPixels(canvas)
                    .resizeBilinear([224, 224])
                    .toFloat()
                    .div(tf.scalar(127.5))
                    .sub(tf.scalar(1))
                    .expandDims(0);
                const embedding = this._inferMobileNet(pixelTensor);
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
        } catch (err) {
        console.error("ImageLearning: Prediction crash!", err);
        tf.engine().endScope();
        return [];
    }
}

    stopPredict() {
        this._result = [];
        this._isPredicting = false;
        if (this._captureTimeoutClear) {
            clearTimeout(this._captureTimeoutClear);
            this._captureTimeoutClear = null;
        }
    }

    async namePredictions(logits) {
        const values = Array.from(await logits.data());
        return values
            .map((probability, index) => ({
                className: this._labels[index] || index,
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
                .expandDims(this._axis);
        });
    }

    async load(url, modelArtifacts) {
        // Priority 1: Load from in-memory artifacts (offline training)
        if (modelArtifacts && modelArtifacts.modelTopology && modelArtifacts.weightDataBase64) {
            try {
                const weightData = base64ToArrayBuffer(modelArtifacts.weightDataBase64);
                this.model = await tf.loadLayersModel(tf.io.fromMemory({
                    modelTopology: modelArtifacts.modelTopology,
                    weightSpecs: modelArtifacts.weightSpecs,
                    weightData: weightData
                }));
                this.isLoaded = true;
                this._isOfflineHead = true;
                console.log('ImageLearning: Loaded head model from memory artifacts (offline).');

                // Load MobileNet as feature extractor for prediction
                await this._loadMobileNet();
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

    async _loadMobileNet() {
        try {
            // Load MobileNet v1 as a GraphModel (TF Hub format)
            // In offline Electron, use local path
            const isOfflineApp = window.location.protocol === 'file:';
            let mobilenetUrl;
            if (isOfflineApp) {
                // Return to original path that was known to work
                mobilenetUrl = '../../renderer/resources/lib/tensorflow/models/mobilenet/model.json';
            } else {
                mobilenetUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json';
            }

            // This is a GraphModel, not LayersModel
            this._mobilenetModel = await tf.loadGraphModel(mobilenetUrl);
            console.log('ImageLearning: MobileNet GraphModel loaded from:', mobilenetUrl);
        } catch (e) {
            console.error('ImageLearning: Failed to load MobileNet from:', mobilenetUrl, e);
            this._isOfflineHead = false;
        }
    }

    // Mimic mobilenet.infer(img, embedding=true): returns [1, 1024] tensor
    _inferMobileNet(imgTensor) {
        // Possible node names for global average pooling output in MobileNet v1 TF Hub
        const CANDIDATE_NODES = [
            'module_apply_default/MobilenetV1/Logits/global_pool',
            'module_apply_default/MobilenetV1/MobilenetV1/global_pool',
        ];

        for (const nodeName of CANDIDATE_NODES) {
            try {
                const result = this._mobilenetModel.execute(imgTensor, nodeName);
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
