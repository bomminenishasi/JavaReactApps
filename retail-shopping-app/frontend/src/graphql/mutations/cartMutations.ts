import { gql } from '@apollo/client';

export const ADD_TO_CART = gql`
  mutation AddToCart($userId: ID!, $productId: ID!, $quantity: Int!) {
    addToCart(userId: $userId, productId: $productId, quantity: $quantity) {
      id
      items {
        id
        quantity
        unitPrice
        totalPrice
        product {
          id
          name
          images
          price
        }
      }
      total
      itemCount
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($cartItemId: ID!, $quantity: Int!) {
    updateCartItem(cartItemId: $cartItemId, quantity: $quantity) {
      id
      items {
        id
        quantity
        unitPrice
        totalPrice
        product {
          id
          name
          images
          price
        }
      }
      subtotal
      tax
      total
      itemCount
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartItemId: ID!) {
    removeFromCart(cartItemId: $cartItemId) {
      id
      items {
        id
        quantity
        totalPrice
        product { id name }
      }
      total
      itemCount
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($userId: ID!) {
    clearCart(userId: $userId) {
      id
      items {
        id
      }
      total
      itemCount
    }
  }
`;
