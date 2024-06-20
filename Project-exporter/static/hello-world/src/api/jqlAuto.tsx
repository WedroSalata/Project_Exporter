import { invoke, requestJira } from "@forge/bridge";

export async function validateJQL(request: string) {
  const bodyData = {
    queries: [request],
  };

  const res = await requestJira(`/rest/api/3/jql/parse?validation=strict`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });

  return await res.json();
}
export async function GetInfo(searchJQL: string, maxResults?: number) {
  try {
    const res: ApiIssue[] = await invoke("getIssues", {
      searchJQL,
      maxResults,
    });

    return res;
  } catch (e) {
    console.log("Error in 'getIssues': ", e);
    return [];
  }
}
