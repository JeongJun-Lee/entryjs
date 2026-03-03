import audioUtils from './audioUtils';
import io from 'socket.io-client';

const GATEWAY_CONNECT_TIMEOUT = 5000;

const DEFAULT_ADDR = {
    hostname: window.origin,
    path: '/vc',
};

export function voiceApiConnect(addr = DEFAULT_ADDR, language = 'Kor', cb) {
    return new Promise((resolve, reject) => {
        let hostname = addr.hostname;
        const isUzbek = language === 'Uzb' || language === 'uz' || language === 'uz-UZ';
        // Force local Vosk for Uzbek in entry-offline regardless of isOffline status
        if (isUzbek && (typeof window !== 'undefined' && window.process && window.process.type === 'renderer' || typeof Entry !== 'undefined')) {
            hostname = 'http://127.0.0.1:4002';
        }
        console.log(`[audioSocket] STT Connection attempt to: ${hostname} (Language: ${language})`);

        const client = io(hostname, {
            path: addr.path,
            query: `language=${language}`,
            secure: hostname.startsWith('https'),
            reconnect: false, // Don't auto-reconnect for STT, better to start fresh
            forceNew: true,   // Important: don't reuse connection
            multiplex: false, // Important: don't multiplex
            rejectUnauthorized: false,
            timeout: GATEWAY_CONNECT_TIMEOUT,
            transports: ['websocket', 'polling'],
        });

        client.on('connect', () => {
            console.log('[Antigravity] NSASR Voice Server Connected');
            resolve(client);
        });

        client.on('disconnect', () => {
            console.log('closed');
            Entry.engine.hideAllAudioPanel();
            audioUtils.isRecording = false;
        });

        let isFirst = true;
        client.on('connect_error', (error) => {
            if (isFirst) {
                isFirst = false;
                client.io.opts.transports = ['polling', 'websocket'];
            } else {
                console.error('connect_error', error);
                Entry.engine.hideAllAudioPanel();
                audioUtils.isRecording = false;
                reject(error);
            }
        });
        client.on('connect_timeout', (timeout) => {
            console.error('connect_timeout', timeout);
            Entry.engine.hideAllAudioPanel();
            audioUtils.isRecording = false;
            reject(timeout);
        });
        client.on('error', (error) => {
            console.error('error', error);
            Entry.engine.hideAllAudioPanel();
            audioUtils.isRecording = false;
            reject(error);
        });
    });
}
