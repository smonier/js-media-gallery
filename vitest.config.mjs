// Unit tests for the pure helpers of src/utils (rich text filter, video addresses, i18n values).
// Separate from vite.config.mjs so the Jahia build plugin is not involved.
export default {
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
};
