
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MonacoEditorLoaderService, MonacoStandaloneCodeEditor } from '@materia-ui/ngx-monaco-editor';
import * as AlfrescoApi from 'alfresco-js-api';
import { filter, take } from 'rxjs';

export interface Log {
  type: 'log' | 'info' | 'warn' | 'error';
  timestamp: Date;
  msg: any;
}

export interface EditorContext {
  logger: {
    log(msg: string | object): void,
    info(msg: string | object): void,
    warn(msg: string | object): void,
    error(msg: string | object): void
  },
  alfrescoJsApi: AlfrescoApi
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public editorOptions = { theme: 'vs-dark', language: 'javascript' };
  public code = this.getCode();

  public logs: Log[] = [];

  @ViewChild("logContainer")
  public logContainer!: ElementRef;

  public alfrescoJsApi = new AlfrescoApi({ provider:'ECM', hostEcm: 'http://localhost:8080/' });

  constructor(private monacoLoaderService: MonacoEditorLoaderService) {}


  editorInit(editor: MonacoStandaloneCodeEditor) {
    
    this.monacoLoaderService.isMonacoLoaded$.pipe(
      filter(isLoaded => isLoaded),
      take(1),
    ).subscribe(() => {
         // here, we retrieve monaco-editor instance
         console.log("Code editor loaded");
         console.log(monaco);

        //  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        //   target: monaco.languages.typescript.ScriptTarget.ES2016,
        //   allowNonTsExtensions: true,
        //   moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        // });

        // const alfrescoJsApiTypes = import('node_modules/@alfresco/js-api')

        // const types = [
        //   { name: 'alfresco-js-api', types: alfrescoJsApiTypes },
        // ]

        // types.forEach(module => {
        //   monaco.languages.typescript.javascriptDefaults.addExtraLib(
        //     `declare module "${module.name}" {
        //     ${module.types}
        //     }`
        //   )
        // })
    });

    // Programatic content selection example

    editor.setSelection({
      startLineNumber: 1,
      startColumn: 1,
      endColumn: 50,
      endLineNumber: 3,
    });

    this.alfrescoJsApi.login('admin', 'admin').then(ticket => {
        console.log('API called successfully to login into Alfresco Content Services. ' + ticket);
    }, error => {
        console.error(error);
    });

  }

  getCode() {
    return (
      [
        'this.logger.log(this.alfrescoJsApi);',
        'this.logger.info("COUCOU !");'
      ].join('\n')
    );
  }

  run() {
    const contextEditor: EditorContext = {
      alfrescoJsApi: this.alfrescoJsApi,
      logger: {
        log: (msg: string | object) => {
          this.logs.push({ type: 'log', timestamp: new Date(), msg });
        },
        info: (msg: string | object) => {
          this.logs.push({ type: 'info', timestamp: new Date(), msg });
        },
        warn: (msg: string | object) => {
          this.logs.push({ type: 'warn', timestamp: new Date(), msg });
        },
        error: (msg: string | object) => {
          this.logs.push({ type: 'error', timestamp: new Date(), msg });
        }
      }
    }

    // Execute the code from the editor
    new Function(this.code).bind(contextEditor)();
  }

  isObject(e: any) {
    return e instanceof Object;
  }

  scrollToBottom() {
    this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
  }

  clearConsole() {
    this.logs = [];
  }
}
