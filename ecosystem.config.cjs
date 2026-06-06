module.exports = {
  apps: [
    {
      name: 'amt',
      script: 'dist/server.cjs',
      cwd: '/var/www/amt',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
