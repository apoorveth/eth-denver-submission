module.exports = {
    apps: [
      {
        name: 'gasless-backend',
        script: './bin/www',
        instances: 2,
        exec_mode: 'cluster',
        watch: false, // Don't restart when files in the directory change
        wait_ready: true,
        listen_timeout: 7000,
        kill_timeout: 3000,
        env: {
          NODE_ENV: 'staging',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  