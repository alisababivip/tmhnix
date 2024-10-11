// const os = require('os')
// const numCPUs = os.cpus().length

// let bicryptoInstances = 0
// let backendInstances = 0

// if (numCPUs === 1) {
//   bicryptoInstances = 1
//   backendInstances = 1
// } else if (numCPUs === 2) {
//   bicryptoInstances = 1
//   backendInstances = 1
// } else {
//   bicryptoInstances = Math.floor(numCPUs / 2)
//   backendInstances = numCPUs - bicryptoInstances
// }

module.exports = {
  apps: [
    {
      name: 'bicrypto',
      script: './.app/.output/server/index.mjs',
      // instances: bicryptoInstances,
      // exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'backend',
      script: './dist/index.js',
      // instances: backendInstances,
      // exec_mode: 'cluster',
      // watch: ['./dist'],
      // ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
}
