const cron = require("node-cron");
const Deliverer = require("../models/DelivererModel");
const { getWeekLabel } = require('../utils/relatedFunc');

cron.schedule("59 23 * * *", async () => {
  console.log("Updating COD history for all deliverers...");

  const deliverers = await Deliverer.find({});

  for (const d of deliverers) {
    if (d.codSummary.collectedToday > 0) {
      d.codSummary.history.push({
        date: new Date(),
        amount: d.codSummary.collectedToday
      });

      // Keep only last 15 days
      if (d.codSummary.history.length > 15) {
        d.codSummary.history = d.codSummary.history.slice(-15);
      }

      // Reset collectedToday for the next day
      d.codSummary.collectedToday = 0;
      await d.save();
    }
  }

  console.log("COD history updated successfully.");
});

cron.schedule('0 0 * * 1', async () => {
  console.log('Weekly Deliverer activity update started...');
  const weekLabel = getWeekLabel();

  try {
    const deliverers = await Deliverer.find();
    for (const d of deliverers) {
        ['weeklyDeliveries', 'weeklyPickups'].forEach(field => {
            const exists = d[field].some(w => w.week === weekLabel);
            if (!exists) {
            d[field].push({ week: weekLabel, count: 0 });
            if (d[field].length > 7) {
                d[field] = d[field].slice(-7);
            }
            }
        });
        await d.save({ validateBeforeSave: false });
    }
    console.log('Weekly Deliverer activity update completed.');
  } catch (err) {
    console.error('Error in weekly Deliverer activity update:', err);
  }
});