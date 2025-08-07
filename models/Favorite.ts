import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  clerkId: string;
  productId: string;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema({
  clerkId: {
    type: String,
    required: true
    // Não usar index: true aqui
  },
  productId: {
    type: String,
    required: true
  },
}, {
  timestamps: true,
});

// Índice composto único para evitar favoritos duplicados
FavoriteSchema.index({ clerkId: 1, productId: 1 }, { unique: true });
// Índice para buscar favoritos de um usuário
FavoriteSchema.index({ clerkId: 1, createdAt: -1 });

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);