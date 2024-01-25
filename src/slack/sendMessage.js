import Slack from '@slack/bolt';
import { log } from 'apify';
import { generateBlock } from './slackBlock.js';

export async function postSlackMessage(
    newTweets,
    slackChannel,
    slackBotToken,
    slackSignInSecret
) {
    // Prepare Tweets
    const slackMessageBlock = [];
    if (Array.isArray(newTweets) && newTweets.length > 0) {
        newTweets.forEach((tweet, _) => {
            const {
                tweetAuthor,
                tweetAvatar,
                tweetUrl,
                tweetText,
                tweetImage,
                tweetDate,
                tweetLikes,
                tweetRetweets,
                tweetReplies,
                inReplyTo,
            } = tweet;

            // Generate Slack JSON block
            const tweetBlock = generateBlock(
                tweetAuthor,
                tweetAvatar,
                tweetDate,
                tweetText,
                tweetUrl,
                tweetImage,
                tweetLikes,
                tweetRetweets,
                tweetReplies,
                inReplyTo
            );

            slackMessageBlock.push(...tweetBlock);
        });
    }

    // Send Slack Message
    const app = new Slack.App({
        signingSecret: slackSignInSecret,
        token: slackBotToken,
    });

    // Split keywordMessagesArr into chunks of 50 or less
    const chunkSize = 50;
    for (let i = 0; i < slackMessageBlock.length; i += chunkSize) {
        const chunk = slackMessageBlock.slice(i, i + chunkSize);
        await app.client.chat.postMessage({
            token: slackBotToken,
            channel: slackChannel,
            text: 'Tweet Mentions Bot',
            blocks: chunk,
        });
    }

    log.info('📤 Tweet update sent to Slack.');
}
