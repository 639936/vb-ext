let BASE_URL = 'https://18mh.net';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}
let vercel_url = 'https://18mh.vercel.app';
let clean_vercel_url = vercel_url;
clean_vercel_url = clean_vercel_url.replace(/^"([\s\S]*)"$/, "$1");
let VERCEL_PROXY_URL = clean_vercel_url.trim();
if (VERCEL_PROXY_URL.endsWith('/')) {
    VERCEL_PROXY_URL = VERCEL_PROXY_URL.slice(0, -1);
}