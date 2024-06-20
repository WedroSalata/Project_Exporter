import React, { useState } from "react";
import { invoke } from "@forge/bridge";
import Form, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormFooter,
  FormHeader,
  FormSection,
  HelperMessage,
  RequiredAsterisk,
  ValidMessage,
} from "@atlaskit/form";
import Button, { LoadingButton } from "@atlaskit/button";
import TextField from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import { SingleValue } from "react-select";
import { RowGenWithHistory, SelectToTable } from "../../utils/dataParsers";
import { GetInfo } from "../../api/jqlAuto";

interface ScheduleFormProps {
  id: number;
  setIsScheduleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  templates: ReportProps[];
  settemplates: React.Dispatch<React.SetStateAction<ReportProps[]>>;
}

interface IntervalOption {
  label: string;
  value: Interval;
}
const intervalOptions: IntervalOption[] = [
  {
    label: "12 Hours",
    value: "12hours",
  },
  {
    label: "24 Hours",
    value: "24hours",
  },
  {
    label: "1 Week",
    value: "1week",
  },
  {
    label: "2 Week",
    value: "2week",
  },
  {
    label: "3 Week",
    value: "3week",
  },
];
export function ReportScheduler(props: ScheduleFormProps) {
  const { id, setIsScheduleOpen, templates, settemplates } = props;

  const template = structuredClone(templates[id]);

  let initVals: SchedulerProps = {
    schedulerKey: "",
    schedulerInterval: "12hours",
  };
  if (template.scheduler !== undefined) {
    initVals = {
      schedulerKey: template.scheduler.schedulerKey,
      schedulerInterval: template.scheduler.schedulerInterval,
    };
  }
  console.log("initVals", template);

  const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
  const [issueKey, setIssueKey] = useState<string>(initVals.schedulerKey);
  // const [interval, setInterval] = useState<string>(initVals.schedulerInterval);
  const [intervalSelect, setIntervalSelect] = useState<SingleValue<Option>>(
    intervalOptions.find(
      (option) => option.value === initVals.schedulerInterval
    ) || null
  );

  function CloseForm(): void {
    setIsScheduleOpen(false);
  }
  async function SendEmail() {
    const issues = await GetInfo(template.form.formJql);
    const exportProps: ExportProps = {
      format: template.form.formFormat,
      fileName: template.form.formName,
      tableHead: { cells: SelectToTable(template.form.formColumns) },
      tableRows: RowGenWithHistory(
        issues,
        [...template.form.formColumns],
        template.form.formHistory,
        template.form.formCounter || ""
      ),
    };

    try {
      const response: any = await invoke("SendEmail", {
        issueId: issueKey,
        exportProps,
      });

      if (response.message === "Email sent successfully") {
        console.log("Email sent successfully");
      } else {
        console.error("Error sending email", response);
      }
    } catch (error) {
      console.error("Error sending email", error);
    }
  }

  return (
    <>
      <Form
        onSubmit={(formState: any) => {
          setScheduleLoading(true);
          console.log("formState", formState);

          const newTemplates = structuredClone(templates);
          newTemplates[id].scheduler = {
            schedulerInterval: formState["schedulerInterval"].value,
            schedulerKey: formState["schedulerKey"],
          };
          console.log("newTemplate", newTemplates[id].scheduler);

          invoke("SaveTemplates", { templates: newTemplates });
          settemplates(newTemplates);
          setScheduleLoading(false);
          setIsScheduleOpen(false);
        }}
      >
        {({ formProps }) => (
          <form {...formProps}>
            <Field
              name="schedulerKey"
              label="Key of issue for report attaching"
              validate={(value) => {
                setIssueKey(value || "");
              }}
              isRequired={true}
              defaultValue={issueKey}
            >
              {({ fieldProps }) => (
                <>
                  <TextField {...fieldProps} />
                </>
              )}
            </Field>

            <Field
              name="schedulerInterval"
              label="Report interval"
              isRequired={false}
              defaultValue={intervalSelect}
            >
              {({ fieldProps }) => (
                <>
                  <Select
                    {...fieldProps}
                    options={intervalOptions}
                    isClearable
                    onChange={(option) => {
                      setIntervalSelect(option);
                    }}
                  />
                </>
              )}
            </Field>
            <FormFooter>
              <Button onClick={CloseForm}>Cancel</Button>
              <Button
                appearance="danger"
                onClick={() => {
                  template.scheduler = undefined;
                  const templatesCopy = structuredClone(templates);
                  templatesCopy[id] = template;
                  settemplates(templatesCopy);
                  setIsScheduleOpen(false);
                }}
              >
                Remove Schedule
              </Button>

              <Button onClick={() => SendEmail()}>Execute now</Button>
              <LoadingButton
                isLoading={scheduleLoading}
                type="submit"
                appearance="primary"
              >
                Save Template
              </LoadingButton>
            </FormFooter>
          </form>
        )}
      </Form>
    </>
  );
}

function parseStringToArray(input: string | undefined): string[] {
  const regex = /^\*$|^(\w+)(,\s*\w+)*$/;

  if (input === undefined || !regex.test(input)) {
    return [];
  }

  if (input === "*") {
    return ["*"];
  }

  return input.split(",").map((item) => item.trim());
}
