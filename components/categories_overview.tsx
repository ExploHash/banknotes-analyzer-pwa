import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Config, ExceptionsMap, Record, Report } from "../utils/generate-report";
import TransactionsModal from "./modals/TransactionsModal";
import LineChartModal from "./modals/LineChartModal";
import SetBudget from "./modals/SetBudgetModal";
import SetBudgetModal from "./modals/SetBudgetModal";

interface CategoriesOverviewProps {
  report: Report;
  reportConfig: Config;
  exceptionsMap: ExceptionsMap;
  csvData: Record[];
  onAddException: (record: Record, category: string) => void;
  onRemoveException: (record: Record) => void;
}

export default function CategoriesOverview({
  report,
  reportConfig,
  exceptionsMap,
  csvData,
  onAddException,
  onRemoveException,
}: CategoriesOverviewProps) {
  const {
    isOpen: budgetModalIsOpen,
    onOpen: budgetModalOnOpen,
    onClose: budgetModalOnClose,
  } = useDisclosure();

  const {
    isOpen: transactionsModalIsOpen,
    onOpen: transactionsModalOnOpen,
    onClose: transactionsModalOnClose,
  } = useDisclosure();

  const {
    isOpen: lineChartModalIsOpen,
    onOpen: lineChartModalOnOpen,
    onClose: lineChartModalOnClose,
  } = useDisclosure();

  const [transactionsModalData, setTransactionsModalData] = useState<Record[]>([]);
  const [lineChartCategory, setLineChartCategory] = useState("");
  const [lineChartIncomeIsPositive, setLineChartIncomeIsPositive] = useState(true);
  const [budgetTargets, setBudgetTargets] = useState<{[key: string]: number}>({});
  const [budgetModalCategory, setBudgetModalCategory] = useState("");

  const handleViewTransactions = (matchedRecords: any[]) => {
    setTransactionsModalData(matchedRecords);
    transactionsModalOnOpen();
  };

  const handleViewLineChart = (categoryName: string, isIncome: boolean) => {
    setLineChartCategory(categoryName);
    setLineChartIncomeIsPositive(isIncome);
    lineChartModalOnOpen();
  };

  const handleViewSetBudget = (category: string) => {
    setBudgetModalCategory(category);
    budgetModalOnOpen();
  }

  const loadBudgetTargets = () => {
    const budgetTargetText = localStorage.getItem("budgetTargets") ?? "{}";
    setBudgetTargets(JSON.parse(budgetTargetText));
  }

  const saveBudgetTargets = () => {
    localStorage.setItem("budgetTargets", JSON.stringify(budgetTargets));
  }

  const setBudgetForCategory = (category: string, budget: number) => {
    setBudgetTargets({
      ...budgetTargets,
      [category]: budget,
    });
  }

  const renderVariance = (amount, budget) => {
    const variance = Math.round(budget - amount);
    const color = variance > 0 ? "green" : "red"
    return budget ? <span style={{color}}>€{variance}</span> : "-"
  }


  useEffect(() => {
    loadBudgetTargets();
  }, [])

  useEffect(() => {
    if (Object.keys(budgetTargets ?? {}).length > 0) {
      console.log("saving", budgetTargets)
      saveBudgetTargets();
    }
  }, [budgetTargets])

  return (
    <>
      <SetBudgetModal
        category={budgetModalCategory}
        isOpen={budgetModalIsOpen}
        onClose={budgetModalOnClose}
        onBudgetSet={setBudgetForCategory}
      />
      <TransactionsModal
        isOpen={transactionsModalIsOpen}
        onClose={transactionsModalOnClose}
        transactionsData={transactionsModalData}
        reportConfig={reportConfig}
        onAddException={onAddException}
        onRemoveException={onRemoveException}
      />
      <LineChartModal
        isOpen={lineChartModalIsOpen}
        onClose={lineChartModalOnClose}
        category={lineChartCategory}
        incomeIsPositive={lineChartIncomeIsPositive}
        csvData={csvData}
        reportConfig={reportConfig}
        exceptionsMap={exceptionsMap}
      />

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
                  onPress={() => handleViewTransactions(category.matchedRecords)}
                >
                  View Transactions
                </Button>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => handleViewLineChart(category.name, true)}
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
              <TableCell>{budgetTargets[category.name] ? "€" + budgetTargets[category.name] : "-"}</TableCell>
              <TableCell>{renderVariance(category.amount, budgetTargets[category.name])}</TableCell>
              <TableCell>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => handleViewTransactions(category.matchedRecords)}
                >
                  View Transactions
                </Button>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => handleViewLineChart(category.name, false)}
                >
                  View Line Chart
                </Button>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => handleViewSetBudget(category.name)}
                >
                  Set Budget Target
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
