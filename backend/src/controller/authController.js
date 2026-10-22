const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
  try {
    const { Fullname, Email, Password } = req.body;
    if (!Fullname || !Email || !Password) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const findUser = await User.findOne({ Email });
    if (findUser) {
      return res.status(400).json({ message: "User already exists!" });
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newUser = new User({ Fullname, Email, Password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: "User registered!" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "there is a server error!" });
  }
};

const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const isUserExists = await User.findOne({ Email });
    if (!isUserExists) {
      return res.status(400).json({ message: "User does't exists!!" });
    }
    const isPasswordMatch = await bcrypt.compare(
      Password,
      isUserExists.Password,
    );
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect!!" });
    }
    const token = jwt.sign(
      {
        id: isUserExists._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );
    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        _id: isUserExists._id,
        Fullname: isUserExists.Fullname,
        Email: isUserExists.Email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "there is a server error!" });
  }
};

module.exports = { register, login };
