import axios from "axios";
import { resolveApiBaseUrl } from "./apiBase.js";

const API_BASE_URL = resolveApiBaseUrl();
const BASE_URL = `${API_BASE_URL}/student-api/cart`;

export const getCartAPI = async (token) => {
  const response = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const addToCartAPI = async (
  courseId,
  token
) => {
  const response = await axios.post(
    `${BASE_URL}/${courseId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const removeFromCartAPI = async (
  courseId,
  token
) => {
  const response = await axios.delete(
    `${BASE_URL}/${courseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};