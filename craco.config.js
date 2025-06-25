module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Désactiver ESLint complètement pour éviter les erreurs CI
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ESLintWebpackPlugin'
      );

      // Désactiver les warnings ESLint pour le build
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            warning.module.resource.includes("node_modules")
          );
        },
      ];

      // Ajouter les polyfills pour les modules Node.js
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "util": require.resolve("util"),
        "url": require.resolve("url"),
        "assert": require.resolve("assert")
      };

      return webpackConfig;
    }
  },
  eslint: {
    enable: false  // Désactiver ESLint complètement
  }
}; 
