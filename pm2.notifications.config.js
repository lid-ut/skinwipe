module.exports = {
  apps: [
    {
      name: 'skinswipe-notifications',
      script: './notifications',
      node_args: '--harmony --max-old-space-size=4192',
    },
  ],
};
