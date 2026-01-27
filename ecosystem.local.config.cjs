module.exports = {
  apps: [
    {
      name: 'iodd-s54182',
      script: './server.mjs',
      cwd: '/Users/Shared/repos/IODD_prod-master/server3/s32_iodd-data-api',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 15,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/Users/Shared/repos/IODD_prod-master/logs/iodd-s54182_error.log',
      out_file: '/Users/Shared/repos/IODD_prod-master/logs/iodd-s54182_out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    },
    
    {
      name: 'iodd-c54132',
      script: 'npx',
      args: 'http-server -c-1 -p 54132 --cors',
      cwd: '/Users/Shared/repos/IODD_prod-master/client3/c32_iodd-app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      wait_ready: true,
      listen_timeout: 10000,
      min_uptime: '10s',
      max_restarts: 15,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/Users/Shared/repos/IODD_prod-master/logs/iodd-c54132_error.log',
      out_file: '/Users/Shared/repos/IODD_prod-master/logs/iodd-c54132_out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
  ]
};
