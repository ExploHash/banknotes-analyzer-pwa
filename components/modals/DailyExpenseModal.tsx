import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import { Record } from "../../utils/generate-report";

interface DailyExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryRecords: Record[];
  selectedMonth: string;
  categoryName: string;
}

export default function DailyExpenseModal({
  isOpen,
  onClose,
  categoryRecords,
  selectedMonth,
  categoryName,
}: DailyExpenseModalProps) {
  const [data, setData] = useState<any>({});
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isOpen || !selectedMonth || !categoryRecords.length || !categoryName) return;

    const days = [];
    const expenseData = [];
    let totalExpenses = 0;
    let daysWithExpenses = 0;

    const daysInMonth = dayjs(`01-${selectedMonth}`, "DD-MM-YYYY").daysInMonth();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = categoryRecords.filter((row) => {
        const rowDay = dayjs(row.date, "DD-MM-YYYY").date();
        return rowDay === day;
      });

      const dayExpenses = dayData.reduce((acc, row) => acc + row.amount, 0);

      days.push(day.toString());
      expenseData.push(dayExpenses);
      totalExpenses += dayExpenses;

      if (dayExpenses > 0) {
        daysWithExpenses++;
      }
    }

    setTotal(totalExpenses);
    setAverage(daysWithExpenses > 0 ? totalExpenses / daysWithExpenses : 0);

    setData({
      labels: days,
      datasets: [
        {
          label: "Daily Expenses",
          data: expenseData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, [isOpen, categoryRecords, selectedMonth, categoryName]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `€${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "€" + value.toFixed(0);
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Day of Month",
        },
      },
    },
  };

  return (
    <Modal
      size="5xl"
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        backdrop: "bg-gray-900/50 backdrop-blur-sm",
        base: "bg-white rounded-2xl shadow-2xl",
        header: "border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600",
        body: "p-6",
        footer: "border-t border-gray-200 bg-gray-50",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-white">
              <h3 className="text-2xl font-bold">Daily Expense Overview - {categoryName}</h3>
              <p className="text-red-100 text-sm font-normal">
                {categoryName} expenses per day for {selectedMonth}
              </p>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-medium text-orange-700 uppercase tracking-wide">
                    Average per Day
                  </p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    €{average.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <p className="text-sm font-medium text-red-700 uppercase tracking-wide">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    €{total.toFixed(2)}
                  </p>
                </div>
              </div>
              {data.datasets && data.datasets.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <Bar data={data} options={chartOptions} />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 shadow-md hover:shadow-lg transition-all"
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
