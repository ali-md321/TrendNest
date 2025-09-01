// if(process.env.NODE_ENV !== "production"){
//   require('dotenv').config(); 
// }
require('dotenv').config();
const app = require("./Backend/app");
const connectDB = require('./Backend/config/mondoDBConnect');
const { initSocket } = require('./Backend/config/socketBackend');
const PORT = process.env.PORT || 3000;

connectDB();

const server = app.listen(PORT,() => {
    console.log(`Server is running at ${PORT}`);
})

initSocket(server);