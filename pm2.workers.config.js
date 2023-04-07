module.exports = {
  apps: [
    {
      name: 'skinswipe-bots-workers',
      script: './workers/bots_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-market-workers',
      script: './workers/market_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-trades-workers',
      script: './workers/trades_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-update-prices-workers',
      script: './workers/update_prices_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-users-inventories-workers',
      script: './workers/users_inventories_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-users-inventories-common-workers',
      script: './workers/users_inventories_common_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-users-workers',
      script: './workers/users_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-csgotm-market-workers',
      script: './workers/csgotm_market_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
  ],
};
