let BASE_URL = 'https://18mh.net';
try {
    if (CONFIG_URL) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
}
let clean_vercel_url = vercel_url;
clean_vercel_url = clean_vercel_url.replace(/^"([\s\S]*)"$/, "$1");
let VERCEL_PROXY_URL = clean_vercel_url.trim();
if (VERCEL_PROXY_URL.endsWith('/')) {
    VERCEL_PROXY_URL = VERCEL_PROXY_URL.slice(0, -1);
}
let header = `{
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        }
    }`;