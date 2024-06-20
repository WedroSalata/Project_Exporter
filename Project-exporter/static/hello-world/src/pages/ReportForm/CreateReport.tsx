// Core
import React, { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";
// AtlasKit
import Form, { CheckboxField, Field, FormFooter, HelperMessage } from "@atlaskit/form";
import Button, { LoadingButton } from "@atlaskit/button";
import DynamicTable from "@atlaskit/dynamic-table";
import { CheckboxSelect, ValueType } from "@atlaskit/select";
import TextField from "@atlaskit/textfield";
import { Checkbox } from "@atlaskit/checkbox";
import { RadioGroup } from "@atlaskit/radio";
// Helpers
import { IssueFieldsDummy } from "../../utils/constants";
import { GetInfo, validateJQL } from "../../api/jqlAuto";
import { RowGenWithHistory, SelectToTable } from "../../utils/dataParsers";
import { ExportFunction } from "../../utils/exporters";

const initJQLfield = "";
const initialTableHead = {
  cells: [
    {
      key: "Key",
      content: "Key",
    },
    {
      key: "Summary",
      content: "Summary",
    },
  ],
};
const initSelectState: Option[] = [
  {
    label: "Key",
    value: "key",
  },
  {
    label: "Summary",
    value: "summary",
  },
];
const initTableRow: TableRow[] = [
  {
    key: "row1",
    cells: [
      {
        key: "key",
        content: "Empty",
      },
      {
        key: "summary",
        content: "Row",
      },
    ],
  },
];
const RadioOptions = [
  { name: "format", value: "json", label: ".json" },
  { name: "format", value: "csv", label: ".csv" },
  { name: "format", value: "xlsx", label: ".xlsx" },
];

export function CreateReportForm(props: ReportFormProps) {
  const { id, setIsReportOpen, templates, settemplates } = props;

  const initVals: FormProps =
    id === -1
      ? {
          formJql: initJQLfield,
          formHistory: false,
          formName: "Some name",
          formColumns: initSelectState as Option[],
          formCounter: "",
          formFormat: "json",
        }
      : {
          formJql: templates[id].form.formJql,
          formHistory: templates[id].form.formHistory,
          formName: templates[id].form.formName,
          formColumns: templates[id].form.formColumns,
          formCounter: templates[id].form.formCounter,
          formFormat: templates[id].form.formFormat,
        };

  // Loaders
  const [dataLoading, setDataLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [formLoading, setformLoading] = useState(false);
  // Fields
  const [templateName, setTemplateName] = useState<string>(initVals.formName);
  const [JQLfield, setJQLfield] = useState<string>(initVals.formJql);
  const [formHistory, setFormHistory] = useState<boolean>(initVals.formHistory);
  const [counterIds, setCounterIds] = useState<string | undefined>(undefined);
  const [tableHead, setTableHead] = useState<TableHead>(initialTableHead);
  // Report data
  const [apiData, setApiData] = useState<ApiIssue[]>([]);
  const [tableRows, setTableRows] = useState<TableRow[]>(initTableRow);
  const [format, setFormat] = useState<"xlsx" | "json" | "csv">(
    initVals.formFormat
  );
  // Other
  const [JQLfieldVal, setJQLfieldVal] = useState<any>("");
  const [tableHeadSelect, setTableHeadSelect] = useState<
    ValueType<Option, true>
  >(initVals.formColumns);
  // ===============================================

  useEffect(() => {
    if (!!apiData) {
      setTableRows(
        RowGenWithHistory(
          apiData,
          [...tableHeadSelect],
          formHistory,
          counterIds || ""
        )
      );
    }
  }, [apiData, tableHeadSelect]);

  async function checkJQL() {
    const data = await validateJQL(JQLfield);
    setJQLfieldVal(data);
  }
  function getRes() {
    try {
      return JQLfieldVal?.queries[0]?.errors[0];
    } catch (e) {
      // console.log("error", e);
    }
    return "All ok!";
  }
  async function GetData() {
    setDataLoading(true);
    setApiData(await GetInfo(JQLfield, 10));
    setDataLoading(false);
  }

  async function ExportExecution() {
    setExportLoading(true);
    const issues = await GetInfo(JQLfield);
    ExportFunction({
      props: {
        format,
        fileName: templateName,
        tableHead,
        tableRows: RowGenWithHistory(
          issues,
          [...tableHeadSelect],
          formHistory,
          counterIds || ""
        ),
      },
    })();
    setExportLoading(false);
  }

  // function CloseForm(): void {
  //   setIsReportOpen(false);
  // }

  return (
    <>
      <Form
        onSubmit={(formState: any) => {
          setformLoading(true);
          // console.log("FormState", formState);
          const finalForm: FormProps = {
            formColumns: formState["formColumns"],
            formJql: formState["formJql"],
            formName: formState["formName"],
            formHistory: formState["formHistory"],
            formCounter: formState["formCounter"],
            formFormat: formState["formFormat"],
          };
          const newTemplates = [...structuredClone(templates)];
          // console.log(finalForm);
          if (id !== -1) {
            newTemplates[id].form = finalForm;
          } else {
            newTemplates.push({ id: 1, form: finalForm });
          }
          invoke("SaveTemplates", { templates: newTemplates });
          settemplates(newTemplates);
          setIsReportOpen(false);
          setformLoading(false);
        }}
      >
        {({ formProps }) => (
          <form {...formProps}>
            <Field
              name="formName"
              label="Template Name"
              validate={(value) => {
                setTemplateName(value || "");
              }}
              isRequired={true}
              defaultValue={initVals.formName}
            >
              {({ fieldProps }) => (
                <>
                  <TextField {...fieldProps} autoComplete="TemplateName" />
                </>
              )}
            </Field>
            <Field
              name="formJql"
              label="JQL filter"
              isRequired={false}
              validate={(value) => {
                setJQLfield(value || "");
              }}
              defaultValue={initVals.formJql}
            >
              {({ fieldProps }) => (
                <>
                  <TextField {...fieldProps} autoComplete="JQL" />
                  <Button onClick={checkJQL}>Check</Button>
                  <div>{getRes()}</div>
                </>
              )}
            </Field>
            <Field
              name="formCounter"
              label="Counter filter"
              isRequired={false}
              validate={(value) => {
                setCounterIds(value);
                if (value === "" || value === undefined) {
                  return undefined;
                }
                const regex = /^\*$|^(\w+)(,\s*\w+)*$/;
                if (!regex.test(value)) {
                  return "Invalid input format";
                }
                return undefined;
              }}
              defaultValue={initVals.formCounter}
            >
              {({ fieldProps }) => (
                <>
                  <TextField {...fieldProps} autoComplete="counter" />
                  <HelperMessage>
                    Input comma-separated values. You also should add Counter to
                    the columns
                  </HelperMessage>
                </>
              )}
            </Field>
            <CheckboxField name="formHistory" defaultIsChecked={formHistory}>
              {({ fieldProps }) => (
                <Checkbox
                  {...fieldProps}
                  label="Include history"
                  isChecked={formHistory}
                  onChange={(event) => {
                    setFormHistory(event.target.checked);
                  }}
                />
              )}
            </CheckboxField>
            <Field
              name="formColumns"
              label="Columns"
              isRequired={false}
              defaultValue={tableHeadSelect}
            >
              {({ fieldProps }) => (
                <>
                  <CheckboxSelect
                    {...fieldProps}
                    isMulti
                    isClearable
                    options={IssueFieldsDummy.map((item) => ({
                      label: item.name,
                      value: item.id,
                    }))}
                    onChange={(option) => {
                      setTableHead({ cells: SelectToTable(option) });
                      setTableHeadSelect(option);
                    }}
                  />
                </>
              )}
            </Field>
            <Field
              label="Export format"
              name="formFormat"
              defaultValue={format}
              validate={(value) => {
                setFormat(value || "json");
              }}
              isRequired
            >
              {({ fieldProps }: { fieldProps: object }) => (
                <RadioGroup {...fieldProps} options={RadioOptions} />
              )}
            </Field>
            <DynamicTable
              head={tableHead}
              rows={tableRows}
              defaultPage={1}
              rowsPerPage={10}
              emptyView={<h4>The table is empty and this is the empty view</h4>}
            />
            <FormFooter>
              <Button onClick={() => setIsReportOpen(false)}>Cancel</Button>
              <LoadingButton
                isLoading={exportLoading}
                onClick={ExportExecution}
              >
                Export
              </LoadingButton>
              <LoadingButton isLoading={dataLoading} onClick={GetData}>
                Get data
              </LoadingButton>
              <LoadingButton
                isLoading={formLoading}
                type="submit"
                appearance="primary"
              >
                Save Report
              </LoadingButton>
            </FormFooter>
          </form>
        )}
      </Form>
    </>
  );
}
export default CreateReportForm;
