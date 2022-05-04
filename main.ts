import { Plugin, parseYaml, TFile } from "obsidian";
import { kebabCase, trim } from "lodash";
export default class Bellboy extends Plugin {
  async parseFrontMatter(file: TFile) {
    const contents = await this.app.vault.cachedRead(file);
    const { header } = contents.match(/---\n(?<header>.*)\n---/s).groups;
    if (!header) return {};

    const frontMatter = parseYaml(header);
    return frontMatter;
  }

  async getSanitizedFileName(file: TFile) {
    const contents = await this.app.vault.cachedRead(file);

    const { title } = contents.match(/\s*#+ (?<title>.*)$/m).groups;
    if (!title) return file.name;

    return kebabCase(title);
  }

  async constructFileName(file: TFile) {
    const sanitizedFileName = await this.getSanitizedFileName(file);
    const { icon } = await this.parseFrontMatter(file);

    const fileName = `${sanitizedFileName}${icon ? "-" + trim(icon) : ""}.md`;
    return fileName;
  }

  async onload() {
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (file instanceof TFile) {
          const fileName = await this.constructFileName(file);
          await this.app.fileManager.renameFile(file, fileName);
        }
      })
    );
  }
}
