"use client";

import type { IGetMeResponseDto } from "@/src/DTOs/me/get-me-response.dto";
import { useAppQuery } from "@/src/hooks/api/_shared/use-app-query.hook";
import type { IUserMe } from "@/src/interfaces/user-me.interface";
import { fetchApiJson } from "@/src/utils/fetch-api-json.util";
import { userQueryKeys } from "./user.query-keys.const";

interface IUseMeQueryProps {
  initialUser?: IUserMe | null;
}

const fetchMeUser = async (): Promise<IUserMe | null> => {
  const data = await fetchApiJson<IGetMeResponseDto>({ path: "/api/me" });

  return data.user;
};

export const useMeQuery = ({ initialUser }: IUseMeQueryProps = {}) => {
  return useAppQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchMeUser,
    initialData: initialUser ?? null,
  });
};
