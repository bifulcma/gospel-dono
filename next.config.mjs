/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // I .md di prompts/ e canon/ vengono importati come stringhe (asset/source):
    // così il bundler li incorpora nelle funzioni serverless (su Vercel /var/task
    // contiene solo ciò che è importato staticamente, non ciò che si legge con fs).
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' });
    return config;
  },
};

export default nextConfig;
