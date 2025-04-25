module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ["module:react-native-dotenv", {
      "moduleName": "react-native-dotenv",
      "path": ".env",
      "blacklist": null,
      "whitelist": ["OPENAI_API_KEY"],
      "safe": true,
      "allowUndefined": false
    }]
  ]
}; 