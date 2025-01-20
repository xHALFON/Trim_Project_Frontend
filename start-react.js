const { spawn } = require('child_process');

const reactProcess = spawn('npm.cmd', ['start'], {
    stdio: 'inherit',
    shell: true
});

reactProcess.on('error', (err) => {
    console.error('Failed to start React app:', err);
});