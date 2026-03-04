import audioUtils from './audioUtils';
import io from 'socket.io-client';

const GATEWAY_CONNECT_TIMEOUT = 10000;

const DEFAULT_ADDR = {
    hostname: window.origin,
    path: '/vc',
};

export function voiceApiConnect(addr = DEFAULT_ADDR, language = 'Kor', cb) {
    return new Promise(async (resolve, reject) => {
        let hostname = addr.hostname;
        const isUzbek = language === 'Uzb' || language === 'uz' || language === 'uz-UZ';

        console.log(`[audioSocket] Checking Env: isUzbek=${isUzbek}, ipcInvokeTracker=${!!window.ipcInvoke}`);

        // Force local Vosk for Uzbek in entry-offline if ipcInvoke is available
        if (isUzbek && window.ipcInvoke) {
            hostname = 'http://127.0.0.1:4002';
            console.log('[audioSocket] Detected offline condition for Uzbek STT via ipcInvoke capability.');

            try {
                console.log('[audioSocket] Requesting lazy-load of local STT server via ipcInvoke("start-vosk-server")');
                const serverStarted = await window.ipcInvoke('start-vosk-server');
                console.log(`[audioSocket] IPC "start-vosk-server" returned: ${serverStarted}`);
                if (!serverStarted) {
                    audioUtils.isRecording = false;
                    return reject(new Error('Local STT Server failed to start'));
                }
            } catch (e) {
                console.error('[audioSocket] Error invoking start-vosk-server:', e);
                audioUtils.isRecording = false;
                return reject(e);
            }
        } else if (isUzbek) {
            // For Uzbek without ipcInvoke, we are probably on the web where it shouldn't be supported anyway, 
            // but just in case we default to remote or local? Log it so we can trace it.
            console.warn('[audioSocket] window.ipcInvoke is NOT available. Proceeding with default hostname for Uzbek.');
        }

        console.log(`[audioSocket] STT Connection attempt to: ${hostname} (Language: ${language})`);

        const client = io(hostname, {
            path: addr.path,
            query: `language=${language}`,
            secure: hostname.startsWith('https'),
            reconnection: false, // Don't auto-reconnect for STT, better to start fresh
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
