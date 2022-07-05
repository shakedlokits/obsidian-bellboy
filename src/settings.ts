import { refreshFileStructure } from './organize-file-structure';
import Bellboy from '../main';
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface BellboySettings {
	shouldUpdateFileNames: boolean;
	shouldOrganizeFileStructure: boolean;
}

const DEFAULT_SETTINGS: Partial<BellboySettings> = {
	shouldUpdateFileNames: true,
	shouldOrganizeFileStructure: true,
};

export const loadSettings = async (plugin: Bellboy) => {
	const loadedPluginData = await plugin.loadData();
	plugin.settings = {
		...DEFAULT_SETTINGS,
		...loadedPluginData,
	};
};

export const saveSettings = async (plugin: Bellboy) => {
	await plugin.saveData(plugin.settings);
};

export class SettingsTab extends PluginSettingTab {
	plugin: Bellboy;

	constructor(app: App, plugin: Bellboy) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h1').setText('\nBellboy Settings');
		containerEl
			.createEl('p')
			.setText(
				'Bellboy is built to be an opinionated file structure manager for Obsidian,\n' +
					'it follows an automated file system structure that implemets the Idea Processor method'
			);
		const link = containerEl.createEl('a');
		link.setText('Two Minute Intro 🛎');
		link.setAttribute(
			'href',
			'https://github.com/shakedlokits/obsidian-bellboy/blob/master/README.md'
		);

		containerEl.createEl('h1').setText('\n');

		new Setting(containerEl)
			.setName('Should Update File Names')
			.setDesc("Bellboy uses an simplified naming convention based on the file's header and icon.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.shouldUpdateFileNames).onChange(async (value) => {
					this.plugin.settings.shouldUpdateFileNames = value;
					await saveSettings(this.plugin);
				})
			);

		new Setting(containerEl)
			.setName('Should Organize Files')
			.setDesc('Bellboy organizes files based on the Idea Processor state system.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.shouldOrganizeFileStructure)
					.onChange(async (value) => {
						this.plugin.settings.shouldOrganizeFileStructure = value;
						await saveSettings(this.plugin);
					})
			);

		new Setting(containerEl)
			.setName('Refresh File Structure')
			.setDesc('Run a full file structure organization.')
			.setDisabled(!this.plugin.settings.shouldOrganizeFileStructure)
			.addButton((button) =>
				button
					.setButtonText('Run Refresh')
					.onClick(async () => refreshFileStructure({ plugin: this.plugin }))
			);
	}
}
