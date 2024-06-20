export function SelectToTable(options: Option[]): TableCell[] {
  if (!options) {
    return [];
  }
  return options.map((item) => ({
    key: item.value,
    content: item.label,
  }));
}
export const RowGenWithHistory = (
  issues: ApiIssue[],
  columns: Option[],
  formHistory: boolean,
  counterIds: string
): TableRow[] => {
  // Generate columns set
  const columnsIndexes = columns.map((column) => column.value);

  const res = issues.flatMap((apiIssue, index) => {
    const issueWithCounter = AddCounter(apiIssue, counterIds);

    // Parse issue to issue array, if it has changelog
    const issueArray = formHistory
      ? issueToArray(issueWithCounter, columnsIndexes, formHistory)
      : [issueWithCounter];

    return issueArray.map((issueFromArr, index1) => {
      const cells: TableCell[] = GenerateCell(columns, issueFromArr);
      return {
        key: `row${index}${index1}`,
        cells,
      };
    });
  });

  return res;
};

function AddCounter(issue: ApiIssue, counterIds: string): ApiIssue {
  const counterArr = parseStringToArray(counterIds);
  let counterVal = 0;
  if (issue.changelog !== undefined && issue.changelog?.total > 0) {
    // Potential promblem if in the history would be a few items with the same fieldId
    for (const history of issue.changelog.histories) {
      for (const item of history.items) {
        if (counterArr?.includes(item.fieldId)) {
          counterVal++;
        }
      }
    }
  }
  return {
    ...structuredClone(issue),
    fields: {
      ...structuredClone(issue.fields),
      counter: `${counterVal}`,
    },
  };
}

const issueToArray = (
  issue: ApiIssue,
  columnsIndexes: string[],
  formHistory: boolean
): ApiIssue[] => {
  const exitValue = structuredClone(issue);
  if (!issue.changelog || issue.changelog.total === 0) {
    return [exitValue];
  }

  // If all of fields, that was changed in issue, wasn't present in requested field's.
  const changeOutofArr = issue.changelog.histories.every((history) =>
    history.items.every((item) => !columnsIndexes.includes(item.fieldId))
  );
  if (!formHistory || changeOutofArr) {
    return [exitValue];
  }

  // Flat changelog creation
  const historyArray = issue.changelog.histories
    .flatMap((history) =>
      history.items.map((item) => ({
        id: history.id,
        created: history.created,
        author: history.author,
        ...item,
      }))
    )
    // Excluding changes to fields that were not requested
    .filter((hist) => columnsIndexes.includes(hist.fieldId));

  // Cloning current issue for each log entry
  return historyArray.map((obj) => {
    const fields = structuredClone(issue.fields);
    fields[obj.fieldId] = obj.fromString;
    return { ...structuredClone(issue), changelog: undefined, fields };
  });
};

function GenerateCell(columnsArray: Option[], issue: ApiIssue): TableCell[] {
  return columnsArray.map((column) => ({
    key: column.label,
    content: column.value === "key" ? issue.key : issue.fields[column.value],
  }));
}

export function parseStringToArray(input: string | undefined): string[] {
  const regex = /^\*$|^(\w+)(,\s*\w+)*$/;

  if (input === undefined || !regex.test(input)) {
    return [];
  }

  if (input === "*") {
    return ["*"];
  }

  return input.split(",").map((item) => item.trim());
}

// Helper function to convert array of objects to CSV string
export function arrayToCSV(data: Array<Record<string, any>>): string {
  if (data.length === 0) return "";

  // Extract keys from the first object to form the header
  const keys = Object.keys(data[0]);

  // Create the CSV header row
  const csvHeader = keys.map((key) => `"${key}"`).join(",");

  // Create the CSV data rows
  const csvRows = data.map((row) => {
    return keys.map((key) => `"${row[key]}"`).join(",");
  });

  // Combine the header and rows
  const csvString = [csvHeader, ...csvRows].join("\n");

  return csvString;
}
