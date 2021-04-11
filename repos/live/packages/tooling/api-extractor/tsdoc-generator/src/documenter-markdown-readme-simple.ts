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
  //ApiItemKind,
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
  //ExcerptTokenKind,
  IResolveDeclarationReferenceResult,
  ApiTypeAlias,
  ExcerptToken,
  ApiOptionalMixin,
} from '@microsoft/api-extractor-model'
import {Utilities} from '@microsoft/api-documenter/lib/utils/Utilities'
import {PackageName} from '@rushstack/node-core-library'
import {CustomMarkdownEmitter} from '@microsoft/api-documenter/lib/markdown/CustomMarkdownEmitter'
import {CustomDocNodes} from '@microsoft/api-documenter/lib/nodes/CustomDocNodeKind'
import {DocHeading} from '@microsoft/api-documenter/lib/nodes/DocHeading'
//import { Utilities } from '@microsoft/../utils/Utilities';

// TODO(vjpr): Use Playground: https://tsdoc.org/play#

const configuration = CustomDocNodes.configuration
let rootApiModel

export default function documenterMarkdownReadmeSimple({apiModel}) {
  const out = []
  rootApiModel = apiModel
  process(apiModel, out)
  return out.join('\n')
}

function process(apiModel, out) {
  switch (apiModel.kind) {
    case ApiItemKind.Model:
      processModel(apiModel, out)
      break
  }
}

function processModel(apiModel, out) {
  apiModel.members.map(apiMember => {
    if (apiMember.kind === ApiItemKind.Package) {
      processPackage(apiMember, out)
    }
  })
}

function processPackage(apiModel, out) {
  apiModel.members.map(apiMember => {
    if (apiMember.kind === ApiItemKind.EntryPoint) {
      processEntryPoint(apiMember, out)
    }
  })
}

function processEntryPoint(apiModel, out) {
  apiModel.members.map(apiMember => {
    if (apiMember.kind === ApiItemKind.Function) {
      processFunction(apiMember, out)
    } else if (apiMember.kind === ApiItemKind.Class) {
      processClass(apiMember, out)
    }
  })
}

function processFunction(apiModel, out) {
  out.push('## ' + apiModel.name + '\n')
  appendSection(apiModel, apiModel.tsdocComment?.summarySection, out)
  renderParams(apiModel, out)
  renderReturns(apiModel, out)
  renderExample(apiModel, out)
}

function processClass(apiMember, out) {}

////////////////////////////////////////////////////////////////////////////////

function renderReturns(apiModel, out) {
  if (!apiModel.returnTypeExcerpt.length) return
  out.push('### Returns')
  out.push(apiModel.returnTypeExcerpt)
  appendSection(apiModel, apiModel.tsdocComment?.returnsBlock?.content, out)
}

function renderExample(apiModel, out) {
  const tsdocComment: DocComment | undefined = apiModel.tsdocComment

  const output = new DocSection({configuration})

  if (tsdocComment) {
    // Write the @remarks block
    if (tsdocComment.remarksBlock) {
      output.appendNode(
        new DocHeading({
          configuration,
          title: 'Remarks',
        }),
      )
      appendSection(apiModel, tsdocComment.remarksBlock.content, out)
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
          configuration,
          title: heading,
        }),
      )

      appendSection(apiModel, exampleBlock.content, out)

      ++exampleNumber
    }
  }
}

function appendSection(apiModel, docSection, out) {
  const output: DocSection = new DocSection({configuration})
  docSection.nodes?.map(node => {
    output.appendNode(node)
  })
  const str = toString(output, apiModel)
  out.push(str)
}

function renderParams(apiModel, out) {
  if (!apiModel.parameters.length) return
  out.push('### Params\n')
  for (const apiParameter of apiModel.parameters ?? []) {
    renderParam(apiParameter, out)
    if (apiParameter.tsdocParamBlock) {
      const str = toString(apiParameter.tsdocParamBlock?.content, apiModel)
      out.push(str)
    }
  }
}

function renderParam(apiParameter, out) {
  const name = code(apiParameter.name)
  let typeStr = ''
  const excerpt = apiParameter.parameterTypeExcerpt

  if (!excerpt.text.trim()) {
    typeStr = '(not declared)'
    ret()
    return
  }

  excerpt.spannedTokens.map(token => {
    const unwrappedTokenText: string = token.text.replace(/[\r\n]+/g, ' ')
    const isHyperlinkable =
      token.kind === ExcerptTokenKind.Reference && token.canonicalReference

    // a. Not hyperlinkable.
    if (!isHyperlinkable) {
      typeStr += unwrappedTokenText
      return
    }

    // b. If it's hyperlinkable, then append a DocLinkTag
    const apiItemResult: IResolveDeclarationReferenceResult = rootApiModel.resolveDeclarationReference(
      token.canonicalReference,
      undefined,
    )
    if (apiItemResult.resolvedApiItem) {
      const urlDestination = getLinkFilenameForApiItem(
        apiItemResult.resolvedApiItem,
      )
      typeStr += unwrappedTokenText + ' ' + urlDestination
      return
    }
  })

  ret()
  return

  function ret() {
    const str = `- ${name} **{${typeStr}}**:`
    out.push(str)
  }
}

////////////////////////////////////////////////////////////////////////////////

function toString(output, apiItem) {
  const markdownEmitter = new CustomMarkdownEmitter(rootApiModel)
  const stringBuilder: StringBuilder = new StringBuilder()
  markdownEmitter.emit(stringBuilder, output, {
    contextApiItem: apiItem,
    //onGetFilenameForApiItem: (apiItemForFilename: ApiItem) => {
    //  return this._getLinkFilenameForApiItem(apiItemForFilename)
    //},
  })
  let pageContent: string = stringBuilder.toString()
  return pageContent
}

////////////////////////////////////////////////////////////////////////////////

function code(code) {
  return '`' + code + '`'
}

////////////////////////////////////////////////////////////////////////////////

// Inlined to avoid `const enum` + `--isolated-module` issue.
// See: https://ncjamieson.com/dont-export-const-enums/

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

enum ExcerptTokenKind {
  Content = 'Content',
  Reference = 'Reference',
}

////////////////////////////////////////////////////////////////////////////////

function getLinkFilenameForApiItem(apiItem: ApiItem): string {
  return './' + getFilenameForApiItem(apiItem)
}

function getFilenameForApiItem(apiItem: ApiItem): string {
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
