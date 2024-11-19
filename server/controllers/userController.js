const User = require("../model/userModel");
const brcypt = require("bcrypt");

module.exports.regiser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
            return res.json({ msg: "Username đã được sử dụng", status: false });
        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email đã được sử dụng", status: false });
        const hashedPassword = await brcypt.hash(password, 10);
        const user = await User.create({
            email, username, password: hashedPassword,
        });
        delete user.password;
        return res.json({ status: true, user });
    }
    catch (ex) {
        next(ex);
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user)
            return res.json({ msg: "Sai Username hoặc Password", status: false });
        const isPasswordValid = await brcypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.json({ msg: "Sai Username hoặc Password", status: false });
        delete user.password;
        return res.json({ status: true, user });
    }
    catch (ex) {
        next(ex);
    }
};

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userID = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(userID, {
            isAvatarImageSet: true,
            avatarImage,
        },
        { new: true }
    );
        return res.json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
        });
    } catch (ex) {
        next(ex);
    }
};

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.params.id } }).select([
            "email", "username", "avatarImage", "_id"
        ]);
        return res.json(users);
    } catch (ex) {
        next(ex);
    }
};

module.exports.logout = (req, res, next) => {
    try {
      if (!req.params.id) return res.json({ msg: "Bắt buộc id người dùng" });
      onlineUsers.delete(req.params.id);
      return res.status(200).send();
    } catch (ex) {
      next(ex);
    }
  };