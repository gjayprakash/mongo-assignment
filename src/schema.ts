import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Query {
    hello: String
  }

  type CustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: String!
  }

  type TopProduct {
    productId: ID!
    name: String!
    totalSold: Int!
  }

  type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [CategoryRevenue!]!
  }

  type CategoryRevenue {
    category: String!
    revenue: Float!
  }

  type Customer {
    _id: ID!
    name: String!
    email: String!
    age: Int!
    location: String!
    gender: String!
    totalSpending: Float
    totalOrders: Int
  }

  input CustomerFilterInput {
    name: String
    email: String
    minAge: Int
    maxAge: Int
    location: String
    gender: String
  }

  type PaginationInfo {
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type CustomerQueryResult {
    customers: [Customer!]!
    pagination: PaginationInfo!
  }

  type Query {
    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [TopProduct]
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
    getCustomers(
      filter: CustomerFilterInput
      page: Int
      limit: Int
      sortBy: String
      sortOrder: String
    ): CustomerQueryResult!
  }

  type Mutation {
    placeOrder(input: PlaceOrderInput!): Order!
  }

  input PlaceOrderInput {
    customerId: ID!
    products: [ProductOrderInput!]!
  }

  input ProductOrderInput {
    productId: ID!
    quantity: Int!
  }

  type Order {
    id: ID!
    customerId: ID!
    products: [ProductOrder!]!
    totalAmount: Float!
    orderDate: String!
    status: String!
  }

  type ProductOrder {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }
`;

export default typeDefs;
