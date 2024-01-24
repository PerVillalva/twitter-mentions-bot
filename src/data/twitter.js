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
        let tweets = await fetchDataFromApify(twitterTaskId);

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        tweets = tweets
            .filter((tweet) => new Date(tweet.timestamp) >= twoDaysAgo)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const recentMentions = tweets.map((tweet) => ({
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
            recentMentions.filter(
                (mention) =>
                    mention.tweetText.includes(seachTerm) && mention.tweetDate
            )
        );
        log.info('✅ Twitter data was successfully extracted.');
    } catch (error) {
        log.error('Failed to fetch Twitter data:', error);
        throw error;
    }
}
