import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import { Config, ExceptionsMap, generateReport, Record } from "../utils/generate-report";

interface MonthSelectorProps {
  csvData: Record[];
  months: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  reportConfig: Config;
  exceptionsMap: ExceptionsMap;
  IsPaydayToPayday: number;
}

export default function MonthSelector({
  csvData,
  months,
  selectedMonth,
  onMonthChange,
  reportConfig,
  exceptionsMap,
  IsPaydayToPayday,
}: MonthSelectorProps) {
  const [barData, setBarData] = useState({} as any);

  const filterTransactions = (
    data: Record[],
    selectedMonth: string,
    IsPaydayToPayday: number,
  ) => {
    let filteredData;
    if (!IsPaydayToPayday) {
      filteredData = data.filter((row) => {
        const month: string = row.date.split("-").slice(1, 3).join("-");
        return month === selectedMonth;
      });
    } else {
      const payday = 26;
      const month = selectedMonth.split("-")[0];
      const year = parseInt(selectedMonth.split("-")[1]);
      const endPayday = dayjs()
        .year(year)
        .month(+month - 1)
        .date(payday);
      const startPayday = endPayday.subtract(1, "month");

      filteredData = data.filter((row) => {
        const date = dayjs(row.date, "DD-MM-YYYY");
        return date.isSameOrAfter(startPayday) && date.isBefore(endPayday);
      });
    }

    return filteredData;
  };

  useEffect(() => {
    if (!csvData.length || !months.length) return;

    const incomeData = [];
    const expenseData = [];

    for (const month of months) {
      const filteredData = filterTransactions(csvData, month, IsPaydayToPayday);

      const report = generateReport(filteredData, reportConfig, exceptionsMap);
      const incomeTotal = report.incomeCategories.reduce((total, category) => {
        return category.name !== "Spaarrekening"
          ? total + category.amount
          : total;
      }, 0);
      incomeData.push(incomeTotal + report.unmatchedIncomeTotal);

      const outgoingTotal = report.expenseCategories.reduce((total, category) => {
        return category.name !== "Spaarrekening"
          ? total + category.amount
          : total;
      }, 0);
      expenseData.push(outgoingTotal + report.unmatchedExpenseTotal);
    }

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
  }, [csvData, months, reportConfig, exceptionsMap, IsPaydayToPayday]);

  return (
    <>
      {Object.keys(barData).length > 0 && (
        <Bar className="mt-10" data={barData} />
      )}
      <div className="p-4">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
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
    </>
  );
}