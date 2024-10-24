export type DisseminationConfig = {
	locationExtensions?: string[];
	sensitiveExtensions?: string[];
}

export type RichTextClassificationConfig = {
	enabled: boolean;
	classifications: { [key: string]: DisseminationConfig; }
}