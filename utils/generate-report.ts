const crypto = require("crypto");

//Constants
export const bankNoteColumns: string[] = [
  "date",
  "accountIBAN",
  "amount",
  "type",
  "name",
  "IBAN",
  "mutationCode",
  "description",
];

export const bankNoteColumnsING: string[] = [
  "Datum",
  "Naam / Omschrijving",
  "Rekening",
  "Tegenrekening",
  "Code",
  "Af Bij",
  "Bedrag (EUR)",
  "Mutatiesoort",
  "Mededelingen",
];




export type Record = {
  id: number;
  date: string;
  accountIBAN: string;
  amount: number;
  type: "Credit" | "Debet";
  name: string;
  IBAN: string;
  mutationCode: string;
  description: string;
  isException?: boolean;
};

export type ReportCategory = {
  name: string;
  amount: number;
  matchedRecords: Record[];
};

export type Report = {
  incomeCategories: ReportCategory[];
  expenseCategories: ReportCategory[];
  unmatchedIncomeRecords: Record[];
  unmatchedExpenseRecords: Record[];
  unmatchedIncomeTotal: number;
  unmatchedExpenseTotal: number;
};

export type ExceptionsMap = {
  [key: string]: string;
};

export type Config = {
  [key: string]: {
    [key: string]: string;
  }[];
};

export const baseConfig: Config = {
  Voedsel: [
    { description: "ALBERT HEIJN" },
    { description: "AH Amersfoort" },
    { description: "DIRK" },
    { description: "Albert Heijn" },
    { description: "Ikea bv inz.Utrecht" },
    { description: "Lidl" },
    { description: "Jumbo" },
    { description: "TopEdelgebak" },
    { description: "^AVANS 1218" },
    { description: "^HAN" },
    { description: "^Plus" },
    { name: "Flink" },
    { description: "Hogeschool Van Arnhem" },
  ],
  VoedselToGo: [
    { description: "Station Vlissingen" },
    { description: "AH to go" },
    { description: "Kiosk" },
    { description: "kiosk" },
  ],
  Tikkie: [{ name: "Tikkie" }, { name: "TIKKIE$" }, { name: "Betaalverzoek" }],
  FastFood: [
    { description: "Dominos" },
    { name: "Dominos" },
    { description: "Smullers" },
    { name: "Domino's Pizza" },
    { description: "MCD" },
    { description: "McDonald's" },
    { description: "Subway" },
    { name: "Thuisbezorgd.nl" },
    { description: "STARBUCKS" },
    { description: "Starbucks" },
    { description: "Food Facilities" },
    { description: "FOOD EN FACILITIES" },
    { description: "^Julia's" },
    { description: "^McD" },
    { name: "^Burgerme" },
    { description: "^Smullers" },
    { description: "Foodmaster" },
    { description: "Poke2go" },
  ],
  Drank: [
    { description: "Gall & Gall" },
    { name: "Gall&Gall" },
    { description: "Gall&Gall" },
  ],
  Huur: [{ description: "Huur" }],
  Servers: [{ name: "OVH BV" }],
  Verzekeringen: [
    { name: "SNS VERZEKERINGEN BKN BV" },
    { description: "SNS Verzekeringen" },
    { name: "DITZO ZORGVERZEKERING" },
    { name: "Ditzo" },
    { name: "ASR IKZ ZORG" },
    { name: "SNS Verzekeren" },
  ],
  Abbonementen: [
    { name: "NETFLIX" },
    { description: "EYEWISH" },
    { name: "Telfort Thuis" },
    { name: "TELE2" },
    { name: "^ODIDO" },
    { description: "Simpel" },
    { name: "Staatsloterij B.V." },
    { name: "Stg Greenpeace Nederland" },
  ],
  ZorgToeslag: [{ description: "ZORGTOESLAG" }],
  Kleding: [
    { description: "^WE " },
    { description: "Perry Sport" },
    { description: "J&J" },
    { description: "H & M" },
    { name: "De Bijenkorf" },
    { description: "^vanHaren" },
  ],
  Loon: [{ name: "Gravity B.V." }],
  StudieFinanciering: [{ description: "Studiefinanciering" }],
  Transport: [{ description: "^NS" }, { name: "^NS" }],
  Spullen: [
    { name: "WWW.AMAZON.DE" },
    { description: "MediaMarkt" },
    { description: "Amazon" },
    { name: "bol.com" },
    { description: "^BCC" },
    { name: "Azerty.nl" },
    { name: "Bax-shop.nl" },
    { name: "EDC Retail" },
  ],
  Sporten: [{ name: "^Basic Fit" }, { description: "Boulderhal" }],
  Uitjes: [
    { name: "Ticketmaster" },
    { name: "TicketMaster" },
    { description: "tickets" },
    { name: "Ik Ben Aanwezig" },
    { description: "Pathe Utrecht" },
    { name: "^Vue" },
    { description: "WAKU WAKU" },
    { description: "DierenPark Amersfoort" },
    { description: "RLBS" },
    { description: "Naturalis" },
    { description: "^VUE Amersfoort" },
    { description: "Winselerhof" },
  ],
  Toilet: [
    { description: "Sanifair" },
    { description: "Schoonmaakbedrijf" },
    { description: "Toilet" },
  ],
  Kapper: [{ description: "^Ami Kappers" }, { description: "^Hizi Hair" }],
  Donaties: [{ name: "Rode Kruis" }],
  AndereWinkels: [
    { description: "Action" },
    { description: "Kruidvat" },
    { description: "KRUIDVAT" },
    { description: "Blokker" },
    { description: "BLOKKER" },
    { description: "Decathlon" },
    { description: "decathlon" },
    { description: "^HEMA" },
    { description: "^ETOS" },
    { description: "^BLOEM!" },
  ],
  Books: [{ description: "^Kindle" }],
  Games: [{ name: "GOG.com" }, { description: "Microsoft" }],
  Paypal: [{ name: "PayPal" }],
  CreditCard: [{ name: "ICS" }],
  SchoolGeld: [{ description: "termijn$" }, { description: "Collegegeld" }],
  Spaarrekening: [
    { name: "J.G.C.E. Beaart" },
    { IBAN: "TRIONL2U NL34TRIO2025035446" },
  ],
  BelastingDienst: [{ name: "Belastingdienst" }],
  StudieSchuld: [{ name: "DUO" }],

  // BetaalAutomaat: [
  //   {description: "BETAALAUTOMAAT"}
  // ]
};

