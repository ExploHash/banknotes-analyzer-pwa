import { Checkbox } from "@nextui-org/react";
import Papa from "papaparse";
import { Dispatch, SetStateAction } from "react";
import { bankNoteColumns, Record } from "../utils/generate-report";
import dayjs from "dayjs";

export type FileLoaderProps = {
  onFileLoad: (data: Record[]) => void;
  IsPaydayToPayday: number;
  setIsPaydayToPayday: Dispatch<SetStateAction<number>>;
};

const FileLoader: React.FC<FileLoaderProps> = ({
  onFileLoad,
  IsPaydayToPayday,
  setIsPaydayToPayday,
}) => {
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        beforeFirstChunk: (chunk) => {
          if(chunk.startsWith('"Datum","Naam / Omschrijving"')) {
            console.log("detedasjhds");
            return;
          } else {
            return bankNoteColumns.join(",") + "\n" + chunk;
          }
        },

        transform: (value, header) => {
          if (header === "amount") {
            return parseFloat(value.replace(".", "").replace(",", "."));
          }
          return value;
        },

        complete: (result: { data: Record[] }) => {
          // Add id to each record
          result.data.forEach((row, index) => {
            row.id = index;
          });


          // Check if ING format
          // @ts-expect-error yolo
          if (result.data[0]["Naam / Omschrijving"]) {
          // Filter if Datum is null
            result.data = result.data.filter((row) => {
              return row["Datum"];
            })

            result.data = result.data.map((row, index) => {
              return {
                id: index,
                date: dayjs(row["Datum"], "YYYYMMDD").format("DD-MM-YYYY"),
                accountIBAN: row["Rekening"],
                amount: parseFloat(row["Bedrag (EUR)"].replace(",", ".")),
                type: row["Af Bij"] === "Bij" ? "Credit" : "Debet",
                name: row["Naam / Omschrijving"],
                IBAN: row["Tegenrekening"] || "",
                mutationCode: row["Code"],
                description: row["Mededelingen"],
              } as Record;
            });
          }

          onFileLoad(result.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error.message);
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Bank Statement</h2>
        <p className="text-gray-600">Upload a CSV file to analyze your transactions</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose CSV File
          </span>
        </label>
        
        <Checkbox
          isSelected={!!IsPaydayToPayday}
          onValueChange={(checked) => setIsPaydayToPayday(checked ? 1 : 0)}
          classNames={{
            base: "bg-white rounded-lg border border-gray-300 px-4 py-2 shadow-sm",
            label: "text-gray-700 font-medium"
          }}
        >
          Payday to Payday Mode
        </Checkbox>
      </div>
    </div>
  );
};

export default FileLoader;
