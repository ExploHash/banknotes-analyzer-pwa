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
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add a new rule
            </ModalHeader>
            <ModalBody>
              <Select
                label="Category"
                className="mb-4"
                onChange={(e) => setCategory(e.target.value)}
              >
                {Object.keys(reportConfig).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Column"
                className="mb-4"
                onChange={(e) => setColumn(e.target.value)}
              >
                {bankNoteColumns.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Regex or contain value to match on"
                className="mb-4"
                type="text"
                onChange={(e) => setValue(e.target.value)}
              />
              <Button onPress={handleAddRule}>
                Add Rule
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