export function hashRecord(record: Record): string {
  const data = JSON.stringify({
    ...record,
    id: undefined,
    isException: undefined,
  });
  return crypto.createHash("md5").update(data).digest("hex");
}

function matchRecord(record: Record, config: Config): string | null {
  for (const category of Object.keys(config)) {
    for (const rule of config[category]) {
      const conditions = Object.entries(rule);
      let result = conditions.every(([column, value]) => {
        // @ts-ignore
        return RegExp(value).test(record[column as keyof Record]);
      });

      if (result) {
        return category;
      }
    }
  }
  return null;
}

export function generateReport(
  records: Record[],
  config: Config,
  exceptions: ExceptionsMap,
): Report {
  const report: Report = {
    incomeCategories: [],
    expenseCategories: [],
    unmatchedExpenseRecords: [],
    unmatchedIncomeRecords: [],
    unmatchedExpenseTotal: 0,
    unmatchedIncomeTotal: 0,
  };

  for (const record of records) {
    let matchedCategoryName: string | null;
    // First check if record is an exception
    const hash = hashRecord(record);
    if (exceptions[hash]) {
      matchedCategoryName = exceptions[hash];
      record.isException = true;
    } else {
      matchedCategoryName = matchRecord(record, config);
    }

    if (matchedCategoryName) {
      // If so, add to report
      // Check if need to add to income or expense
      const key: keyof Report =
        record.type === "Credit" ? "incomeCategories" : "expenseCategories";

      // Check if category already exists
      const category = report[key].find(
        (category) => category.name === matchedCategoryName,
      );
      if (!category) {
        // If not, create new category
        report[key].push({
          name: matchedCategoryName,
          amount: record.amount,
          matchedRecords: [record],
        });
      } else {
        // If so, add to existing category
        category.amount += record.amount;
        category.matchedRecords.push(record);
      }
    } else {
      // If not, add to unmatched
      let key: keyof Report =
        record.type === "Credit"
          ? "unmatchedIncomeRecords"
          : "unmatchedExpenseRecords";
      let totalKey: keyof Report =
        record.type === "Credit"
          ? "unmatchedIncomeTotal"
          : "unmatchedExpenseTotal";
      report[key].push(record);
      report[totalKey] += record.amount;
    }
  }

  // Sort categories by amount
  report.incomeCategories.sort((a, b) => b.amount - a.amount);
  report.expenseCategories.sort((a, b) => b.amount - a.amount);

  // Sort records by amount
  for (const category of report.incomeCategories) {
    category.matchedRecords.sort((a, b) => b.amount - a.amount);
  }
  for (const category of report.expenseCategories) {
    category.matchedRecords.sort((a, b) => b.amount - a.amount);
  }

  report.unmatchedIncomeRecords.sort((a, b) => b.amount - a.amount);
  report.unmatchedExpenseRecords.sort((a, b) => b.amount - a.amount);

  return report;
}
