interface IssueChangelog {
  startAt: number;
  maxResult: number;
  total: number;
  histories: ChangelogHistory[];
}
interface ChangelogHistory {
  id: string;
  author: ApiUser;
  created: string;
  items: HistoryItem[];
}
interface HistoryItem {
  field: string;
  fieldtype: string;
  fieldId: string;
  from: any;
  fromString: any;
  to: any;
  toString: any;
}

interface ApiIssue {
  expand?: string;
  changelog?: IssueChangelog;
  id: string;
  key: string;
  self: string;
  fields: any;
}

interface ApiIssueField {
  id: string;
  name: string;
  description?: string;
  schema?: Record<string, unknown>;
}

interface TableHead {
  cells: TableCell[];
}
interface TableRow {
  key: string;
  cells: TableCell[];
}

interface TableCell {
  key: string;
  content: any;
}
interface Counter {
  fieldIds: string[];
  quantity: number;
}

interface ReportProps {
  id: number;
  form: FormProps;
  scheduler?: SchedulerProps;
}
interface FormProps {
  formJql: string;
  formHistory: boolean;
  formName: string;
  formColumns: Option[];
  formCounter?: string;
  formFormat: "xlsx" | "json" | "csv";
}
interface Option {
  label: string;
  value: string;
}

type Interval = "12hours" | "24hours" | "1week" | "2week" | "3week";

interface SchedulerProps {
  schedulerKey: string;
  schedulerInterval: Interval;
  schedulerLastRun?: Date;
}
interface ExportProps {
  format: "xlsx" | "json" | "csv";
  fileName: string;
  tableHead: TableHead;
  tableRows: TableRow[];
}

interface ReportFormProps {
  id: number;
  setIsReportOpen: React.Dispatch<React.SetStateAction<boolean>>;
  templates: ReportProps[];
  settemplates: React.Dispatch<React.SetStateAction<ReportProps[]>>;
}
