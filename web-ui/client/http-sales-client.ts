import { getAuthToken, refreshAccessToken } from "@/lib/auth";
import Axios, {
  type AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

export const SALES_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sannty.in";

// Add retry property to AxiosRequestConfig
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const AXIOS_INSTANCE = Axios.create({
  baseURL: SALES_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store failed requests that need to be retried after token refresh
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];
let isRefreshing = false;

AXIOS_INSTANCE.interceptors.request.use(async function (config) {
  try {
    const token = await getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized error
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is in progress, queue the failed request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return AXIOS_INSTANCE(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const newToken = await refreshAccessToken();

        // Process failed queue with new token
        failedQueue.forEach((request) => {
          request.resolve();
        });
        failedQueue = [];

        // Update the failed request with new token and retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return AXIOS_INSTANCE(originalRequest);
      } catch (refreshError) {
        // Process failed queue with error
        failedQueue.forEach((request) => {
          request.reject(refreshError);
        });
        failedQueue = [];
        if (typeof window !== "undefined") {
          toast.error("Session expired. Please login again.");
        }
        throw new Error("Authentication failed"); // More specific error
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.status === 400) {
      const data = error.response.data as Record<string, string[]>;
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const message = data[firstKey][0];
        if (typeof window !== "undefined") {
          toast.error(message);
        }
      } else {
        if (typeof window !== "undefined") {
          toast.error("Bad Request");
        }
      }
      throw { errorMessage: "Bad Request" };
    }

    if (error.response?.status === 404 || error.response?.status === 405) {
      if (typeof window !== "undefined") {
        toast.error("Not Found");
      }
      throw { errorMessage: "Not Found" };
    }

    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        toast.error("Access forbidden");
      }
      throw { errorMessage: "Access forbidden" };
    }

    if (error.message === "Network Error") {
      if (typeof window !== "undefined") {
        toast.error("Network Error");
      }
      throw { errorMessage: "Network Error" };
    }

    return Promise.reject(error);
  }
);

export const httpSalesClient = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  const { data } = await AXIOS_INSTANCE(config);
  return data;
};

export default httpSalesClient;
