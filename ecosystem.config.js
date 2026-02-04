module.exports = {
  apps: [{
    name: 'sinch12',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ca-sinch',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '/var/www/ca-sinch/.env',
    env_file_encoding: 'utf8'
  }]
};
