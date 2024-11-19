import { getContests } from "@helpers/API";
import type { CONTEST_RESULT } from "@interfaces";
import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ url }): Promise<CONTEST_RESULT | null> => {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "") || 1);
  console.log("PAGE: ", page);
  return await getContests(page).then(c => {
    if (!c) return null;
    return c;
  });
};
