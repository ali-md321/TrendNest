const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { errorMiddleware } = require('./middlewares/errorMiddleware');
const userRouter = require('./routers/userRouter');
const productRouter = require('./routers/productRouter');
const orderRouter = require('./routers/orderRouter');
const sellerRouter = require('./routers/sellerRouter');
const delivererRouter = require('./routers/delivererRouter');
const chatRouter= require('./routers/AIChatRouter');
const pushRouter = require('./routers/pushRouter');
const notificationRouter = require('./routers/notificationRouter');

app.set('trust proxy', 1)
app.use(helmet());
app.use(cors({
    origin : [process.env.FRONTEND_URI,"http://localhost:5173/"],
    credentials: true 
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({extended : true}));
app.use(rateLimit({ windowMs: 60*1000, max: 60 }));

app.get("/test",(req,res)=> {
    res.send({message : "Working!.."})
})
app.use("/api", userRouter);
app.use("/api", productRouter);
app.use("/api", orderRouter);
app.use("/api", sellerRouter);
app.use("/api", sellerRouter);
app.use("/api", delivererRouter);
app.use("/api", chatRouter);
app.use("/api", notificationRouter);
app.use("/api", pushRouter);

app.use(errorMiddleware);
module.exports = app;