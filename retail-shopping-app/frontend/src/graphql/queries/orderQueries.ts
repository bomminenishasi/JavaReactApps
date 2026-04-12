import { gql } from '@apollo/client';

export const GET_ORDERS = gql`
  query GetOrders($userId: ID!) {
    orders(userId: $userId) {
      id
      orderNumber
      status
      paymentStatus
      total
      itemCount
      createdAt
      estimatedDelivery
      items {
        id
        productName
        quantity
        unitPrice
        totalPrice
      }
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      userId
      status
      paymentStatus
      subtotal
      tax
      shippingCost
      discount
      total
      estimatedDelivery
      createdAt
      updatedAt
      items {
        id
        productId
        productName
        sku
        quantity
        unitPrice
        totalPrice
      }
      shippingAddress {
        street
        city
        state
        zipCode
        country
      }
      billingAddress {
        street
        city
        state
        zipCode
        country
      }
    }
  }
`;
