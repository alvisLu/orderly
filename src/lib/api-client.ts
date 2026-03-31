import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: "/api",
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) {
        toast.error("權限不足，請使用管理員帳號登入");
        window.location.href = "/login";
      }
      if (status === 400) {
        const message = error.response?.data?.error ?? "請求錯誤";
        const code = error.response?.data?.code ?? "";

        if (message === "Validation failed") {
          const ValidationErrorMsg = `Validation error: [${message}] ${error.response?.data?.fields.map((f: any) => `${f.path}: ${f.message}`).join(", ")}`;
          console.error(ValidationErrorMsg);
          return Promise.reject(toast.error(ValidationErrorMsg));
        }

        const RequestErrorMsg = `Request error: [${code}] ${message}`;
        console.error(RequestErrorMsg);
        return Promise.reject(toast.error(RequestErrorMsg));
      }
      if (status === 401) {
        window.location.href = "/login";
      }
      const message = error.response?.data?.error ?? error.message;
      const code = error.response?.data?.code ?? "";

      const ServerErrorMsg = `Server error: [${code}] ${message}`;
      console.error(ServerErrorMsg);
      return Promise.reject(toast.error(ServerErrorMsg));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
