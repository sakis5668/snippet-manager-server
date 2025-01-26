const express = require("express");
const router = express.Router();
const Snippet = require("../models/snippetModel");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user });
    res.json(snippets);
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, description, code } = req.body;

  // validate the data
  if (!description && !code) {
    return res.status(400).json({ errorMessage: "Enter at least description or code" });
  }

    const newSnippet = new Snippet({ title, description, code, user: req.user });
    await newSnippet.save();
    res.json(newSnippet);
  } catch (error) {
    //res.status(500).json({ errorMessage: error.message });
    res.status(500).send();
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { title, description, code } = req.body;
    const snippedId = req.params.id;

    if (!description && !code) {
      return res.status(400).json({ errorMessage: "Enter at least description or code" });
    }

    if (!snippedId) {
      return res.status(400).json({ errorMessage: "Snippet ID is required" });
    }

    const snippet = await Snippet.findById(snippedId);
    if (!snippet) {
      return res.status(404).json({ errorMessage: "Snippet not found" });
    }
    
    if (snippet.user.toString() !== req.user) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }

    snippet.title = title;
    snippet.description = description;
    snippet.code = code;
    await snippet.save();
    res.json(snippet);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const snippedId = req.params.id;
    
    if (!snippedId) {
      return res.status(400).json({ errorMessage: "Snippet ID is required" });
    }

    const snippet = await Snippet.findById(snippedId);
    if (!snippet) {
      return res.status(404).json({ errorMessage: "Snippet not found" });
    }

    if (snippet.user.toString() !== req.user) {
      return res.status(401).json({ errorMessage: "Unauthorized" });
    }

    await snippet.deleteOne();
    res.json(snippet);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
