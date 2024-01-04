import axios from 'axios';
import { Dataset, log } from 'apify';

const { APIFY_TOKEN, ACTOR_TASK_ID } = process.env;

// Fetch Dataset Data From Apify
export async function fetchDataFromApify(datasetId) {
    const url = `https://api.apify.com/v2/datasets/${datasetId}/items/?token=${APIFY_TOKEN}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        log.error('Failed to fetch data from Apify:', error);
        throw error;
    }
}

// Fetch Previous Run Dataset
export async function fetchPreviousDatasetItems() {
    try {
        const actorLastRun = await axios.get(
            `https://api.apify.com/v2/actor-tasks/${ACTOR_TASK_ID}/runs/last?token=${APIFY_TOKEN}&status=SUCCEEDED`
        );

        const lastRunID = actorLastRun.data.data.defaultDatasetId;

        const previousDataset = await axios.get(
            `https://api.apify.com/v2/datasets/${lastRunID}/items/?token=${APIFY_TOKEN}`
        );

        return previousDataset.data;
    } catch (error) {
        log.error('Error fetching previous dataset items:', error);
        throw error; // or return a default value or handle the error appropriately
    }
}

// Fetch Latest Run Dataset
export async function fetchCurrentDatasetItems() {
    try {
        const newDataset = await Dataset.open();
        const newDatasetItems = await newDataset.getData();
        const newDatasetItemsArr = newDatasetItems.items;

        return newDatasetItemsArr;
    } catch (error) {
        log.error('Error fetching current dataset items:', error.message);
        throw error; // or return a default value or handle the error appropriately
    }
}

// Get Apify Task Run Number
export async function checkTaskRunNumber() {
    const task = await axios.get(
        `https://api.apify.com/v2/actor-tasks/${ACTOR_TASK_ID}/runs?token=${APIFY_TOKEN}&status=SUCCEEDED`
    );
    const taskData = task.data.data;
    const taskRuns = taskData.total;
    return taskRuns;
}
