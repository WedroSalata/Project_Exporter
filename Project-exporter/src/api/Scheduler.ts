import { uploadAttachmentToJira } from "./Attachment";
import api, { route, storage } from "@forge/api";
import { getIssues } from "./Issue";
import { RowGenWithHistory, SelectToTable } from "../utils/helpers";

// Function to run the scheduled check
export async function scheduleCheck() {
  try {
    console.log("Scheduler entry");

    const templates: ReportProps[] = await storage.get("Templates");
    console.log("Scheduler templates", templates);

    for (const item of templates) {
      if (
        item.scheduler &&
        shouldTriggerAction(
          item.scheduler.schedulerLastRun,
          item.scheduler.schedulerInterval
        )
      ) {
        await autoExporter(item);
        const newTemplates = templates.map((template) => {
          if (template.id === item.id) {
            return {
              ...template,
              scheduler: {
                ...template.scheduler,
                schedulerLastRun: new Date(),
              },
            };
          }
          return template;
        });
        await storage.set("Templates", newTemplates);
        console.log(`Report for ${item.form.formName} processed and updated`);
      } else {
        console.log("Report Skipped for", item.form.formName);
      }
    }
  } catch (e) {
    console.error("Error in scheduleCheck", e);
  }
}

// Function to automatically export the report and upload it to Jira
async function autoExporter(item: ReportProps) {
  try {
    console.log("Report exporting", item.form.formName);

    // Get issues based on the JQL query in the form
    const issues = await getIssues(item.form.formJql);
    // console.log("Issues retrieved", issues);

    // Prepare export properties
    const exportProps: ExportProps = {
      format: item.form.formFormat,
      fileName: item.form.formName,
      tableHead: { cells: SelectToTable(item.form.formColumns) },
      tableRows: RowGenWithHistory(
        issues,
        [...item.form.formColumns],
        item.form.formHistory,
        item.form.formCounter || ""
      ),
    };
    // console.log("Export properties prepared");

    // Upload the attachment to Jira
    const response = await uploadAttachmentToJira(
      item.scheduler.schedulerKey,
      exportProps
    );
    console.log("Attachment upload response", response);

    return response;
  } catch (e) {
    console.error("Error in autoExporter for", item.form.formName, e);
  }
}
function shouldTriggerAction(
  lastdate: Date | undefined,
  interval: Interval
): boolean {
  // Return true if lastdate is undefined
  if (lastdate === undefined) {
    return true;
  }

  // Get the current date and time
  const now = new Date();

  // Calculate the interval in milliseconds
  let intervalMs: number;
  switch (interval) {
    case "12hours":
      intervalMs = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      break;
    case "24hours":
      intervalMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      break;
    case "1week":
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
      break;
    case "2week":
      intervalMs = 2 * 7 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
      break;
    case "3week":
      intervalMs = 3 * 7 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds
      break;
    default:
      throw new Error("Invalid interval");
  }

  // Calculate the difference in time between now and lastdate
  const timeDifference = now.getTime() - new Date(lastdate).getTime();

  // Return true if the time difference is greater than the interval
  return timeDifference > intervalMs;
}
