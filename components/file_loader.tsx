import { Card, Checkbox } from "@nextui-org/react";
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
    <Card className="p-4 mt-5">
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
