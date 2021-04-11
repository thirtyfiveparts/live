// Adapted from: https://github.com/microsoft/rushstack/blob/master/apps/api-documenter/src/documenters/MarkdownDocumenter.ts
// Create simple documentation readme.

import {
  DocSection,
  DocPlainText,
  DocLinkTag,
  TSDocConfiguration,
  StringBuilder,
  DocNodeKind,
  DocParagraph,
  DocCodeSpan,
  DocFencedCode,
  StandardTags,
  DocBlock,
  DocComment,
  DocNodeContainer,
} from '@microsoft/tsdoc'
import {
  ApiModel,
  ApiItem,
  ApiEnum,
  ApiPackage,
  //ApiItemKind, // const enum
  ApiReleaseTagMixin,
  ApiDocumentedItem,
  ApiClass,
  ReleaseTag,
  ApiStaticMixin,
  ApiPropertyItem,
  ApiInterface,
  Excerpt,
  ApiParameterListMixin,
  ApiReturnTypeMixin,
  ApiDeclaredItem,
  ApiNamespace,
  ExcerptTokenKind,
  IResolveDeclarationReferenceResult,
  ApiTypeAlias,
  ExcerptToken,
  ApiOptionalMixin,
} from '@microsoft/api-extractor-model'
import {DocumenterConfig} from '@microsoft/api-documenter/lib/documenters/DocumenterConfig'
import {
  MarkdownDocumenterFeatureContext,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
} from '@microsoft/api-documenter/lib/plugin/MarkdownDocumenterFeature'
import {MarkdownDocumenterAccessor} from '@microsoft/api-documenter/lib/plugin/MarkdownDocumenterAccessor'
import {PluginLoader} from '@microsoft/api-documenter/lib/plugin/PluginLoader'
import {CustomMarkdownEmitter} from '@microsoft/api-documenter/lib/markdown/CustomMarkdownEmitter'
import {IMarkdownDocumenterOptions, MarkdownDocumenter} from '@microsoft/api-documenter/lib/documenters/MarkdownDocumenter'
import {CustomDocNodes} from '@microsoft/api-documenter/lib/nodes/CustomDocNodeKind'
import {PackageName, FileSystem} from '@rushstack/node-core-library'
import path from 'path'
import {Utilities} from '@microsoft/api-documenter/lib/utils/Utilities'
import {DocNoteBox} from '@microsoft/api-documenter/lib/nodes/DocNoteBox'
import {DocHeading} from '@microsoft/api-documenter/lib/nodes/DocHeading'
import {DocTable} from '@microsoft/api-documenter/lib/nodes/DocTable'
import {DocEmphasisSpan} from '@microsoft/api-documenter/lib/nodes/DocEmphasisSpan'
import {DocTableRow} from '@microsoft/api-documenter/lib/nodes/DocTableRow'
import {DocTableCell} from '@microsoft/api-documenter/lib/nodes/DocTableCell'

////////////////////////////////////////////////////////////////////////////////

// Inlined to avoid `const enum` + `--isolated-module` issue.
// See: https://ncjamieson.com/dont-export-const-enums/

enum NewlineKind {
  CrLf = '\r\n',
  Lf = '\n',
  OsDefault = 'os',
}

enum ApiItemKind {
  CallSignature = 'CallSignature',
  Class = 'Class',
  Constructor = 'Constructor',
  ConstructSignature = 'ConstructSignature',
  EntryPoint = 'EntryPoint',
  Enum = 'Enum',
  EnumMember = 'EnumMember',
  Function = 'Function',
  IndexSignature = 'IndexSignature',
  Interface = 'Interface',
  Method = 'Method',
  MethodSignature = 'MethodSignature',
  Model = 'Model',
  Namespace = 'Namespace',
  Package = 'Package',
  Property = 'Property',
  PropertySignature = 'PropertySignature',
  TypeAlias = 'TypeAlias',
  Variable = 'Variable',
  None = 'None',
}

////////////////////////////////////////////////////////////////////////////////

