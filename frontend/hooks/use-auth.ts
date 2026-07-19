import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/services/api-client";

export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`);
      router.push("/forms");
    },
    onError: (err: ApiError) => toast.error(err.message || "Couldn't log you in"),
  });
}

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setSession(data.user, data.access_token);
      toast.success("Account created — welcome to Formly");
      router.push("/forms");
    },
    onError: (err: ApiError) => toast.error(err.message || "Couldn't create your account"),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Clear local session even if the network call fails — the user
      // clicked logout, so the UI must reflect that regardless.
      clearSession();
      queryClient.clear();
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onError: (err: ApiError) => toast.error(err.message || "Something went wrong"),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success("Password updated — sign in with your new password");
      router.push("/login");
    },
    onError: (err: ApiError) => toast.error(err.message || "That reset link is invalid or expired"),
  });
}
