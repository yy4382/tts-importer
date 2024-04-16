// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/ui", "@nuxt/content"],
  // @ts-ignore
  content: {
    // My custom configuration
    markdown: {
      anchorLinks: {
        depth: 2,
        exclude: [1],
      },
    },
  },
});
