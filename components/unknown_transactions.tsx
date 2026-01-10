import {
  Button,
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
import { bankNoteColumns, Config, Record, Report } from "../utils/generate-report";

interface UnknownTransactionsProps {
  report: Report;
  reportConfig: Config;
  onAddException: (record: Record, category: string) => void;
}

export default function UnknownTransactions({
  report,
  reportConfig,
  onAddException,
}: UnknownTransactionsProps) {
  return (
    <div className="space-y-6">
      {/* Unknown Income Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Unknown Income Transactions</h3>
        </div>
        <div className="p-6 overflow-x-auto">
          <Table
            aria-label="Unknown income transactions table"
            classNames={{
              wrapper: "shadow-none",
              th: "bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider",
              td: "text-gray-900 text-sm",
              tr: "hover:bg-yellow-50 transition-colors"
            }}
          >
        <TableHeader>
          {bankNoteColumns.map((key) => (
            <TableColumn key={key}>{key}</TableColumn>
          ))}
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {report?.unmatchedIncomeRecords?.map((record) => (
            <TableRow key={record.id}>
              {bankNoteColumns.map((key) => (
                // @ts-ignore
                <TableCell key={key}>{record[key]}</TableCell>
              ))}
              <TableCell>
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
                          onClick={() => onAddException(record, key)}
                        >
                          {key}
                        </SelectItem>
                      ))}
                    </Select>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
          </Table>
        </div>
      </div>

      {/* Unknown Expense Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Unknown Expense Transactions</h3>
        </div>
        <div className="p-6 overflow-x-auto">
          <Table
            aria-label="Unknown expense transactions table"
            classNames={{
              wrapper: "shadow-none",
              th: "bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider",
              td: "text-gray-900 text-sm",
              tr: "hover:bg-orange-50 transition-colors"
            }}
          >
        <TableHeader>
          {bankNoteColumns.map((key) => (
            <TableColumn key={key}>{key}</TableColumn>
          ))}
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {report?.unmatchedExpenseRecords?.map((record) => (
            <TableRow key={record.id}>
              {bankNoteColumns.map((key) => (
                // @ts-ignore
                <TableCell key={key}>{record[key]}</TableCell>
              ))}
              <TableCell>
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
                          onClick={() => onAddException(record, key)}
                        >
                          {key}
                        </SelectItem>
                      ))}
                    </Select>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}