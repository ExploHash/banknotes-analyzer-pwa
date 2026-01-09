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
}

export default function LineChartModal({
  isOpen,
  onClose,
  category,
  incomeIsPositive,
  csvData,
  reportConfig,
  exceptionsMap,
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

    setData({
      labels: months,
      datasets: [
        {
          label: category,
          data: lineData,
          fill: false,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    });
  }, [isOpen, category, incomeIsPositive, csvData, reportConfig, exceptionsMap]);

  return (
    <Modal size="5xl" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Data</ModalHeader>
            <ModalBody>
              <p>Average: {average}</p>
              <p>Total: {total}</p>
              {data.datasets && data.datasets.length > 0 && <Line data={data} />}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}