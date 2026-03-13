import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import { ResumesRepository } from './resumes.repository';
import { mapResumeToRenderCV } from './utils/rendercv-mapper';
import { UserPayload } from '../../auth/decorators/current-user.decorator';

const execAsync = promisify(exec);

@Injectable()
export class ResumesRenderingService {
  private readonly logger = new Logger(ResumesRenderingService.name);

  constructor(private readonly repository: ResumesRepository) {}

  async renderResume(user: UserPayload, id: string): Promise<{ pdfPath: string; pngPaths: string[]; tempDir: string }> {
    const resume = await this.repository.findOne(user, id);
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    return this.renderFromData(resume, id);
  }

  async renderFromData(data: any, identifier: string): Promise<{ pdfPath: string; pngPaths: string[]; tempDir: string }> {
    const renderCVData = mapResumeToRenderCV(data);
    const tempDir = path.join(os.tmpdir(), `rendercv-${identifier}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const yamlContent = yaml.dump(renderCVData);
    const yamlPath = path.join(tempDir, 'resume.yaml');
    fs.writeFileSync(yamlPath, yamlContent);

    try {
      this.logger.log(`Rendering resume ${identifier} in ${tempDir}`);
      this.logger.debug(`YAML Content:\n${yamlContent}`);
      
      // Execute rendercv CLI within the temp directory
      // This avoids compatibility issues with the --output-directory flag in different versions
      // We set PYTHONIOENCODING to utf-8 to avoid 'charmap' errors on Windows consoles
      const { stdout, stderr } = await execAsync(`python -m rendercv render "resume.yaml"`, {
        cwd: tempDir,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        timeout: 60000, 
      });

      const outputDir = path.join(tempDir, 'rendercv_output');
      if (!fs.existsSync(outputDir)) {
        throw new Error('RenderCV output directory not found');
      }

      const files = fs.readdirSync(outputDir);
      const pdfFile = files.find(f => f.endsWith('.pdf'));
      const pngFiles = files
        .filter(f => f.endsWith('.png'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      if (!pdfFile) {
        throw new Error('PDF generation failed: No PDF found in output');
      }

      return {
        pdfPath: path.join(outputDir, pdfFile),
        pngPaths: pngFiles.map(f => path.join(outputDir, f)),
        tempDir,
      };
    } catch (error: any) {
      const stderr = error.stderr || '';
      const stdout = error.stdout || '';
      this.logger.error(`Error rendering resume ${identifier}: ${error.message}`);
      if (stderr) this.logger.error(`RenderCV stderr output:\n${stderr}`);
      if (stdout) this.logger.debug(`RenderCV stdout output:\n${stdout}`);
      
      throw new InternalServerErrorException(`Failed to render resume: ${error.message}${stderr ? '\n' + stderr : ''}`);
    }
  }

  async cleanup(tempDir: string) {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (err) {
      this.logger.error(`Failed to cleanup temp dir ${tempDir}: ${err.message}`);
    }
  }
}
