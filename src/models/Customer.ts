import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  age: number;
  location: string;
  gender: string;
}

const customerSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  location: { type: String, required: true },
  gender: { type: String, required: true },
});

customerSchema.index({ name: 1 });
customerSchema.index({ location: 1 });
customerSchema.index({ age: 1 });
customerSchema.index({ name: 1, location: 1 });

export default mongoose.model<ICustomer>("Customer", customerSchema);