//export class MarkdownDocumenterReadme {
export class MarkdownDocumenterReadme extends MarkdownDocumenter {
  private readonly _apiModel: ApiModel
  private readonly _documenterConfig: DocumenterConfig | undefined
  private readonly _tsdocConfiguration: TSDocConfiguration
  private readonly _markdownEmitter: CustomMarkdownEmitter
  private readonly _outputFolder: string
  private readonly _pluginLoader: PluginLoader

  public constructor(options: IMarkdownDocumenterOptions) {
    super(options)
    this._apiModel = options.apiModel
    this._documenterConfig = options.documenterConfig
    this._outputFolder = options.outputFolder
    this._tsdocConfiguration = CustomDocNodes.configuration
    this._markdownEmitter = new CustomMarkdownEmitter(this._apiModel)

    this._pluginLoader = new PluginLoader()
  }

  public generateFiles(): void {
    if (this._documenterConfig) {
      this._pluginLoader.load(this._documenterConfig, () => {
        return new MarkdownDocumenterFeatureContext({
          apiModel: this._apiModel,
          outputFolder: this._outputFolder,
          documenter: new MarkdownDocumenterAccessor({
            getLinkForApiItem: (apiItem: ApiItem) => {
              return this._getLinkFilenameForApiItem(apiItem)
            },
          }),
        })
      })
    }

    console.log()
    //this._deleteOldOutputFiles()

    this._writeApiItemPage(this._apiModel)

    if (this._pluginLoader.markdownDocumenterFeature) {
      this._pluginLoader.markdownDocumenterFeature.onFinished({})
    }
  }

  private _writeApiItemPage(apiItem: ApiItem): void {
    const configuration: TSDocConfiguration = this._tsdocConfiguration
    const output: DocSection = new DocSection({
      configuration: this._tsdocConfiguration,
    })

    const scopedName: string = apiItem.getScopedNameWithinPackage()

    console.log('kind', apiItem.kind)

    switch (apiItem.kind) {
      case ApiItemKind.Model:
        output.appendNode(
          new DocHeading({configuration, title: `API Reference`}),
        )
        break
      case ApiItemKind.Function:
        output.appendNode(
          new DocHeading({configuration, title: `${scopedName} function`}),
        )
        break
    }

    ////////////////////////////////////////////////////////////////////////////

    if (ApiReleaseTagMixin.isBaseClassOf(apiItem)) {
      if (apiItem.releaseTag === ReleaseTag.Beta) {
        this._writeBetaWarning(output)
      }
    }

    ////////////////////////////////////////////////////////////////////////////

    let appendRemarks: boolean = true
    if (appendRemarks) {
      this._writeRemarksSection(output, apiItem)
    }

    ////////////////////////////////////////////////////////////////////////////
    // Handle node children
    ////////////////////////////////////////////////////////////////////////////

    switch (apiItem.kind) {
      case ApiItemKind.Class:
        //this._writeClassTables(output, apiItem as ApiClass)
        break
      case ApiItemKind.Enum:
        //this._writeEnumTables(output, apiItem as ApiEnum)
        break
      case ApiItemKind.Interface:
        //this._writeInterfaceTables(output, apiItem as ApiInterface)
        break
      case ApiItemKind.Constructor:
      case ApiItemKind.ConstructSignature:
      case ApiItemKind.Method:
      case ApiItemKind.MethodSignature:
      case ApiItemKind.Function:
        //this._writeParameterTables(output, apiItem as ApiParameterListMixin)
        //this._writeThrowsSection(output, apiItem)
        break
      case ApiItemKind.Namespace:
        //this._writePackageOrNamespaceTables(output, apiItem as ApiNamespace)
        break
      case ApiItemKind.Model:
        this._writeModelTable(output, apiItem as ApiModel)
        break
      case ApiItemKind.Package:
        //this._writePackageOrNamespaceTables(output, apiItem as ApiPackage)
        break
      case ApiItemKind.Property:
      case ApiItemKind.PropertySignature:
        break
      case ApiItemKind.TypeAlias:
        break
      case ApiItemKind.Variable:
        break
      default:
        throw new Error('Unsupported API item kind: ' + apiItem.kind)
    }

    ////////////////////////////////////////////////////////////////////////////

    const filename: string = path.join(
      this._outputFolder,
      //this._getFilenameForApiItem(apiItem),
      'readme.md',
    )
    const stringBuilder: StringBuilder = new StringBuilder()

    stringBuilder.append(
      '<!-- Do not edit this file. It is automatically generated by API Documenter. -->\n\n',
    )
    this._markdownEmitter.emit(stringBuilder, output, {
      contextApiItem: apiItem,
      onGetFilenameForApiItem: (apiItemForFilename: ApiItem) => {
        return this._getLinkFilenameForApiItem(apiItemForFilename)
      },
    })

    let pageContent: string = stringBuilder.toString()

    if (this._pluginLoader.markdownDocumenterFeature) {
      // Allow the plugin to customize the pageContent
      const eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs = {
        apiItem: apiItem,
        outputFilename: filename,
        pageContent: pageContent,
      }
      this._pluginLoader.markdownDocumenterFeature.onBeforeWritePage(eventArgs)
      pageContent = eventArgs.pageContent
    }

    ////////////////////////////////////////////////////////////////////////////

    console.log('Writing', filename)
    FileSystem.writeFile(filename, pageContent, {
      convertLineEndings: this._documenterConfig
        ? this._documenterConfig.newlineKind
        : NewlineKind.CrLf,
    })
  }

