const { regiser, login, setAvatar, getAllUsers, logout } = require("../controllers/userController");

const router = require("express").Router();

router.post("/register", regiser);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.get("/logout/:id", logout);

module.exports = router;