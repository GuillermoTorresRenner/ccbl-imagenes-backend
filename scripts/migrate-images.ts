import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import * as FormData from 'form-data';
import axios from 'axios';

interface ImageRecord {
  title: string;
  description: string;
  year: string;
  decade: string;
  zone: string;
  people: string;
  altText: string;
  notes: string;
  previousData: string;
  patrimonialValue: string;
  owner: string;
  culturalFund: string;
  imagePath: string;
}

interface MigrationLog {
  success: ImageRecord[];
  failed: Array<{ record: ImageRecord; error: string }>;
  orphaned: ImageRecord[];
}

class ImageMigrator {
  private readonly csvPath = path.join(
    process.cwd(),
    'img_migrations',
    'Metadata.csv',
  );
  private readonly imagesBasePath = path.join(
    process.cwd(),
    'img_migrations',
    'imagenes',
  );
  private readonly processedDir = path.join(
    process.cwd(),
    'img_migrations',
    'processed',
  );
  private readonly logsDir = path.join(process.cwd(), 'img_migrations', 'logs');
  private readonly reportsDir = path.join(
    process.cwd(),
    'img_migrations',
    'reports',
  );
  private readonly apiUrl = process.env.API_URL || 'http://localhost:3000';

  private migrationLog: MigrationLog = {
    success: [],
    failed: [],
    orphaned: [],
  };

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.processedDir, this.logsDir, this.reportsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async migrate(): Promise<void> {
    console.log('🚀 Iniciando migración de imágenes...');

    try {
      // Paso 1: Leer y validar CSV
      const records = await this.readAndValidateCSV();
      console.log(`📊 Total de registros en CSV: ${records.length}`);

      // Paso 2: Filtrar registros válidos
      const validRecords = await this.validateImageFiles(records);
      console.log(`✅ Registros con imágenes válidas: ${validRecords.length}`);
      console.log(
        `❌ Registros huérfanos: ${this.migrationLog.orphaned.length}`,
      );

      // Paso 3: Generar JSON procesado
      await this.generateProcessedJSON(validRecords);

      // Paso 4: Migrar imágenes
      await this.migrateImages(validRecords);

      // Paso 5: Generar reportes
      await this.generateReports();

      console.log('🎉 Migración completada!');
      this.printSummary();
    } catch (error) {
      console.error('💥 Error durante la migración:', error);
      process.exit(1);
    }
  }

  private async readAndValidateCSV(): Promise<ImageRecord[]> {
    return new Promise((resolve, reject) => {
      const records: ImageRecord[] = [];

      fs.createReadStream(this.csvPath)
        .pipe(csv())
        .on('data', (data) => {
          // Mapear campos del CSV real a nuestro modelo
          const record: ImageRecord = {
            title:
              data['Title\n'] || data.description || data.code || 'Sin título',
            description: data.description || '',
            year: data.year || '',
            decade: data.decade || '',
            zone: data.zone || '',
            people: data.people || '',
            altText: data['Title\n'] || data.description || data.code || '',
            notes: data.notes || '',
            previousData: data.previous_data || '',
            patrimonialValue: data['patrimonial_value\n'] || '0',
            owner: data.owner || '',
            culturalFund: data.cultural_fund || '',
            imagePath: this.buildImagePath(data.code, data.folder),
          };

          // Solo agregar si tiene código (no es la línea vacía)
          if (data.code && data.code.trim()) {
            records.push(record);
          }
        })
        .on('end', () => {
          console.log(`📚 CSV leído exitosamente: ${records.length} registros`);
          resolve(records);
        })
        .on('error', reject);
    });
  }

  private buildImagePath(code: string, folder: string): string {
    if (!code) return '';

    // Mapear códigos a archivos reales
    // Los códigos como LBCH051, E177_04_001 etc. deben mapearse a archivos como LBCH002.jpg
    let fileName = '';
    let folderName = '';

    if (code.startsWith('LBCH')) {
      // Extraer el número del código LBCH051 -> 051 -> 51 -> LBCH051.jpg
      const match = code.match(/LBCH(\d+)/);
      if (match) {
        const num = match[1].padStart(3, '0');
        fileName = `LBCH${num}.jpg`;
        folderName =
          folder === 'LBCH1'
            ? 'LBCH1_jpg'
            : folder === 'LBCH2'
              ? 'LBCH2_jpg'
              : folder === 'LBCH3'
                ? 'LBCH3_jpg'
                : folder === 'LBCH4'
                  ? 'LBCH4_jpg'
                  : folder === 'LBCH5'
                    ? 'LBCH5_jpg'
                    : 'LBCH1_jpg';
      }
    } else if (code.startsWith('E177')) {
      // Para códigos de escuela, usar el código completo como nombre
      fileName = `${code}.jpg`;
      folderName = 'FACHADAS'; // Asumir que van en FACHADAS por ahora
    } else {
      // Para otros códigos, intentar usar el código como nombre
      fileName = `${code}.jpg`;
      folderName = folder || 'FACHADAS';
    }

    return path.join(folderName, fileName);
  }

