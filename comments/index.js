const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
    res.send(commentsByPostId[req.params.id] || []); // Always send back an array to whoever is making the request
});

app.post("/posts/:id/comments", async (req, res) => {
    const commentId = randomBytes(4).toString("hex"); // ID is pulled from the query string parameter and should belong to a post in the DB of the 'posts' service.
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    comments.push({ id: commentId, content });

    commentsByPostId[req.params.id] = comments;

    await axios.post("http://localhost:4005/events", {
        type: "CommentCreated",
        data: {
            id: commentId,
            content,
            postId: req.params.id,
        },
    });

    res.status(201).send(comments);
});

app.post("/events", (req, res) => {
    console.log("Event Received", req.body.type);

    res.send({});
});

app.listen(4001, () => console.log("listening on port 4001..."));
