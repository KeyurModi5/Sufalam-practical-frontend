import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/product`;

const showErrorToast = (error) => {
  const status = error?.response?.status;
  if (status === 400 || status === 500 || status === 401) {
    toast.error(error?.response?.data?.message || "Something went wrong");
  }
};

export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/all`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    showErrorToast(error);
    throw error;
  }
};

export const createProduct = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    showErrorToast(error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/fetch/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product by ID (${id}):`, error);
    showErrorToast(error);
    throw error;
  }
};

export const updateProduct = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ID (${id}):`, error);
    showErrorToast(error);
    throw error;
  }
};

export const getAttributeFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/attribute`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attribute filters:", error);
    return [];
  }
};
