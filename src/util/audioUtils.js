/**
 * 언더바가 붙은 함수 및 변수를 외부에서 쓰지 마세요
 * @author extracold1209, wodnjs6512
 */

const { voiceApiConnect } = require('./audioSocket');

const STATUS_CODE = {
    CONNECTED: 'CONNECTED',
    NOT_RECOGNIZED: 'NOT_RECOGNIZED',
    START_RECOGNIZE: 'START_RECOGNIZE',
    END_POINT_DETECTED: 'END_POINT_DETECTED',
    MODEL_LOADING: 'MODEL_LOADING',
    MODEL_LOADED: 'MODEL_LOADED',
};

const getVoiceServerAddress = () => ({
    hostname: Entry.baseUrl,
    path: '/vc',
});

const DESIRED_SAMPLE_RATE = 16000;

class AudioUtils {
    isTimedRecord = false;
    isMuted = false;
    timedResult = [];
    stopCallback = null;

    get currentVolume() {
        return this._currentVolume;
    }

    constructor() {
        this.isInitialized = false; // 유저 인풋 연결 확인
        this.isRecording = false;
        this._userMediaStream = undefined;
        this._mediaRecorder = undefined;
        this._currentVolume = -1;
        this._audioChunks = [];
        this.result = null;
        this.startedRecording = false;
        this.audioInputList = [];
    }

    async getMediaStream() {
        try {
            return await navigator.mediaDevices.getUserMedia({
                audio: {
                    autoGainControl: true,
                    noiseSuppression: true,
                    echoCancellation: true,
                },
            });
        } catch (err) {
            // is MIC present in browser
            this.isRecording = false;
            this.stopRecord();
            throw new Entry.Utils.IncompatibleError('IncompatibleError', [
                Lang.Workspace.check_microphone_error,
            ]);
        }
    }

