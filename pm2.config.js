module.exports = {
  apps: [
    {
      name: 'skinswipe',
      script: './index.js',
      exec_mode: 'cluster',
      instances: 2,
      node_args: '--harmony --max-old-space-size=8384',
    },
  ],
};
