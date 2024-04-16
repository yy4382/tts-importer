export default defineAppConfig({
  ui: {
    primary: "violet",
    notifications: {
      // Show toasts at the top right of the screen
      position: "top-0 bottom-auto",
    },
    card: {
      background: "bg-stone-100 dark:bg-gray-900",
      divide: "divide-stone-300 dark:divide-gray-800",
    },
    checkbox: {
      label: "select-none",
    },
  },
});