    incompatBrowserChecker() {
        // IE/safari CHECKER
        if (!this.isAudioSupport) {
            this.isAudioSupport = this._isBrowserSupportAudio(); // 브라우저 지원 확인
            if (!this.isAudioSupport) {
                this.isRecording = false;
                this.stopRecord();
                throw new Entry.Utils.IncompatibleError('IncompatibleError', [
                    Lang.Workspace.check_microphone_error,
                ]);
            }
        }
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }
        this.incompatBrowserChecker();
        const mediaStream = await this.getMediaStream();
        try {
            Entry.addEventListener('beforeStop', () => {
                this.improperStop();
            });

            const inputList = await navigator.mediaDevices.enumerateDevices();
            this.audioInputList = inputList
                .filter((input) => input.kind === 'audioinput')
                .map((item) => [item.label, item.deviceId]);

            if (!window.AudioContext) {
                if (window.webkitAudioContext) {
                    window.AudioContext = window.webkitAudioContext;
                }
            }
            // Create context with 16kHz sample rate directly to avoid resampling overhead
            const audioContext = new window.AudioContext({ sampleRate: DESIRED_SAMPLE_RATE });
            const streamSrc = audioContext.createMediaStreamSource(mediaStream);
            const analyserNode = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.5;

            const scriptNode = audioContext.createScriptProcessor(2048, 1, 1);
            const streamDest = audioContext.createMediaStreamDestination();
            const mediaRecorder = new MediaRecorder(streamDest.stream);

            this._connectNodes(streamSrc, gainNode, analyserNode, scriptNode, streamDest);
            scriptNode.onaudioprocess = this._handleScriptProcess(analyserNode);

            this._audioContext = audioContext;
            this._userMediaStream = mediaStream;
            this._mediaRecorder = mediaRecorder;

            this.isInitialized = true;
            return;
        } catch (e) {
            console.error('error occurred while init audio input', e);
            this.isInitialized = false;
            return;
        }
    }

    improperStop() {
        this.stopRecord();
        if (this.resolveFunc) {
            this.resolveFunc('');
        }
    }

    _getLangCode(language) {
        switch (language) {
            case 'Kor': return 'ko-KR';
            case 'Eng': return 'en-US';
            case 'Jpn': return 'ja-JP';
            case 'Uzb':
            case 'Uzbek':
            case 'uz':
            case 'uz-UZ': return 'uz-UZ';
            default: return language;
        }
    }

    startRecord(recordMilliSecond, language) {
        this.result = null;
        const isLocalVosk =
            language === 'Uzb' ||
            language === 'uz' ||
            language === 'uz-UZ';
        if (isLocalVosk) {
            return this._startSocketRecord(recordMilliSecond, language);
        }

        if (typeof Entry !== 'undefined' && Entry.isOffline) {
            console.log(`[audioUtils] Offline mode: Skipping STT for ${language}`);
            return Promise.resolve('-');
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return this._startSocketRecord(recordMilliSecond, language);
        }

        return new Promise((resolve) => {
            const recognition = new SpeechRecognition();
            recognition.lang = this._getLangCode(language);
            recognition.continuous = false;
            recognition.interimResults = false;
            let resolved = false;

            recognition.onresult = (event) => {
                if (resolved) return;
                const text = event.results[0][0].transcript;
                resolved = true;
                resolve(text);
                this.stopRecord();
            };

            recognition.onerror = async (event) => {
                if (resolved) return;
                console.log('SpeechRecognition error:', event.error);
                const isUzbek = language === 'Uzb' || language === 'uz' || language === 'uz-UZ';
                if (isUzbek && (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed')) {
                    resolved = true;
                    this.startedRecording = false;
                    if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                        Entry.engine.toggleAudioShadePanel(); // hide panel so fallback can toggle it again
                    }
                    resolve(await this._startSocketRecord(recordMilliSecond, language));
                } else if (!isUzbek && event.error === 'network') {
                    // For non-uzbek languages, if network fails, we fall back to original socket (Naver Clova)
                    // though it will likely fail if actually offline.
                    resolved = true;
                    this.startedRecording = false;
                    if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                        Entry.engine.toggleAudioShadePanel();
                    }
                    resolve(await this._startSocketRecord(recordMilliSecond, language));
                } else {
                    resolved = true;
                    resolve('-');
                    this.stopRecord();
                }
            };

            recognition.onnomatch = () => {
                if (!resolved) {
                    resolved = true;
                    resolve('-');
                    this.stopRecord();
                }
            };

            try {
                if (!this.isRecording) {
                    this.isRecording = true;
                }
                recognition.start();
                this.startedRecording = true;
                if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                    Entry.engine.toggleAudioShadePanel();
                }

                this._properStopCall = setTimeout(() => {
                    if (!resolved) {
                        recognition.stop();
                        resolved = true;
                        resolve('-');
                        this.stopRecord();
                    }
                }, recordMilliSecond);

                this.stopCallback = () => {
                    if (!resolved) {
                        recognition.stop();
                        resolved = true;
                        resolve(0);
                    }
                };
            } catch (e) {
                console.error(e);
                if (!resolved) {
                    resolved = true;
                    this.startedRecording = false;
                    if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                        Entry.engine.toggleAudioShadePanel();
                    }
                    this._startSocketRecord(recordMilliSecond, language).then(resolve);
                }
            }
        });
    }

    _startSocketRecord(recordMilliSecond, language) {
        return new Promise(async (resolve, reject) => {
            this.resolveFunc = resolve;
            if (!this.isInitialized) {
                console.log('audio not initialized');
                resolve(0);
                return;
            }
            this.isRecording = true;
            if (this._audioContext.state === 'suspended') {
                console.log('[audioUtils] AudioContext is suspended, resuming...');
                await this._audioContext.resume();
            }

            try {
                this._socketClient = await voiceApiConnect(
                    getVoiceServerAddress(),
                    language,
                    (data) => {
                        this.result = data;
                    }
                );
            } catch (err) {
                console.error('[audioUtils] Connection to STT server failed:', err);
                this.isRecording = false;
                resolve('-');
                return;
            }

            if (!this._socketClient) {
                console.error('[audioUtils] Socket client not created');
                this.isRecording = false;
                resolve('-');
                return;
            }

            this._audioChunks = [];

            this._stopMediaRecorder();
            this._mediaRecorder.start();
            this.startedRecording = true;
            Entry.engine.toggleAudioShadePanel();

            if (this._socketClient) {
                this._socketClient.on('disconnect', () => {
                    console.log('[audioUtils] Socket disconnected');
                    if (this.stopCallback) {
                        this.stopCallback();
                    } else if (this.resolveFunc) {
                        this.resolveFunc('-');
                    }
                });
                this._socketClient.on('message', (e) => {
                    switch (e) {
                        case STATUS_CODE.CONNECTED:
                            break;
                        case STATUS_CODE.MODEL_LOADING:
                            console.log('[audioUtils] STATUS: MODEL_LOADING');
                            break;
                        case STATUS_CODE.MODEL_LOADED:
                            console.log('[audioUtils] STATUS: MODEL_LOADED');
                            if (Entry.toast) {
                                Entry.toast.success(
                                    Lang.Msgs.video_model_load_success,
                                    Lang.Msgs.audio_model_load_completed
                                );
                            }
                            break;
                        case STATUS_CODE.END_POINT_DETECTED:
                            Entry.dispatchEvent('audioRecordProcessing');
                            if (this.startedRecording) {
                                Entry.engine.toggleAudioProgressPanel();
                            }
                            this.startedRecording = false;
                            break;
                        case STATUS_CODE.NOT_RECOGNIZED:
                            this.stopCallback = null;
                            resolve('-');
                            this.stopRecord();
                            break;
                        default: {
                            const parsed = JSON.parse(e);
                            const isArray = Array.isArray(parsed);
                            if (isArray) {
                                this.stopCallback = null;
                                resolve(parsed[0]);
                                this.stopRecord();
                            } else {
                                resolve('-');
                            }
                            break;
                        }
                    }
                });
                this._properStopCall = setTimeout(() => {
                    this.stopRecord();
                }, recordMilliSecond);
                this.stopCallback = () => {
                    resolve(0);
                };
            }
        });
    }

    startTimedRecord(recordMilliSecond, language) {
        this.result = null;
        const isLocalVosk =
            language === 'Uzb' ||
            language === 'uz' ||
            language === 'uz-UZ';
        if (isLocalVosk) {
            return this._startSocketTimedRecord(recordMilliSecond, language);
        }
        if (typeof Entry !== 'undefined' && Entry.isOffline) {
            console.log(`[audioUtils] Offline mode: Skipping STT for ${language}`);
            return Promise.resolve('-');
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return this._startSocketTimedRecord(recordMilliSecond, language);
        }

        return new Promise((resolve) => {
            const recognition = new SpeechRecognition();
            recognition.lang = this._getLangCode(language);
            recognition.continuous = false;
            recognition.interimResults = false;
            let resolved = false;

            recognition.onresult = (event) => {
                if (resolved) return;
                const text = event.results[0][0].transcript;
                resolved = true;
                resolve(text);
                this.stopRecord();
            };

            recognition.onerror = async (event) => {
                if (resolved) return;
                console.log('SpeechRecognition error:', event.error);
                const isUzbek = language === 'Uzb' || language === 'uz' || language === 'uz-UZ';
                if (isUzbek && (event.error === 'network' || event.error === 'not-allowed' || event.error === 'service-not-allowed')) {
                    resolved = true;
                    this.startedRecording = false;
                    if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                        Entry.engine.toggleAudioShadePanel();
                    }
                    resolve(await this._startSocketTimedRecord(recordMilliSecond, language));
                } else if (!isUzbek && event.error === 'network') {
                    resolved = true;
                    this.startedRecording = false;
                    if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                        Entry.engine.toggleAudioShadePanel();
                    }
                    resolve(await this._startSocketTimedRecord(recordMilliSecond, language));
                } else {
                    resolved = true;
                    resolve('-');
                    this.stopRecord();
                }
            };

            recognition.onnomatch = () => {
                if (!resolved) {
                    resolved = true;
                    resolve('-');
                    this.stopRecord();
                }
            };

            try {
                if (!this.isRecording) {
                    this.isRecording = true;
                }
                recognition.start();
                this.startedRecording = true;
                if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                    Entry.engine.toggleAudioShadePanel();
                }

                this._properStopCall = setTimeout(() => {
                    if (!resolved) {
                        recognition.stop();
                        resolved = true;
                        resolve('-');
                        this.stopRecord();
                    }
                }, recordMilliSecond);

                this.stopCallback = () => {
                    if (!resolved) {
                        recognition.stop();
                        resolved = true;
                        resolve(0);
                    }
                };
            } catch (e) {
                console.error(e);
                if (!resolved) {
                    resolved = true;
                    this.startedRecording = false;
                    if (Entry.engine && typeof Entry.engine.toggleAudioShadePanel === 'function') {
                        Entry.engine.toggleAudioShadePanel();
                    }
                    this._startSocketTimedRecord(recordMilliSecond, language).then(resolve);
                }
            }
        });
    }

    _startSocketTimedRecord(recordMilliSecond, language) {
        return new Promise(async (resolve, reject) => {
            this.isTimedRecord = true;
            this.timedResult = [];
            this.resolveFunc = resolve;
            if (!this.isInitialized) {
                console.log('audio not initialized');
                resolve(0);
                return;
            }
            this.isRecording = true;
            if (this._audioContext.state === 'suspended') {
                console.log('[audioUtils] AudioContext is suspended, resuming...');
                await this._audioContext.resume();
            }

            try {
                this._socketClient = await voiceApiConnect(
                    getVoiceServerAddress(),
                    language,
                    (data) => {
                        this.result = data;
                    }
                );
            } catch (err) {
                console.error('[audioUtils] Connection to STT server failed (timed):', err);
                this.isRecording = false;
                this.isTimedRecord = false;
                resolve('-');
                return;
            }

            if (!this._socketClient) {
                console.error('[audioUtils] Socket client not created (timed)');
                this.isRecording = false;
                this.isTimedRecord = false;
                resolve('-');
                return;
            }

            this._audioChunks = [];

            this._stopMediaRecorder();
            this._mediaRecorder.start();
            this.startedRecording = true;
            Entry.engine.toggleAudioShadePanel();
            if (this._socketClient) {
                this._socketClient.on('disconnect', () => {
                    console.log('[audioUtils] Socket disconnected');
                    if (this.isRecording && this.stopCallback) {
                        this.stopCallback();
                    } else if (this.resolveFunc) {
                        this.resolveFunc('-');
                    }
                });
            }

            this._properStopCall = setTimeout(async () => {
                try {
                    this.isTimedRecord = false;
                    Entry.dispatchEvent('audioRecordProcessing');
                    if (this.startedRecording) {
                        Entry.engine.toggleAudioProgressPanel();
                    }
                    this.startedRecording = false;
                    const result = await this.sendBuffer(this.timedResult, language);
                    this.stopRecord();
                    resolve(result);
                } catch (e) {
                    resolve(0);
                }
            }, recordMilliSecond);

            this.stopCallback = () => {
                resolve(0);
            };
        });
    }

    async sendBuffer(buffers, language) {
        return new Promise(async (resolve, reject) => {
            if (!this._socketClient) {
                resolve('-');
                return;
            }
            this._socketClient.on('disconnect', () => {
                resolve('-');
            });
            this._socketClient.on('message', (e) => {
                switch (e) {
                    case STATUS_CODE.CONNECTED:
                        break;
                    case STATUS_CODE.END_POINT_DETECTED:
                        break;
                    case STATUS_CODE.NOT_RECOGNIZED:
                        this.stopCallback = null;
                        resolve('-');
                        this.stopRecord();
                        break;
                    default: {
                        const parsed = JSON.parse(e);
                        const isArray = Array.isArray(parsed);
                        if (isArray) {
                            this.stopCallback = null;
                            resolve(parsed[0]);
                            this.stopRecord();
                        } else {
                            resolve('-');
                        }
                        break;
                    }
                }
            });

            if (this._socketClient && this._socketClient.connected) {
                // socket.io로 서버 전송
                buffers.forEach((buffer) => {
                    const channelData = buffer.getChannelData(0);
                    const pcmData = new Int16Array(channelData.length);
                    for (let i = 0; i < channelData.length; i++) {
                        const s = Math.max(-1, Math.min(1, channelData[i]));
                        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    this._socketClient.send(pcmData.buffer);
                });
            }
        });
    }

    _stopMediaRecorder() {
        if (this._mediaRecorder.state == 'recording' || this._mediaRecorder.state === 'paused') {
            this._mediaRecorder.stop();
        }
    }

    /**
     * 녹음을 종료한다.
     */
    stopRecord() {
        if (this._socketClient) {
            this._socketClient.disconnect();
            this._socketClient = null;
        }
        if (!this.isInitialized || !this.isRecording) {
            // Even if not recording, ensure stopCallback is handled if it exists
            if (this.stopCallback) {
                this.stopCallback();
                this.stopCallback = null;
            }
            return;
        }
        Entry.dispatchEvent('audioRecordProcessing');
        if (this.startedRecording) {
            Entry.engine.toggleAudioProgressPanel();
        }
        this.startedRecording = false;

        this._mediaRecorder.onstop = null;

        this._stopMediaRecorder();
        this._audioContext.suspend();
        if (this.stream) {
            this.stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        clearTimeout(this._properStopCall);
        if (this.stopCallback) {
            this.stopCallback();
        }
        this.isRecording = false;
    }

    isAudioConnected() {
        if (!this._isBrowserSupportAudio() || !this.isInitialized || !this._userMediaStream) {
            return false;
        }
        const tracks = this._userMediaStream.getAudioTracks();
        return tracks && tracks.some((track) => track.readyState === 'live');
    }

    _connectNodes(...connectableNodes) {
        for (let i = 0; i < connectableNodes.length - 1; i++) {
            if (connectableNodes[i].connect) {
                connectableNodes[i].connect(connectableNodes[i + 1]);
            } else {
                throw new Error('you can not connect node');
            }
        }
    }

    /**
     * STT 데이터 전송을 일시 중지(Mute)하거나 재개한다.
     * TTS 재생 중에 마이크 소리가 섞이는 것을 방지하기 위해 사용.
     * @param {boolean} isMuted
     */
    setMute(isMuted) {
        this.isMuted = !!isMuted;
        if (this.isMuted) {
            console.log('[audioUtils] STT Muted (TTS Playing...)');
        } else {
            console.log('[audioUtils] STT Unmuted');
        }
    }

    _isBrowserSupportAudio() {
        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia ||
            !window.MediaRecorder
        ) {
            return false;
        }
        return true;
    }

    _handleScriptProcess = (analyserNode) => (audioProcessingEvent) => {
        const array = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(array);

        // 현재 input 의 볼륨세기
        this._currentVolume = array.reduce((total, data) => total + data, 0) / array.length;

        // 볼륨 변형 없이 그대로 통과
        const { inputBuffer, outputBuffer } = audioProcessingEvent;
        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            for (let sample = 0; sample < inputBuffer.length; sample++) {
                outputData[sample] = inputData[sample];
            }
        }
        if (!this.isRecording) {
            return;
        }

        if (this.isMuted) {
            // Mute 상태일 때는 0으로 채워진 오디오 데이터로 처리 (인식 방지)
            if (this.isTimedRecord) {
                const silentBuffer = this._audioContext.createBuffer(
                    inputBuffer.numberOfChannels,
                    inputBuffer.length,
                    inputBuffer.sampleRate
                );
                this.timedResult.push(silentBuffer);
            }
            return;
        }

        if (this.isTimedRecord) {
            this.timedResult.push(inputBuffer);
        } else if (this._socketClient && this._socketClient.connected) {
            const channelData = inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(channelData.length);
            for (let i = 0; i < channelData.length; i++) {
                if (i === 0 && Math.random() < 0.01) {
                    console.log(`[audioUtils] Sending PCM chunk to socket: ${pcmData.length} samples`);
                }
                const s = Math.max(-1, Math.min(1, channelData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            this._socketClient.send(pcmData.buffer);
        }
    };
}

//Entry 네임스페이스에는 존재하지 않으므로 외부에서 사용할 수 없다.
export default new AudioUtils();
