// Admin route to update pricing
app.post('/api/admin/pricing', async (req, res) => {
  if (req.user.plan !== 'unlimited') return res.status(403).send('Not admin');
  await db.collection('settings').updateOne(
    { key: 'pricing' },
    { $set: { value: req.body.prices } },
    { upsert: true }
  );
  res.send('Pricing updated');
});

// Get current pricing for checkout
app.get('/api/pricing', async (req, res) => {
  const pricing = await db.collection('settings').findOne({ key: 'pricing' });
  res.json(pricing?.value || { slug: 19, premium: 49 }); // Default low prices
});