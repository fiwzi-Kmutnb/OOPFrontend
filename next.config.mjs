/** @type {import('next').NextConfig} */

const nextConfig = {
    webpack: (config) => {
        config.externals = [...(config.externals || []), { canvas: 'canvas' }];

        config.experiments = {
            asyncWebAssembly: true,
            layers: true,
        };

        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        return config;
    },
    transpilePackages: [
        'cornerstone-core',
        'cornerstone-wado-image-loader',
        'dicom-parser',
        '@icr/polyseg-wasm',
    ],
};

export default nextConfig;