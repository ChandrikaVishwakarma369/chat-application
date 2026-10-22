const mongoose = require("mongoose")
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGOURI)
        console.log("Connected to the database")
    } catch (error) {
        console.log("Error connecting to the database:", error)
        process.exit(1)
    }
}
module.exports = dbConnect