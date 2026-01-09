import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import dayjs from "dayjs";
import {
  Config,
  ExceptionsMap,
  generateReport,
  Record,
} from "../utils/generate-report";

interface MonthOverviewProps {
  currentMonthTransactions: Record[];
  selectedMonth: string;
  reportConfig: Config;
  exceptionsMap: ExceptionsMap;
}

export default function MonthOverview({
  currentMonthTransactions,
  selectedMonth,
  reportConfig,
  exceptionsMap,
}: MonthOverviewProps) {
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [pieData, setPieData] = useState({} as any);
  const [monthIncomeOutgoingData, setMonthIncomeOutgoingData] = useState(
    {} as any,
  );

  const pieOptions = {
    plugins: {
      datalabels: {
        display: true,
        color: "white",
        formatter: (val: any, ctx: any) =>
          ctx.chart.data.labels[ctx.dataIndex],
        font: {
          weight: "bold" as const,
        },
        backgroundColor: null,
        borderColor: null,
        borderWidth: 0,
      },
    },
  };

  const calculateIncomeOutgoingData = (month: string) => {
    const days = [];
    const incomeData = [];
    const outgoingData = [];
    let summedIncome = 0;
    let summedOutgoing = 0;
    const monthData = currentMonthTransactions;
    const daysInMonth = dayjs(`01-${month}`, "DD-MM-YYYY").daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = monthData.filter((row) => {
        const rowDay = dayjs(row.date, "DD-MM-YYYY").date();
        return rowDay === day;
      });

      const income = dayData
        .filter((row) => row.type === "Credit")
        .reduce((acc, row) => acc + row.amount, 0);

      const outgoing = dayData
        .filter((row) => row.type !== "Credit")
        .reduce((acc, row) => acc + row.amount, 0);

      days.push(day);

      summedIncome += income;
      summedOutgoing += outgoing;
      incomeData.push(summedIncome);
      outgoingData.push(summedOutgoing);
    }

    return {
      labels: days,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Outgoing",
          data: outgoingData,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const generatePieData = (report: any) => {
    const expenseCategories = report.expenseCategories.filter(
      (category: any) => category.name !== "Spaarrekening",
    );

    return {
      labels: [
        ...expenseCategories.map((category: any) => category.name),
        "Unknown",
      ],
      datasets: [
        {
          data: [
            ...expenseCategories.map((category: any) => category.amount),
            report.unmatchedExpenseTotal,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ],
        },
      ],
    };
  };

  useEffect(() => {
    if (!selectedMonth || !currentMonthTransactions.length) return;

    const report = generateReport(currentMonthTransactions, reportConfig, exceptionsMap);

    // Calculate income total
    const calculatedIncomeTotal = report.incomeCategories.reduce(
      (total, category) => {
        return category.name !== "Spaarrekening"
          ? total + category.amount
          : total;
      },
      0,
    );
    setIncomeTotal(calculatedIncomeTotal + report.unmatchedIncomeTotal);

    // Calculate outgoing total
    const calculatedOutgoingTotal = report.expenseCategories.reduce(
      (total, category) => {
        return category.name !== "Spaarrekening"
          ? total + category.amount
          : total;
      },
      0,
    );
    setOutgoingTotal(calculatedOutgoingTotal + report.unmatchedExpenseTotal);

    // Calculate savings total
    const savingsRemoved = report.incomeCategories.find(
      (category) => category.name === "Spaarrekening",
    );
    const savingsAdded = report.expenseCategories.find(
      (category) => category.name === "Spaarrekening",
    );
    const calculatedSavingsTotal =
      (savingsAdded?.amount || 0) - (savingsRemoved?.amount || 0);
    setSavingsTotal(calculatedSavingsTotal);

    // Calculate rest total
    const calculatedRestTotal =
      calculatedIncomeTotal - calculatedOutgoingTotal - calculatedSavingsTotal;
    setRestTotal(calculatedRestTotal);

    // Generate pie data
    const pieData = generatePieData(report);
    setPieData(pieData);

    // Calculate income and outgoing line
    const monthIncomeOutgoingData = calculateIncomeOutgoingData(selectedMonth);
    setMonthIncomeOutgoingData(monthIncomeOutgoingData);
  }, [currentMonthTransactions, selectedMonth, reportConfig, exceptionsMap]);

  return (
    <div>
      <div className="flex rounded-md bg-gray-100 p-4 shadow-md">
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Income Total</h2>
            <p className="text-2xl font-bold text-green-600">
              €{incomeTotal.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex-1">
          <div>
            <h2 className="text-xl font-semibold">Outgoing Total</h2>
            <p className="text-2xl font-bold text-red-600">
              €{outgoingTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex rounded-md bg-gray-100 p-4 shadow-md">
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Savings total</h2>
            <p className="text-2xl font-bold text-green-600">
              €{savingsTotal.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex-1">
          <div>
            <h2 className="text-xl font-semibold">Rest total</h2>
            <p className="text-2xl font-bold text-green-600">
              €{restTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      {Object.keys(monthIncomeOutgoingData).length > 0 && (
        <div className="flex rounded-md bg-gray-100 p-4 shadow-md">
          <Line data={monthIncomeOutgoingData} />
        </div>
      )}
      <div className="flex rounded-md bg-gray-100 p-4 shadow-md">
        {Object.keys(pieData).length > 0 && (
          <Pie
            data={pieData}
            plugins={[ChartDataLabels] as any}
            options={pieOptions}
          />
        )}
      </div>
    </div>
  );
}