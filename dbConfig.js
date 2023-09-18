const config = {
    server: '192.168.20.15',
    authentication: {
        type: 'default',
        options: {
            userName: 'qrcode',
            password: 'EmpaqQR2023'
        }
    },
    options: {
        port: 1433,
        database: 'trackingDemo',
        trustServerCertificate: true
    }
};

module.exports = config;
