import * as XLSX from "xlsx";
import api, { route } from "@forge/api";
import FormData from "form-data";
import { arrayToCSV } from "../utils/helpers";

// Function to convert JSON data to Excel buffer
const exportToExcelBuffer = (data: any[]): Buffer => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
};

// Export function to generate file content and metadata
export const ExportFunction = ({
  props,
}: {
  props: ExportProps;
}): {
  filename: string;
  content: Buffer;
  type: string;
} => {
  const { format, fileName, tableRows } = props;

  console.log("Export entry", fileName);

  // Transform table rows to a flat object array
  const transformedData = tableRows.map((item) => {
    const transformedItem: any = {};
    item.cells.forEach((cell) => {
      transformedItem[cell.key] = cell.content;
    });
    return transformedItem;
  });

  console.log("Export format", format);
  // Generate file content based on the specified format
  if (format === "csv") {
    const csvContent = arrayToCSV(transformedData);
    return {
      filename: `${fileName}.csv`,
      content: Buffer.from(csvContent),
      type: "text/csv",
    };
  }

  if (format === "xlsx") {
    const excelContent = exportToExcelBuffer(transformedData);
    return {
      filename: `${fileName}.xlsx`,
      content: excelContent,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  const jsonContent = JSON.stringify(transformedData, null, 2);
  return {
    filename: `${fileName}.json`,
    content: Buffer.from(jsonContent),
    type: "application/json",
  };
};

export const uploadAttachmentToJira = async (
  issueKey: string,
  exportProps: ExportProps
) => {
  // console.log("Attachment Start");

  try {
    // console.log("Export Start");
    const { filename, type, content } = ExportFunction({
      props: exportProps,
    });

    console.log("Form Data", filename, type, );
    const formData = new FormData();
    formData.append("file", Buffer.from(content), {
      filename,
      contentType: type,
    });

    // console.log("API Req");
    const response = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueKey}/attachments`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "X-Atlassian-Token": "no-check",
        },
      });

    console.log(`Response: ${response.status} ${response.statusText}`);
    const res = await response.json();
    console.log("Attachment Res", res);
    return res;
  } catch (error) {
    console.log("Attachment error", error);

    return error;
  }
};
