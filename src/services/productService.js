import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/product`;

export const getProducts = async (params = {}) => {
  const response = await axios.get(`${API_URL}/all`, { params });
  return response.data;
};

export const createProduct = async (data) => {
  const res = await axios.post(`${API_URL}/create`, data);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${API_URL}/fetch/${id}`);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const response = await axios.put(`${API_URL}/update/${id}`, data);
  return response.data;
};

export const getAttributeFilters = () => {
  return axios
    .get(`${API_URL}/attribute`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return [];
    });
};
