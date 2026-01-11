import {
  Button,
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
} from "@nextui-org/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Chip,
} from "@nextui-org/react";
import {
  bankNoteColumns,
  Config,
  Record,
  Report,
} from "../utils/generate-report";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  pointerWithin,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface UnknownTransactionsProps {
  report: Report;
  reportConfig: Config;
  onAddException: (record: Record, category: string) => void;
}

const labelColors = [
  "default",
  "primary",
  "secondary",
  "success",
  "warning",
  "danger",
];

function DraggableCard({
  record,
  kind,
}: {
  record: Record;
  kind: "income" | "expense";
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: record.id,
      data: { kind },
    });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Card className="">
        <CardHeader className="flex gap-3">
          <div className="flex justify-between w-full">
            <div className="flex flex-col">
              <p className="text-md">{record.name}</p>
              <p className="text-small text-default-500">
                {record.date} - {record.accountIBAN}
              </p>
            </div>
            <div className="flex items-center">
              <p className="text-md font-semibold">€{record.amount}</p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>{record.description}</p>
        </CardBody>
        <Divider />
      </Card>
    </div>
  );
}

function DroppableLabel({
  category,
  color,
}: {
  category: string;
  color: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: category,
  });

  return (
    <div ref={setNodeRef} className="inline-block">
      <Chip
        color={color as any}
        className={`w-full text-center m-1 ${isOver ? "ring-4 ring-black" : ""}`}
      >
        {category}
      </Chip>
    </div>
  );
}

export default function UnknownTransactions({
  report,
  reportConfig,
  onAddException,
}: UnknownTransactionsProps) {
  const handleIncomeDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;

    const category = String(event.over.id);
    const record = report?.unmatchedIncomeRecords?.find(
      (r) => r.id === event.active.id,
    );
    if (!record) return;

    onAddException(record, category);
  };

  const handleExpenseDragEnd = (event: DragEndEvent) => {
    if (!event.over) return;

    const category = String(event.over.id);
    const record = report?.unmatchedExpenseRecords?.find(
      (r) => r.id === event.active.id,
    );
    if (!record) return;

    onAddException(record, category);
  };

  return (
    <div className="space-y-6">
      {/* Unknown Income Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <DndContext
          onDragEnd={handleIncomeDragEnd}
          collisionDetection={pointerWithin}
        >
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">
              Unknown Income Transactions
            </h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-default-500 mb-2">
                Tip: Drag a transaction card and drop it onto a category chip to
                classify it.
              </p>
              {Object.keys(reportConfig)
                .sort()
                .map((key, index) => (
                  <DroppableLabel
                    key={key}
                    category={key}
                    color={labelColors[index % labelColors.length]}
                  />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report?.unmatchedIncomeRecords?.map((record) => (
                <DraggableCard key={record.id} record={record} kind="income" />
              ))}
            </div>
          </div>
        </DndContext>
      </div>

      {/* Unknown Expense Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <DndContext
          onDragEnd={handleExpenseDragEnd}
          collisionDetection={pointerWithin}
        >
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">
              Unknown Expense Transactions
            </h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-default-500 mb-2">
                Tip: Drag a transaction card and drop it onto a category chip to
                classify it.
              </p>
              {Object.keys(reportConfig)
                .sort()
                .map((key, index) => (
                  <DroppableLabel
                    key={key}
                    category={key}
                    color={labelColors[index % labelColors.length]}
                  />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report?.unmatchedExpenseRecords?.map((record) => (
                <DraggableCard key={record.id} record={record} kind="expense" />
              ))}
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