  private _writeModelTable(output: DocSection, apiModel: ApiModel): void {
    const configuration: TSDocConfiguration = this._tsdocConfiguration

    //const packagesTable: DocTable = new DocTable({
    //  configuration,
    //  headerTitles: ['Package', 'Description']
    //});

    for (const apiMember of apiModel.members) {
      console.log(apiMember.kind)

      //const node = new DocParagraph({configuration}, [
      //  new DocEmphasisSpan({configuration, bold: true}, [
      //    new DocPlainText({configuration, text: 'Signature:'}),
      //  ]),
      //])
      //output.appendNode(node)

      if (apiMember.kind === ApiItemKind.Package) {
        for (const a of apiMember.members) {
          console.log(a.kind)
          console.log('ENTRYPOINT')
          if (a.kind === ApiItemKind.EntryPoint) {
            for (const b of a.members) {
              console.log(b.kind)
              console.log(b)
              makeFunctionNode(b)
              this._writeParameterTables(output, b as ApiParameterListMixin)
            }
          }
        }
      }

      function makeFunctionNode(model) {
        const node = new DocParagraph({configuration}, [
          new DocEmphasisSpan({configuration, bold: true}, [
            new DocPlainText({
              configuration,
              text: model.name,
              //text: JSON.stringify(model, null, 2),
            }),
          ]),
        ])
        output.appendNode(node)
      }

      //const row: DocTableRow = new DocTableRow({ configuration }, [
      //  this._createTitleCell(apiMember),
      //  this._createDescriptionCell(apiMember)
      //]);

      //switch (apiMember.kind) {
      //  case ApiItemKind.Package:
      //    packagesTable.addRow(row);
      //    this._writeApiItemPage(apiMember);
      //    break;
      //}
    }

    //if (packagesTable.rows.length > 0) {
    //  output.appendNode(new DocHeading({ configuration: this._tsdocConfiguration, title: 'Packages' }));
    //  output.appendNode(packagesTable);
    //}
  }

