
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
      // nodesApi: new Alfresco.NodesApi(this.alfrescoJsApi),
      // searchApi: new Alfresco.SearchApi(this.alfrescoJsApi),
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
      },
      alfrescoApiConfig: new Alfresco.AlfrescoApiConfig(this.alfrescoJsApi), 
      aboutApi: new Alfresco.AboutApi(this.alfrescoJsApi), 
      adminEndpointsApi: new Alfresco.AdminEndpointsApi(this.alfrescoJsApi), 
      adminGroupsApi: new Alfresco.AdminGroupsApi(this.alfrescoJsApi), 
      adminTenantsApi: new Alfresco.AdminTenantsApi(this.alfrescoJsApi), 
      adminUsersApi: new Alfresco.AdminUsersApi(this.alfrescoJsApi),    
      commentsApi: new Alfresco.CommentsApi(this.alfrescoJsApi), 
      contentApi: new Alfresco.ContentApi(this.alfrescoJsApi), 
      groupsApi: new Alfresco.GroupsApi(this.alfrescoJsApi), 
      iDMSyncApi: new Alfresco.IDMSyncApi(this.alfrescoJsApi), 
      integrationAlfrescoCloudApi: new Alfresco.IntegrationAlfrescoCloudApi(this.alfrescoJsApi), 
      integrationAlfrescoOnPremiseApi: new Alfresco.IntegrationAlfrescoOnPremiseApi(this.alfrescoJsApi), 
      integrationBoxApi: new Alfresco.IntegrationBoxApi(this.alfrescoJsApi), 
      integrationDriveApi: new Alfresco.IntegrationDriveApi(this.alfrescoJsApi),  
      modelJsonBpmnApi: new Alfresco.ModelJsonBpmnApi(this.alfrescoJsApi), 
      modelsApi: new Alfresco.ModelsApi(this.alfrescoJsApi), 
      modelsHistoryApi: new Alfresco.ModelsHistoryApi(this.alfrescoJsApi), 
      processDefinitionsApi: new Alfresco.ProcessDefinitionsApi(this.alfrescoJsApi),  
      processInstanceVariablesApi: new Alfresco.ProcessInstanceVariablesApi(this.alfrescoJsApi), 
      processInstancesApi: new Alfresco.ProcessInstancesApi(this.alfrescoJsApi),     
      reportApi: new Alfresco.ReportApi(this.alfrescoJsApi),  
      systemPropertiesApi: new Alfresco.SystemPropertiesApi(this.alfrescoJsApi), 
      taskActionsApi: new Alfresco.TaskActionsApi(this.alfrescoJsApi),  
      taskFormsApi: new Alfresco.TaskFormsApi(this.alfrescoJsApi), 
      temporaryApi: new Alfresco.TemporaryApi(this.alfrescoJsApi),  
      userFiltersApi: new Alfresco.UserFiltersApi(this.alfrescoJsApi),      
      customModelApi: new Alfresco.CustomModelApi(this.alfrescoJsApi), 
      downloadsApi: new Alfresco.DownloadsApi(this.alfrescoJsApi), 
      favoritesApi: new Alfresco.FavoritesApi(this.alfrescoJsApi),  
      networksApi: new Alfresco.NetworksApi(this.alfrescoJsApi), 
      nodesApi: new Alfresco.NodesApi(this.alfrescoJsApi), 
      peopleApi: new Alfresco.PeopleApi(this.alfrescoJsApi), 
      queriesApi: new Alfresco.QueriesApi(this.alfrescoJsApi), 
      ratingsApi: new Alfresco.RatingsApi(this.alfrescoJsApi), 
      renditionsApi: new Alfresco.RenditionsApi(this.alfrescoJsApi), 
      sharedlinksApi: new Alfresco.SharedlinksApi(this.alfrescoJsApi), 
      sitesApi: new Alfresco.SitesApi(this.alfrescoJsApi), 
      tagsApi: new Alfresco.TagsApi(this.alfrescoJsApi), 
      versionsApi: new Alfresco.VersionsApi(this.alfrescoJsApi), 
      webscriptApi: new Alfresco.WebscriptApi(this.alfrescoJsApi),       
    }

    // const r = this.monacoElements.filter(i => i.klass.toUpperCase().includes("API")).map(element => element.klass.charAt(0).toLowerCase() + element.klass.slice(1) + ": " + "new Alfresco." + element.klass + "(this.alfrescoJsApi)").join(", \n");
    // console.log(r);

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
