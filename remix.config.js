const { flatRoutes } = require("remix-flat-routes");
/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  // ignore all files in routes folder to prevent
  // default remix convention from picking up routes
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes, {
      basePath: "/", // optional base path (defaults to /)
      ignoredRouteFiles: [], // same as remix config
    });
  },
};
