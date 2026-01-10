import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useState } from "react";

interface SetBudgetProps {
  category: string;
  isOpen: boolean;
  onClose: () => void;
  onBudgetSet: (category: string, budget: number) => void;
}

export default function SetBudget({
  category,
  isOpen,
  onClose,
  onBudgetSet
}: SetBudgetProps) {
  const [budget, setBudget] = useState("");

  const handleAddBudget = () => {
    onBudgetSet(category, parseInt(budget));
    setBudget("0");
    onClose();
  };

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Set a budget for "{category}"
            </ModalHeader>
            <ModalBody>
              <Input
                label="Budget in euros"
                className="mb-4"
                type="text"
                onChange={(e) => setBudget(e.target.value)}
              />
              <Button onPress={handleAddBudget}>
                Save Budget
              </Button>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
