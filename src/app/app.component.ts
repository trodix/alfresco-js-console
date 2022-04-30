
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MonacoEditorLoaderService, MonacoStandaloneCodeEditor } from '@materia-ui/ngx-monaco-editor';
import { AlfrescoApi, AlfrescoApiConfig, NodesApi } from '@alfresco/js-api';
import { filter, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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
  nodesApi: NodesApi
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

  public alfrescoJsApi = new AlfrescoApi(new AlfrescoApiConfig({ provider: 'ECM', hostEcm: "http://localhost:8090" }));

  constructor(private monacoLoaderService: MonacoEditorLoaderService, private http: HttpClient) {}


  editorInit(editor: MonacoStandaloneCodeEditor) {
    
    this.monacoLoaderService.isMonacoLoaded$.pipe(
      filter(isLoaded => isLoaded),
      take(1),
    ).subscribe(() => {
        // here, we retrieve monaco-editor instance
        console.log("Code editor loaded");
        console.log(monaco);

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2016,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.Classic,
        });

        this.http.get('assets/types/index.d.ts', { responseType: 'text' }).subscribe(alfrescoJsApiTypes => {

          const typesDefinition: { name: string, types: string }[] = [
            { name: 'AlfrescoApi', types: alfrescoJsApiTypes },
          ];

          console.log(typesDefinition)

          typesDefinition.forEach(module => {
            
            // monaco.languages.typescript.javascriptDefaults.addExtraLib(
            //   `declare module "${module.name}" {
            //     ${module.types}
            //   }`
            // )

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              `${module.types}`, "assets/types/index.d.ts"
            )

          });

          console.log(monaco.languages.typescript.javascriptDefaults.getExtraLibs());

        })
       
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
`

const fileOrFolderId = '80a94ac8-3ece-47ad-864e-5d939424c47c';

this.nodesApi.getNode(fileOrFolderId).then(node => {
    this.logger.info('This is the name: ' + node.entry.name );
}, error => {
    this.logger.error('This node does not exist');
});

const folderNodeId = '80a94ac8-3ece-47ad-864e-5d939424c47c';

this.nodesApi.listNodeChildren(folderNodeId).then(data => {
    this.logger.info('The number of children in this folder are ' + data.list.pagination.count);
    data.list.entries.forEach(node => {
        this.logger.info(node.entry.id + " - " + node.entry.name);
    });
}, error => {
    this.logger.error('This node does not exist');
});

`
    );
  }

  run() {
    const contextEditor: EditorContext = {
      nodesApi: new NodesApi(this.alfrescoJsApi),
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
function DeclarationProvider(arg0: string, DeclarationProvider: any) {
  throw new Error('Function not implemented.');
}

