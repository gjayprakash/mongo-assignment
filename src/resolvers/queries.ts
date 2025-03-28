import { IResolvers } from "@graphql-tools/utils";
import Customer from "../models/Customer";
import Order from "../models/Order";
import {
  GetCustomersOutput,
  GetCustomersArgs,
  GetCustomerSpendingArgs,
  GetCustomerSpendingOutput,
  GetSalesAnalyticsArgs,
  GetSalesAnalyticsOutput,
  GetTopSellingProductOutput,
  GetTopSellingProductsArgs,
  GetCustomerOrdersOutput,
  GetCustomerOrdersArgs,
} from "./types";
import Product from "../models/Product";
import { Types } from "mongoose";

const queryResolvers: IResolvers = {
  Query: {
    getCustomerSpending: async (
      _,
      input: GetCustomerSpendingArgs
    ): Promise<GetCustomerSpendingOutput | null> => {
      try {
        const { customerId } = input;

        const result = await Order.aggregate([
          { $match: { customerId, status: "completed" } },
          {
            $lookup: {
              from: "customers",
              localField: "customerId",
              foreignField: "_id",
              as: "customerDetails",
            },
          },
          { $unwind: "$customerDetails" },
          {
            $group: {
              _id: "$customerId",
              customerName: { $first: "$customerDetails.name" },
              totalSpent: { $sum: "$totalAmount" },
              averageOrderValue: { $avg: "$totalAmount" },
              lastOrderDate: { $max: "$orderDate" },
            },
          },
        ]);

        return result.length ? result[0] : null;
      } catch (error) {
        console.error("Error fetching customer spending:", error);
        throw new Error("Failed to fetch customer spending");
      }
    },

    getTopSellingProducts: async (
      _,
      input: GetTopSellingProductsArgs
    ): Promise<GetTopSellingProductOutput[]> => {
      const { limit } = input;
      try {
        return await Order.aggregate([
          { $unwind: "$products" },
          {
            $group: {
              _id: "$products.productId",
              totalSold: { $sum: "$products.quantity" },
            },
          },
          { $sort: { totalSold: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productId: "$_id",
              name: "$productDetails.name",
              totalSold: 1,
            },
          },
        ]);
      } catch (error) {
        console.error("Error fetching top selling products:", error);
        throw new Error("Failed to fetch top selling products");
      }
    },

    getSalesAnalytics: async (
      _,
      input: GetSalesAnalyticsArgs
    ): Promise<GetSalesAnalyticsOutput> => {
      const { startDate, endDate } = input;
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate).toISOString();

      try {
        const result = await Order.aggregate([
          {
            $match: {
              orderDate: {
                $gte: start,
                $lte: end,
              },
              status: "completed",
            },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: "products",
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $group: {
              _id: "$productDetails.category",
              categoryRevenue: {
                $sum: {
                  $multiply: [
                    "$products.quantity",
                    "$products.priceAtPurchase",
                  ],
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: "$categoryRevenue",
              },
              completedOrders: {
                $sum: 1,
              },
              categoryBreakdown: {
                $push: {
                  category: "$_id",
                  revenue: "$categoryRevenue",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalRevenue: 1,
              completedOrders: 1,
              categoryBreakdown: 1,
            },
          },
        ]);

        return result.at(0);
      } catch (error) {
        console.error("Error fetching sales analytics:", error);
        throw new Error("Failed to fetch sales analytics");
      }
    },

    getCustomers: async (
      _,
      input: GetCustomersArgs
    ): Promise<GetCustomersOutput> => {
      const {
        filter = {},
        page = 1,
        limit = 10,
        sortBy = "name",
        sortOrder = "asc",
      } = input;
      try {
        const filterConditions: any = {};

        if (filter.name) {
          filterConditions.name = { $regex: filter.name, $options: "i" };
        }

        if (filter.email) {
          filterConditions.email = { $regex: filter.email, $options: "i" };
        }

        if (filter.minAge !== undefined || filter.maxAge !== undefined) {
          filterConditions.age = {};
          if (filter.minAge !== undefined) {
            filterConditions.age.$gte = filter.minAge;
          }
          if (filter.maxAge !== undefined) {
            filterConditions.age.$lte = filter.maxAge;
          }
        }

        if (filter.location) {
          filterConditions.location = {
            $regex: filter.location,
            $options: "i",
          };
        }

        if (filter.gender) {
          filterConditions.gender = filter.gender;
        }

        const sortDirection = sortOrder === "desc" ? -1 : 1;

        const sortOptions: any = {};
        sortOptions[sortBy] = sortDirection;

        const customers = await Customer.aggregate([
          { $match: filterConditions },
          {
            $lookup: {
              from: "orders",
              localField: "_id",
              foreignField: "customerId",
              as: "orders",
            },
          },
          {
            $addFields: {
              totalSpending: { $sum: "$orders.totalAmount" },
              totalOrders: { $size: "$orders" },
            },
          },
          { $sort: sortOptions },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              name: 1,
              email: 1,
              age: 1,
              location: 1,
              gender: 1,
              totalSpending: 1,
              totalOrders: 1,
            },
          },
        ]);

        const totalCustomers = await Customer.countDocuments(filterConditions);

        return {
          customers,
          pagination: {
            total: totalCustomers,
            page,
            limit,
            totalPages: Math.ceil(totalCustomers / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching customers:", error);
        throw new Error("Failed to fetch customers");
      }
    },

    getCustomerOrders: async (
      _,
      { input }: { input: GetCustomerOrdersArgs }
    ): Promise<GetCustomerOrdersOutput | null> => {
      const { customerId, page = 1, limit = 10 } = input;

      try {
        const orders = await Order.aggregate([
          {
            $match: { customerId },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: "products",
              localField: "products.productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $group: {
              _id: "$_id",
              customerId: { $first: "$customerId" },
              totalAmount: { $first: "$totalAmount" },
              orderDate: { $first: "$orderDate" },
              status: { $first: "$status" },
              products: {
                $push: {
                  productId: "$products.productId",
                  category: "$productDetails.category",
                  quantity: "$products.quantity",
                  priceAtPurchase: "$products.priceAtPurchase",
                  name: "$productDetails.name",
                },
              },
            },
          },
          {
            $sort: { orderDate: -1 },
          },
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ]);

        const totalOrders = await Order.countDocuments({
          customerId,
        });

        return {
          orders: orders.map((order) => ({
            ...order,
            orderId: order._id.toString(),
          })),
          pagination: {
            total: totalOrders,
            page,
            limit,
            totalPages: Math.ceil(totalOrders / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching customer orders:", error);
        throw new Error("Failed to fetch customer orders");
      }
    },
  },
};

export default queryResolvers;
