
import { Component, ElementRef, OnInit, Type, ViewChild } from '@angular/core';
import { MonacoEditorLoaderService, MonacoStandaloneCodeEditor } from '@materia-ui/ngx-monaco-editor';
import * as Alfresco from '@alfresco/js-api';
import { filter, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { AlfrescoApiConfig } from '@alfresco/js-api';

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
  nodesApi: Alfresco.NodesApi,
  searchApi: Alfresco.SearchApi
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public editorOptions = { theme: 'vs-dark', language: 'javascript' };
  public code = this.getCode();

  public logs: Log[] = [];

  @ViewChild("logContainer")
  public logContainer!: ElementRef;

  public alfrescoConfig: AlfrescoApiConfig = new Alfresco.AlfrescoApiConfig({ provider: 'ECM', hostEcm: "http://localhost:8090" });

  public alfrescoJsApi = new Alfresco.AlfrescoApi(this.alfrescoConfig);

  public username: FormControl = new FormControl('');
  public password: FormControl = new FormControl('');

  public isLoggedIn(): boolean {
    return this.alfrescoJsApi.isLoggedIn();
  }

  constructor(private monacoLoaderService: MonacoEditorLoaderService, private http: HttpClient) {}

  public ngOnInit(): void {}

  editorInit(editor: MonacoStandaloneCodeEditor): void {
    
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

        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          [
            'interface EditorContext {',
            ' logger: {',
            '   log(msg: string | object): void,',
            '   info(msg: string | object): void,',
            '   warn(msg: string | object): void,',
            '   error(msg: string | object): void',
            ' },',
            ' nodesApi: object,',
            ' searchApi: {',
            '  search({ query: string }): Promise<any>',
            ' },',
            '};',
            'declare const alfresco: EditorContext;'
            ].join('\n'), 'filename/editor-context.d.ts'
        );

        // this.http.get('assets/types/index.d.ts', { responseType: 'text' }).subscribe(alfrescoJsApiTypes => {

        //   const typesDefinition: { name: string, types: string }[] = [
        //     { name: 'AlfrescoApi', types: alfrescoJsApiTypes },
        //   ];

        //   console.log(typesDefinition)

        //   typesDefinition.forEach(module => {
            
        //     // monaco.languages.typescript.javascriptDefaults.addExtraLib(
        //     //   `declare module "${module.name}" {
        //     //     ${module.types}
        //     //   }`
        //     // )

        //     monaco.languages.typescript.javascriptDefaults.addExtraLib(
        //       `${module.types}`, "assets/types/index.d.ts"
        //     )

        //   });

        //   console.log(monaco.languages.typescript.javascriptDefaults.getExtraLibs());

        // })



        


        // function createDependencyProposals(range: any): monaco.languages.CompletionItem[] {
        //   // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
        //   // here you could do a server side lookup
        //   return [
        //     // Loggers
        //     {
        //       label: 'this.logger.log',
        //       kind: monaco.languages.CompletionItemKind.Function,
        //       documentation: 'logger.log',
        //       insertText: 'this.logger.log()',
        //       range: range,
        //     },
        //     {
        //       label: 'this.logger.info',
        //       kind: monaco.languages.CompletionItemKind.Function,
        //       documentation: 'logger.info',
        //       insertText: 'this.logger.info()',
        //       range: range,
        //     },
        //     {
        //       label: 'this.logger.warn',
        //       kind: monaco.languages.CompletionItemKind.Function,
        //       documentation: 'logger.warn',
        //       insertText: 'this.logger.warn()',
        //       range: range,
        //     },
        //     {
        //       label: 'this.logger.error',
        //       kind: monaco.languages.CompletionItemKind.Function,
        //       documentation: 'logger.error',
        //       insertText: 'this.logger.error()',
        //       range: range,
        //     },
        //     // Alfresco APIs
        //     {
        //       label: 'nodesApi',
        //       kind: monaco.languages.CompletionItemKind.Property,
        //       documentation: 'Alfresco.NodesApi',
        //       insertText: 'this.nodesApi',
        //       range: range,
        //     }
        //   ];
        // }

        // monaco.languages.registerCompletionItemProvider('javascript', {
        //   provideCompletionItems: function (model, position) {
        //     // find out if we are completing a property in the 'this' object.
        //     var textUntilPosition = model.getValueInRange({
        //       startLineNumber: 1,
        //       startColumn: 1,
        //       endLineNumber: position.lineNumber,
        //       endColumn: position.column
        //     });
        //     // var match = textUntilPosition.includes("this")
        //     // if (!match) {
        //     //   console.log(textUntilPosition);
        //     //   return { suggestions: [] };
        //     // }
        //     var word = model.getWordUntilPosition(position);
        //     var range = {
        //       startLineNumber: position.lineNumber,
        //       endLineNumber: position.lineNumber,
        //       startColumn: word.startColumn,
        //       endColumn: word.endColumn
        //     };
        //     return {
        //       suggestions: createDependencyProposals(range)
        //     };
        //   }
        // });

       
    });

    this.tryLoginFromLocalStorage();
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

  login() {
    this.alfrescoJsApi.login(this.username.value, this.password.value).then(ticket => {
      console.log('API called successfully to login into Alfresco Content Services by username/password. ' + ticket);
      localStorage.setItem("ticket-ECM", ticket);
    }, error => {
        console.error(error);
    });
  }

  logout() {
    this.alfrescoJsApi.logout();
  }

  tryLoginFromLocalStorage() {
    const ticket = localStorage.getItem("ticket-ECM");
    if (ticket) {
      this.alfrescoJsApi.loginTicket(ticket, "").then(ticket => {
        console.log('API called successfully to login into Alfresco Content Services by ticket. ' + ticket);
      }, error => {
          console.error(error);
          localStorage.removeItem("ticket-ECM");
      });
    }
  }

  run() {
    const contextEditor: EditorContext = {
      nodesApi: new Alfresco.NodesApi(this.alfrescoJsApi),
      searchApi: new Alfresco.SearchApi(this.alfrescoJsApi),
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

    try {
      // Execute the code from the editor
      new Function("const alfresco = this;\n" + this.code).bind(contextEditor)();
    } catch (error) {
      this.logs.push({ type: 'error', timestamp: new Date(), msg: error })
    }
    
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
