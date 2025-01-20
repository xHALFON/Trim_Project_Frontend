module.exports = {
    apps: [{
      name: 'Trim_frontend',
      script: './start-react.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        PORT: 80
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 443
      }
    }]
  }