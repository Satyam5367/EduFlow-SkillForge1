import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // single course checkout
  const [coupon, setCoupon] = useState('');

  const addToCart = (course) => setCart(course);
  const clearCart = () => { setCart(null); setCoupon(''); };

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart, coupon, setCoupon }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
