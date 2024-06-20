interface ApiUser {
  self: string;
  accountId: string;
  accountType: string;
  emailAddress: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  displayName: string;
  active: boolean;
  timeZone: string;
}

interface ApiProject {
  expand: string;
  self: string;
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties: Record<string, unknown>;
  entityId: string;
  uuid: string;
}

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

interface ApiGroup {
  groupId: string;
  name: string;
}

interface ApiSearchIssueResponse {
  expand: string;
  startAt: number;
  maxResult: number;
  total: number;
  issues: ApiIssue[];
}

interface ApiIssueField {
  id: string;
  name: string;
  description?: string;
  schema?: Record<string, unknown>;
}

interface ExportProps {
  format: "xlsx" | "json" | "csv";
  fileName: string;
  tableHead: TableHead;
  tableRows: TableRow[];
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
