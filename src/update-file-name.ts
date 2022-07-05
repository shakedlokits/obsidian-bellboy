import { kebabCase, trim } from 'lodash';
import Bellboy from 'main';
import { CachedMetadata, TFile } from 'obsidian';

export const updateFileName = async ({
	plugin,
	file,
	cache,
}: {
	plugin: Bellboy;
	file: TFile;
	cache: CachedMetadata;
}) => {
	const isExcluded = file.extension !== 'md' || file.path.startsWith('_');
	if (isExcluded) return;

	const [{ heading: title }] = cache?.headings ?? [{ heading: file.basename }];
	const { icon } = cache?.frontmatter;

	const fileName = `${kebabCase(title)}${icon ? '-' + trim(icon) : ''}.md`;
	if (file.basename !== fileName && plugin.settings.shouldUpdateFileNames) {
		await plugin.app.fileManager.renameFile(file, fileName);
	}
};
