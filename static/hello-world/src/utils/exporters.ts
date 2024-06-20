import * as XLSX from "xlsx";
import { arrayToCSV } from "./dataParsers";

export function ExportFunction({
  props,
}: {
  props: {
    format: "xlsx" | "json" | "csv";
    fileName: string;
    tableHead: TableHead;
    tableRows: TableRow[];
  };
}) {
  const { format, fileName, tableHead, tableRows } = props;

  console.log("Export", format, tableHead, tableRows);
  const transformedData = tableRows.map((item) => {
    const transformedItem: any = {};

    item.cells.forEach((cell) => {
      transformedItem[cell.key] = cell.content;
    });

    return transformedItem;
  });

  if (format === "csv") {
    return () => {
      downloadCSV(transformedData, `${fileName}.csv`);
    };
  }
  if (format === "xlsx") {
    return () => {
      exportToExcel(transformedData, `${fileName}.xlsx`);
    };
  }
  return () => {
    downloadJSON(transformedData, `${fileName}.json`);
  };
}

const exportToExcel = (data: any[], filename: string): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
};

const downloadJSON = (jsonData: object, filename: string): void => {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);  
  link.click();
  document.body.removeChild(link);
};
const downloadCSV = (csvData: any, filename: string): void => {
  const blob = new Blob([arrayToCSV(csvData)], {
    type: "text/csv",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
