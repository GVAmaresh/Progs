var mongoose = require("mongoose");
var dotenv = require("dotenv");
var express = require("express");
var userRouter = require('./routes/userRouter');
process.on("uncaughtException", function (err) {
    console.log("UncaughtException Shutting down....");
    console.log(err.name, err.message);
    process.exit(1);
});
dotenv.config({ path: "./.env.local" });
var app = express();
app.use(express.json());
app.use('/api/v1/users', userRouter);
if (!(process.env && process.env.NEXT_PUBLIC_DB && process.env.NEXT_PUBLIC_PASSWORD)) {
    console.log("Cannot Found the database");
    process.exit(1);
}
var DB = process.env.NEXT_PUBLIC_DB.replace("<PASSWORD>", process.env.NEXT_PUBLIC_PASSWORD);
mongoose
    .connect(DB)
    .then(function () {
    console.log("Database Connected Successfully");
})
    .catch(function (err) {
    console.log("Database Connection Failed");
    console.log(err);
    process.exit(1);
});
if (!(process.env && process.env.PORT)) {
    console.log("Cannot Find the port");
    process.exit(1);
}
var port = process.env.PORT;
var server = app.listen(port, function () {
    console.log("App running on the port: ".concat(port));
});
process.on("unhandledRejection", function (err) {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(function () {
        process.exit(1);
    });
});
