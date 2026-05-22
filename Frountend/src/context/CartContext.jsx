import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";

import {
  getCartAPI,
  addToCartAPI,
  removeFromCartAPI,
} from "../services/cartAPI";

const CartContext = createContext();

export const CartProvider = ({
  children,
}) => {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);

  const fetchCart = async (authToken) => {
    const currentToken = authToken || token;
    if (!currentToken) {
      setCart([]);
      return;
    }

    try {
      const response = await getCartAPI(currentToken);
      setCart(response.cart?.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = async (
    courseId
  ) => {
    try {
      const response =
        await addToCartAPI(
          courseId,
          token
        );

      const newCart = response.cart?.items || [];
      setCart(newCart);
      return newCart;
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add course to cart";

      if (typeof errorMessage === "string" && errorMessage.toLowerCase().includes("already in cart")) {
        await fetchCart();
      }

      throw error;
    }
  };

  const removeFromCart = async (
    courseId
  ) => {
    try {
      const response =
        await removeFromCartAPI(
          courseId,
          token
        );

      setCart(response.cart?.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () =>
  useContext(CartContext);