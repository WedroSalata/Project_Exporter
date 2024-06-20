import api, { route, storage } from "@forge/api";

export async function validateJQL(request: string) {
  const bodyData = {
    queries: [request],
  };

  const res = await api
    .asUser()
    .requestJira(route`/rest/api/3/jql/parse?validation=strict`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

  return await res.json();
}
