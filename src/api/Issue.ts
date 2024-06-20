import api, { route } from "@forge/api";

interface BodyData {
  jql: string;
  maxResults: number;
  startAt: number;
  expand: string[];
}
export async function getIssues(
  searchJQL: string,
  totalRequest?: number,
  startAtInit: number = 0
) {
  const maxResultsInit = 100;
  const maxResultsPerRequest = maxResultsInit;
  let startAt = startAtInit;
  let allIssues: ApiIssue[] = [];
  try {
    while (true) {
      if (totalRequest && allIssues.length >= totalRequest) {
        break;
      }
      const bodyData: BodyData = {
        jql: searchJQL,
        maxResults: maxResultsInit,
        startAt,
        expand: ["changelog"],
      };

      console.log("bodyData", bodyData);
      const res = await api.asApp().requestJira(route`/rest/api/3/search`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const result: ApiSearchIssueResponse = await res.json();
      // console.log("result", result);

      if (result.issues.length === 0) {
        break;
      }
      allIssues = [...allIssues, ...result.issues];
      startAt += maxResultsPerRequest;
      if (maxResultsPerRequest > result.issues.length) {
        break;
      }
      if (startAt >= result.total) {
        break;
      }
    }
    return allIssues;
  } catch (error) {
    console.error(`Error getAllIssues:`, error);
    return error;
  }
}
