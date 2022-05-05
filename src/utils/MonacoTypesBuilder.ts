export interface EntryType {
  klass: string, 
  methods: string []
}


export class MonacoTypesBuilder {

  /**
   * Exemple: 
   * <code>require.context(`!!raw-loader!/node_modules/@alfresco/js-api/typings/src/`, true, /\.d.ts$/)</code>
   */
  private files: __WebpackModuleApi.RequireContext;

  constructor(files: __WebpackModuleApi.RequireContext) {
    this.files = files;
  }

  public build(): string {
    return this.buildExtraLibsTypesTemplate();
  }

  private getEntriesType(): EntryType[] {

    const result: EntryType[] = [];
    
    this.files.keys().forEach((key: string) => {
      const obj: { klass: string, methods: string [] } = {
        klass: key,
        methods: this.getMethods(key)
      };
      result.push(obj);
    });

    return result;
  }

  private buildExtraLibsTypesTemplate(): string {

    let template = "";

    this.getEntriesType().forEach(entry => {
      const parts = entry.klass.split("/");
      const tmpName = parts[parts.length - 1].split(".")[0];
      const klass = tmpName.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
      const methods = entry.methods;

      methods.forEach(m => console.log(m));

      template += `declare class ${klass} {\n\n`;
      methods.map(m => "\t" + m + ";\n\n").forEach(m => template += m);
      template += `}\n\n`;
    });

    return template;
  }

  private getMethods(itemName: string): string[] {

    const methods: string[] = [];

    const methodMatcher = new RegExp(/(\w+)(\(.*\)):\s*([\w<>]+)/g);
    const methodsResults = this.files(itemName).default.matchAll(methodMatcher);

    for (const match of methodsResults) {
      const method = match[0];
      methods.push(method);
    }

    return methods;
  }


}
