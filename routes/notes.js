const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');

const router = express.Router();
const editableFields = ['title', 'content'];

function validateNoteBody(body, requireAllFields) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  const unknownFields = Object.keys(body).filter((field) => !editableFields.includes(field));
  if (unknownFields.length > 0) {
    return `Unknown field${unknownFields.length > 1 ? 's' : ''}: ${unknownFields.join(', ')}.`;
  }

  const fieldsToValidate = requireAllFields
    ? editableFields
    : editableFields.filter((field) => Object.hasOwn(body, field));

  if (!requireAllFields && fieldsToValidate.length === 0) {
    return 'Provide a title, content, or both to update.';
  }

  for (const field of fieldsToValidate) {
    if (typeof body[field] !== 'string' || body[field].trim().length === 0) {
      return `${field} must be a non-empty string.`;
    }
  }

  return null;
}

function isValidNoteId(id) {
  return mongoose.isObjectIdOrHexString(id);
}

router.post('/', async (req, res) => {
  const validationError = validateNoteBody(req.body, true);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const note = await Note.create({
    title: req.body.title,
    content: req.body.content
  });

  return res.status(201).json({
    success: true,
    data: note
  });
});

router.get('/', async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: notes
  });
});

router.get('/:id', async (req, res) => {
  if (!isValidNoteId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID.' });
  }

  const note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found.' });
  }

  return res.status(200).json({
    success: true,
    data: note
  });
});

router.put('/:id', async (req, res) => {
  if (!isValidNoteId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID.' });
  }

  const validationError = validateNoteBody(req.body, false);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true
  });
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found.' });
  }

  return res.status(200).json({
    success: true,
    data: note
  });
});

router.delete('/:id', async (req, res) => {
  if (!isValidNoteId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID.' });
  }

  const note = await Note.findByIdAndDelete(req.params.id);
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found.' });
  }

  return res.status(200).json({
    success: true,
    message: 'Note deleted successfully.',
    data: note
  });
});

module.exports = router;
