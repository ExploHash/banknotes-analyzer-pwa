import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useState } from "react";
import { bankNoteColumns, Config } from "../../utils/generate-report";

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportConfig: Config;
  onAddRule: (category: string, column: string, value: string) => void;
}

export default function AddRuleModal({
  isOpen,
  onClose,
  reportConfig,
  onAddRule,
}: AddRuleModalProps) {
  const [category, setCategory] = useState("");
  const [column, setColumn] = useState("");
  const [value, setValue] = useState("");

  const handleAddRule = () => {
    onAddRule(category, column, value);
    // Reset form state
    setCategory("");
    setColumn("");
    setValue("");
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
              <h3 className="text-2xl font-bold">Create New Rule</h3>
              <p className="text-indigo-100 text-sm font-normal">Define a rule to automatically categorize transactions</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  label="Category"
                  placeholder="Select a category"
                  onChange={(e) => setCategory(e.target.value)}
                  classNames={{
                    trigger: "border-2 border-gray-300 hover:border-indigo-500 transition-colors",
                    label: "font-semibold text-gray-700"
                  }}
                >
                  {Object.keys(reportConfig).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Column"
                  placeholder="Select a column to match"
                  onChange={(e) => setColumn(e.target.value)}
                  classNames={{
                    trigger: "border-2 border-gray-300 hover:border-indigo-500 transition-colors",
                    label: "font-semibold text-gray-700"
                  }}
                >
                  {bankNoteColumns.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Match Value"
                  placeholder="Enter regex or text to match"
                  type="text"
                  onChange={(e) => setValue(e.target.value)}
                  classNames={{
                    input: "border-2 border-gray-300 hover:border-indigo-500 transition-colors",
                    label: "font-semibold text-gray-700"
                  }}
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
                onPress={handleAddRule}
              >
                ✨ Add Rule
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}