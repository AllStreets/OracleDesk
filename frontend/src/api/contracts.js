import client from "./client";

export const getContracts = () => client.get("/api/contracts").then(r => r.data);
export const getContract = (id) => client.get(`/api/contracts/${id}`).then(r => r.data);
export const triggerAnalysis = (id) => client.post(`/api/contracts/${id}/analyze`).then(r => r.data);
export const getHistory = (id) => client.get(`/api/contracts/${id}/history`).then(r => r.data);
export const getDashboard = () => client.get("/api/dashboard").then(r => r.data);
