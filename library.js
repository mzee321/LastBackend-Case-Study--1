const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        BookName: String,
        Author: String,
        YearPublished: String,
        Publisher: String,
        Genre: String
    }
)

const UserModel = mongoose.model("books",UserSchema)

module.exports = UserModel;