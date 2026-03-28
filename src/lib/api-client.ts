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
      if (status === 401) {
        window.location.href = "/login";
      }
      const message = error.response?.data?.error ?? error.message;
      const code = error.response?.data?.code ?? "";
      return Promise.reject(toast.error(`Server error: [${code}] ${message}`));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
