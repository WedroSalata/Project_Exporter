import React, { useState, useEffect } from "react";
import Button from "@atlaskit/button";
import DynamicTable from "@atlaskit/dynamic-table";
import { Head } from "./ReportTable/Headers";
import CreateReportForm from "../ReportForm/CreateReport";
import { invoke } from "@forge/bridge";
import { ReportScheduler } from "../ReportScheduler/ReportScheduler";

function ReportBrowser() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [reportId, setReportId] = useState<number>(-1);
  const [templates, settemplates] = useState<ReportProps[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);

  useEffect(() => {
    console.log("Page loaded");
    LoadTemplates();
  }, []);

  useEffect(() => {
    console.log("Rows Update", templates);
    setRows(RowsCreate());
  }, [templates]);

  async function LoadTemplates() {
    setIsDataLoading(true);
    const res: ReportProps[] = await invoke("GetTemplates");
    settemplates(res);
    setIsDataLoading(false);
  }

  function RowsCreate() {
    return templates.map((template, index) => {
      return {
        key: template.form.formName,
        cells: [
          { key: `${template.form.formName}`, content: template.form.formName },
          {
            key: `${template.form.formHistory}`,
            content: `${template.form.formHistory}`,
          },
          {
            key: "actionButtons",
            content: (
              <>
                <Button
                  onClick={() => {
                    setReportId(index);
                    setIsReportOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setReportId(index);
                    setIsScheduleOpen(true);
                  }}
                >
                  Schedule
                </Button>
                <Button
                  appearance="danger"
                  onClick={() => {
                    const newTemplates = templates.filter(
                      (_, ind) => ind !== index
                    );
                    settemplates(newTemplates);
                    invoke("SaveTemplates", { templates: newTemplates });
                  }}
                >
                  Remove
                </Button>
              </>
            ),
          },
        ],
      };
    });
  }

  return (
    <>
 {isReportOpen && (
   <CreateReportForm
     setIsReportOpen={setIsReportOpen}
     templates={templates}
     settemplates={settemplates}
     id={reportId}
   />
 )}
 {isScheduleOpen && (
   <ReportScheduler
     id={reportId}
     setIsScheduleOpen={setIsScheduleOpen}
     templates={templates}
     settemplates={settemplates}
   />
 )}
 {!isReportOpen && !isScheduleOpen && (
   <>
     <div style={{ margin: "10px 0px" }}>
       <div
         style={{
           display: "flex",
           justifyContent: "space-between",
           margin: "10px 0px",
         }}
       >
         <h2>REPORT BROWSER</h2>
         <Button
           appearance="primary"
           onClick={() => {
             setReportId(-1);
             setIsReportOpen(true);
           }}
         >
           Create Report
         </Button>
       </div>
       <div style={{ overflowX: "scroll" }}>
         <DynamicTable
           isLoading={isDataLoading}
           head={Head()}
           rows={rows}
           emptyView={
             <h3>The table is empty and this is the empty view</h3>
           }
         />
       </div>
     </div>
   </>
 )}
    </>
  );
}

export default ReportBrowser;
