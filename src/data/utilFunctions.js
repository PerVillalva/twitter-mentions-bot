export async function compareDatasets(prevDataset, newDataset) {
    const oldDatasetArray = prevDataset.map((obj) => obj.tweetUrl);

    const newTweets = newDataset.filter(
        (item) => !oldDatasetArray.includes(item.tweetUrl)
    );
    return newTweets;
}

export function parseDate(inputDate) {
    const parsedDate = new Date(inputDate);

    // Get the day, month, year, hour, and minutes components
    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('default', { month: 'short' });
    const year = parsedDate.getFullYear();
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    // Determine whether it's AM or PM
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    const hour12 = hours % 12 || 12; // Handle midnight (0) as 12

    // Get the timezone abbreviation and offset
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Format the minutes with leading zeros
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Construct the readable date string
    const readableDate = `${day} ${month} ${year}, ${hour12}:${formattedMinutes} ${period} ${timezone}`;

    return readableDate;
}
