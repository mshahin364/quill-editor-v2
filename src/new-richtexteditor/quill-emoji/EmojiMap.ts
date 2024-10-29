import emojiList, {Emoji} from './EmojiList';

const emojiMap: {
    [key: string]: Emoji;
} = {};

emojiList.forEach((emojiListObject) => {
    emojiMap[emojiListObject.name] = emojiListObject;
});

export default emojiMap;