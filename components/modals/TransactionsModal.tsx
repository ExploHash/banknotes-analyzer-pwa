import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { bankNoteColumns, Config, Record } from "../../utils/generate-report";

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionsData: Record[];
  reportConfig: Config;
  onAddException: (record: Record, category: string) => void;
  onRemoveException: (record: Record) => void;
}

export default function TransactionsModal({
  isOpen,
  onClose,
  transactionsData,
  reportConfig,
  onAddException,
  onRemoveException,
}: TransactionsModalProps) {
  const handleRemoveException = (record: Record) => {
    onClose();
    onRemoveException(record);
  };

  const handleAddException = (record: Record, category: string) => {
    onClose();
    onAddException(record, category);
  };

  return (
    <Modal size="5xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Transactions
            </ModalHeader>
            <ModalBody>
              <Table className="max-h-96 overflow-scroll">
                <TableHeader>
                  {bankNoteColumns.map((key) => (
                    <TableColumn key={key}>{key}</TableColumn>
                  ))}
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {transactionsData?.map((record) => (
                    <TableRow key={record.id}>
                      {bankNoteColumns.map((key) => (
                        // @ts-ignore
                        <TableCell key={key}>{record[key]}</TableCell>
                      ))}
                      <TableCell>
                        {record.isException && (
                          <Button
                            color="primary"
                            variant="light"
                            onPress={() => handleRemoveException(record)}
                          >
                            Remove Exception
                          </Button>
                        )}
                        {!record.isException && (
                          <Popover placement="bottom">
                            <PopoverTrigger>
                              <Button>Add Exception</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <Select className="w-40">
                                {Object.keys(reportConfig).map((key) => (
                                  <SelectItem
                                    key={key}
                                    value={key}
                                    onClick={() => handleAddException(record, key)}
                                  >
                                    {key}
                                  </SelectItem>
                                ))}
                              </Select>
                            </PopoverContent>
                          </Popover>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}