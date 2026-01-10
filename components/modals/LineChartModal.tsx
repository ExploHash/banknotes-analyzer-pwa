import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Config, ExceptionsMap, generateReport, Record } from "../../utils/generate-report";

interface LineChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  incomeIsPositive: boolean;
  csvData: Record[];
  reportConfig: Config;
  exceptionsMap: ExceptionsMap;
  budgetTargets: {[key: string]: number};
}

export default function LineChartModal({
  isOpen,
  onClose,
  category,
  incomeIsPositive,
  csvData,
  reportConfig,
  exceptionsMap,
  budgetTargets,
}: LineChartModalProps) {
  const [data, setData] = useState<any>({});
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isOpen || !category) return;

    const lineData = [];
    const months = Array.from(
      new Set(csvData.map((row) => row.date.split("-").slice(1, 3).join("-"))),
    );

    // Remove last month
    months.pop();

    let allTotal = 0;
    let count = 0;

    for (const month of months) {
      const filteredData = csvData.filter((row) => {
        const rowMonth: string = row.date.split("-").slice(1, 3).join("-");
        return rowMonth === month;
      });

      const report = generateReport(filteredData, reportConfig, exceptionsMap);
      const expenseTotal =
        report.expenseCategories.find((c) => c.name === category)?.amount || 0;
      const incomeTotal =
        report.incomeCategories.find((c) => c.name === category)?.amount || 0;

      const total = incomeIsPositive
        ? incomeTotal - expenseTotal
        : expenseTotal - incomeTotal;

      lineData.push(total);
      allTotal += total;
      count++;
    }

    const calculatedAverage = allTotal / count;
    setAverage(calculatedAverage);
    setTotal(allTotal);

    const datasets: any[] = [
      {
        label: category,
        data: lineData,
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ];

    // Add budget line if budget exists for this category
    const budget = budgetTargets[category];
    if (budget && !incomeIsPositive) {
      datasets.push({
        label: "Budget Target",
        data: Array(months.length).fill(budget),
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
      });
    }

    setData({
      labels: months,
      datasets: datasets,
    });
  }, [isOpen, category, incomeIsPositive, csvData, reportConfig, exceptionsMap, budgetTargets]);

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
              <h3 className="text-2xl font-bold">Category Trend Analysis</h3>
              <p className="text-indigo-100 text-sm font-normal">Historical data for {category}</p>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Average per Month</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">€{average.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">€{total.toFixed(2)}</p>
                </div>
              </div>
              {data.datasets && data.datasets.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <Line data={data} />
                </div>
              )}
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