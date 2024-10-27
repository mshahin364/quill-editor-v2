export interface Emoji {
    id: string;
    shortcodes: string;
    name: string;
    native: string;
    set: 'native' | 'apple' | 'facebook' | 'google' | 'twitter';
    skin: 1 | 2 | 3 | 4 | 5 | 6;
}
