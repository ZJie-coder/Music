import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import morgan from 'morgan';

dotenv.config({processEnv: process.env});
console.log(process.env.SERVER_PORT)

const app = express();
const port = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(morgan('dev')); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;