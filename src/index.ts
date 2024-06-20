import Resolver from "@forge/resolver";
import { getIssues } from "./api/Issue";
import { validateJQL } from "./api/Jql";
import { GetTemplates, SaveTemplates } from "./api/Storage";
import { ExportFunction, uploadAttachmentToJira } from "./api/Attachment";
import { scheduleCheck } from "./api/Scheduler";

const resolver = new Resolver();

//NOTE - always check for:
// 25s timeout
// 400 response

resolver.define("getIssues", async ({ payload }) => {
  console.log("invoke", payload);

  return await getIssues(
    payload.searchJQL,
    payload.maxResults ?? undefined,
    payload.startAt ?? undefined
  );
});

resolver.define("validateJQL", async ({ payload }) => {
  return await validateJQL(payload.jql);
});

resolver.define("GetTemplates", async ({ payload }) => {
  return await GetTemplates();
});
resolver.define("SaveTemplates", async ({ payload }) => {
  return await SaveTemplates(payload.templates);
});
resolver.define("SendEmail", async ({ payload }) => {
  return uploadAttachmentToJira(payload.issueId, payload.exportProps);
  // return await emailApiRequest(
  //   payload.body,
  //   payload.subject,
  //   payload.textBody,
  //   payload.issueKey
  // );
  // return await sendEmailWithAttachment(payload.email, payload.exportProps);
});

export const schedulerCheck = scheduleCheck;

export const handler = resolver.getDefinitions();
