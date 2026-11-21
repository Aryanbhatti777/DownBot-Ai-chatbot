import axios from "axios";

const client = axios.create({
  baseURL: "/api/v1/auth",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

function unwrap(response) {
  return response.data.data;
}

export const authApi = {
  async register(fields) {
    return unwrap(await client.post("/register", fields));
  },
  async login(fields) {
    return unwrap(await client.post("/login", fields));
  },
  async refresh() {
    return unwrap(await client.post("/refresh"));
  },
  async logout() {
    return unwrap(await client.post("/logout"));
  },
  async me(accessToken) {
    return unwrap(await client.get("/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }));
  }
};

export function getApiError(error) {
  return error.response?.data?.message ?? "Something went wrong. Please try again.";
}
