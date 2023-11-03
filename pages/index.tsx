import Layout from '../components/layout';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { useState } from 'react';
import Papa from 'papaparse';
import { Record, Report, bankNoteColumns, generateReport } from '../utils/generate-report';
import 'chart.js/auto';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export default function Home() {
  const [csvData, setCSVData]: [Record[], any] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [months, setMonths]: [string[], any] = useState([]);
  const [report, setReport]: [Report, any] = useState({} as any);
  const [pieData, setPieData] = useState({} as any);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [outgoingTotal, setOutgoingTotal] = useState(0);
  const [barData, setBarData] = useState({} as any);
  const [savingsTotal, setSavingsTotal] = useState(0);

  const pieOptions = {
    plugins: {
      datalabels: {
        display: true,
        color: 'white',
        formatter: (val, ctx) => (ctx.chart.data.labels[ctx.dataIndex])
      }
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        beforeFirstChunk: (chunk) => {
          return bankNoteColumns.join(',') + '\n' + chunk;
        },

        transform: (value, header) => {
          if (header === 'amount') {
            return parseFloat(value.replace('.', '').replace(',', '.'));
          }
          return value;
        },

        complete: (result: { data: Record[] }) => {
          // Add id to each record
          result.data.forEach((row, index) => {
            row.id = index;
          });

          setCSVData(result.data);
          console.log('CSV Data: ', result.data);
          const months = calculateMonths(result.data);
          calculateBarData(result.data, months);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error.message);
        },
      });
    }
  };

  const calculateMonths = (records: Record[]): string[] => {
    const uniqueMonths: Set<string> = new Set();
    records.forEach((row) => {
      const month: string = row.date.split('-').slice(1, 3).join('-');
      uniqueMonths.add(month);
    });

    setMonths(Array.from(uniqueMonths as any));

    return Array.from(uniqueMonths as any);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    const report = calculateData(e.target.value);
    const pieData = generatePieData(report);
    console.log('Pie Data: ', pieData);
    setPieData(pieData);
  };

  const calculateData = (selectedMonth: string) => {
    const filteredData = csvData.filter((row) => {
      const month: string = row.date.split('-').slice(1, 3).join('-');
      return month === selectedMonth;
    });

    const report = generateReport(filteredData);
    console.log('Report: ', report);
    setReport(report);

    // Calculate income total
    // @ts-ignore
    const incomeTotal = report.incomeCategories.reduce((total, category) => {
      return category.name !== 'Spaarrekening' ? total + category.amount : total;
    }, 0);
    setIncomeTotal(incomeTotal + report.unmatchedIncomeTotal);

    // Calculate outgoing total
    let outgoingTotal = report.expenseCategories.reduce((total, category) => {
      return category.name !== 'Spaarrekening' ? total + category.amount : total;
    }, 0);

    // Calculate savings total
    const savingsRemoved = report.incomeCategories.find((category) => category.name === 'Spaarrekening');
    const savingsAdded = report.expenseCategories.find((category) => category.name === 'Spaarrekening');
    const savingsTotal = (savingsAdded?.amount || 0) - (savingsRemoved?.amount || 0);
    setSavingsTotal(savingsTotal);

    setOutgoingTotal(outgoingTotal + report.unmatchedExpenseTotal);

    return report;
  }

  const calculateBarData = (records: Record[], months: string[]) => {
    // Bar chart with 2 datasets of income and expenses
    const incomeData = [];
    const expenseData = [];

    for (const month of months) {
      const filteredData = records.filter((row) => {
        const rowMonth: string = row.date.split('-').slice(1, 3).join('-');
        return rowMonth === month;
      });

      const report = generateReport(filteredData);
      const incomeTotal = report.incomeCategories.reduce((total, category) => {
        return category.name !== 'Spaarrekening' ? total + category.amount : total;
      }, 0);
      incomeData.push(incomeTotal + report.unmatchedIncomeTotal);

      let outgoingTotal = report.expenseCategories.reduce((total, category) => {
        return category.name !== 'Spaarrekening' ? total + category.amount : total;
      }, 0);
      expenseData.push(outgoingTotal + report.unmatchedExpenseTotal);
    }

    setBarData({
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const generatePieData = (report: Report) => {
    const expenseCategories = report.expenseCategories.filter ((category) => category.name !== 'Spaarrekening');

    
    return {
      labels: [...expenseCategories.map((category) => category.name), 'Unknown'],
      datasets: [
        {
          data: [...expenseCategories.map((category) => category.amount), report.unmatchedExpenseTotal],
        },
      ],
    };
  }
    

  return (
    <Layout home>
      <div className="p-4">
        <input type="file" accept=".csv" onChange={handleFileUpload} className="border rounded-lg p-2" />
      </div>

      {csvData.length > 0 && (
       <Bar data={barData} /> 
      )}

      <div className="p-4">
        <select value={selectedMonth} onChange={handleMonthChange} className="border rounded-lg p-2">
          <option value="">Select Month</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
<div >
    <div className="flex p-4 bg-gray-100 rounded-md shadow-md">
      <div className="flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Income Total</h2>
          <p className="text-2xl font-bold text-green-600">€{incomeTotal.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex-1">
        <div>
          <h2 className="text-xl font-semibold">Outgoing Total</h2>
          <p className="text-2xl font-bold text-red-600">€{outgoingTotal.toFixed(2)}</p>
        </div>
      </div>
        </div>
        <div className="flex p-4 bg-gray-100 rounded-md shadow-md">
      <div className="flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Savings total</h2>
          <p className="text-2xl font-bold text-green-600">€{savingsTotal.toFixed(2)}</p>
        </div>
      </div>
      {/* <div className="flex-1">
        <div>
          <h2 className="text-xl font-semibold">Outgoing Total</h2>
          <p className="text-2xl font-bold text-red-600">€{outgoingTotal.toFixed(2)}</p>
        </div>
      </div> */}
    </div>

    <div className="flex p-4 bg-gray-100 rounded-md shadow-md">
        {Object.keys(report).length > 0 && (
          <Pie data={pieData} plugins={[ChartDataLabels] as any} options={pieOptions} />
          )}
    </div>

        <h1>Report</h1>
        <h2>Income categories</h2>
        <Table>
          <TableHeader>
            <TableColumn>Category</TableColumn>
            <TableColumn>Amount</TableColumn>
          </TableHeader>
          <TableBody>
            {report?.incomeCategories?.map((category) => (
              <TableRow key={category.name}>
                <TableCell>{category.name}</TableCell>
                <TableCell>€{category.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <h2>Expense categories</h2>
        <Table>
          <TableHeader>
            <TableColumn>Category</TableColumn>
            <TableColumn>Amount</TableColumn>
          </TableHeader>
          <TableBody>
            {report?.expenseCategories?.map((category) => (
              <TableRow key={category.name}>
                <TableCell>{category.name}</TableCell>
                <TableCell>€{category.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h1>Unknown Income</h1>
        <Table>
          <TableHeader>
            {bankNoteColumns.map((key) => (
              <TableColumn key={key}>
                {key}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody>
        {report?.unmatchedIncomeRecords?.map((record) =>
          <TableRow key={record.id}>
            {bankNoteColumns.map((key) => (
              // @ts-ignore
              <TableCell key={key}>{record[key]}</TableCell>
            ))}
            
          </TableRow>
        )}
      </TableBody>
          
        </Table>

         <h1>Unknown Expense</h1>
        <Table>
          <TableHeader>
            {bankNoteColumns.map((key) => (
              <TableColumn key={key}>
                {key}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody>
        {report?.unmatchedExpenseRecords?.map((record) =>
          <TableRow key={record.id}>
            {bankNoteColumns.map((key) => (
              // @ts-ignore
              <TableCell key={key}>{record[key]}</TableCell>
            ))}
            
          </TableRow>
        )}
      </TableBody>
          
        </Table>
      </div>
    </Layout>
  );
}