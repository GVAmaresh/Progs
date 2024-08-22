const Express = require('express')
const router = express.Router()
const authController = require("../controllers/authController")
const userController = require("../controllers/userController")

router.post("/signup", authController.signup)
router.post("/login", authController.login)
router.post("/logout", authController.logout)

router.use(authController.protect);

router.get("/me", authController.getMe, userController.getMe);

module.exports = router;
