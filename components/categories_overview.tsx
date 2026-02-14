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
import DailyExpenseModal from "./modals/DailyExpenseModal";

interface CategoriesOverviewProps {
  report: Report;
  reportConfig: Config;
  exceptionsMap: ExceptionsMap;
  csvData: Record[];
  onAddException: (record: Record, category: string) => void;
  onRemoveException: (record: Record) => void;
  selectedMonth: string;
}

export default function CategoriesOverview({
  report,
  reportConfig,
  exceptionsMap,
  csvData,
  onAddException,
  onRemoveException,
  selectedMonth,
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

  const {
    isOpen: dailyExpenseModalIsOpen,
    onOpen: dailyExpenseModalOnOpen,
    onClose: dailyExpenseModalOnClose,
  } = useDisclosure();

  const [transactionsModalData, setTransactionsModalData] = useState<Record[]>([]);
  const [lineChartCategory, setLineChartCategory] = useState("");
  const [lineChartIncomeIsPositive, setLineChartIncomeIsPositive] = useState(true);
  const [budgetTargets, setBudgetTargets] = useState<{[key: string]: number}>({});
  const [budgetModalCategory, setBudgetModalCategory] = useState("");
  const [dailyExpenseModalData, setDailyExpenseModalData] = useState<Record[]>([]);
  const [dailyExpenseModalCategory, setDailyExpenseModalCategory] = useState("");

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

  const handleViewDailyChart = (categoryName: string, matchedRecords: Record[]) => {
    setDailyExpenseModalCategory(categoryName);
    setDailyExpenseModalData(matchedRecords);
    dailyExpenseModalOnOpen();
  };

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

  const renderVariance = (actual: number, budget?: number) => {
    if (!budget) return <span className="text-gray-400">-</span>;

    const variance = budget - actual;
    const percentage = ((variance / budget) * 100).toFixed(1);

    if (variance > 0) {
      return (
        <span className="text-green-600 font-semibold">
          +€{variance.toFixed(2)} ({percentage}%)
        </span>
      );
    } else if (variance < 0) {
      return (
        <span className="text-red-600 font-semibold">
          -€{Math.abs(variance).toFixed(2)} ({Math.abs(parseFloat(percentage))}%)
        </span>
      );
    } else {
      return <span className="text-gray-600 font-semibold">€0.00 (0%)</span>;
    }
  };

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
    <div className="space-y-6">
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
        budgetTargets={budgetTargets}
      />
      <DailyExpenseModal
        isOpen={dailyExpenseModalIsOpen}
        onClose={dailyExpenseModalOnClose}
        categoryRecords={dailyExpenseModalData}
        selectedMonth={selectedMonth}
        categoryName={dailyExpenseModalCategory}
      />

      {/* Income Categories Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Income Categories</h3>
        </div>
        <div className="p-6">
          <Table
            aria-label="Income categories table"
            classNames={{
              wrapper: "shadow-none",
              th: "bg-gray-50 text-gray-700 font-semibold text-sm uppercase tracking-wider",
              td: "text-gray-900 text-base",
              tr: "hover:bg-gray-50 transition-colors"
            }}
          >
        <TableHeader>
          <TableColumn>Category</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {report?.incomeCategories?.map((category) => (
            <TableRow key={category.name}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="font-semibold text-green-600 text-lg">€{category.amount.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    onPress={() => handleViewTransactions(category.matchedRecords)}
                  >
                    📋 Transactions
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    onPress={() => handleViewLineChart(category.name, true)}
                  >
                    📈 Trend
                  </Button>
                </div>

              </TableCell>
            </TableRow>
          ))}
          <TableRow key="unknown">
            <TableCell className="font-medium">Unknown</TableCell>
            <TableCell className="font-semibold text-green-600 text-lg">
              €{report?.unmatchedIncomeTotal?.toFixed(2)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
          </Table>
        </div>
      </div>

      {/* Expense Categories Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Expense Categories</h3>
        </div>
        <div className="p-6">
          <Table
            aria-label="Expense categories table"
            classNames={{
              wrapper: "shadow-none",
              th: "bg-gray-50 text-gray-700 font-semibold text-sm uppercase tracking-wider",
              td: "text-gray-900 text-base",
              tr: "hover:bg-gray-50 transition-colors"
            }}
          >
        <TableHeader>
          <TableColumn>Category</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Budget</TableColumn>
          <TableColumn>Variance</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {report?.expenseCategories?.map((category) => (
            <TableRow key={category.name}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="font-semibold text-red-600 text-lg">€{category.amount.toFixed(2)}</TableCell>
              <TableCell className="font-medium text-gray-700">{budgetTargets[category.name] ? `€${budgetTargets[category.name]}` : "-"}</TableCell>
              <TableCell>{renderVariance(category.amount, budgetTargets[category.name])}</TableCell>
              <TableCell>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    onPress={() => handleViewTransactions(category.matchedRecords)}
                  >
                    📋 Transactions
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    onPress={() => handleViewLineChart(category.name, false)}
                  >
                    📈 Trend
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    onPress={() => handleViewSetBudget(category.name)}
                  >
                    🎯 Set Budget
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    onPress={() => handleViewDailyChart(category.name, category.matchedRecords)}
                  >
                    📊 Daily Chart
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          <TableRow key="unknown">
            <TableCell className="font-medium">Unknown</TableCell>
            <TableCell className="font-semibold text-red-600 text-lg">
              €{report?.unmatchedExpenseTotal?.toFixed(2)}
            </TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
