module.exports = {
    networks: {
        hospital: {
            host: "hospital-blockchain",     // Docker container name (for internal network)
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
