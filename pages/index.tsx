import {
  Button,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import "chart.js/auto";
import { useEffect, useState, useMemo } from "react";
import FileLoader from "../components/file_loader";
import Layout from "../components/layout";
import AddRuleModal from "../components/modals/AddRuleModal";
import MonthOverview from "../components/month_overview";
import CategoriesOverview from "../components/categories_overview";
import UnknownTransactions from "../components/unknown_transactions";
import MonthSelector from "../components/month_selector";
import {
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

  const [reportConfig, setReportConfig] = useState<Config>({});
  const [reportConfigText, setReportConfigText] = useState("");
  const [exceptionsMap, setExceptionsMap] = useState<ExceptionsMap>({});

  const [IsPaydayToPayday, setIsPaydayToPayday] = useState(0);
  const {
    isOpen: addRuleModalIsOpen,
    onOpen: addRuleModalOnOpen,
    onClose: addRuleModelOnClose,
  } = useDisclosure();

  const currentMonthTransactions = useMemo(() => {
    if (!selectedMonth || !csvData.length) return [];

    let filteredData;
    if (!IsPaydayToPayday) {
      filteredData = csvData.filter((row) => {
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

      filteredData = csvData.filter((row) => {
        const date = dayjs(row.date, "DD-MM-YYYY");
        return date.isSameOrAfter(startPayday) && date.isBefore(endPayday);
      });
    }

    return filteredData;
  }, [csvData, selectedMonth, IsPaydayToPayday]);

  const onFileLoad = (data: Record[]) => {
    setCSVData(data);
    console.log("CSV Data: ", data);
  };

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

  useEffect(() => {
    setReportConfigText(JSON.stringify(reportConfig, null, 2));
  }, [reportConfig]);

  const saveConfig = (config) => {
    localStorage.setItem("reportConfig", JSON.stringify(config));
  };

  const months = useMemo((): string[] => {
    const uniqueMonths: Set<string> = new Set();
    csvData.forEach((row) => {
      const month: string = row.date.split("-").slice(1, 3).join("-");
      if (month.length) {
        uniqueMonths.add(month);
      }
    });

    return Array.from(uniqueMonths);
  }, [csvData]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const report = useMemo(() => {
    if (!selectedMonth || !currentMonthTransactions.length) return {} as Report;

    return generateReport(currentMonthTransactions, reportConfig, exceptionsMap);
  }, [currentMonthTransactions, reportConfig, exceptionsMap, selectedMonth]);



  const addRule = (category: string, column: string, value: string) => {
    const newConfig = {
      ...reportConfig,
      [category]: [
        ...reportConfig[category],
        {
          [column]: value,
        },
      ],
    };
    setReportConfig(newConfig);
    saveConfig(newConfig);
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
  };

  const addException = (record: Record, category: string) => {
    // Hash the record
    const hash = hashRecord(record);
    exceptionsMap[hash] = category;

    setExceptionsMap({ ...exceptionsMap });
    localStorage.setItem("exceptionsMap", JSON.stringify(exceptionsMap));
  };

  const removeException = (record: Record) => {
    const hash = hashRecord(record);
    delete exceptionsMap[hash];

    setExceptionsMap({ ...exceptionsMap });
    localStorage.setItem("exceptionsMap", JSON.stringify(exceptionsMap));
  };

  return (
    <Layout home>
      <AddRuleModal
        isOpen={addRuleModalIsOpen}
        onClose={addRuleModelOnClose}
        reportConfig={reportConfig}
        onAddRule={addRule}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Analyzer</h1>
            <p className="text-gray-600">Track your income, expenses, and savings</p>
          </div>

          {/* File Loader Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <FileLoader
              onFileLoad={onFileLoad}
              setIsPaydayToPayday={setIsPaydayToPayday}
              IsPaydayToPayday={IsPaydayToPayday}
            />
          </div>

          {csvData.length > 0 && (
            <div className="space-y-8">
              <MonthSelector
                csvData={csvData}
                months={months}
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
                reportConfig={reportConfig}
                exceptionsMap={exceptionsMap}
                IsPaydayToPayday={IsPaydayToPayday}
              />
              
              {selectedMonth && (
                <div className="space-y-8">
                  <MonthOverview
                    currentMonthTransactions={currentMonthTransactions}
                    selectedMonth={selectedMonth}
                    reportConfig={reportConfig}
                    exceptionsMap={exceptionsMap}
                  />

                  <CategoriesOverview
                    report={report}
                    reportConfig={reportConfig}
                    exceptionsMap={exceptionsMap}
                    csvData={csvData}
                    onAddException={addException}
                    onRemoveException={removeException}
                    selectedMonth={selectedMonth}
                  />

                  {/* Create Rule Button */}
                  <div className="flex justify-center">
                    <Button
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      onPress={() => {
                        addRuleModalOnOpen();
                      }}
                    >
                      + Create New Rule
                    </Button>
                  </div>

                  <UnknownTransactions
                    report={report}
                    reportConfig={reportConfig}
                    onAddException={addException}
                  />

                  {/* Config Section */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white">Configuration Editor</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <Textarea
                        value={reportConfigText}
                        onChange={(e) => {
                          setReportConfigText(e.target.value);
                        }}
                        className="font-mono text-sm"
                        minRows={10}
                      />
                      <Button
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        onPress={() => {
                          updateConfig();
                        }}
                      >
                        💾 Save Config
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
