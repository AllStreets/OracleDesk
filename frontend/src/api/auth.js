import client from "./client";

export async function signup(email, password) {
  const { data } = await client.post("/api/auth/signup", { email, password });
  localStorage.setItem("oracle_token", data.access_token);
  return data;
}

export async function login(email, password) {
  const { data } = await client.post("/api/auth/login", { email, password });
  localStorage.setItem("oracle_token", data.access_token);
  return data;
}
