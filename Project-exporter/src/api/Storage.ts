import { storage } from "@forge/api";

export function SaveTemplates(templates: any) {
  return storage.set("Templates", templates);
}
export function GetTemplates() {
  return storage.get("Templates");
}
