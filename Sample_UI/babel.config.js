module.exports = {
    plugins: [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties"],
        ['@babel/plugin-transform-modules-commonjs', { lazy: () => true, noInterop: false }],
        ['@babel/plugin-transform-runtime', { useESModules: true }]
    ],
    presets: [

        ["@vue/app", {
            useBuiltIns: "entry",
            target: {
                "node": "current"
            }
        }],
        ['@babel/preset-env', {
            targets: {
                chrome: '85',
            }
        }],
        '@babel/preset-typescript',
    ]
};