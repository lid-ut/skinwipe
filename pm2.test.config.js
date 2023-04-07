module.exports = {
  apps: [
    {
      name: 'skinswipe-test',
      script: './index.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-bots-workers',
      script: './workers/bots_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-market-workers',
      script: './workers/market_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-trades-workers',
      script: './workers/trades_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-update-prices-workers',
      script: './workers/update_prices_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-users-inventories-workers',
      script: './workers/users_inventories_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-users-inventories-common-workers',
      script: './workers/users_inventories_common_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-users-workers',
      script: './workers/users_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
    {
      name: 'skinswipe-test-csgotm-market-workers',
      script: './workers/csgotm_market_workers.js',
      node_args: '--harmony --max-old-space-size=8384',
    },
  ],
};
