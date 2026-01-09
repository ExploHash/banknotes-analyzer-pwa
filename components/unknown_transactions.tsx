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
    <>
      <h4>Unknown Income</h4>
      <Table>
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
                    <Button>Add Exception</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Select className="w-40">
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

      <h4>Unknown Expense</h4>
      <Table>
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
                    <Button>Add Exception</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Select className="w-40">
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
    </>
  );
}