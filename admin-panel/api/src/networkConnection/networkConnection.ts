import { Contract, Gateway, Wallet, Wallets } from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import path from "path";
import { buildCAClient, enrollAdmin } from "../tools/caUtil";
import { buildCCPOrg, buildWallet } from "../tools/appUtil";

const channelName = "votingchannel";
const electionCC = "electioncc";

const electionCommissionOrg = "ElectionCommissionMSP";
const adminId = "admin";

// build an in memory object with the network configuration (also known as a connection profile)
const ccpElectionCommissionOrg = buildCCPOrg();

// setup the wallet to cache the credentials of the application user, on the app server locally
const walletPathElectionCommission = path.join(
  __dirname,
  "wallet",
  "electioncommission"
);

// build an instance of the fabric ca services client based on
// the information in the network configuration
const caElectionCommissionClient = buildCAClient(
  FabricCAServices,
  ccpElectionCommissionOrg,
  "ca.electionCommission.example.com"
);

// Create a new gateway for connecting to Org's peer node.
export const gatewayElectionCommission = new Gateway();

export async function initiallyEnrollAdminAndConnectGateway() {
  console.log(
    "\n--> Fabric client user & Gateway init: Using ElectionCommissionOrg identity to ElectionCommissionOrg Peer"
  );

  const walletElectionCommission = await buildWallet(
    Wallets,
    walletPathElectionCommission
  );

  // in a real application this would be done on an administrative flow, and only once
  // stores admin identity in local wallet, if needed
  await enrollAdmin(
    caElectionCommissionClient,
    walletElectionCommission,
    electionCommissionOrg
  );

  try {
    //connect using Discovery enabled
    await gatewayElectionCommission.connect(ccpElectionCommissionOrg, {
      wallet: walletElectionCommission,
      identity: adminId,
      discovery: { enabled: true, asLocalhost: true },
    });
  } catch (error) {
    console.error(
      `Error in connecting to gateway for ElectionCommissionOrg: ${error}`
    );
    process.exit(1);
  }
}

export async function getElectionContractAndGateway() {
  try {
    /** ******* Fabric client init: Using ElectionCommission identity to ElectionCommission Peer ******* */
    const networkElectionCommission =
      await gatewayElectionCommission.getNetwork(channelName);
    const contractElectionCC =
      networkElectionCommission.getContract(electionCC);

    return contractElectionCC;
  } catch (error) {
    console.error(`Error in setup: ${error}`);
    process.exit(1);
  }
}
