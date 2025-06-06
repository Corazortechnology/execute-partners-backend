// articles.js
const express = require("express");
const router = express.Router();
const articleController = require("../../controllers/Articles/Articles");
const authMiddleware = require("../../middlewares/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get("/", articleController.getAllArticles);
router.get("/:id", articleController.getArticleById);

// Protected routes
router.use(authMiddleware);

router.post("/", upload.single("coverImage"), articleController.createArticle);
router.put("/:id", upload.single("coverImage"), articleController.updateArticle);
router.delete("/:id", articleController.deleteArticle);
router.post("/:id/like", articleController.likeArticle);
router.post("/:id/comments", articleController.addComment);
router.put("/:id/comments/:commentId", articleController.updateComment);
router.delete("/:id/comments/:commentId", articleController.deleteComment);
router.post("/:id/comments/:commentId/replies", articleController.addReply);

//Route to join the community 
router.post("/community/join", articleController.joinGlobalCommunity);

// Route to get the total count of users which joined the community 
router.get("/community/join-count", articleController.getGlobalCommunityJoinCount);

module.exports = router;