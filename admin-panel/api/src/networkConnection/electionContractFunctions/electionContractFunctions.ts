import { getElectionContractAndGateway } from "../networkConnection";

export async function initializeElection(electionId: string) {
  const electionContract = await getElectionContractAndGateway();
  try {
    const response = await electionContract.submitTransaction(
      "Initialize",
      electionId
    );
    const message = response.toString("utf-8");
    return message;
  } catch (error) {
    console.error(`Error in setup: ${error}`);
  }
}

export async function startElection(electionId: string) {
  const electionContract = await getElectionContractAndGateway();
  try {
    const response = await electionContract.submitTransaction(
      "StartElection",
      electionId
    );
    const message = response.toString("utf-8");
    return message;
  } catch (error) {
    console.error(`Error in setup: ${error}`);
  }
}

export async function finishElection(electionId: string) {
  const electionContract = await getElectionContractAndGateway();
  try {
    const response = await electionContract.submitTransaction(
      "FinishElection",
      electionId
    );
    const message = response.toString("utf-8");
    return message;
  } catch (error) {
    console.error(`Error in setup: ${error}`);
  }
}
