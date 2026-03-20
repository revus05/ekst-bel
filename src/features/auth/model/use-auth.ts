"use client";

import { logoutUser } from "entities/user/api/auth-api";
import { clearUser, selectCurrentUser } from "entities/user/model/user-slice";
import { useRouter } from "next/navigation";
import { normalizeApiError } from "shared/api/contracts";
import { useAppDispatch, useAppSelector } from "shared/lib/store/hooks";
import { toast } from "shared/lib/toast";

function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);

  async function logout() {
    try {
      await logoutUser();
      dispatch(clearUser());
      toast.success("Вы вышли из аккаунта.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      const normalizedError = normalizeApiError(
        error,
        "Не удалось выйти из аккаунта.",
      );
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
