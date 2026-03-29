"use client";

import { TOASTER_TYPES_ENUM } from "@/src/features/error-handling/enums/snackbars/snackbars.enum";
import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";
import { useCallback } from "react";
import type { ToastClassnames } from "sonner";
import { toast } from "sonner";

type TAppToastClassNames = Pick<
  ToastClassnames,
  "toast" | "title" | "description"
>;

export interface IUseShowAppToastReturn {
  showAppToast: (args: ISnackbarArgs) => void;
}

const TOASTER_TYPE_VALUES = new Set<string>(Object.values(TOASTER_TYPES_ENUM));

/**
 * PRIVATE
 */
const isToasterType = (value: string): value is TOASTER_TYPES_ENUM => {
  return TOASTER_TYPE_VALUES.has(value);
};

const toastShell = "border shadow-md !border-l-4 [&_[data-icon]]:shrink-0";

const typeClassNames: Record<TOASTER_TYPES_ENUM, TAppToastClassNames> = {
  [TOASTER_TYPES_ENUM.SUCCESS]: {
    toast: `${toastShell} !border-emerald-200 !border-l-emerald-600 !bg-emerald-50 dark:!border-emerald-800 dark:!border-l-emerald-400 dark:!bg-emerald-950/55`,
    title: "font-semibold text-emerald-950 dark:text-emerald-50",
    description: "text-emerald-900/85 dark:text-emerald-100/85",
  },
  [TOASTER_TYPES_ENUM.ERROR]: {
    toast: `${toastShell} !border-red-200 !border-l-red-600 !bg-red-50 dark:!border-red-900 dark:!border-l-red-400 dark:!bg-red-950/55`,
    title: "font-semibold text-red-950 dark:text-red-50",
    description: "text-red-900/85 dark:text-red-100/85",
  },
  [TOASTER_TYPES_ENUM.WARNING]: {
    toast: `${toastShell} !border-amber-200 !border-l-amber-500 !bg-amber-50 dark:!border-amber-900 dark:!border-l-amber-400 dark:!bg-amber-950/55`,
    title: "font-semibold text-amber-950 dark:text-amber-50",
    description: "text-amber-900/85 dark:text-amber-100/85",
  },
  [TOASTER_TYPES_ENUM.INFO]: {
    toast: `${toastShell} !border-sky-200 !border-l-sky-600 !bg-sky-50 dark:!border-sky-900 dark:!border-l-sky-400 dark:!bg-sky-950/55`,
    title: "font-semibold text-sky-950 dark:text-sky-50",
    description: "text-sky-900/85 dark:text-sky-100/85",
  },
};

const fallbackClassNames: TAppToastClassNames = {
  toast: `${toastShell} !border-border !border-l-muted-foreground !bg-popover`,
  title: "font-semibold text-foreground",
  description: "text-muted-foreground",
};

/**
 * PRIVATE
 */
const showAppToastImpl = ({ type, title, message }: ISnackbarArgs): void => {
  if (!isToasterType(type)) {
    toast(title, {
      description: message,
      classNames: fallbackClassNames,
    });
    return;
  }

  const toastOptions = {
    description: message,
    classNames: typeClassNames[type],
  };

  switch (type) {
    case TOASTER_TYPES_ENUM.SUCCESS:
      toast.success(title, toastOptions);
      return;
    case TOASTER_TYPES_ENUM.ERROR:
      toast.error(title, toastOptions);
      return;
    case TOASTER_TYPES_ENUM.WARNING:
      toast.warning(title, toastOptions);
      return;
    case TOASTER_TYPES_ENUM.INFO:
      toast.info(title, toastOptions);
      return;
  }
};

export const useShowAppToast = (): IUseShowAppToastReturn => {
  const showAppToast = useCallback((args: ISnackbarArgs) => {
    showAppToastImpl(args);
  }, []);

  return { showAppToast };
};