  private _writeParameterTables(
    output: DocSection,
    apiParameterListMixin: ApiParameterListMixin,
  ): void {
    const configuration: TSDocConfiguration = this._tsdocConfiguration

    const parametersTable: DocTable = new DocTable({
      configuration,
      headerTitles: ['Parameter', 'Type', 'Description'],
    })

    for (const apiParameter of apiParameterListMixin.parameters ?? []) {
      const parameterDescription: DocSection = new DocSection({configuration})
      if (apiParameter.tsdocParamBlock) {
        this._appendSection(
          parameterDescription,
          apiParameter.tsdocParamBlock.content,
        )
      }

      parametersTable.addRow(
        new DocTableRow({configuration}, [
          new DocTableCell({configuration}, [
            new DocParagraph({configuration}, [
              new DocPlainText({configuration, text: apiParameter.name}),
            ]),
          ]),
          new DocTableCell({configuration}, [
            this._createParagraphForTypeExcerpt(
              apiParameter.parameterTypeExcerpt,
            ),
          ]),
          new DocTableCell({configuration}, parameterDescription.nodes),
        ]),
      )
    }

    if (parametersTable.rows.length > 0) {
      output.appendNode(
        new DocHeading({
          configuration: this._tsdocConfiguration,
          title: 'Parameters',
        }),
      )
      output.appendNode(parametersTable)
    }

    if (ApiReturnTypeMixin.isBaseClassOf(apiParameterListMixin)) {
      const returnTypeExcerpt: Excerpt = apiParameterListMixin.returnTypeExcerpt
      output.appendNode(
        new DocParagraph({configuration}, [
          new DocEmphasisSpan({configuration, bold: true}, [
            new DocPlainText({configuration, text: 'Returns:'}),
          ]),
        ]),
      )

      output.appendNode(this._createParagraphForTypeExcerpt(returnTypeExcerpt))

      if (apiParameterListMixin instanceof ApiDocumentedItem) {
        if (
          apiParameterListMixin.tsdocComment &&
          apiParameterListMixin.tsdocComment.returnsBlock
        ) {
          this._appendSection(
            output,
            apiParameterListMixin.tsdocComment.returnsBlock.content,
          )
        }
      }
    }
  }

  private _writeRemarksSection(output: DocSection, apiItem: ApiItem): void {
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment

      if (tsdocComment) {
        // Write the @remarks block
        if (tsdocComment.remarksBlock) {
          output.appendNode(
            new DocHeading({
              configuration: this._tsdocConfiguration,
              title: 'Remarks',
            }),
          )
          this._appendSection(output, tsdocComment.remarksBlock.content)
        }

        // Write the @example blocks
        const exampleBlocks: DocBlock[] = tsdocComment.customBlocks.filter(
          x =>
            x.blockTag.tagNameWithUpperCase ===
            StandardTags.example.tagNameWithUpperCase,
        )

        let exampleNumber: number = 1
        for (const exampleBlock of exampleBlocks) {
          const heading: string =
            exampleBlocks.length > 1 ? `Example ${exampleNumber}` : 'Example'

          output.appendNode(
            new DocHeading({
              configuration: this._tsdocConfiguration,
              title: heading,
            }),
          )

          this._appendSection(output, exampleBlock.content)

          ++exampleNumber
        }
      }
    }
  }

  private _getFilenameForApiItem(apiItem: ApiItem): string {
    if (apiItem.kind === ApiItemKind.Model) {
      return 'index.md'
    }

    let baseName: string = ''
    for (const hierarchyItem of apiItem.getHierarchy()) {
      // For overloaded methods, add a suffix such as "MyClass.myMethod_2".
      let qualifiedName: string = Utilities.getSafeFilenameForName(
        hierarchyItem.displayName,
      )
      if (ApiParameterListMixin.isBaseClassOf(hierarchyItem)) {
        if (hierarchyItem.overloadIndex > 1) {
          // Subtract one for compatibility with earlier releases of API Documenter.
          // (This will get revamped when we fix GitHub issue #1308)
          qualifiedName += `_${hierarchyItem.overloadIndex - 1}`
        }
      }

      switch (hierarchyItem.kind) {
        case ApiItemKind.Model:
        case ApiItemKind.EntryPoint:
          break
        case ApiItemKind.Package:
          baseName = Utilities.getSafeFilenameForName(
            PackageName.getUnscopedName(hierarchyItem.displayName),
          )
          break
        default:
          baseName += '.' + qualifiedName
      }
    }
    return baseName + '.md'
  }

  private _appendSection(output: DocSection, docSection: DocSection): void {
    for (const node of docSection.nodes) {
      output.appendNode(node)
    }
  }

  private _getLinkFilenameForApiItem(apiItem: ApiItem): string {
    return './' + this._getFilenameForApiItem(apiItem)
  }

  private _writeBetaWarning(output: DocSection): void {
    const configuration: TSDocConfiguration = this._tsdocConfiguration
    const betaWarning: string =
      'This API is provided as a preview for developers and may change' +
      ' based on feedback that we receive.  Do not use this API in a production environment.'
    output.appendNode(
      new DocNoteBox({configuration}, [
        new DocParagraph({configuration}, [
          new DocPlainText({configuration, text: betaWarning}),
        ]),
      ]),
    )
  }
}
