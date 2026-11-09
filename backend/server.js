require("dotenv").config();
const app = require('./src/App');
const connectDB = require('./src/db/db');


connectDB();

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`MailPilot server is running at Port ${PORT}`);
})