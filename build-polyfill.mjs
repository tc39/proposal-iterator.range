import builder from "core-js-builder"

const bundle = await builder({
    modules: [/esnext.+iterator/],
    summary: {
        console: { size: true, modules: false },
        comment: { size: false, modules: true },
    },
    format: "bundle",
    filename: './iterator-helper.js',
})
