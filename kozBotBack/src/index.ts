import mongoose from 'mongoose';
import app from './app';
// import { runVacancyProcess } from './vacancy-process';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    // runVacancyProcess(
    //   "Frontend Developer",
    //   "React, TypeScript, Frontend",
    //   "Нужен разработчик с опытом в React, Next.js и интеграцией с REST API"
    // );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
