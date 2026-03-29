"use client";

import type { IGetMeResponseDto } from "@/src/DTOs/me/get-me-response.dto";
import { useGlobalErrorHandlers } from "@/src/hooks/api/_shared/use-global-error-handlers.hook";
import type { IUserMe } from "@/src/interfaces/user-me.interface";
import { fetchApiJson } from "@/src/utils/fetch-api-json.util";
import { useQuery } from "@tanstack/react-query";
import { userQueryKeys } from "./user.query-keys.const";

interface IUseMeQueryProps {
  initialUser?: IUserMe | null;
}

const fetchMeUser = async (): Promise<IUserMe | null> => {
  const data = await fetchApiJson<IGetMeResponseDto>({ path: "/api/me" });

  return data.user;
};

export const useMeQuery = ({ initialUser }: IUseMeQueryProps = {}) => {
  const { wrapFunction } = useGlobalErrorHandlers();

  return useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: () => wrapFunction(fetchMeUser),
    initialData: initialUser ?? null,
  });
};
