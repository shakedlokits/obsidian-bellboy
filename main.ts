import { Plugin, TFile } from 'obsidian';
import kebabCase from 'lodash/kebabCase';
import trim from 'lodash/trim';

export default class Bellboy extends Plugin {
	async onload() {
		this.registerEvent(
			this.app.metadataCache.on('changed', async (file, data, cache) => {
				if (file instanceof TFile) {
					const [{ heading: title }] = cache?.headings ?? [{ heading: file.basename }];
					const { icon } = cache?.frontmatter;

					const fileName = `${kebabCase(title)}${icon ? '-' + trim(icon) : ''}.md`;
					if (file.basename !== fileName) {
						await this.app.fileManager.renameFile(file, fileName);
					}
				}
			})
		);
	}
}
