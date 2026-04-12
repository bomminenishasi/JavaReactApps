import { gql } from '@apollo/client';

export const ORDER_STATUS_UPDATED = gql`
  subscription OnOrderStatusUpdated($orderId: ID!) {
    orderStatusUpdated(orderId: $orderId) {
      id
      orderNumber
      status
      paymentStatus
      updatedAt
      estimatedDelivery
    }
  }
`;

export const CART_UPDATED = gql`
  subscription OnCartUpdated($userId: ID!) {
    cartUpdated(userId: $userId) {
      id
      itemCount
      total
    }
  }
`;
