
import { Component, ElementRef, OnInit, Type, ViewChild } from '@angular/core';
import { MonacoEditorLoaderService, MonacoStandaloneCodeEditor, MonacoEditorConstructionOptions } from '@materia-ui/ngx-monaco-editor';
import * as Alfresco from '@alfresco/js-api';
import { filter, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { EntryType, MonacoTypesBuilder } from 'src/utils/MonacoTypesBuilder';

export interface Log {
  type: 'log' | 'info' | 'warn' | 'error';
  timestamp: Date;
  msg: any;
}

// export interface EditorContext {
//   logger: {
//     log(msg: string | object): void,
//     info(msg: string | object): void,
//     warn(msg: string | object): void,
//     error(msg: string | object): void
//   },
//   nodesApi: Alfresco.NodesApi,
//   searchApi: Alfresco.SearchApi
// }

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

  public monacoElements: EntryType[];

  public username: FormControl = new FormControl('');
  public password: FormControl = new FormControl('');

  public isLoggedIn(): boolean {
    return this.alfrescoJsApi.isLoggedIn();
  }

  constructor(private monacoLoaderService: MonacoEditorLoaderService, private http: HttpClient) {
    this.monacoElements = [];
  }

  public ngOnInit(): void {}

  editorInit(editor: MonacoStandaloneCodeEditor): void {
    
    this.monacoLoaderService.isMonacoLoaded$.pipe(
      filter(isLoaded => isLoaded),
      take(1),
    ).subscribe(() => {
        // here, we retrieve monaco-editor instance
        console.log("Code editor loaded");
        console.log(monaco);
        
        const files = require.context('!!raw-loader!/node_modules/@alfresco/js-api/typings/src/', true, /\.d.ts$/);
        const monacoTypeBuilder = new MonacoTypesBuilder(files);
        const monacoTypes = monacoTypeBuilder.build();
        this.monacoElements = monacoTypeBuilder.getElements();

        const compilerOptions: monaco.languages.typescript.CompilerOptions = {
          target: monaco.languages.typescript.ScriptTarget.ES2016,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.Classic,
          lib: ["es2016"],
          allowJs: true
        }

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.javascriptDefaults.addExtraLib(monacoTypes);
    });

    this.tryLoginFromLocalStorage();
  }

  getCode() {
    return "";
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
    let contextEditor = {
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

    // const getInstance = (className: string): Object | null => {
    //   for (const c in Alfresco) {
    //     if (c == className) {
    //       const obj = Object.create(Alfresco[c]).prototype;
    //       //console.log(obj)
    //       return new obj.constructor(this.alfrescoJsApi);
    //     }
    //   }
    //   return null;
    // }

    // getInstance("AlfrescoApi");



    // contextEditor = { 
    //   ...contextEditor, 
    //   ...this.monacoElements.map(element => { 
    //     return element[element.klass.charAt(0).toLowerCase() + element.klass.slice(1)] = getInstance(element.klass) 
    //   })
      
    // };

    // console.log(contextEditor);

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

}
