export const SHOP_DETAILS = `query fetchShopDetails {
  shop {
    id
  }
}`;

export const QUERY_PRODUCT = `query GetProducts ($input: Int, $query: String!) {
  products(first: $input, query: $query) {
    edges {
      node {
        id
        title
        vendor
        totalInventory
        status
        legacyResourceId
        featuredImage {
          id
          url
        }
      }
      cursor
    }
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}`;
export const QUERY_NEXT_ORDERS = `query GetProducts($first: Int, $after: String, $query: String!) {
  products(first: $first, after: $after,  query: $query) {
    edges {
      node {
        id
        title
        vendor
        totalInventory
        status
        legacyResourceId
          featuredImage {
          id
          url
        }
        
      }
      cursor
    }
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}`;

export const QUERY_PREVIOUS_ORDERS = `query GetProducts($last: Int, $before: String, $query: String!) {
  products(last: $last, before: $before, query: $query) {
    edges {
      node {
        id
        title
        vendor
        totalInventory
        status
        legacyResourceId
        featuredImage {
          id
          url
        }
      }
      cursor
    }
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}`;
