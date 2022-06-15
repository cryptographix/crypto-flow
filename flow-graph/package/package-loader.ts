import { Package, PackageDefinition } from './package.ts'
import { JSONObject, JSONValue } from "../deps.ts";
import { registry } from "./package-registry.ts";

/**
 * A ImportDefinition represents a set of packages used by a project.
 * 
 * Project files have an `imports` section consisting of a map between namespaces and library-urls.
 *  
 * Each entry references one or more urls, that may be `js` or `json`, and which when loaded,
 * return meta-data and implementations for Blocks, Datatypes and Interfaces.
 * 
 * URLs may be relative to the project url or specify an absolute HTTPS path.
 */
export class ImportDefinition {
  // namespace for Package(s)
  namespace!: string;

  // set of URLs from which to import packages, may be .json or .js
  moduleURLs: string[];

  // list of Obejct names (interfaces, blocks, datatypes)
  importFilters: string[];

  constructor(namespace: string, info: Pick<ImportDefinition, 'moduleURLs' | 'importFilters'>, public baseURL?: string) {
    const { moduleURLs, importFilters } = info;

    this.namespace = namespace;
    this.moduleURLs = moduleURLs;
    this.importFilters = importFilters;
  }

  static parseJSON(namespace: string, value: JSONValue): ImportDefinition {

    if (Array.isArray(value) || JSONValue.isString(value)) {
      const urls = Array.isArray(value) ? JSONValue.asStringArray(value) : [JSONValue.asString(value)!]

      return new ImportDefinition(
        namespace,
        {
          moduleURLs: urls,
          importFilters: []
        }
      );
    }

    if (!JSONValue.isObject(value))
      throw new Error();

    const { url = "", import: filters } = value;

    return new ImportDefinition(namespace,
      {
        moduleURLs: Array.isArray(url) ? JSONValue.asStringArray(url) : [JSONValue.asString(url)!],
        importFilters: JSONValue.isUndefined(filters) ? [] : JSONValue.asString(filters)!.split(',')
      });
  }

  toJSON(): JSONValue {
    const { moduleURLs, importFilters } = this;

    if (importFilters.length == 0) {
      return moduleURLs.length > 1 ? moduleURLs : moduleURLs[0];
    }
    else {
      return {
        url: moduleURLs.length > 1 ? moduleURLs : moduleURLs[0],
        import: importFilters.join(',')
      }
    }
  }
}

/**
 * 
 */
export class PackageLoader {
  constructor(public importDefinition: ImportDefinition, public baseURL?: string) {
    //
  }

  async loadPackages(): Promise<void> {
    const importDefinition = this.importDefinition;

    const namespace = importDefinition.namespace ?? "";

    const packages: Promise<Package>[] = [];

    for (const moduleURL of importDefinition.moduleURLs ?? []) {
      console.log(moduleURL, this.baseURL)

      const url = new URL(moduleURL, this.baseURL);
      const lowerPath = url.pathname.toLowerCase();

      let pack: Promise<Package>;

      if (lowerPath.endsWith('.js')) {
        pack = import(url.toString())
          .then(m => {
            if (m.packageDefinition !== undefined) {
              const packageDefinition: PackageDefinition = m.packageDefinition;

              // Force loading at specified namespace
              packageDefinition.namespace = namespace;

              return registry.registerPackage(packageDefinition);
            }
            else {
              throw new Error("Import Failed. No exported Packages");
            }
          });
      } else if (lowerPath.endsWith('.json')) {
        pack = fetch(url.toString(), { headers: new Headers({ "accept": "application/json" }) })
          .then(resp => resp.json())
          .then( async (obj: JSONObject) => {
            let pack;

            // A package json must have an internal "library" or "project"
            if (JSONValue.isObject(obj.library)) {
              pack = await Package.parsePackage(obj.library);
            } else if (JSONValue.isObject(obj.project)) {
              pack = await Package.parsePackage(obj.project);
            } else {
              throw new Error( "Package is neither a library or project file" );
            }
       
            return registry.registerPackage(pack);
          });
      }
      else {
        throw new Error("oops, cannot import file that doesn't terminate in .js or .json")
      }

      packages.push(pack);
    }

    await Promise.all(packages);
  }
}
