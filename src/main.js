import { Actor, log } from 'apify';
import { fetchTwitterData } from './data/twitter.js';
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
    twitterSearchTerm,
    maxTweets,
    slackChannel,
    slackBotToken,
    slackSignInSecret,
} = input;

await fetchTwitterData(maxTweets, twitterSearchTerm);

const numberOfRuns = await checkTaskRunNumber();
if (numberOfRuns >= 1) {
    const oldDataset = await fetchPreviousDatasetItems();
    const newDataset = await fetchCurrentDatasetItems();
    const differences = await compareDatasets(oldDataset, newDataset);

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
