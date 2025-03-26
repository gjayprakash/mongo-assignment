import { IResolvers } from "@graphql-tools/utils";
import mongoose, { Types } from "mongoose";
import Order, { IOrder } from "../models/Order";
import Product from "../models/Product";
import { PlaceOrderInput } from "./types";

const mutationResolvers: IResolvers = {
  Mutation: {
    placeOrder: async (
      _,
      { input }: { input: PlaceOrderInput }
    ): Promise<IOrder> => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const { customerId, products } = input;

        const productIds = products.map((p) => p.productId);

        const productDetails = await Product.find({
          _id: { $in: productIds },
        }).session(session);

        if (productDetails.length !== products.length) {
          const missingProductIds = products
            .filter(
              (p) =>
                !productDetails.some((pd) => pd._id.toString() === p.productId)
            )
            .map((p) => p.productId);

          throw new Error(
            `Products not found: ${missingProductIds.join(", ")}`
          );
        }

        let totalAmount = 0;
        const orderProducts = products.map((product) => {
          const productDetail = productDetails.find(
            (p) => p._id.toString() === product.productId
          );

          if (!productDetail) {
            throw new Error(`Product with ID ${product.productId} not found`);
          }

          if (productDetail.stock < product.quantity) {
            throw new Error(
              `Insufficient stock for product ID ${product.productId}`
            );
          }

          const priceAtPurchase = productDetail.price;
          totalAmount += priceAtPurchase * product.quantity;

          return {
            productId: product.productId,
            quantity: product.quantity,
            priceAtPurchase,
          };
        });

        // Bulk update product stocks
        await Product.updateMany(
          { _id: { $in: productIds } },
          { $inc: { stock: -1 } },
          { session }
        );

        // Create the order
        const order = new Order({
          customerId: new Types.ObjectId(customerId),
          products: orderProducts,
          totalAmount,
          orderDate: new Date(),
          status: "completed",
        });

        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        return order;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error placing order:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to place order"
        );
      }
    },
  },
};

export default mutationResolvers;
