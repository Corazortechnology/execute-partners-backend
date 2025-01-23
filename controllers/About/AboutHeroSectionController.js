const About = require('../../models/About/AboutHeroSectionModel');

// Fetch the "About Us" data
exports.getAbout = async function(req, res) {
  try {
    const about = await About.findOne({});
    if (!about) {
      return res.status(404).send({ message: 'About Us data not found.' });
    }
    res.status(200).send(about);
  } catch (err) {
    res.status(500).send({ error: 'Server error while fetching data.' });
  }
};

// Create "About Us" data
exports.createAbout = async function(req, res) {
  const { heading, description } = req.body;

  try {
    const about = new About({
      heading,
      description
    });

    const savedAbout = await about.save();
    res.status(201).send(savedAbout);
  } catch (err) {
    res.status(500).send({ error: 'Server error while saving data.' });
  }
};

// Update "About Us" data
exports.updateAbout = async function(req, res) {
  const { heading, description } = req.body;

  try {
    const updatedAbout = await About.findOneAndUpdate(
      {}, 
      { heading, description }, 
      { new: true, upsert: true }
    );

    res.status(200).send(updatedAbout);
  } catch (err) {
    res.status(500).send({ error: 'Server error while updating data.' });
  }
};
