import mongoose, { Schema } from 'mongoose';

export interface IProduct extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  slug: string;
  categories: string[];
  league?: string;  // Added league field
  team?: string;    // Added team field
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,
    sizes: [String],
    slug: { type: String, unique: true },
    categories: [String],
    league: String,   // Added league field
    team: String,     // Added team field
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
