import Bellboy from 'main';
import { CachedMetadata, TAbstractFile, TFile } from 'obsidian';

enum FileStatus {
	Inbox = 'inbox',
	InProgress = 'in-progress',
	Planning = 'planning',
	Blocked = 'blocked',
	Backlog = 'backlog',
	Done = 'done',
}

enum FileMode {
	Inbox = '01_inbox',
	Working = '02_working',
	Archive = '03_archive',
}

const mapFileStatusToMode = (status: FileStatus): FileMode => {
	switch (status) {
		case FileStatus.Inbox:
			return FileMode.Inbox;
		case FileStatus.Planning:
		case FileStatus.InProgress:
		case FileStatus.Blocked:
			return FileMode.Working;
		case FileStatus.Done:
		case FileStatus.Backlog:
			return FileMode.Archive;
		default:
			console.error(`Status "${status}" is not supported`);
	}
};

const createFolderIfNotExists = async ({ plugin, path }: { plugin: Bellboy; path: string }) => {
	const abstractFile = plugin.app.vault.getAbstractFileByPath(path);
	if (!abstractFile) await plugin.app.vault.createFolder(path);
};

export const organizeFileStructure = async ({
	plugin,
	file,
	cache,
}: {
	plugin: Bellboy;
	file: TFile;
	cache: CachedMetadata;
}) => {
	const { status = FileStatus.Inbox } = cache?.frontmatter;
	const isSupportedStatus = Object.values(FileStatus).includes(status);
	const isExcluded = file.extension !== 'md' || file.path.startsWith('_');
	if (!isSupportedStatus || isExcluded) return;

	const mode = mapFileStatusToMode(status);
	const shouldIncludeStatus = status !== FileStatus.Inbox;
	const folder = shouldIncludeStatus ? `${mode}/${status}` : mode;
	await createFolderIfNotExists({ plugin, path: folder });

	const fileName = `${folder}/${file.name}`;
	if (file.path !== fileName && plugin.settings.shouldOrganizeFileStructure) {
		await plugin.app.fileManager.renameFile(file, fileName);
	}
};

export const stashAttachments = async ({
	plugin,
	file,
}: {
	plugin: Bellboy;
	file: TAbstractFile;
}) => {
	if (!(file instanceof TFile)) return;

	const isExcluded = file.extension === 'md' || file.path.startsWith('_');
	if (isExcluded) return;

	const folder = '_attachments';
	await createFolderIfNotExists({ plugin, path: folder });

	const fileName = `${folder}/${file.name}`;
	if (plugin.settings.shouldOrganizeFileStructure) {
		await plugin.app.fileManager.renameFile(file, fileName);
	}
};

export const refreshFileStructure = async ({ plugin }: { plugin: Bellboy }) => {
	const files = plugin.app.vault.getFiles();
	await Promise.allSettled(
		files.map(async (file) => {
			const cache = plugin.app.metadataCache.getFileCache(file);
			await organizeFileStructure({ plugin, file, cache });
			await stashAttachments({ plugin, file });
		})
	);
};
