const fs = require("fs");
const path = require("path");
const spawnSync = require("child_process").spawnSync;

const MAX_DEPTH = 4;

const args = [
    "node_modules/solidity-docgen/dist/cli.js",
    "--input=node_modules/@bancor/contracts-solidity/solidity/contracts",
    "--output=ethereum-contracts/ethereum-api-reference",
    "--templates=config/ethereum-smart-contracts",
    "--solc-module=solc",
    "--solc-settings=" + JSON.stringify({ optimizer: { enabled: true, runs: 200 }})
];

const result = spawnSync("node", args, { stdio: ["inherit", "inherit", "pipe"], encoding: "utf8" });
if (result.stderr.length > 0) {
    throw new Error(result.stderr);
}

function fix(pathName) {
    if (fs.lstatSync(pathName).isDirectory()) {
        for (const fileName of fs.readdirSync(pathName))
            fix(path.join(pathName, fileName));
    }
    else if (pathName.endsWith(".md")) {
        const parts = pathName.toLowerCase().split(path.sep);
        const lines = fs.readFileSync(pathName, { encoding: "utf8" }).split("\r").join("").split("\n");
        fs.unlinkSync(pathName)
        fs.writeFileSync(
            [...parts.slice(0, Math.min(parts.length - 1, MAX_DEPTH)), parts.slice(-1)[0]].join(path.sep),
            lines.filter(line => line.trim().length > 0).join("\n\n") + "\n"
        );
    }
}

function clear(pathName) {
    if (fs.lstatSync(pathName).isDirectory()) {
        const fileNames = fs.readdirSync(pathName);
        if (fileNames.length == 0)
            fs.rmdirSync(pathName);
        else for (const fileName of fileNames)
            clear(path.join(pathName, fileName));
    }
}

fix("ethereum-contracts/ethereum-api-reference");
clear("ethereum-contracts/ethereum-api-reference");

fs.copyFileSync("node_modules/@bancor/contracts-solidity/README.md", "ethereum-contracts/ethereum-api-reference/README.md");
fs.copyFileSync("node_modules/@bancor/contracts-solidity/solidity/build/BancorNetwork.abi", "ethereum-contracts/build/BancorNetwork.abi");
fs.copyFileSync("node_modules/@bancor/contracts-solidity/solidity/build/ContractRegistry.abi", "ethereum-contracts/build/ContractRegistry.abi");
fs.copyFileSync("node_modules/@bancor/contracts-solidity/solidity/build/ConverterBase.abi", "ethereum-contracts/build/ConverterBase.abi");
fs.copyFileSync("node_modules/@bancor/contracts-solidity/solidity/build/ConverterUpgrader.abi", "ethereum-contracts/build/ConverterUpgrader.abi");
fs.copyFileSync("node_modules/@bancor/contracts-solidity/solidity/build/LiquidityPoolConverter.abi", "ethereum-contracts/build/LiquidityPoolConverter.abi");
//fs.copyFileSync("node_modules/bancor-contracts/solidity/utils/README.md", "ethereum-contracts/ethereum-api-reference/utils/README.md");
