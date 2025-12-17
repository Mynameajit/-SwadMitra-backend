import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log()
        await mongoose.connect(process.env.MONGO_URI,{
            dbName:"SwadMitra"
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};
export default connectDB;