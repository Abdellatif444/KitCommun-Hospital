module.exports = {
    contracts_build_directory: "./build/contracts",
    contracts_directory: "./smart-contracts",
    migrations_directory: "./smart-contracts",
    networks: {
        hospital: {
            host: "ganache-blockchain",     // Docker container name (for internal network)
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
