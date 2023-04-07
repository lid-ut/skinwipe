const LandingEmails = require('../models/LandingEmails');
const LandingAdEmails = require('../models/LandingAdEmails');

/*
 * @api [post] /api/saveContacts
 * description: "Save landing contacts"
 * tags:
 * - landing
 * consumes:
 * - application/json
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/saveContacts', async (req, res) => {
  if (!req.body.email) {
    res.send('no email');
    return;
  }
  const oldEmail = await LandingEmails.findOne({ email: req.body.email });
  if (oldEmail) {
    res.send('ok');
    return;
  }
  const newContact = new LandingEmails({
    email: req.body.email,
    landing_id: req.body.landing_id || '',
    section: req.body.section || '',
    create_date: new Date(),
    campaign: req.body.campaign || '',
    source: req.body.source || '',
    community: req.body.community || '',
    post: req.body.post || '',
  });
  await newContact.save();
  res.send('ok');
});

/*
 * @api [post] /api/saveAdContacts
 * description: "Save landing contacts"
 * tags:
 * - landing
 * consumes:
 * - application/json
 * responses:
 *   "200":
 *     description: ""
 */
app.post('/api/saveAdContacts', async (req, res) => {
  if (!req.body.email) {
    res.send('no email');
    return;
  }
  const oldEmail = await LandingAdEmails.findOne({ email: req.body.email });
  if (oldEmail) {
    res.send('ok');
    return;
  }
  const newContact = new LandingAdEmails({
    email: req.body.email,
    name: req.body.name || '',
    company: req.body.company || '',
    phone: req.body.phone || '',
  });
  await newContact.save();
  res.send('ok');
});
