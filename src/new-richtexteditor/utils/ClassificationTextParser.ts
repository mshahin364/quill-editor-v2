import {RichTextClassificationConfig} from '../RichTextClassificationConfig';
import {CommonUtil} from "./CommonUtil.ts";

export class ClassificationTextParser {
	classificationConfig: RichTextClassificationConfig;
	NO_FOREIGN_SHORT = 'NF';
	NO_FOREIGN = 'NO_FOREIGN';
	FIVE_EYE = 'FVEY';
	RELEASE_TO = 'REL TO';

	constructor(classificationConfig: RichTextClassificationConfig) {
		this.classificationConfig = classificationConfig;
	}

	private cleanUpClassificationText(text: string) {
		return text.toUpperCase()
			.replace(this.NO_FOREIGN, this.NO_FOREIGN_SHORT)
			.replace(/\)/g, '')
			.split('//');
	}

	public getClassificationQueryRegex(multiLine = false) {
		return new RegExp(`^\\s*?(\\\((${this.getApplicableClassification().join('|')})(\/{2}.+?\\\)|\\\)))`, multiLine ? 'gm' : 'g');
	};

	public getClassificationInputRegex() {
		return new RegExp(`\\\((${this.getApplicableClassification().join('|')})(\/{2}|\\\))|\\\)`, 'g');
	};

	public getApplicableClassification(): string[] {
		return Object.keys(this.classificationConfig.classifications).map(classification => classification.trim().toUpperCase());
	}

	public getApplicableSensitiveExtensions(classification: string) {
		return this.classificationConfig.classifications[classification].sensitiveExtensions || [];
	}

	public getApplicableLocationExtensions(classification: string) {
		return this.classificationConfig.classifications[classification].locationExtensions || [];
	}

	public getClassification(text: string): string {
		return (this.getClassificationInputRegex().exec(text.toUpperCase()) || [])[1];
	}

	public getExtensions(text: string) {
		return this.getSensitiveExtensions(text).concat(this.getLocationExtensions(text));
	}

	public getSensitiveExtensions(text: string): string[] {
		const data = this.cleanUpClassificationText(text);
		if (data.length > 1) {
			if (data.length === 3 || (!data[1].startsWith(this.RELEASE_TO) && !data[1].startsWith(this.NO_FOREIGN_SHORT))) {
				return CommonUtil.removeDuplicates(data[1].split('/').map(info => info.trim().toUpperCase()));
			}
		}
		return [];
	}

	public getLocationExtensions(text: string): string[] {
		const data = this.cleanUpClassificationText(text);

		if (data.length > 1) {
			const locationData = data[data.length - 1];
			if (locationData.startsWith(this.NO_FOREIGN_SHORT)) {
				return [this.NO_FOREIGN_SHORT];
			} else if (locationData.startsWith(this.RELEASE_TO)) {
				const countries = locationData.replace(this.RELEASE_TO, '').split(',').map(country => country.trim());
				return CommonUtil.removeDuplicates((countries.indexOf(this.FIVE_EYE) > -1) ? [this.FIVE_EYE] : countries);
			}
		}

		return [];
	}

	private hasCountryUSA(locationExtensions: string[]) {
		return (
			locationExtensions.length === 0 ||
			locationExtensions.includes('USA') ||
			locationExtensions.includes(this.NO_FOREIGN_SHORT) ||
			locationExtensions.includes(this.FIVE_EYE)

		);
	}

	public isValidInput(text: string): boolean {
		const classification = this.getClassification(text);
		const classificationExists = this.getApplicableClassification().includes(classification);

		if (!classificationExists) {
			return false;
		}

		const sensitiveExtensions = this.getSensitiveExtensions(text);
		const locationExtensions = this.getLocationExtensions(text);
		const applicableSensitiveExtensions = this.getApplicableSensitiveExtensions(classification);
		const applicableLocationExtensions = this.getApplicableLocationExtensions(classification);

		if (!sensitiveExtensions.every(ext => applicableSensitiveExtensions.includes(ext))) {
			return false;
		}

		if (!locationExtensions.every(ext => applicableLocationExtensions.includes(ext))) {
			return false;
		}

		return this.hasCountryUSA(locationExtensions);
	}

	public prepareClassificationText(text: string): string {
		const locationExtensions = this.getLocationExtensions(text);
		const sensitiveExtensions = this.getSensitiveExtensions(text);
		const sensitiveExtensionsText = sensitiveExtensions.join('/') || '';

		let locationExtensionsText = '';

		if (locationExtensions.includes(this.FIVE_EYE)) {
			locationExtensionsText = `REL TO ${this.FIVE_EYE}`;
		} else if (locationExtensions.includes(this.NO_FOREIGN_SHORT)) {
			locationExtensionsText = this.NO_FOREIGN_SHORT;
		} else if (locationExtensions.length > 0) {
			locationExtensionsText = `${this.RELEASE_TO} ${locationExtensions.join(', ')}`;
		}

		return this.getClassification(text)
			.concat(sensitiveExtensionsText ? '//' + sensitiveExtensionsText : '')
			.concat(locationExtensionsText ? '//' + locationExtensionsText : '');
	}
}