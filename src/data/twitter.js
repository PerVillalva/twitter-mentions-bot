import { Actor, log, Dataset } from 'apify';
import { fetchDataFromApify } from './fetchData.js';
import { parseDate } from './utilFunctions.js';

// Fetch Twitter Mentions
export async function fetchTwitterData(twitterSeachUrl, maxTweets, seachTerm) {
    log.info('🐦 Gathering Twitter Seach Data...');
    try {
        const twitterActor = await Actor.call('shanes/tweet-flash', {
            search_urls: twitterSeachUrl,
            max_tweets: maxTweets,
        });

        const twitterTaskId = twitterActor.defaultDatasetId;
        const tweets = await fetchDataFromApify(twitterTaskId);

        const recentMentions = tweets.slice(0, maxTweets).map((tweet) => ({
            tweetAuthor: tweet.username,
            tweetAvatar: tweet.tweet_avatar,
            tweetUrl: tweet.url,
            tweetText: tweet.text,
            tweetImage: tweet.images,
            tweetDate: parseDate(tweet.timestamp),
            tweetLikes: tweet.likes,
            tweetRetweets: tweet.retweets,
            tweetReplies: tweet.replies,
            inReplyTo: tweet.in_reply_to,
        }));

        await Dataset.pushData(
            recentMentions.filter((mention) =>
                mention.tweetText.includes(seachTerm)
            )
        );
        log.info('✅ Twitter data was successfully extracted.');
    } catch (error) {
        log.error('Failed to fetch Twitter data:', error);
        throw error;
    }
}
