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
      legend: {
        display: false,
      },
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
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Income Total</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                €{incomeTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-500 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 uppercase tracking-wide">Outgoing Total</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                €{outgoingTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-500 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Savings Total</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                €{savingsTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-500 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Rest Total</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                €{restTotal.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-500 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Income/Outgoing Chart */}
      {Object.keys(monthIncomeOutgoingData).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Cumulative Flow</h3>
          <Line data={monthIncomeOutgoingData} />
        </div>
      )}

      {/* Expense Breakdown Pie Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
        {Object.keys(pieData).length > 0 && (
          <div className="max-w-md mx-auto">
            <Pie
              data={pieData}
              plugins={[ChartDataLabels] as any}
              options={pieOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}
