export function generateBlock(
    author,
    authorAvatar,
    date,
    text,
    tweetURL,
    tweetLikes,
    tweetRetweets,
    tweetReplies,
    inReplyTo,
    authorFollowers
) {
    const textBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `${text}`,
        },
        accessory: {
            type: 'button',
            text: {
                type: 'plain_text',
                text: 'View Tweet',
                emoji: true,
            },
            style: 'primary',
            value: 'View Tweet',
            url: `${tweetURL}`,
            action_id: 'button-action',
        },
    };

    const slackBlock = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: '🐦 New Apify mention on X (Twitter)',
                emoji: true,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*:bust_in_silhouette: Author: \`${author}\`*\n\n\n*:busts_in_silhouette: Follower Count: \`${authorFollowers}\`*\n\n\n*:spiral_calendar_pad: Date: \`${date}\`*`,
            },
            accessory: {
                type: 'image',
                image_url: `${authorAvatar}`,
                alt_text: 'author_avatar',
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `:thumbsup: *Likes: \`${tweetLikes}\`*`,
                },
                {
                    type: 'mrkdwn',
                    text: `*:speech_balloon: Replies: \`${tweetReplies}\`*`,
                },
                {
                    type: 'mrkdwn',
                    text: `*:repeat: Retweets: \`${tweetRetweets}\`*`,
                },
                ...(inReplyTo.length > 0
                    ? [
                          {
                              type: 'mrkdwn',
                              text: `*:leftwards_arrow_with_hook: In reply to ${inReplyTo}*`,
                          },
                      ]
                    : []),
            ],
        },
        {
            type: 'divider',
        },
        textBlock,
        {
            type: 'divider',
        },
    ];

    return slackBlock;
}
