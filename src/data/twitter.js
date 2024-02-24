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

            const restrictDaysPeriod = new Date();
            restrictDaysPeriod.setDate(restrictDaysPeriod.getDate() - 2);

            tweets = tweets
                .filter(
                    (tweet) => new Date(tweet.created_at) >= restrictDaysPeriod
                )
                .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
        } while (tweets.length === 0);

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

        // await Dataset.pushData(recentMentions);
        await Dataset.pushData(
            recentMentions.filter(
                (mention) =>
                    mention.tweetText
                        .toLowerCase()
                        .includes(seachTerm.toLowerCase()) ||
                    mention.tweetAuthor === 'Apify'
            )
        );

        log.info('✅ Twitter data was successfully extracted.');
    } catch (error) {
        log.error('Failed to fetch Twitter data:', error);
        throw error;
    }
}
