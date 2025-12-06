import { RequestError, ResponseType, get } from "positron-components/backend";

export const dummy = async () => {
  let res = await get<string>("/api/test", ResponseType.Text);
  if (!Object.values(RequestError).includes(res as RequestError)) {
    return res;
  }
};
