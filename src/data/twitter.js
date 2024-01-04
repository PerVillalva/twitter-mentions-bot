import { Actor, log, Dataset } from 'apify';
import { fetchDataFromApify } from './fetchData.js';
import { parseDate } from './utilFunctions.js';

// Fetch Tweet Author Information - DISABLED
export async function fetchTweetAuthorInfo(urlArr) {
    log.info('👨‍💻 Gathering Tweet Author Data...');
    try {
        const twitterURLActor = await Actor.call(
            'quacker/twitter-url-scraper',
            {
                addUserInfo: true,
                startUrls: urlArr,
                tweetsDesired: 1,
            }
        );

        const datasetId = twitterURLActor.defaultDatasetId;
        const dataset = await fetchDataFromApify(datasetId);
        const authorData = dataset.map((profile) => ({
            authorFollowers: profile.user.followers_count,
            authorDescription: profile.user.description,
            authorLocation: profile.user.location,
        }));

        log.info('✅ Tweet author data was successfully extracted.');
        return authorData;
    } catch (error) {
        log.error('Failed to fetch Tweet author data:', error);
        throw error;
    }
}

// Fetch Twitter Mentions
export async function fetchTwitterData(twitterSeachUrl, maxTweets) {
    log.info('🐦 Gathering Twitter Seach Data...');
    try {
        const twitterActor = await Actor.call('shanes/tweet-flash', {
            search_urls: twitterSeachUrl,
            max_tweets: maxTweets,
        });

        const twitterTaskId = twitterActor.defaultDatasetId;
        const tweets = await fetchDataFromApify(twitterTaskId);

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

        await Dataset.pushData(recentMentions);
        log.info('✅ Twitter data was successfully extracted.');
    } catch (error) {
        log.error('Failed to fetch Twitter data:', error);
        throw error;
    }
}
