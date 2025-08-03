import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(process.env.MONGODB_URI!, {
    dbName: 'vestiario',
  });
};
