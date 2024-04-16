module.exports = {
  root: true,
  extends: ["@nuxtjs/eslint-config-typescript", "prettier"],
  rules: {
    "vue/first-attribute-linebreak": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-alert": "warn",
  },
};
