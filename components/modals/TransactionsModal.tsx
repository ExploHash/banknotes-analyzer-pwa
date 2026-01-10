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
    <Modal
      size="5xl"
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
              <h3 className="text-2xl font-bold">Transaction Details</h3>
              <p className="text-indigo-100 text-sm font-normal">View and categorize transactions</p>
            </ModalHeader>
            <ModalBody>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table
                  classNames={{
                    wrapper: "shadow-none max-h-[500px]",
                    th: "bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider",
                    td: "text-gray-900 text-sm",
                    tr: "hover:bg-indigo-50 transition-colors"
                  }}
                >
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
                              size="sm"
                              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                              onPress={() => handleRemoveException(record)}
                            >
                              🗑️ Remove
                            </Button>
                          )}
                          {!record.isException && (
                            <Popover placement="bottom">
                              <PopoverTrigger>
                                <Button
                                  size="sm"
                                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                  ✏️ Categorize
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-2">
                                <Select
                                  className="w-48"
                                  label="Select category"
                                  size="sm"
                                >
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
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 shadow-md hover:shadow-lg transition-all"
                onPress={onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
