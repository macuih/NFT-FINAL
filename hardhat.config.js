require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://ec2-3-21-204-133.us-east-2.compute.amazonaws.com:8545", // your EC2 public DNS
      chainId: 31337,
    },
  },
  paths: {
    artifacts: "./artifacts",            // default
    sources: "./contracts",              // default
    tests: "./test",                     // default
    cache: "./cache",                    // default
  },
};
