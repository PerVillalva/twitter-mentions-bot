import { Actor, log } from 'apify';
import { fetchTwitterData, fetchTweetAuthorInfo } from './data/twitter.js';
import {
    checkTaskRunNumber,
    fetchCurrentDatasetItems,
    fetchPreviousDatasetItems,
} from './data/fetchData.js';
import { compareDatasets } from './data/utilFunctions.js';
import { postSlackMessage } from './slack/sendMessage.js';

await Actor.init();

const input = await Actor.getInput();
const {
    twitterSeachURLs,
    maxTweets,
    slackChannel,
    slackBotToken,
    slackSignInSecret,
} = input;

const initialUrls = twitterSeachURLs.map((url) => {
    const req = url.url;
    return req;
});

await fetchTwitterData(initialUrls, maxTweets);

const numberOfRuns = await checkTaskRunNumber();
if (numberOfRuns >= 1) {
    const oldDataset = await fetchPreviousDatasetItems();
    const newDataset = await fetchCurrentDatasetItems();
    const differences = await compareDatasets(oldDataset, newDataset);

    // --------------- Author Information Feature (Not Working - TODO) ---------------
    // const usernamesArray = newDataset.reduce((uniqueArray, tweetDataset) => {
    //     const url = `https://twitter.com/${tweetDataset.tweetAuthor}`;
    //     if (uniqueArray.findIndex((obj) => obj.url === url) < 0) {
    //         uniqueArray.push({ url });
    //     }
    //     return uniqueArray;
    // }, []);
    // const tweetAuthorInformation = await fetchTweetAuthorInfo(usernamesArray);

    let newTweets;

    const KVS = Actor.openKeyValueStore();

    if (differences.length) {
        log.info('New tweets:', differences);
        await Actor.setValue('NEW_TWEETS', { tweets: differences });

        // Get newly added pages' urls from the KeyValueStore
        newTweets = await (await KVS).getValue('NEW_TWEETS');

        await postSlackMessage(
            newTweets.tweets,
            slackChannel,
            slackBotToken,
            slackSignInSecret
        );
    } else {
        log.info('No new tweets found.');
        newTweets = [];
    }
} else {
    log.info(
        'If this is your first time running this Actor Task, please run it again'
    );
}

await Actor.exit();
