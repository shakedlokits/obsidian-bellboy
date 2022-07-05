import { organizeFileStructure, stashAttachments } from './src/organize-file-structure';
import { BellboySettings, loadSettings, SettingsTab } from './src/settings';
import { Plugin } from 'obsidian';
import { updateFileName } from 'src/update-file-name';

export default class Bellboy extends Plugin {
	settings: BellboySettings;

	async onload() {
		await loadSettings(this);
		this.addSettingTab(new SettingsTab(this.app, this));

		this.registerEvent(
			this.app.metadataCache.on('changed', async (file, data, cache) => {
				await updateFileName({ plugin: this, file, cache });
				await organizeFileStructure({ plugin: this, file, cache });
			})
		);
		this.registerEvent(
			this.app.vault.on('create', async (file) => {
				await stashAttachments({ plugin: this, file });
			})
		);
	}
}
