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
      <FileLoader
        onFileLoad={onFileLoad}
        setIsPaydayToPayday={setIsPaydayToPayday}
        IsPaydayToPayday={IsPaydayToPayday}
      />

      {csvData.length > 0 && (
        <>
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
            <div>
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
              />

              <Button
                className="my-4"
                onPress={() => {
                  addRuleModalOnOpen();
                }}
              >
                Create new Rule
              </Button>
              <UnknownTransactions
                report={report}
                reportConfig={reportConfig}
                onAddException={addException}
              />
              <h4>Current Config</h4>
              <Textarea
                value={reportConfigText}
                onChange={(e) => {
                  setReportConfigText(e.target.value);
                }}
              />

              <Button
                className="my-4"
                onPress={() => {
                  updateConfig();
                }}
              >
                Save Config
              </Button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
