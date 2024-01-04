export function generateBlock(
    author,
    authorAvatar,
    date,
    text,
    tweetURL,
    tweetImage,
    tweetLikes,
    tweetRetweets,
    tweetReplies,
    inReplyTo
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
                text: `*Author*\n*${author}*\n\n\n*Date*\n${date}\n\n`,
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
                              text: `*:leftwards_arrow_with_hook: In reply to ${inReplyTo[0]}*`,
                          },
                      ]
                    : []),
            ],
        },
        {
            type: 'divider',
        },
        ...(tweetImage.length > 0
            ? [
                  textBlock,
                  {
                      type: 'image',
                      image_url: `${tweetImage[0]}`,
                      alt_text: 'tweet_image',
                  },
              ]
            : [textBlock]),
        {
            type: 'divider',
        },
    ];

    return slackBlock;
}
