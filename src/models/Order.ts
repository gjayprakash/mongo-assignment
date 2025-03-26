import mongoose, { Document, Schema } from "mongoose";

interface IProductOrder {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  products: IProductOrder[];
  totalAmount: number;
  orderDate: Date;
  status: string;
}

const productOrderSchema: Schema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
});

const orderSchema: Schema = new Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  products: { type: [productOrderSchema], required: true },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, required: true },
  status: { type: String, required: true },
});

orderSchema.index({ customerId: 1 });
orderSchema.index({ orderDate: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customerId: 1, orderDate: 1 });

export default mongoose.model<IOrder>("Order", orderSchema);
