import { GrView } from "react-icons/gr";
import Container from "../components/ui/Container";
import Text from "../components/ui/Text";
import { VscDebugStart } from "react-icons/vsc";
import { FaStopCircle } from "react-icons/fa";
import { useElectionStore } from "../store/electionStore";
import { useEffect, useState } from "react";
import AddElectionModal from "../components/modals/election/AddElectionModal";
import ToastModal from "../components/ToastModal";

export type TFormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
};

const ElectionList: React.FC = () => {
  const {
    electionList,
    setElectionList,
    addElection,
    startElection,
    finishElection,
  } = useElectionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<{
    type: string;
    toastMessage: string;
  }>();

  // Form fields for modal
  const electionFields: TFormField[] = [
    {
      name: "electionName",
      label: "Election Name",
      type: "text",
      required: true,
    },
  ];

  const handleAddElection = async (data: Record<string, string>) => {
    const electionName = data.electionName?.trim();
    if (!electionName) return;

    const toast = await addElection(electionName);
    setToastMessage(toast);
  };

  useEffect(() => {
    setElectionList();
  }, [setElectionList]);

  return (
    <Container>
      <Text size={3} className="font-semibold">
        Election List
      </Text>

      <button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
        Add Election
      </button>
      {/* All the Elections */}

      {/* Election Table */}
      <div className="flex flex-col gap-2">
        <ul className="grid grid-cols-4">
          <li>
            <Text size={5}>Sl no.</Text>
          </li>
          <li>
            <Text size={5}>Election Id</Text>
          </li>
          <li>
            <Text size={5}>Election Name</Text>
          </li>
          <li>
            <Text size={5}>Actions</Text>
          </li>
        </ul>

        {electionList.map((election, index) => {
          return (
            <ul key={index} className="grid grid-cols-4 items-center">
              <li>{index + 1}</li>
              <li>{election.electionId}</li>
              <li>{election.status}</li>
              <li className="flex flex-row items-center gap-3">
                <button
                  onClick={() => {}}
                  className="cursor-pointer p-2 bg-indigo-500 text-white rounded-md"
                >
                  <GrView size={18} />
                </button>
                <button
                  onClick={async () => {
                    const toast = await startElection(election.electionId);
                    setToastMessage(toast);
                  }}
                  className="cursor-pointer p-2 bg-teal-500 text-white rounded-md"
                >
                  <VscDebugStart size={18} />
                </button>
                <button
                  onClick={async () => {
                    const toast = await finishElection(election.electionId);
                    setToastMessage(toast);
                  }}
                  className="cursor-pointer p-2 bg-rose-500 text-white rounded-md"
                >
                  <FaStopCircle size={18} />
                </button>
              </li>
            </ul>
          );
        })}
      </div>
      {/* Vew Election */}
      {/* Add Candidate */}

      {/* Toast Modal */}
      <ToastModal
        type={toastMessage?.type}
        toastMessage={toastMessage?.toastMessage}
        setToastMessage={setToastMessage}
      />

      <AddElectionModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title="Add Election"
        fields={electionFields}
        onSuccess={handleAddElection}
      />
    </Container>
  );
};

export default ElectionList;
