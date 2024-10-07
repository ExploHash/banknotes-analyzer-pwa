// TODO: split into multiple components because this is getting out of hand :)
import {
  Button,
  Input,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure
} from "@nextui-org/react";
import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import FileLoader from "../components/file_loader";
import Layout from "../components/layout";
import {
  bankNoteColumns,
  baseConfig,
  Config,
  ExceptionsMap,
  generateReport,
  hashRecord,
  Record,
  Report,
} from "../utils/generate-report";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

export default function Home() {
  const [csvData, setCSVData]: [Record[], any] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [months, setMonths]: [string[], any] = useState([]);
  const [report, setReport]: [Report, any] = useState({} as any);
  const [pieData, setPieData] = useState({} as any);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);
  const [barData, setBarData] = useState({} as any);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [reportConfig, setReportConfig] = useState<Config>({});
  const [reportConfigText, setReportConfigText] = useState("");
  const [exceptionsMap, setExceptionsMap] = useState<ExceptionsMap>({});
  const [addRuleCategory, setAddRuleCategory] = useState("");
  const [addRuleColumn, setAddRuleColumn] = useState("");
  const [addRuleValue, setAddRuleValue] = useState("");
  const [lineModalData, setLineModalData] = useState({} as any);
  const [lineModalAverage, setLineModalAverage] = useState(0);
  const [lineModalTotal, setLineModalTotal] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [IsPaydayToPayday, setIsPaydayToPayday] = useState(0);
  const [monthIncomeOutgoingData, setMonthIncomeOutgoingData] = useState(
    {} as any,
  );
  const {
    isOpen: transactionsModalIsOpen,
    onOpen: transactionsModalOnOpen,
    onClose: transactionsModelOnClose,
  } = useDisclosure();

  const {
    isOpen: addRuleModalIsOpen,
    onOpen: addRuleModalOnOpen,
    onClose: addRuleModelOnClose,
  } = useDisclosure();

  const {
    isOpen: lineChartModalIsOpen,
    onOpen: lineChartModalOnOpen,
    onClose: lineChartModelOnClose,
  } = useDisclosure();

  const [transactionsModalData, setTransactionsModalData] = useState<Record[]>(
    [],
  );

  const onFileLoad = (data: Record[]) => {
    setCSVData(data);
    console.log("CSV Data: ", data);
    const months = calculateMonths(data);
    calculateBarData(data, months);
  };

  useEffect(() => {
    const months = calculateMonths(csvData);
    calculateBarData(csvData, months);

    if (selectedMonth) {
      recalculate(selectedMonth);
    }
  }, [IsPaydayToPayday]);

  useEffect(() => {
    // Load config from local storage or use base config
    const config = localStorage.getItem("reportConfig");
    const exceptions = localStorage.getItem("exceptionsMap");
    setExceptionsMap(exceptions ? JSON.parse(exceptions) : {});

    if (config) {
      console.log("Loaded config from local storage");
      setReportConfig(JSON.parse(config));
    } else {
      setReportConfig(baseConfig);
    }
  }, []);

  // If reportConfig changes save to textReportConfig
  useEffect(() => {
    setReportConfigText(JSON.stringify(reportConfig, null, 2));
  }, [reportConfig]);

  const saveConfig = (config) => {
    localStorage.setItem("reportConfig", JSON.stringify(config));
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        display: true,
        color: "white",
        formatter: (val, ctx) => ctx.chart.data.labels[ctx.dataIndex],
      },
    },
  };

  const calculateMonths = (records: Record[]): string[] => {
    const uniqueMonths: Set<string> = new Set();
    records.forEach((row) => {
      const month: string = row.date.split("-").slice(1, 3).join("-");
      if (month.length) {
        uniqueMonths.add(month);
      }
    });

    setMonths(Array.from(uniqueMonths as any));

    return Array.from(uniqueMonths as any);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    recalculate(e.target.value);
  };

  const recalculate = (month) => {
    const report = calculateData(month);
    const pieData = generatePieData(report);
    setPieData(pieData);

    // Calculate income and outgoing line
    const monthIncomeOutgoingData = calculateIncomeOutgoingData(month);
    setMonthIncomeOutgoingData(monthIncomeOutgoingData);
  };

  const calculateIncomeOutgoingData = (month: string) => {
    const days = [];
    const incomeData = [];
    const outgoingData = [];
    let summedIncome = 0;
    let summedOutgoing = 0;
    const monthData = filterTransactions(csvData, month, IsPaydayToPayday);
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

      // Filter with dayjs and format DD-MM-YYYY between payday and payday
      filteredData = data.filter((row) => {
        const date = dayjs(row.date, "DD-MM-YYYY");
        return date.isSameOrAfter(startPayday) && date.isBefore(endPayday);
      });
    }

    return filteredData;
  };

  const calculateData = (selectedMonth: string) => {
    const filteredData = filterTransactions(
      csvData,
      selectedMonth,
      IsPaydayToPayday,
    );

    const report = generateReport(filteredData, reportConfig, exceptionsMap);
    console.log("Report: ", report);
    setReport(report);

    // Calculate income total
    // @ts-ignore
    const incomeTotal = report.incomeCategories.reduce((total, category) => {
      return category.name !== "Spaarrekening"
        ? total + category.amount
        : total;
    }, 0);
    setIncomeTotal(incomeTotal + report.unmatchedIncomeTotal);

    // Calculate outgoing total
    let outgoingTotal = report.expenseCategories.reduce((total, category) => {
      return category.name !== "Spaarrekening"
        ? total + category.amount
        : total;
    }, 0);

    // Calculate savings total
    const savingsRemoved = report.incomeCategories.find(
      (category) => category.name === "Spaarrekening",
    );
    const savingsAdded = report.expenseCategories.find(
      (category) => category.name === "Spaarrekening",
    );
    const savingsTotal =
      (savingsAdded?.amount || 0) - (savingsRemoved?.amount || 0);
    setSavingsTotal(savingsTotal);

    setOutgoingTotal(outgoingTotal + report.unmatchedExpenseTotal);

    // Calculate rest total
    const restTotal = incomeTotal - outgoingTotal - savingsTotal;
    setRestTotal(restTotal);

    return report;
  };

  const calculateBarData = (records: Record[], months: string[]) => {
    // Bar chart with 2 datasets of income and expenses
    const incomeData = [];
    const expenseData = [];

    for (const month of months) {
      let filteredData = filterTransactions(records, month, IsPaydayToPayday);

      const report = generateReport(filteredData, reportConfig, exceptionsMap);
      const incomeTotal = report.incomeCategories.reduce((total, category) => {
        return category.name !== "Spaarrekening"
          ? total + category.amount
          : total;
      }, 0);
      incomeData.push(incomeTotal + report.unmatchedIncomeTotal);

      let outgoingTotal = report.expenseCategories.reduce((total, category) => {
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
  };

  const generatePieData = (report: Report) => {
    const expenseCategories = report.expenseCategories.filter(
      (category) => category.name !== "Spaarrekening",
    );

    return {
      labels: [
        ...expenseCategories.map((category) => category.name),
        "Unknown",
      ],
      datasets: [
        {
          data: [
            ...expenseCategories.map((category) => category.amount),
            report.unmatchedExpenseTotal,
          ],
        },
      ],
    };
  };

  const addRule = () => {
    reportConfig[addRuleCategory].push({
      [addRuleColumn]: addRuleValue,
    });
    setReportConfig(reportConfig);
    saveConfig(reportConfig);
    recalculate(selectedMonth);
  };

  const updateConfig = () => {
    let newConfig;
    try {
      newConfig = JSON.parse(reportConfigText);
    } catch (e) {
      alert("Invalid JSON");
      return;
    }
    setReportConfig(newConfig);
    setReportConfigText(JSON.stringify(newConfig, null, 2));
    saveConfig(newConfig);
    recalculate(selectedMonth);
    alert("Saved");
  };

  const addException = (record: Record, category: string) => {
    // Hash the record
    const hash = hashRecord(record);
    exceptionsMap[hash] = category;

    setExceptionsMap(exceptionsMap);
    localStorage.setItem("exceptionsMap", JSON.stringify(exceptionsMap));

    recalculate(selectedMonth);
  };

  const removeException = (record: Record) => {
    const hash = hashRecord(record);
    delete exceptionsMap[hash];

    setExceptionsMap(exceptionsMap);
    localStorage.setItem("exceptionsMap", JSON.stringify(exceptionsMap));

    recalculate(selectedMonth);
  };

  const calculateLineData = (category: string, incomeIsPositive = true) => {
    const lineData = [];
    const months = Array.from(
      new Set(csvData.map((row) => row.date.split("-").slice(1, 3).join("-"))),
    );

    // Remove last month
    months.pop();

    console.log("Months: ", months);
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

    const average = allTotal / count;
    setLineModalAverage(average);
    setLineModalTotal(allTotal);

    console.log(lineData);

    setLineModalData({
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
  };

  return (
    <Layout home>
      <Modal
        size="5xl"
        isOpen={lineChartModalIsOpen}
        onClose={lineChartModelOnClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Data</ModalHeader>
              <ModalBody>
                <p>Average: {lineModalAverage}</p>
                <p>Total: {lineModalTotal}</p>
                <Line data={lineModalData} />
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
      <Modal
        size="xl"
        isOpen={addRuleModalIsOpen}
        onClose={addRuleModelOnClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Transactions
              </ModalHeader>
              <ModalBody>
                /* Select a addRuleCategory, addRuleColumn and addRuleValue */
                <Select
                  className="mb-4"
                  onChange={(e) => setAddRuleCategory(e.target.value)}
                >
                  {Object.keys(reportConfig).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  className="mb-4"
                  onChange={(e) => setAddRuleColumn(e.target.value)}
                >
                  {bankNoteColumns.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  className="mb-4"
                  type="text"
                  placeholder="Value"
                  onChange={(e) => setAddRuleValue(e.target.value)}
                />
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => {
                    addRule();
                    addRuleModelOnClose();
                  }}
                >
                  Add Rule
                </Button>
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
      <Modal
        size="5xl"
        isOpen={transactionsModalIsOpen}
        onClose={transactionsModelOnClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Transactions
              </ModalHeader>
              <ModalBody>
                <Table className="max-h-96 overflow-scroll">
                  <TableHeader>
                    {bankNoteColumns.map((key) => (
                      <TableColumn key={key}>{key}</TableColumn>
                    ))}
                    <TableColumn>Actions</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {transactionsModalData?.map((record) => (
                      <TableRow key={record.id}>
                        {bankNoteColumns.map((key) => (
                          // @ts-ignore
                          <TableCell key={key}>{record[key]}</TableCell>
                        ))}
                        <TableCell>
                          {record.isException && (
                            <Button
                              color="primary"
                              variant="light"
                              onPress={() => {
                                transactionsModelOnClose();
                                removeException(record);
                              }}
                            >
                              Remove Exception
                            </Button>
                          )}
                          {!record.isException && (
                            <Popover placement="bottom">
                              <PopoverTrigger>
                                <Button>Add Exception</Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <Select className="w-40">
                                  {Object.keys(reportConfig).map((key) => (
                                    <SelectItem
                                      key={key}
                                      value={key}
                                      onClick={() => {
                                        transactionsModelOnClose();
                                        addException(record, key);
                                      }}
                                    >
                                      {key}
                                    </SelectItem>
                                  ))}
                                </Select>
                              </PopoverContent>
                            </Popover>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
      <FileLoader
        onFileLoad={onFileLoad}
        setIsPaydayToPayday={setIsPaydayToPayday}
        IsPaydayToPayday={IsPaydayToPayday}
      />

      {csvData.length > 0 && <Bar data={barData} />}

      <div className="p-4">
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
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
          {Object.keys(report).length > 0 && (
            <Pie
              data={pieData}
              plugins={[ChartDataLabels] as any}
              options={pieOptions}
            />
          )}
        </div>

        <h1>Report</h1>
        <h2>Income categories</h2>
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
                    onPress={() => {
                      setTransactionsModalData(category.matchedRecords);
                      transactionsModalOnOpen();
                    }}
                  >
                    View Transactions
                  </Button>
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => {
                      lineChartModalOnOpen();
                      calculateLineData(category.name);
                    }}
                  >
                    View Line Chart
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow key="unknown">
              <TableCell>Unknown</TableCell>
              <TableCell>€{report?.unmatchedIncomeTotal?.toFixed(2)}</TableCell>
              <TableCell>
                <p />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <h2>Expense categories</h2>
        <Table>
          <TableHeader>
            <TableColumn>Category</TableColumn>
            <TableColumn>Amount</TableColumn>
            <TableColumn></TableColumn>
          </TableHeader>
          <TableBody>
            {report?.expenseCategories?.map((category) => (
              <TableRow key={category.name}>
                <TableCell>{category.name}</TableCell>
                <TableCell>€{category.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => {
                      setTransactionsModalData(category.matchedRecords);
                      transactionsModalOnOpen();
                    }}
                  >
                    View Transactions
                  </Button>
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => {
                      lineChartModalOnOpen();
                      calculateLineData(category.name, false);
                    }}
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
              <TableCell>
                <p />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Button
          color="primary"
          variant="light"
          onPress={() => {
            addRuleModalOnOpen();
          }}
        >
          Add Rule
        </Button>
        <h1>Unknown Income</h1>
        <Table>
          <TableHeader>
            {bankNoteColumns.map((key) => (
              <TableColumn key={key}>{key}</TableColumn>
            ))}
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {report?.unmatchedIncomeRecords?.map((record) => (
              <TableRow key={record.id}>
                {bankNoteColumns.map((key) => (
                  // @ts-ignore
                  <TableCell key={key}>{record[key]}</TableCell>
                ))}
                <TableCell>
                  <Popover placement="bottom">
                    <PopoverTrigger>
                      <Button>Add Exception</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Select className="w-40">
                        {Object.keys(reportConfig).map((key) => (
                          <SelectItem
                            key={key}
                            value={key}
                            onClick={() => {
                              addException(record, key);
                            }}
                          >
                            {key}
                          </SelectItem>
                        ))}
                      </Select>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h1>Unknown Expense</h1>
        <Table>
          <TableHeader>
            {bankNoteColumns.map((key) => (
              <TableColumn key={key}>{key}</TableColumn>
            ))}
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {report?.unmatchedExpenseRecords?.map((record) => (
              <TableRow key={record.id}>
                {bankNoteColumns.map((key) => (
                  // @ts-ignore
                  <TableCell key={key}>{record[key]}</TableCell>
                ))}
                <TableCell>
                  <Popover placement="bottom">
                    <PopoverTrigger>
                      <Button>Add Exception</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Select className="w-40">
                        {Object.keys(reportConfig).map((key) => (
                          <SelectItem
                            key={key}
                            value={key}
                            onClick={() => {
                              addException(record, key);
                            }}
                          >
                            {key}
                          </SelectItem>
                        ))}
                      </Select>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h1>Current Config</h1>
        <Textarea
          value={reportConfigText}
          onChange={(e) => {
            setReportConfigText(e.target.value);
          }}
        />

        <Button
          color="primary"
          variant="light"
          onPress={() => {
            updateConfig();
          }}
        >
          Save Config
        </Button>
      </div>
    </Layout>
  );
}