  private async validateImageFiles(
    records: ImageRecord[],
  ): Promise<ImageRecord[]> {
    const validRecords: ImageRecord[] = [];

    console.log('🔍 Validando existencia de archivos de imagen...');

    for (const record of records) {
      const imagePath = this.resolveImagePath(record.imagePath);

      if (imagePath && fs.existsSync(imagePath)) {
        record.imagePath = imagePath;
        validRecords.push(record);
      } else {
        this.migrationLog.orphaned.push(record);
        console.log(`⚠️  Imagen no encontrada: ${record.imagePath}`);
      }
    }

    return validRecords;
  }

  private resolveImagePath(relativePath: string): string | null {
    if (!relativePath) return null;

    // Limpiar la ruta
    const cleanPath = relativePath.replace(/^\/+/, '').replace(/\\/g, '/');

    // Buscar en diferentes posibles ubicaciones
    const possiblePaths = [
      path.join(this.imagesBasePath, cleanPath),
      path.join(this.imagesBasePath, path.basename(cleanPath)),
    ];

    // Buscar en todas las subcarpetas
    try {
      const subDirs = fs
        .readdirSync(this.imagesBasePath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const subDir of subDirs) {
        possiblePaths.push(
          path.join(this.imagesBasePath, subDir, path.basename(cleanPath)),
        );
      }
    } catch (error) {
      console.warn('Error leyendo subdirectorios:', error);
    }

    // Retornar el primer path que existe
    return possiblePaths.find((p) => fs.existsSync(p)) || null;
  }

  private async generateProcessedJSON(records: ImageRecord[]): Promise<void> {
    const jsonPath = path.join(
      this.processedDir,
      `processed-images-${Date.now()}.json`,
    );

    const processedData = {
      timestamp: new Date().toISOString(),
      totalRecords: records.length,
      records: records,
    };

    fs.writeFileSync(jsonPath, JSON.stringify(processedData, null, 2));
    console.log(`📝 JSON procesado generado: ${jsonPath}`);
  }

  private async migrateImages(records: ImageRecord[]): Promise<void> {
    console.log(`🔄 Iniciando migración de ${records.length} imágenes...`);

    let processed = 0;
    const total = records.length;

    for (const record of records) {
      try {
        await this.uploadSingleImage(record);
        this.migrationLog.success.push(record);
        processed++;

        if (processed % 10 === 0 || processed === total) {
          console.log(
            `📈 Progreso: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`,
          );
        }

        // Pequeña pausa para no sobrecargar el servidor
        await this.sleep(100);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.migrationLog.failed.push({ record, error: errorMessage });
        console.error(`❌ Error subiendo ${record.title}: ${errorMessage}`);
      }
    }
  }

