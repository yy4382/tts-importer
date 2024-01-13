import genAiyue from "~/utils/genAiyue";
export default defineEventHandler((event) => {
    const query = getQuery(event);
    if (!query.config) return { error: 'Missing config' };
    const config = JSON.parse(String(query.config));
    const api = config.api;
    const vconfig = config.vconfig;
    const artifact = genAiyue(api, vconfig);
    return JSON.parse(artifact);
})