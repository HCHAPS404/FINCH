import { Module, type DynamicModule } from '@nestjs/common';
import type { FinchConfig } from '@finch/config';
import { DocumentsController } from './documents.controller.js';
import { AuthorizationGuard } from '../infrastructure/authorization/authorization.guard.js';
import { DOCUMENT_STORAGE_PORT } from '../infrastructure/documents/document-storage.port.js';
import { LocalDiskStorageAdapter } from '../infrastructure/documents/local-disk-storage.adapter.js';

@Module({})
export class DocumentsModule {
  static forRoot(config: FinchConfig): DynamicModule {
    return {
      module: DocumentsModule,
      controllers: [DocumentsController],
      providers: [
        AuthorizationGuard,
        {
          provide: DOCUMENT_STORAGE_PORT,
          useFactory: (): LocalDiskStorageAdapter =>
            new LocalDiskStorageAdapter(config.storage.documentsStorageDir),
        },
      ],
    };
  }
}
