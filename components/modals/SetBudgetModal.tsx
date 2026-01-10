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
    <Modal
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        backdrop: "bg-gray-900/50 backdrop-blur-sm",
        base: "bg-white rounded-2xl shadow-2xl",
        header: "border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-indigo-600",
        body: "p-6",
        footer: "border-t border-gray-200 bg-gray-50"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-white">
              <h3 className="text-2xl font-bold">Set Budget Target</h3>
              <p className="text-indigo-100 text-sm font-normal">Set a monthly budget for "{category}"</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Budget Amount (€)"
                  placeholder="Enter amount in euros"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  classNames={{
                    input: "border-2 border-gray-300 hover:border-indigo-500 transition-colors",
                    label: "font-semibold text-gray-700"
                  }}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-gray-500 text-sm">€</span>
                    </div>
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 shadow-md hover:shadow-lg transition-all"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium px-6 shadow-md hover:shadow-lg transition-all"
                onPress={handleAddBudget}
              >
                🎯 Save Budget
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
