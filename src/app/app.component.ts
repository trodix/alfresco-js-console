
import { Component, ElementRef, OnInit, Type, ViewChild } from '@angular/core';
import { MonacoEditorLoaderService, MonacoStandaloneCodeEditor, MonacoEditorConstructionOptions } from '@materia-ui/ngx-monaco-editor';
import * as Alfresco from '@alfresco/js-api';
import { filter, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';

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

  public editorOptions: MonacoEditorConstructionOptions = { theme: 'vs-dark', language: 'javascript' };
  public code = this.getCode();

  public logs: Log[] = [];

  @ViewChild("logContainer")
  public logContainer!: ElementRef;

  public alfrescoConfig: Alfresco.AlfrescoApiConfig = new Alfresco.AlfrescoApiConfig({ provider: 'ECM', hostEcm: "http://localhost:8090" });

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
        
        // const files = require.context('!!raw-loader!/node_modules/@alfresco/js-api/typings/src/', true, /\.d.ts$/);
        // let template = "";
        
        //const files = require.context('!!raw-loader!/src/app/types', true, /\.d.ts$/);
        
        // files.keys().forEach((key: string) => {
        //   template += files(key).default;
        //   // We add every .d.ts file to Monaco
        //   monaco.languages.typescript.javascriptDefaults.addExtraLib(
        //     files(key).default,
        //     `file:///node_modules/@alfresco/js-api/typings/src/${key.slice(2)}`
        //   );
        // });

        console.log(monaco.languages.typescript.javascriptDefaults.getExtraLibs());

        const compilerOptions: monaco.languages.typescript.CompilerOptions = {
          target: monaco.languages.typescript.ScriptTarget.ES2016,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.Classic,
          lib: ["es2016"],
          allowJs: true
        }

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

        const alfrescoLibs: string[] = [];

        const getMethods = async (moduleName: string): Promise<string[]> => {
          const module = await import("@alfresco/js-api");
          return [];
        }

        for (const module in Alfresco) {
          const methods = getMethods(module).then(method => {
            console.log(methods);
            if (module !== module.toLocaleUpperCase() && module.toLocaleLowerCase().includes("api")) {
              alfrescoLibs.push(module.charAt(0).toLocaleLowerCase() + module.slice(1) + ": " + "object");
            }
          });
        }

        monaco.languages.typescript.javascriptDefaults.addExtraLib(
          [
            'interface EditorContext {',
            ' logger: {',
            '   log(msg: string | object): void,',
            '   info(msg: string | object): void,',
            '   warn(msg: string | object): void,',
            '   error(msg: string | object): void',
            ' },',
            alfrescoLibs.join(",\n"),
            '};',
            'declare const alfresco: EditorContext;'
            ].join('\n'), 'filename/editor-context.d.ts'
        );

        //let template = this.buildTypes(Alfresco);
        //console.log(template);
        //monaco.languages.typescript.javascriptDefaults.addExtraLib(template);

        
      

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
    return (""
// `
// const fileOrFolderId = '80a94ac8-3ece-47ad-864e-5d939424c47c';

// this.nodesApi.getNode(fileOrFolderId).then(node => {
//     this.logger.info('This is the name: ' + node.entry.name );
// }, error => {
//     this.logger.error('This node does not exist');
// });

// const folderNodeId = '80a94ac8-3ece-47ad-864e-5d939424c47c';

// this.nodesApi.listNodeChildren(folderNodeId).then(data => {
//     this.logger.info('The number of children in this folder are ' + data.list.pagination.count);
//     data.list.entries.forEach(node => {
//         this.logger.info(node.entry.id + " - " + node.entry.name);
//     });
// }, error => {
//     this.logger.error('This node does not exist');
// });
// `
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

    // Execute the code from the editor
    new Function("const alfresco = this;\n" + this.code).bind(contextEditor)();
    
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

  buildTypes(namespace: any): string {
    let template = "";

    

    template += this.buildInterfacesTypes(null, Alfresco);

    template += [
      'interface EditorContext {',
      ' logger: {',
      '   log(msg: string | object): void,',
      '   info(msg: string | object): void,',
      '   warn(msg: string | object): void,',
      '   error(msg: string | object): void',
      ' },\n'
    ].join('\n')

    for (const module in namespace) {
      //console.log(module);
      template += `${module === String(module).toUpperCase() ? module : module.charAt(0).toLowerCase() + module.slice(1)}: ${module},\n`
    }

    template += [
      '};',
      'declare const alfresco: EditorContext;'
    ].join('\n')

    return template;
  }

  buildInterfacesTypes(parent: any, namespace: any): string {

    let template = "";

    for (const module in namespace) {
      template += 
        `declare interface ${module} {`
          // TODO
        // if (module == parent || parent == null) {
        //   template += this.buildInterfacesTypes(module, namespace);
        // }
      template += 
        `},\n`
    }

    return template;
  }

}
