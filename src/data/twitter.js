import { Actor, log, Dataset } from 'apify';
import { fetchDataFromApify } from './fetchData.js';
import { parseDate } from './utilFunctions.js';

// Fetch Twitter Mentions
export async function fetchTwitterData(maxTweets, seachTerm) {
    log.info('🐦 Gathering Twitter Seach Data...');
    try {
        let twitterActor;
        let tweets;
        do {
            twitterActor = await Actor.call('microworlds/twitter-scraper', {
                addUserInfo: true,
                maxTweets: maxTweets,
                scrapeTweetReplies: true,
                searchTerms: [seachTerm],
                searchMode: 'live',
            });

            const twitterTaskId = twitterActor.defaultDatasetId;
            tweets = await fetchDataFromApify(twitterTaskId);
        } while (tweets[0].zero_result);

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const recentMentions = tweets.map((tweet) => ({
            tweetAuthor: tweet.user.name,
            tweetAvatar: tweet.user.profile_image_url_https,
            authorFollowers: tweet.user.followers_count,
            tweetUrl: tweet.url,
            tweetText: tweet.full_text,
            tweetDate: parseDate(tweet.created_at),
            tweetLikes: tweet.favorite_count,
            tweetRetweets: tweet.retweet_count,
            tweetReplies: tweet.reply_count,
            inReplyTo: tweet.in_reply_to_screen_name || '',
        }));

        await Dataset.pushData(recentMentions);

        log.info('✅ Twitter data was successfully extracted.');
    } catch (error) {
        log.error('Failed to fetch Twitter data:', error);
        throw error;
    }
}
