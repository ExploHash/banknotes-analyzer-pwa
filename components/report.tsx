import { Card } from "@nextui-org/react";
import Papa from "papaparse";
import { bankNoteColumns, Record, Report } from "../utils/generate-report";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

export type MonthSelectorProps = {
  monthReportMapping: Object;
  onMonthSelected: (month: string) => void;
};

const MonthSelector: React.FC<MonthSelectorProps> = ({
  monthReportMapping,
  onMonthSelected,
}) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [months, setMonths]: [string[], any] = useState([]);
  const [barData, setBarData] = useState({});

  const calculateBarData = (months: string[]) => {
    // Bar chart with 2 datasets of income and expenses
    const incomeData = [];
    const expenseData = [];

    for (const month of months) {
      const report = monthReportMapping[month];
      console.log(report);
      const incomeTotal = report?.incomeCategories?.reduce((total, category) => {
        return category.name !== "Spaarrekening"
          ? total + category.amount
          : total;
      }, 0) ?? 0;
      incomeData.push(incomeTotal + (report?.unmatchedIncomeTotal ?? 0));

      let outgoingTotal = report?.expenseCategories?.reduce((total, category) => {
        return category.name !== "Spaarrekening"
          ? total + category.amount
          : total;
      }, 0) ?? 0;
      expenseData.push(outgoingTotal + (report?.unmatchedExpenseTotal ?? 0));
    }

    console.log(incomeData, expenseData);
    console.log(months);

    setBarData({
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: expenseData,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    });
  };

  useEffect(() => {
    const months = Array.from(Object.keys(monthReportMapping));
    setMonths(months);
    calculateBarData(months);
  }, [monthReportMapping]);

  return (
    <Card className="p-4">
      {months.length > 0 && <Bar data={barData} />}
      <div className="p-4">
        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            onMonthSelected(e.target.value);
          }}
          className="rounded-lg border p-2"
        >
          <option value="">Select Month</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
};

export default MonthSelector;
