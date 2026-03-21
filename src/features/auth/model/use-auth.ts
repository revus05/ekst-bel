"use client";

import { useLocale } from "app/providers/locale-provider";
import { logoutUser } from "entities/user/api/auth-api";
import { clearUser, selectCurrentUser } from "entities/user/model/user-slice";
import { useRouter } from "next/navigation";
import { normalizeApiError } from "shared/api/contracts";
import { getMessages } from "shared/lib/i18n/messages";
import { useAppDispatch, useAppSelector } from "shared/lib/store/hooks";
import { toast } from "shared/lib/toast";

function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { locale } = useLocale();
  const t = getMessages(locale);
  const user = useAppSelector(selectCurrentUser);

  async function logout() {
    try {
      await logoutUser();
      dispatch(clearUser());
      toast.success(t.auth.logoutSuccess);
      router.push("/login");
      router.refresh();
    } catch (error) {
      const normalizedError = normalizeApiError(error, t.auth.logoutError);
      toast.error(normalizedError.message);
    }
  }

  return {
    isAuthenticated: Boolean(user),
    logout,
    user,
  };
}

export { useAuth };
