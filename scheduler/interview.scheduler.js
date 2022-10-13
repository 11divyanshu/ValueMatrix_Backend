import slots from '../models/slot.js';
import unirest from "unirest";
var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
var fastsms_api = process.env.FAST2SMS_API_KEY;

import cron from 'cron';
const interviewNotification = cron.job('*/30 * * * * *',
    async () => {
        const data = await slots.aggregate([
            { $match: { status: 'Accepted' } },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "interviewer",
                }
            },
            { $unwind: '$interviewer' },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "candidate",
                }
            },
            { $unwind: '$candidate' },
            {
                "$project": {
                    "candidate.email": 1,
                    "candidate.contact": 1,
                    "interviewer.email": 1,
                    "interviewer.contact": 1,
                }
            },

        ])
        console.log(data);
        req.query({
            authorization: fastsms_api,
            route: "q",
            message: "You have schedule interview in 5 minutes. Please attend without fail. All the best!",
            numbers: ['8639675114'],
        });
        req.headers({
            "cache-control": "no-cache",
        });
        req.end(function (res) {
            if (res.error) cb({ Error: res.error }, null);
        });

        console.log('You will see this message every second');
    },

);
// interviewNotification.start();

