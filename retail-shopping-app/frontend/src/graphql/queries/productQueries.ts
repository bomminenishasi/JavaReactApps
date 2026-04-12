import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilterInput) {
    products(filter: $filter) {
      content {
        id
        sku
        name
        description
        price
        originalPrice
        brand
        images
        rating
        reviewCount
        inStock
        stockQuantity
        tags
        category {
          id
          name
          slug
        }
      }
      totalElements
      totalPages
      currentPage
      pageSize
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      sku
      name
      description
      price
      originalPrice
      brand
      images
      rating
      reviewCount
      inStock
      stockQuantity
      tags
      category {
        id
        name
        slug
        parentId
      }
      createdAt
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      parentId
      imageUrl
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $page: Int, $size: Int) {
    searchProducts(query: $query, page: $page, size: $size) {
      content {
        id
        sku
        name
        price
        originalPrice
        brand
        images
        rating
        reviewCount
        inStock
        category {
          id
          name
        }
      }
      totalElements
      totalPages
      currentPage
    }
  }
`;
