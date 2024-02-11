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
  useDisclosure,
} from "@nextui-org/react";

import "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Papa from "papaparse";
import { use, useEffect, useState } from "react";
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
import MonthSelector from "../components/month_selector";

export default function Home() {
  const [csvData, setCSVData]: [Record[], any] = useState([]);
  const [currentReport, setCurrentReport]: [Report, any] = useState({} as any);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthReportMapping, setMonthReportMapping]: [Object, any] = useState(
    {}
  );

  const [pieData, setPieData] = useState({} as any);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);
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
    []
  );

  const onFileLoad = (data: Record[]) => {
    setCSVData(data);
    const months = calculateMonths(data);
    recalculate(months);
  };

  useEffect(() => {
    if(csvData.length === 0) return;

    const months = calculateMonths(csvData);
    recalculate(months);
  }, [csvData]);

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


  useEffect(() => {
    if(Object.keys(monthReportMapping).length === 0) return;

    const incomeTotal = currentReport.incomeCategories.reduce((total, category) => {
      return category.name !== "Spaarrekening"
        ? total + category.amount
        : total;
    }, 0);

    setIncomeTotal(incomeTotal + currentReport.unmatchedIncomeTotal);

    // Calculate outgoing total
    let outgoingTotal = currentReport.expenseCategories.reduce((total, category) => {
      return category.name !== "Spaarrekening"
        ? total + category.amount
        : total;
    }, 0);

    // Calculate savings total
    const savingsRemoved = currentReport.incomeCategories.find(
      (category) => category.name === "Spaarrekening"
    );
    const savingsAdded = currentReport.expenseCategories.find(
      (category) => category.name === "Spaarrekening"
    );
    
    const savingsTotal =
      (savingsAdded?.amount ?? 0) - (savingsRemoved?.amount ?? 0);
    setSavingsTotal(savingsTotal);

    setOutgoingTotal(outgoingTotal + currentReport.unmatchedExpenseTotal);

    const pieData = generatePieData(currentReport);
    setPieData(pieData);
  }, [currentReport]);

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

    return Array.from(uniqueMonths as any);
  };

  const handleMonthChange = (month: string) => {
    console.log("Month: ", month);
    setCurrentReport(monthReportMapping[month]);
    setSelectedMonth(month);
  };

  const recalculate = (months: string[]) => {
    const reportMapping = {};
    for (const month of months) {
      const report = calculateData(month);
      reportMapping[month] = report;
    }
    setMonthReportMapping(reportMapping);
  };

  const calculateData = (selectedMonth: string) => {
    console.log("Selected month: ", selectedMonth);
    console.log("csvData: ", csvData);
    const filteredData = csvData.filter((row) => {
      return row.date.endsWith(selectedMonth);
    });
    console.log("Filtered data: ", filteredData);

    return generateReport(filteredData, reportConfig, exceptionsMap);
  };

  const generatePieData = (report: Report) => {
    const expenseCategories = report.expenseCategories.filter(
      (category) => category.name !== "Spaarrekening"
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
      new Set(csvData.map((row) => row.date.split("-").slice(1, 3).join("-")))
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
      {Object.keys(monthReportMapping).length === 0 && (
        <FileLoader onFileLoad={onFileLoad} />
      )}

      {Object.keys(monthReportMapping).length > 0 && (
        <MonthSelector
          monthReportMapping={monthReportMapping}
          onMonthSelected={handleMonthChange}
        />
      )}

      {Object.keys(currentReport).length > 0 && (
        <div>
          <h1>Report for {selectedMonth}</h1>
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
            {/* <div className="flex-1">
          <div>
            <h2 className="text-xl font-semibold">Outgoing Total</h2>
            <p className="text-2xl font-bold text-red-600">€{outgoingTotal.toFixed(2)}</p>
          </div>
        </div> */}
          </div>

          <div className="flex rounded-md bg-gray-100 p-4 shadow-md">
            {pieData?.labels?.length > 0 && (
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
              {currentReport?.incomeCategories?.map((category) => (
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
                <TableCell>
                  €{currentReport?.unmatchedIncomeTotal?.toFixed(2)}
                </TableCell>
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
              {currentReport?.expenseCategories?.map((category) => (
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
                  €{currentReport?.unmatchedExpenseTotal?.toFixed(2)}
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
              {currentReport?.unmatchedIncomeRecords?.map((record) => (
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
              {currentReport?.unmatchedExpenseRecords?.map((record) => (
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
      )}
    </Layout>
  );
}
