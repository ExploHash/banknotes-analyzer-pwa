import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Report } from "../utils/generate-report";

interface CategoriesOverviewProps {
  report: Report;
  onViewTransactions: (matchedRecords: any[]) => void;
  onViewLineChart: (categoryName: string, isIncome: boolean) => void;
}

export default function CategoriesOverview({
  report,
  onViewTransactions,
  onViewLineChart,
}: CategoriesOverviewProps) {
  return (
    <>
      <h4>Income categories</h4>
      <Table>
        <TableHeader>
          <TableColumn>Category</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn></TableColumn>
        </TableHeader>
        <TableBody>
          {report?.incomeCategories?.map((category) => (
            <TableRow key={category.name}>
              <TableCell>{category.name}</TableCell>
              <TableCell>€{category.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => onViewTransactions(category.matchedRecords)}
                >
                  View Transactions
                </Button>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => onViewLineChart(category.name, true)}
                >
                  View Line Chart
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow key="unknown">
            <TableCell>Unknown</TableCell>
            <TableCell>
              €{report?.unmatchedIncomeTotal?.toFixed(2)}
            </TableCell>
            <TableCell>
              <p />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <h4>Expense categories</h4>
      <Table>
        <TableHeader>
          <TableColumn>Category</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Budget</TableColumn>
          <TableColumn>Variance</TableColumn>
          <TableColumn></TableColumn>
        </TableHeader>
        <TableBody>
          {report?.expenseCategories?.map((category) => (
            <TableRow key={category.name}>
              <TableCell>{category.name}</TableCell>
              <TableCell>€{category.amount.toFixed(2)}</TableCell>
              <TableCell>Yourmum</TableCell>
              <TableCell>Yourmum</TableCell>
              <TableCell>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => onViewTransactions(category.matchedRecords)}
                >
                  View Transactions
                </Button>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => onViewLineChart(category.name, false)}
                >
                  View Line Chart
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow key="unknown">
            <TableCell>Unknown</TableCell>
            <TableCell>
              €{report?.unmatchedExpenseTotal?.toFixed(2)}
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>
              <p />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}