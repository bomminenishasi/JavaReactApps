import { gql } from '@apollo/client';

export const GET_CART = gql`
  query GetCart($userId: ID!) {
    cart(userId: $userId) {
      id
      userId
      items {
        id
        quantity
        unitPrice
        totalPrice
        product {
          id
          name
          sku
          price
          images
          inStock
          stockQuantity
        }
      }
      subtotal
      tax
      discount
      total
      itemCount
    }
  }
`;
