import { Card, Checkbox } from "@nextui-org/react";
import Papa from "papaparse";
import { Dispatch, SetStateAction } from "react";
import { bankNoteColumns, Record } from "../utils/generate-report";

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
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      Papa.parse(file, {
        header: true,
        beforeFirstChunk: (chunk) => {
          return bankNoteColumns.join(",") + "\n" + chunk;
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

          onFileLoad(result.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error.message);
        },
      });
    }
  };

  return (
    <Card className="p-4">
      <h1 className="mb-4 text-2xl font-semibold">Bank Note Report</h1>
      <p>Upload a CSV file to generate a report</p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="rounded-lg border p-2"
      />
      <Checkbox
        className="ml-4"
        checked={IsPaydayToPayday}
        onChange={() => setIsPaydayToPayday(!IsPaydayToPayday)}
      >
        Payday to Payday
      </Checkbox>
    </Card>
  );
};

export default FileLoader;
