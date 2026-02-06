module.exports = {
    networks: {
        hospital: {
            host: "127.0.0.1",     // Localhost (since we will run truffle from host or expose port)
            port: 8545,            // Port Ganache défini dans docker-compose
            network_id: "*",       // Match any network id
        }
    },
    compilers: {
        solc: {
            version: "0.8.0",      // Fetch exact version from solc-bin (default: truffle's version)
        }
    }
};
