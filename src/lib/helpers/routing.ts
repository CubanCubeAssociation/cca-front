import { DOMAIN } from "@constants";
import { isFinite } from "./math";

interface ContestParams {
  category: string;
  time: string | number;
  username: string;
  type: "single" | "avg";
}

export function contestNameToLink(name: string, params?: Partial<ContestParams>, admin = false) {
  const pm: Partial<ContestParams> = {};

  if (params?.category) pm.category = params.category;
  if (params?.time) pm.time = !isFinite(+params.time) ? "DNF" : params.time + "";
  if (params?.username) pm.username = params.username;
  if (params?.type) pm.type = params.type;
  if (pm.type === "single") delete pm.type;

  let queryString = new URLSearchParams(pm as any).toString();

  if (queryString) {
    queryString = "?" + queryString;
  }

  return `${admin ? DOMAIN + "/admin/contest" : "/contests"}/${name.replace(/ /g, "-")}${queryString}`;
}

export function contestParamName(paramName: string) {
  return paramName.replace(/-/g, " ");
}
