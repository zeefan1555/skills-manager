import { Skill } from '@claude/code';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SkillParams {
  url: string;
  vault_path?: string;
  type?: string;
}

interface ContentData {
  title: string;
  rawContent: string;
  author?: string;
  publishDate?: string;
  sourcePlatform: string;
  contentType: string;
}

export default class LearningContentToObsidian extends Skill {
  private defaultVaultPath = '/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/';
  private dateFormat = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });

  async run(params: SkillParams) {
    const { url, vault_path = this.defaultVaultPath } = params;

    // 1. 识别内容类型
    const contentType = this.detectContentType(url, params.type);
    if (!contentType) {
      throw new Error(`不支持的内容类型: ${url}`);
    }

    this.output(`开始处理${contentType}内容: ${url}`);

    // 2. 获取原始内容
    const contentData = await this.fetchContent(url, contentType);

    // 3. 标准化文件名
    const safeTitle = this.sanitizeFilename(contentData.title);
    const baseFilename = `${safeTitle}-[${contentData.sourcePlatform}]`;

    // 4. 创建目录结构
    const baseDir = path.join(vault_path, this.getContentFolder(contentType));
    const summaryDir = path.join(baseDir, 'Summaries');
    const rawDir = path.join(baseDir, this.getRawFolder(contentType));

    await fs.mkdir(summaryDir, { recursive: true });
    await fs.mkdir(rawDir, { recursive: true });

    // 5. 保存原始内容
    this.output('正在保存原始内容...');
    const rawFilePath = path.join(rawDir, `${baseFilename}-raw.md`);
    const rawFrontmatter = this.buildFrontmatter({
      ...contentData,
      summaryNote: `[[${baseFilename}]]`,
      rawContentType: this.getRawContentType(contentType),
    });

    const rawContent = `${rawFrontmatter}\n\n> 内容总结：[[${baseFilename}]]\n\n---\n\n${contentData.rawContent}`;
    await fs.writeFile(rawFilePath, rawContent, 'utf-8');

    // 6. 生成总结内容
    this.output('正在生成内容总结...');
    const summary = await this.generateSummary(contentData.rawContent, contentData.title);
    const summaryFilePath = path.join(summaryDir, `${baseFilename}.md`);
    const summaryFrontmatter = this.buildFrontmatter({
      ...contentData,
      rawContent: `[[${baseFilename}-raw]]`,
      keyTopics: summary.keyTopics,
      timeToRead: summary.timeToRead,
    });

    const summaryContent = `${summaryFrontmatter}\n\n${summary.content}\n\n---\n\n> 完整原始内容：[[${baseFilename}-raw]]`;
    await fs.writeFile(summaryFilePath, summaryContent, 'utf-8');

    this.output('\n✅ 导入完成！');
    this.output(`📝 总结版: ${path.relative(vault_path, summaryFilePath)}`);
    this.output(`📚 原始版: ${path.relative(vault_path, rawFilePath)}`);
    this.output(`🔗 Obsidian链接: obsidian://open?vault=agent&file=${encodeURIComponent(path.relative(vault_path, summaryFilePath))}`);
  }

  private detectContentType(url: string, explicitType?: string): string | null {
    if (explicitType) return explicitType;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    // 后续扩展其他类型识别
    return null;
  }

  private getContentFolder(contentType: string): string {
    const folderMap: Record<string, string> = {
      youtube: 'YouTube',
      article: 'Articles',
      course: 'Courses',
      podcast: 'Podcasts',
    };
    return folderMap[contentType] || 'Other';
  }

  private getRawFolder(contentType: string): string {
    const folderMap: Record<string, string> = {
      youtube: 'Transcripts',
      article: 'Full-Text',
      course: 'Materials',
      podcast: 'Transcripts',
    };
    return folderMap[contentType] || 'Raw';
  }

  private getRawContentType(contentType: string): string {
    const typeMap: Record<string, string> = {
      youtube: 'transcript',
      article: 'full-text',
      course: 'course-material',
      podcast: 'transcript',
    };
    return typeMap[contentType] || 'raw';
  }

  private sanitizeFilename(title: string): string {
    return title
      .replace(/[\/?:*"<>|]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  private buildFrontmatter(data: any): string {
    const now = this.dateFormat.format(new Date()).replace(/\//g, '-');
    const frontmatter = {
      title: data.title,
      type: data.contentType,
      source: data.url,
      source_platform: data.sourcePlatform,
      author: data.author || '未知',
      publish_date: data.publishDate || now,
      created_date: now,
      tags: ['学习笔记', data.sourcePlatform],
      ...(data.summary_note ? { summary_note: data.summaryNote } : {}),
      ...(data.raw_content ? { raw_content: data.rawContent } : {}),
      ...(data.raw_content_type ? { raw_content_type: data.rawContentType } : {}),
      ...(data.key_topics ? { key_topics: data.keyTopics } : {}),
      ...(data.time_to_read ? { time_to_read: data.timeToRead } : {}),
    };

    return `---\n${Object.entries(frontmatter)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.map(item => `"${item}"`).join(', ')}]` : `"${v}"`}`)
      .join('\n')}\n---`;
  }

  private async fetchContent(url: string, contentType: string): Promise<ContentData> {
    if (contentType === 'youtube') {
      // 调用youtube-transcript技能
      const transcriptResult = await this.skill('youtube-transcript', { url });
      return {
        title: transcriptResult.title,
        rawContent: transcriptResult.transcript,
        author: transcriptResult.author,
        publishDate: transcriptResult.publishDate,
        sourcePlatform: 'YouTube',
        contentType: 'youtube',
      };
    }
    throw new Error(`未实现的内容类型: ${contentType}`);
  }

  private async generateSummary(content: string, title: string): Promise<{
    content: string;
    keyTopics: string[];
    timeToRead: number;
  }> {
    // 调用ship-learn-next技能生成总结
    const summaryResult = await this.skill('ship-learn-next', {
      content,
      title,
      format: 'obsidian',
    });

    return {
      content: summaryResult.summary,
      keyTopics: summaryResult.keyTopics || [],
      timeToRead: Math.ceil(summaryResult.summary.length / 300), // 按每分钟300字估算
    };
  }
}
