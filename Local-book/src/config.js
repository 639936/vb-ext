let
    HOST;
const DEFAULT_HOST = 'http://192.168.0.168:8080';

// 'local_ip' is a global variable injected by the app from the config
if (typeof local_ip !== 'undefined' && local_ip) {
    if (!local_ip.startsWith('http')) {
        HOST = 'http://' + local_ip;
    } else {
        HOST = local_ip;
    }
} else {
    HOST = DEFAULT_HOST;
}