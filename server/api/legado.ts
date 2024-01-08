export default defineEventHandler((event) => {
    const query = getQuery(event)
    if (!query.config) return { error: 'Missing config' }
    return JSON.parse(String(query.config))
})