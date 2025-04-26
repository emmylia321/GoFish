module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    ["module:react-native-dotenv", {
      "moduleName": "@env",
      "path": ".env",
      "blacklist": null,
      "whitelist": null,
      "safe": false,
      "allowUndefined": true
    }]
  ],
  overrides: [{
    test: fileName => !fileName.includes('node_modules/react-native-maps'),
    plugins: [["@babel/plugin-transform-private-methods", { "loose": true }]]
    }],
};