  private async uploadSingleImage(record: ImageRecord): Promise<void> {
    try {
      const form = new FormData();

      // Agregar archivo de imagen
      const imageBuffer = fs.readFileSync(record.imagePath);
      const fileName = path.basename(record.imagePath);
      form.append('image', imageBuffer, fileName);

      // Agregar metadatos
      form.append('title', record.title);
      form.append('altText', record.altText);
      form.append('description', record.description);
      form.append('notes', record.notes);
      form.append('people', record.people);
      form.append('year', record.year);
      form.append('decade', record.decade);
      form.append('zone', record.zone);
      form.append('previousData', record.previousData);
      form.append('patrimonialValue', record.patrimonialValue);
      form.append('owner', record.owner);
      form.append('culturalFund', record.culturalFund);

      const response = await axios.post(
        `${this.apiUrl}/api/images/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
          timeout: 30000, // 30 segundos timeout
        },
      );

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Mejor manejo de errores
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Error de respuesta del servidor
          const status = error.response.status;
          const data = error.response.data;
          throw new Error(`HTTP ${status}: ${JSON.stringify(data)}`);
        } else if (error.request) {
          // Error de conexión
          throw new Error(`Connection error: ${error.message}`);
        } else {
          // Error en la configuración de la request
          throw new Error(`Request error: ${error.message}`);
        }
      } else {
        // Error genérico
        throw new Error(
          `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private async generateReports(): Promise<void> {
    // Generar log detallado
    const logData = {
      timestamp: new Date().toISOString(),
      summary: {
        total:
          this.migrationLog.success.length +
          this.migrationLog.failed.length +
          this.migrationLog.orphaned.length,
        success: this.migrationLog.success.length,
        failed: this.migrationLog.failed.length,
        orphaned: this.migrationLog.orphaned.length,
      },
      details: this.migrationLog,
    };

    const logPath = path.join(this.logsDir, `migration-log-${Date.now()}.json`);
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));

    // Generar reporte MD
    const reportContent = this.generateMarkdownReport(logData);
    const reportPath = path.join(
      this.reportsDir,
      `migration-report-${Date.now()}.md`,
    );
    fs.writeFileSync(reportPath, reportContent);

    console.log(`📊 Log generado: ${logPath}`);
    console.log(`📋 Reporte generado: ${reportPath}`);
  }

  private generateMarkdownReport(logData: any): string {
    const { summary, details } = logData;

    return `# Reporte de Migración de Imágenes

## Resumen Ejecutivo

- **Fecha**: ${new Date(logData.timestamp).toLocaleString()}
- **Total de registros procesados**: ${summary.total}
- **Imágenes migradas exitosamente**: ${summary.success} ✅
- **Errores de migración**: ${summary.failed} ❌
- **Registros huérfanos**: ${summary.orphaned} ⚠️
- **Tasa de éxito**: ${((summary.success / (summary.total - summary.orphaned)) * 100).toFixed(2)}%

## Estadísticas Detalladas

### ✅ Migraciones Exitosas
${summary.success > 0 ? `Se migraron exitosamente ${summary.success} imágenes.` : 'No se migraron imágenes exitosamente.'}

### ❌ Errores de Migración
${
  summary.failed > 0
    ? `
${details.failed
  .map(
    (item: any, index: number) =>
      `${index + 1}. **${item.record.title}**
   - Imagen: ${item.record.imagePath}
   - Error: ${item.error}
`,
  )
  .join('\n')}
`
    : 'No hubo errores de migración.'
}

### ⚠️ Registros Huérfanos
${
  summary.orphaned > 0
    ? `
Se encontraron ${summary.orphaned} registros sin archivo de imagen correspondiente:

${details.orphaned
  .slice(0, 20)
  .map(
    (item: any, index: number) =>
      `${index + 1}. **${item.title}** - Ruta: ${item.imagePath}`,
  )
  .join('\n')}

${summary.orphaned > 20 ? `\n*... y ${summary.orphaned - 20} más.*` : ''}
`
    : 'No se encontraron registros huérfanos.'
}

## Recomendaciones

${summary.failed > 0 ? '- Revisar y corregir los errores de migración listados arriba.' : ''}
${summary.orphaned > 0 ? '- Localizar y organizar las imágenes huérfanas faltantes.' : ''}
${summary.success > 0 ? '- Las imágenes migradas exitosamente están disponibles en el sistema.' : ''}

---
*Reporte generado automáticamente por el sistema de migración de imágenes*
`;
  }

  private printSummary(): void {
    const total =
      this.migrationLog.success.length +
      this.migrationLog.failed.length +
      this.migrationLog.orphaned.length;

    console.log('\n📊 RESUMEN DE MIGRACIÓN');
    console.log('========================');
    console.log(`Total de registros: ${total}`);
    console.log(`✅ Exitosas: ${this.migrationLog.success.length}`);
    console.log(`❌ Fallidas: ${this.migrationLog.failed.length}`);
    console.log(`⚠️  Huérfanas: ${this.migrationLog.orphaned.length}`);
    console.log(
      `📈 Tasa de éxito: ${((this.migrationLog.success.length / (total - this.migrationLog.orphaned.length)) * 100).toFixed(2)}%`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Ejecutar migración
async function main() {
  const migrator = new ImageMigrator();
  await migrator.migrate();
}

if (require.main === module) {
  main().catch(console.error);
}
